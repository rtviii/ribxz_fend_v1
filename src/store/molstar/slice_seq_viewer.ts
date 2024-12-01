import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ResidueData = [number, string] // [ auth_seq_id, label_comp_id ]

export interface SequenceViewerMetadata {
    chain_title : string;
    structure_id: string;
    length      : number;
    type        : 'Polypeptide' | 'Polynucleotide';
    structure_ref  : string;
    polymer_ref : string;
}

interface SequenceViewerState {
    is_active: boolean;
    metadata?: SequenceViewerMetadata;
    current_data: {
        structure_ref   : string;
        polymer_ref     : string;
        polymer_sequence: ResidueData[];
    };
    selected: Record<string, Record<string, ResidueData[]>>;
}

const initialState: SequenceViewerState = {
    is_active: false,
    metadata: undefined,
    current_data: {
        polymer_ref     : '',
        structure_ref   : '',
        polymer_sequence: [],
    },
    selected: {},
};

export const sequenceViewerSlice = createSlice({
    name: 'sequenceViewer',
    initialState,
    reducers: {
        setActive: (state, action: PayloadAction<boolean>) => {
            state.is_active = action.payload;
        },
        setCurrentData: (
            state, 
            action: PayloadAction<{
                structure_ref      : string;
                polymer_ref     : string;
                polymer_sequence: ResidueData[];
            }>
        ) => {
            state.current_data = action.payload;
        },
        setMetadata: (state, action: PayloadAction<SequenceViewerMetadata>) => {
            state.metadata = action.payload;
        },
        addSelected: (
            state, 
            action: PayloadAction<{
                struct_ref: string;
                polymer_ref: string;
                selected_residues: ResidueData[];
            }>
        ) => {
            const { struct_ref, polymer_ref, selected_residues } = action.payload;
            
            if (!state.selected[struct_ref]) {
                state.selected[struct_ref] = {};
            }
            
            if (!state.selected[struct_ref][polymer_ref]) {
                state.selected[struct_ref][polymer_ref] = [];
            }
            
            state.selected[struct_ref][polymer_ref] = [
                ...state.selected[struct_ref][polymer_ref],
                ...selected_residues
            ];
        },
        removeSelected: (
            state, 
            action: PayloadAction<{
                struct_ref: string;
                polymer_ref: string;
                unselected_residues: ResidueData[];
            }>
        ) => {
            const { struct_ref, polymer_ref, unselected_residues } = action.payload;
            
            if (state.selected[struct_ref] && state.selected[struct_ref][polymer_ref]) {
                state.selected[struct_ref][polymer_ref] = state.selected[struct_ref][polymer_ref].filter(
                    (resident) => 
                        !unselected_residues.some(
                            (unsel) => unsel[0] === resident[0] && unsel[1] === resident[1]
                        )
                );
            }
        }
    }
});

export const {
    setActive,
    setCurrentData,
    setMetadata,
    addSelected,
    removeSelected
} = sequenceViewerSlice.actions;

export default sequenceViewerSlice.reducer;