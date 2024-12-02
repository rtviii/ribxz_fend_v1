import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ResidueData } from './slice_seq_viewer';

export interface PolymerComponent {
    type: 'Polymer';
    ref: string;
    auth_asym_id: string;
    sequence: ResidueData[];
}
export interface LigandComponent {
    type: 'Ligand';
    chemicalId: string;
    ref: string;
}

export type SubComponent = PolymerComponent | LigandComponent;
interface HandleReferencesState {
    handle_root_ref_map: Record<string, string>;
    handle_repr_ref_map: Record<string, string>;
    handle_model_components_map: Record<string, { polymer: PolymerComponent[]; ligand: LigandComponent[] }>;
}

const initialState: HandleReferencesState = {
    handle_root_ref_map: {},
    handle_repr_ref_map: {},
    handle_model_components_map: {},
};

export const handleReferencesSlice = createSlice({
    name: 'handleReferences',
    initialState,
    reducers: {
        mapAssetRootRefAdd: (state, action: PayloadAction<[string, string]>) => {
            state.handle_root_ref_map[action.payload[0]] = action.payload[1];
            console.log("Added root ref", action.payload[0], action.payload[1]);

        },
        mapAssetRootRefDelete: (state, action: PayloadAction<string>) => {
            delete state.handle_root_ref_map[action.payload];
        },
        mapAssetReprRefAdd: (state, action: PayloadAction<[string, string]>) => {
            state.handle_repr_ref_map[action.payload[0]] = action.payload[1];
        },
        mapAssetReprRefDelete: (state, action: PayloadAction<string>) => {
            delete state.handle_repr_ref_map[action.payload];
        },
        mapAssetModelComponentsAdd: (
            state,
            action: PayloadAction<{
                handle: string;
                components: { polymer: PolymerComponent[]; ligand: LigandComponent[] };
            }>
        ) => {
            console.log("got some payload");

            return {
                ...state,
                handle_model_components_map: {
                    ...state.handle_model_components_map,
                    [action.payload.handle]: {
                        ligand: action.payload.components.ligand,
                        polymer: action.payload.components.polymer
                    }
                }
            }
        },
        mapAssetModelComponentsDeleteAll: (state, action: PayloadAction<string>) => {
            delete state.handle_model_components_map[action.payload];
        },
        mapAssetModelComponentsPop: (
            state,
            action: PayloadAction<{ handle: string; component: SubComponent }>
        ) => {
            const currentComponents = state.handle_model_components_map[action.payload.handle];
            if (currentComponents) {
                state.handle_model_components_map[action.payload.handle] = {
                    polymer: currentComponents.polymer.filter(c => c !== action.payload.component),
                    ligand: currentComponents.ligand.filter(c => c !== action.payload.component)
                };
            }
        }
    }
});

export const {
    mapAssetRootRefAdd,
    mapAssetRootRefDelete,
    mapAssetReprRefAdd,
    mapAssetReprRefDelete,
    mapAssetModelComponentsAdd,
    mapAssetModelComponentsDeleteAll,
    mapAssetModelComponentsPop
} = handleReferencesSlice.actions;

export default handleReferencesSlice.reducer;