/**
 * 有界并发的 map。
 *
 * 原生扩展存储每次读一个 key 都是一次 IPC 往返；几千个 key 用 for + await
 * 串行读取会慢到几十秒（表现为「统计一直在转圈」）。这里限制并发数，
 * 既能把往返批量化，又不会一次性打爆 IPC 或内存。
 */
export async function mapWithConcurrency<T, R>(
    items: readonly T[],
    limit: number,
    fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
    const results = new Array<R>(items.length);
    if (items.length === 0) return results;

    let cursor = 0;
    const workerCount = Math.max(1, Math.min(limit, items.length));
    const workers = Array.from({ length: workerCount }, async () => {
        while (true) {
            const index = cursor;
            cursor += 1;
            if (index >= items.length) return;
            results[index] = await fn(items[index], index);
        }
    });
    await Promise.all(workers);
    return results;
}
