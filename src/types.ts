export const VIEW_TYPES = {
    README: "rss-flow-readme-view",
    READ: "rss-flow-read-view",
    GALLERY: "rss-flow-gallery-view"
} as const;

export interface ReactLabSettings {
    setting: string;
    sidebarWidth: number;
}
