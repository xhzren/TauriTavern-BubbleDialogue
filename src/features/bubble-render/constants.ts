/**
 * 气泡渲染常量 —— 数据从原始脚本 (对话渲染系统 v7.1 / 轻量气泡 hydration) 提取，未做人工改写。
 */

export interface MoodGroup {
    id: string;
    label: string;
    color: string;
}

export interface MoodWordGroup extends MoodGroup {
    words: string[];
}

/** 8 组情绪的色卡（与 mood id 一一对应） */
export const MOOD_GROUPS: MoodGroup[] = [
      {
        "id": "mood-joy",
        "label": "喜悦",
        "color": "#f59e0b"
      },
      {
        "id": "mood-anger",
        "label": "愤怒",
        "color": "#ef4444"
      },
      {
        "id": "mood-sad",
        "label": "悲伤",
        "color": "#3b82f6"
      },
      {
        "id": "mood-anxious",
        "label": "紧张",
        "color": "#eab308"
      },
      {
        "id": "mood-calm",
        "label": "平和",
        "color": "#22c55e"
      },
      {
        "id": "mood-shy",
        "label": "害羞",
        "color": "#06b6d4"
      },
      {
        "id": "mood-disgust",
        "label": "嫌弃",
        "color": "#8b5cf6"
      },
      {
        "id": "mood-love",
        "label": "爱恋",
        "color": "#ec4899"
      }
    ];

/** 默认情绪词表：8 组共 109 词 */
export const DEFAULT_MOOD_WORD_GROUPS: MoodWordGroup[] = [
      {
        "id": "mood-joy",
        "label": "喜悦",
        "color": "#f59e0b",
        "words": [
          "开心",
          "欢喜",
          "欣喜",
          "愉悦",
          "满足",
          "幸福",
          "期待",
          "惊喜",
          "甜蜜",
          "狂喜",
          "兴奋",
          "雀跃",
          "畅快",
          "陶醉",
          "得意",
          "骄傲",
          "自豪",
          "自信"
        ]
      },
      {
        "id": "mood-anger",
        "label": "愤怒",
        "color": "#ef4444",
        "words": [
          "愤怒",
          "暴怒",
          "气愤",
          "愤慨",
          "暴躁",
          "怨恨",
          "敌意",
          "恼火",
          "窝火",
          "生气",
          "烦躁",
          "烦闷"
        ]
      },
      {
        "id": "mood-sad",
        "label": "悲伤",
        "color": "#3b82f6",
        "words": [
          "难过",
          "伤心",
          "心酸",
          "忧伤",
          "惆怅",
          "失落",
          "低落",
          "沮丧",
          "悲伤",
          "心痛",
          "悲痛",
          "痛苦",
          "委屈",
          "不甘",
          "失望",
          "受伤",
          "孤独",
          "寂寞",
          "落寞"
        ]
      },
      {
        "id": "mood-anxious",
        "label": "紧张",
        "color": "#eab308",
        "words": [
          "焦虑",
          "紧张",
          "不安",
          "忐忑",
          "担忧",
          "慌张",
          "焦躁",
          "害怕",
          "恐惧",
          "惊恐",
          "畏惧",
          "胆怯",
          "心慌",
          "警惕",
          "戒备"
        ]
      },
      {
        "id": "mood-calm",
        "label": "平和",
        "color": "#22c55e",
        "words": [
          "平静",
          "淡然",
          "冷静",
          "沉稳",
          "从容",
          "坦然",
          "淡定",
          "温馨",
          "舒畅",
          "惬意",
          "温暖",
          "欣慰",
          "释然",
          "感动",
          "感恩"
        ]
      },
      {
        "id": "mood-shy",
        "label": "害羞",
        "color": "#06b6d4",
        "words": [
          "害羞",
          "尴尬",
          "窘迫",
          "难堪",
          "困惑",
          "迷茫",
          "疑惑",
          "纠结",
          "犹豫",
          "无奈",
          "无语"
        ]
      },
      {
        "id": "mood-disgust",
        "label": "嫌弃",
        "color": "#8b5cf6",
        "words": [
          "厌恶",
          "嫌弃",
          "鄙视",
          "反感",
          "排斥",
          "抗拒",
          "不屑",
          "冷淡",
          "冷漠",
          "疏离",
          "麻木"
        ]
      },
      {
        "id": "mood-love",
        "label": "爱恋",
        "color": "#ec4899",
        "words": [
          "喜欢",
          "爱慕",
          "迷恋",
          "倾慕",
          "宠溺",
          "依恋",
          "心动",
          "认真"
        ]
      }
    ];

