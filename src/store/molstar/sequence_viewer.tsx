import { ResidueData } from '@/app/components/sequence_viewer';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SequenceSelectionState {
    selections: {
        [auth_asym_id: string]: ResidueData[]
    }
}

const initialState: SequenceSelectionState = {
    selections: {}
};

export const sequenceViewerSlice = createSlice({
    name: 'sequenceViewer',
    initialState,
    reducers: {
        addSelection: (state, action: PayloadAction<{
            auth_asym_id: string,
            residues: ResidueData[]
        }>) => {
            const { auth_asym_id, residues } = action.payload;
            if (!state.selections[auth_asym_id]) {
                state.selections[auth_asym_id] = [];
            }
            // Add only unique residues
            residues.forEach(residue => {
                if (!state.selections[auth_asym_id].some(
                    existing => existing[0] === residue[0] && existing[1] === residue[1]
                )) {
                    state.selections[auth_asym_id].push(residue);
                }
            });
        },
        removeSelection: (state, action: PayloadAction<{
            auth_asym_id: string,
            residues: ResidueData[]
        }>) => {
            const { auth_asym_id, residues } = action.payload;
            if (state.selections[auth_asym_id]) {
                state.selections[auth_asym_id] = state.selections[auth_asym_id].filter(
                    existing => !residues.some(
                        toRemove => toRemove[0] === existing[0] && toRemove[1] === existing[1]
                    )
                );
            }
        },
        clearSelections: (state, action: PayloadAction<string | undefined>) => {
            if (action.payload) {
                // Clear specific chain
                delete state.selections[action.payload];
            } else {
                // Clear all
                state.selections = {};
            }
        }
    }
});

export const { addSelection, removeSelection, clearSelections } = sequenceViewerSlice.actions;
export default sequenceViewerSlice.reducer;