'use client'
import { ResidueData } from '@/app/components/sequence_viewer';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const getResidueKey = (residue: ResidueData) => `${residue[0]}_${residue[1]}`;

export interface SequenceSelectionState {
    selections: {
        [auth_asym_id: string]: {
            selectedMap: Record<string, ResidueData>;  // Using object as Map for better serialization
            orderedKeys: string[];  // Maintain order for operations that need it
        };
    };
}

const initialState: SequenceSelectionState = {
    selections: {}
};

export const sequenceViewerSlice = createSlice({
    name: 'sequenceViewer',
    initialState,
    reducers: {
        addSelection: (
            state,
            action: PayloadAction<{
                auth_asym_id: string;
                residues: ResidueData[];
            }>
        ) => {
            const { auth_asym_id, residues } = action.payload;
            
            if (!state.selections[auth_asym_id]) {
                state.selections[auth_asym_id] = {
                    selectedMap: {},
                    orderedKeys: []
                };
            }
            
            residues.forEach(residue => {
                const key = getResidueKey(residue);
                if (!state.selections[auth_asym_id].selectedMap[key]) {
                    state.selections[auth_asym_id].selectedMap[key] = residue;
                    state.selections[auth_asym_id].orderedKeys.push(key);
                }
            });
        },
        removeSelection: (
            state,
            action: PayloadAction<{
                auth_asym_id: string;
                residues: ResidueData[];
            }>
        ) => {
            const { auth_asym_id, residues } = action.payload;
            if (state.selections[auth_asym_id]) {
                const keysToRemove = new Set(residues.map(getResidueKey));
                state.selections[auth_asym_id].orderedKeys = 
                    state.selections[auth_asym_id].orderedKeys.filter(key => !keysToRemove.has(key));
                
                residues.forEach(residue => {
                    const key = getResidueKey(residue);
                    delete state.selections[auth_asym_id].selectedMap[key];
                });
            }
        },
        clearSelections: (state, action: PayloadAction<string | undefined>) => {
            if (action.payload) {
                delete state.selections[action.payload];
            } else {
                state.selections = {};
            }
        }
    }
});

// Selector to get residues in original array format if needed
export const getResiduesArray = (state: SequenceSelectionState, auth_asym_id: string): ResidueData[] => {
    const selection = state.selections[auth_asym_id];
    if (!selection) return [];
    return selection.orderedKeys.map(key => selection.selectedMap[key]);
};

export const { addSelection, removeSelection, clearSelections } = sequenceViewerSlice.actions;
export default sequenceViewerSlice.reducer;
