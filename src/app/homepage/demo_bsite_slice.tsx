import {PayloadAction, createSlice} from '@reduxjs/toolkit';

interface BindingSite {
    chemicalId: string;
    residues: {
        auth_asym_id: string;
        auth_seq_id: number;
    }[];
    isVisible: boolean;
    ref?: string;
}

interface BindingSiteState {
    sites: Record<string, BindingSite>;
}

const initialState: BindingSiteState = {
    sites: {}
};

export const bindingSiteSlice = createSlice({
    name: 'bindingSites',
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
                ...action.payload,
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
        }
    }
});

// Export actions and types
export const {addBindingSite, setBindingSiteRef, setBindingSiteVisibility} = bindingSiteSlice.actions;

export type {BindingSite, BindingSiteState};
export default bindingSiteSlice.reducer;