/** 注入给模型的对话格式规则（原脚本 DEFAULT_FORMAT_RULE） */
export const DEFAULT_FORMAT_RULE: string = "[对话渲染格式规范]\r\n角色对白、内心活动、突发反应、莫名声音都必须用以下格式（整行内，固定5段，缺一不可）：\r\n@bubble:角色名|情绪|[对白]|服装|动作\r\n\r\n通用规则：\r\n- @bubble: 前缀固定不可改；各字段用 | 分隔，整行不换行\r\n- 🔴 5段全部必填：角色名、情绪、[对白]、服装、动作 —— 每个 @bubble 都必须写满5段，严禁只写3段（只有情绪没有服装动作会导致头像无法匹配，只能显示基础头像）\r\n- 角色名必须每次都写完整全名且前后一致（\"城崎诺亚\"不简写\"诺亚\"），对所有角色生效（含新NPC/任务对象/论坛网友）；只有名的写名（如\"云儿\"），名字未知用 ？？？\r\n- 台词用 [ ] 包裹，内不能含 | [ ] 符号；旁白正常写不加标记\r\n- 每次说话/心理都必须带完整5段 @bubble，不可省略任何字段；多角色各用自己的名（含系统声音）\r\n- 内心活动写 @bubble:角色名|情绪|[*想的内容*]|服装|动作，星号成对包裹整段心理，服装动作照常填满\r\n- 路人/同学/同事用 @bubble:男路人X|情绪|[对白]|服装|动作（女路人/男同学等同理）\r\n- 敌人：怪物用 @bubble:夜魔A|生气|[你！]|outfit-casual|act-sfw，人型敌人同路人规则\r\n\r\n[字段取值·标签锁死]\r\n※ 服装/动作/情绪三个字段都是\"标签锁死\"：只能从下列固定值选，严禁自造/翻译/改写。服装动作必须原样输出英文标签，情绪只写中文词。写错会被系统忽略或兜底。\r\n\r\n服装（第4段，必填）：outfit-casual 常服/默认服 | outfit-formal 正装/礼服 | outfit-sleep 睡衣/休息 | outfit-lingerie 内衣/泳装(仅女) | outfit-naked 裸体 | outfit-hoodie 连帽衫 | outfit-leather 紧身皮甲 | outfit-maid 女仆装 | outfit-kimono 和风礼装 | outfit-steampunk 蒸汽朋克战斗裙 | outfit-slip 吊带裙 | outfit-ice 冰雪仙装\r\n  · 拿不准就填 outfit-casual（常服），绝不能不写\r\n动作（第5段，必填）—— 🔴 先看这一段正文在发生什么，再机械对应，**不要习惯性填 act-sfw**：\r\n  act-oral 口交(含住/吞吐/舔) | act-handjob 手淫(手/撸动/握住柱身) | act-paizuri 乳交(夹在胸间) | act-footjob 足交(用脚) | act-vaginal 性交(插入/结合) | act-sfw 日常(确实没有性行为)\r\n  · 判定规则：正文段落里出现了哪种性行为，第5段就写对应的 act-* 标签；只有确实没有任何性行为（日常对话、拥抱、亲吻、睡觉、调情）才写 act-sfw。\r\n  · 🔴 最常见的错误：正文在写性行为、第5段却写 act-sfw —— 头像会停在日常差分，跟剧情完全对不上。写 act-sfw 之前，先确认这一段真的没有性行为。\r\n  · 男女都正常填服装+动作；NSFW 动作只有女性有差分图，男性照实际写即可（系统会自动回落，不需要你手动降级成 act-sfw）。\r\n  · 对照示例（左边是正文在写什么 → 右边第5段写什么）：\"她张开嘴含了进去\" → act-oral；\"她用手握住柱身上下套弄\" → act-handjob；\"两人结合在一起\" → act-vaginal；\"只是抱着亲吻、闲聊、睡觉\" → act-sfw。\r\n情绪（第2段，必填，8选1，挑最贴近的）：喜悦(开心/兴奋/期待/满足) | 愤怒(生气/恼火/烦躁) | 悲伤(难过/委屈/失落) | 紧张(焦虑/害怕/慌张) | 平和(平静/温柔/从容/欣慰) | 害羞(尴尬/疑惑/好奇/惊讶/无奈/犹豫) | 嫌弃(厌恶/反感/冷漠) | 爱恋(喜欢/迷恋/宠溺/心动)\r\n  · 只有这8种差分头像；写8类外的词兜底到\"平和\"可能与剧情不符\r\n\r\n[输出规则]\r\n- 🔴 每个 @bubble 必须写满5段：日常场景用 |outfit-casual|act-sfw，NSFW场景必须按上面的动作判定规则换成对应的 act-*（不要因为习惯就写 act-sfw）；严禁只写3段\r\n- 若漏写第4/5段，渲染器会按日常SFW处理（outfit-casual + act-sfw），不会自动从NSFW图池猜测；想命中口交/手交/性交等差分，必须显式写对应 act\r\n- 正文直出markdown，不要包 <now_plot>/<content>/<xmp> 等标签\r\n- image###prompt### 放旁白段之间任意位置，但不要写进 @bubble 行\r\n- @bubble 必须独占整行（前后换行），不与旁白/image### 同行\r\n- @bubble 行末尾严禁任何 XML/HTML 尾巴（/> 、> 、</bubble> 、<br> 等），以\"动作字段\"自然结束后直接换行\r\n\r\n示例（每条都写满5段）：\r\n@bubble:城崎诺亚|喜悦|[咦？真的吗？]|outfit-casual|act-sfw\r\n@bubble:城崎诺亚|紧张|[*我真的能做好吗？*]|outfit-casual|act-sfw\r\n@bubble:林知意|爱恋|[嗯...再深一点...]|outfit-naked|act-vaginal\r\n@bubble:？？？|紧张|[是……是清野同学，我们该撤了]|outfit-casual|act-sfw";

