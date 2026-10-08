/**
 * 气泡 hydration —— 给正则产出的 .yq-bubble 元素填头像、上情绪色、区分对白/心里话。
 *
 * 幂等：用 data-yq-hydrated 去重；但流式中宿主正则会重写气泡 innerHTML 并插入新的
 * 占位 img[data-lazy-mood]，所以「已标记但占位仍在」时必须重填（走同步缓存快路径，
 * 避免头像闪空帧）。这与原始脚本的守卫逻辑一致。
 */

export const BUBBLE_SELECTOR = ".yq-bubble, .custom-yq-bubble";
const AVATAR_SELECTOR = ".yq-bubble-avatar, .custom-yq-bubble-avatar";
const PLACEHOLDER_SELECTOR = ".yq-bubble-avatar[data-lazy-mood], .custom-yq-bubble-avatar[data-lazy-mood]";
const FILLED_SELECTOR = ".yq-bubble-avatar:not([data-lazy-mood]), .custom-yq-bubble-avatar:not([data-lazy-mood])";
const FALLBACK_SELECTOR = ".yq-bubble-avatar-fallback, .custom-yq-bubble-avatar-fallback";
const TEXT_SELECTOR = ".yq-bubble-text, .custom-yq-bubble-text";

export const HYDRATED_ATTR = "yqHydrated";

/**
 * 异步头像解析的并发上限。
 *
 * 首屏可能一次挂上上百个楼层、几百个气泡；原生后端的差分图又是**按需回查**的
 * （列表不带二进制，每个气泡可能 2 次 IPC）。不限并发就会瞬间打出几百次 IPC。
 * 注意：**同步缓存命中的路径不受限制**——流式输出靠它立刻回填、避免空帧闪烁。
 */
export const RESOLVE_CONCURRENCY = 8;

export interface BubbleAvatarRequest {
    name: string;
    mood: string;
    outfit: string | null;
    act: string | null;
    seed: string;
}

export interface BubbleHydrator {
    hydrateAll(): void;
    refresh(): void;
}

export interface HydratorOptions {
    documentRef: () => Document;
    resolveAvatar: (request: BubbleAvatarRequest) => Promise<string | null>;
    resolveCachedAvatar: (request: BubbleAvatarRequest) => string | null;
    resolveMoodGroup: (moodText: string) => { id: string; color: string } | null;
    /**
     * 「按角色」配色模式下，这个角色名对应的正文颜色。
     * 返回 null 表示没有单独配色，用全局色。
     */
    resolveTextColor?: (name: string) => string | null;
    onZoom?: (url: string, name: string) => void;
}

