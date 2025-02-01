import {PayloadAction, createSlice} from '@reduxjs/toolkit';

interface BindingSite {
    isVisible: boolean;
    ref?: string;
}

interface BindingSiteState {
    sites: Record<string, BindingSite>;
}

const initialState: BindingSiteState = {
    sites: {}
};

export const bsite_demo_slice = createSlice({
    name: 'bsite_demo',
    initialState,
    reducers: {
        addBindingSite(
            state,
            action: PayloadAction<{
                chemicalId: string;
                residues: {
                    auth_asym_id: string;
                    auth_seq_id: number;
                }[];
            }>
        ) {
            state.sites[action.payload.chemicalId] = {
                isVisible: false
            };
        },
        setBindingSiteRef(
            state,
            action: PayloadAction<{
                chemicalId: string;
                ref: string;
            }>
        ) {
            if (state.sites[action.payload.chemicalId]) {
                state.sites[action.payload.chemicalId].ref = action.payload.ref;
            }
        },
        setBindingSiteVisibility(
            state,
            action: PayloadAction<{
                chemicalId: string;
                isVisible: boolean;
            }>
        ) {
            if (state.sites[action.payload.chemicalId]) {
                state.sites[action.payload.chemicalId].isVisible = action.payload.isVisible;
            }
        },
        batchSetVisibility(
            state,
            action: PayloadAction<{
                updates: Array<{chemicalId: string; isVisible: boolean}>;
            }>
        ) {
            action.payload.updates.forEach(({chemicalId, isVisible}) => {
                if (state.sites[chemicalId]) {
                    state.sites[chemicalId].isVisible = isVisible;
                }
            });
        }
    }
});

// Export actions and types
export const {addBindingSite, setBindingSiteRef, setBindingSiteVisibility, batchSetVisibility} = bsite_demo_slice.actions;

export type {BindingSite, BindingSiteState};
export default bsite_demo_slice.reducer;