/** 情绪词约束模板，{{mood_groups}} 在注入时替换为实际分组文本 */
export const DEFAULT_MOOD_PROMPT_TEMPLATE: string = "[情绪词约束·标签锁死]\r\n情绪字段（@bubble 第 2 段）只能从下面 8 大情绪分类中选 1 个。每类列出了可用的同义词，写哪个都会归到该类的差分头像：\r\n{{mood_groups}}\r\n规则：\r\n- 必须从上面 8 类（含同义词）里挑最贴近当前剧情的一个，严禁自造分类外的新情绪词。\r\n- 不要机械地每个气泡都写同一个情绪词：按**这一句**的语气细节来选，同一场戏里 害羞 / 紧张 / 爱恋 / 喜悦 / 平和 都可以随台词内容切换；只有情绪确实没变化时才重复。\r\n- 生图只做了这 8 种情绪差分；写分类外的词系统会兜底到\"平和\"，可能与剧情不符。\r\n- 情绪字段不能省略，必须填写。不要写英文，不要写 mood-xxx 标签。\r\n- 🔴 重要：情绪之后的服装段、动作段同样必填，每个 @bubble 必须写满5段（角色名|情绪|[对白]|服装|动作）；日常场景服装填 outfit-casual、动作填 act-sfw，绝不能只写到对白就结束。（这一段在写性行为时，动作段必须按判定规则写对应的 act-*。）";

/** 正文美化默认样式（原脚本 STYLE_DEFAULTS，26 项） */
export const STYLE_DEFAULTS: Record<string, unknown> = {
      "style_dialogueFontSize": 14.5,
      "style_narrationFontSize": 14,
      "style_dialogueSpacing": 10,
      "style_textColorMode": "global",
      "style_globalTextColor": "#d9d9d9",
      "style_markdownMode": "basic",
      "style_dialogueFontWeight": 400,
      "style_narrationFontWeight": 400,
      "style_nameFontWeight": 800,
      "style_narrationBgColor": "#ffffff",
      "style_narrationBgOpacity": 0.04,
      "style_avatarSize": 52,
      "style_narrationIndent": 76,
      "style_narrationFontFamily": "Noto Sans SC",
      "style_dialogueFontFamily": "Noto Serif SC",
      "style_nameFontFamily": "Noto Serif SC",
      "style_fontConfigUrl": "",
      "style_narrationBorderRadius": 0,
      "style_avatarShape": "rounded",
      "style_thoughtSuffixGap": 6,
      "style_thoughtSuffixOffsetY": 5,
      "style_narrationTextIndent": 0,
      "style_narrationLineHeight": 1.75,
      "style_narrationPaddingRight": 16,
      "style_imageCompressEnabled": true,
      "style_imageCompressQuality": 0.82
    };

export const GLOBAL_CHAR_ID = "_global_";
export const CHAR_ID_SEPARATOR = "__";
export const PROMPT_INJECTION_ID = "bubble-dialogue-format-and-mood";