export function createBubbleHydrator(options: HydratorOptions): BubbleHydrator {
    const { documentRef, resolveAvatar, resolveCachedAvatar, resolveMoodGroup, resolveTextColor, onZoom } = options;

    /** 排队中的异步解析任务 */
    const resolveQueue: Array<() => Promise<void>> = [];
    let resolveActive = 0;
    /** 正在排队/解析中的气泡，避免防抖重扫把同一个气泡重复排队 */
    const resolvePending = new WeakSet<HTMLElement>();

    function pumpResolveQueue() {
        while (resolveActive < RESOLVE_CONCURRENCY && resolveQueue.length > 0) {
            const task = resolveQueue.shift();
            if (!task) return;
            resolveActive += 1;
            void task()
                .catch(() => {
                    /* 单个气泡失败不影响其它 */
                })
                .finally(() => {
                    resolveActive -= 1;
                    pumpResolveQueue();
                });
        }
    }

    function enqueueResolve(task: () => Promise<void>) {
        resolveQueue.push(task);
        pumpResolveQueue();
    }

    function firstChar(name: string): string {
        const text = String(name ?? "").trim();
        return text ? Array.from(text)[0] : "?";
    }

    function renderThought(textEl: HTMLElement): boolean {
        if (textEl.dataset.yqThoughtDone) return false;
        const html = textEl.innerHTML;
        let hasThought = false;
        const next = html.replace(/\*([^*\n]+)\*/g, (_match: string, inner: string) => {
            hasThought = true;
            return "<em>" + inner + "</em>";
        });
        if (next !== html) textEl.innerHTML = next;
        textEl.dataset.yqThoughtDone = "1";
        return hasThought;
    }

    function applyTextKind(textEl: HTMLElement, hasThought: boolean) {
        const raw = (textEl.textContent ?? "").trim();
        const isPureThought =
            hasThought &&
            textEl.children.length === 1 &&
            textEl.children[0].tagName === "EM" &&
            (textEl.children[0].textContent ?? "").trim() === raw;
        textEl.classList.remove(
            "yq-bubble-text-thought",
            "custom-yq-bubble-text-thought",
            "yq-bubble-text-dialogue",
            "custom-yq-bubble-text-dialogue",
        );
        if (isPureThought) {
            textEl.classList.add("yq-bubble-text-thought", "custom-yq-bubble-text-thought");
        } else {
            textEl.classList.add("yq-bubble-text-dialogue", "custom-yq-bubble-text-dialogue");
        }
    }

    function buildRequest(bubble: HTMLElement): BubbleAvatarRequest {
        const textEl = bubble.querySelector<HTMLElement>(TEXT_SELECTOR);
        return {
            name: bubble.getAttribute("data-name") ?? "",
            mood: bubble.getAttribute("data-mood") ?? "",
            outfit: bubble.getAttribute("data-outfit")?.trim() || null,
            act: bubble.getAttribute("data-act")?.trim() || null,
            seed: [
                bubble.getAttribute("data-name") ?? "",
                bubble.getAttribute("data-mood") ?? "",
                bubble.getAttribute("data-outfit") ?? "",
                bubble.getAttribute("data-act") ?? "",
                textEl?.textContent?.trim() ?? "",
                bubble.getAttribute("data-yq-seed") ?? "",
                bubble.textContent ?? "",
            ].join("|"),
        };
    }

    function hydrateBubble(bubble: HTMLElement) {
        if (bubble.dataset[HYDRATED_ATTR]) {
            const filled = bubble.querySelector(FILLED_SELECTOR);
            const placeholder = bubble.querySelector(PLACEHOLDER_SELECTOR);
            if (filled && !placeholder) return;
            if (!placeholder && bubble.querySelector(FALLBACK_SELECTOR)) return;
        }

        const name0 = (bubble.getAttribute("data-name") ?? "").trim();
        if (!name0 || !bubble.querySelector(PLACEHOLDER_SELECTOR)) {
            return;
        }
        bubble.dataset[HYDRATED_ATTR] = "1";

        const request = buildRequest(bubble);
        const group = resolveMoodGroup(request.mood);
        if (group && group.color) {
            bubble.style.setProperty("--yq-mood-color", group.color);
        }

        // 正文颜色：「按角色」模式下按名字取色；取不到就删掉变量、回落到全局色
        const textColor = resolveTextColor?.(request.name) ?? null;
        if (textColor) bubble.style.setProperty("--yq-text-color", textColor);
        else bubble.style.removeProperty("--yq-text-color");

        const textEl = bubble.querySelector<HTMLElement>(TEXT_SELECTOR);
        if (textEl) {
            applyTextKind(textEl, renderThought(textEl));
        }

        const img = bubble.querySelector<HTMLImageElement>(PLACEHOLDER_SELECTOR);
        if (!img) return;

        const title = [
            request.name,
            request.mood,
            request.outfit,
            request.act && request.act !== "act-sfw" ? request.act : "",
        ]
            .filter(Boolean)
            .join(" · ");

        const attach = (url: string) => {
            img.src = url;
            img.removeAttribute("data-lazy-mood");
            img.title = title;
            img.addEventListener("click", (event: MouseEvent) => {
                event.preventDefault();
                event.stopPropagation();
                if (onZoom) onZoom(url, request.name);
            });
        };

        const cached = resolveCachedAvatar(request);
        if (cached) {
            attach(cached);
            return;
        }

        if (resolvePending.has(bubble)) return;
        resolvePending.add(bubble);
        enqueueResolve(async () => {
            try {
                const url = await resolveAvatar(request);
                if (url) {
                    attach(url);
                    return;
                }
                const doc = documentRef();
                const fallback = doc.createElement("div");
                fallback.className = img.className.replace(/(custom-)?yq-bubble-avatar/g, "$1yq-bubble-avatar-fallback");
                fallback.textContent = firstChar(request.name);
                fallback.title = title + " (未上传头像)";
                if (img.parentNode) {
                    img.parentNode.replaceChild(fallback, img);
                }
            } finally {
                resolvePending.delete(bubble);
            }
        });
    }

    return {
        hydrateAll() {
            const doc = documentRef();
            doc.querySelectorAll<HTMLElement>(BUBBLE_SELECTOR).forEach(hydrateBubble);
        },
        refresh() {
            const doc = documentRef();
            doc.querySelectorAll<HTMLElement>(BUBBLE_SELECTOR).forEach((bubble) => {
                delete bubble.dataset[HYDRATED_ATTR];
                bubble.removeAttribute("data-yq-hydrated");
                const img = bubble.querySelector<HTMLImageElement>(AVATAR_SELECTOR);
                if (img && img.tagName === "IMG" && !img.getAttribute("data-lazy-mood")) {
                    img.setAttribute("data-lazy-mood", bubble.getAttribute("data-mood") ?? "");
                }
            });
        },
    };
}
