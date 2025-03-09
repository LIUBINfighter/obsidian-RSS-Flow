export const VIEW_TYPES = {
    README: "react-lab-readme-view"
    // GALLERY: "react-lab-gallery-view"
} as const;

export type KanbanLayout = 'horizontal' | 'vertical';

export interface ReactLabSettings {
    setting: string;
    kanbanLayout: KanbanLayout;
    sidebarWidth: number;
}
