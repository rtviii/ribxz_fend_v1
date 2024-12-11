// types.ts
export interface StructureElement {
    auth_asym_id?: string;
    auth_seq_id?: number;
    comp_id?: string;
    entity_id?: string;
    label_seq_id?: number;
    rcsb_id?: string;
}

export interface MolstarEventHandlers {
    onHover?: (element: StructureElement | null) => void;
    onSelect?: (element: StructureElement | null) => void;
    onClearHover?: () => void;
    onClearSelection?: () => void;
}

export interface InteractionState {
    hover: StructureElement | null;
    selected: StructureElement | null;
}

export interface InteractionManagerConfig {
    debounceTime?: number;
    enableHover?: boolean;
    enableSelection?: boolean;
}