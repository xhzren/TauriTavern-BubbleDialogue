export const creatorAppearanceModes = ['night', 'day'] as const;

export type CreatorAppearanceMode = (typeof creatorAppearanceModes)[number];

export const DEFAULT_APPEARANCE_MODE: CreatorAppearanceMode = 'night';
