'use client'
import { ResidueData } from '@/app/components/sequence_viewer';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type RCSB_ID = string;
export type UUIDHandle = string;
export type MolstarRef = string;
export type auth_asym_id = string;
export type chemical_id = string;

export interface PolymerComponent {
    rcsb_id     : RCSB_ID;
    ref         : MolstarRef;
    auth_asym_id: auth_asym_id;
    sequence    : ResidueData[];
}

export interface LigandComponent {
    rcsb_id: RCSB_ID;
    chemicalId: chemical_id;
    ref: MolstarRef;
}

export type SubComponent = PolymerComponent | LigandComponent;

interface HandleReferencesState {
    rcsb_id_root_ref_map  : Record<RCSB_ID, MolstarRef>;
    rcsb_id_components_map: Record<RCSB_ID, Array<auth_asym_id | chemical_id>>;
    components            : Record<string,  SubComponent>;
}

const initialState: HandleReferencesState = {
    rcsb_id_root_ref_map  : {},
    rcsb_id_components_map: {},
    components            : {}
};

// Utility function to generate component IDs
const makeComponentId = (rcsbId: RCSB_ID, localId: auth_asym_id | chemical_id) =>
    `${rcsbId}_${localId}`;

export const handleReferencesSlice = createSlice({
    name: 'handleReferences',
    initialState,
    reducers: {

        mapAssetRootRefAdd: (state, action: PayloadAction<[RCSB_ID, MolstarRef]>) => {
            const [rcsbId, ref] = action.payload;
            state.rcsb_id_root_ref_map[rcsbId] = ref;
        },

        mapAssetRootRefDelete: (state, action: PayloadAction<RCSB_ID>) => {
            delete state.rcsb_id_root_ref_map[action.payload];
        },

        mapAssetModelComponentsAdd: (
            state,
            action: PayloadAction<{
                rcsbId: RCSB_ID;
                components: Record<string, PolymerComponent | LigandComponent>;
            }>
        ) => {
            const { rcsbId, components } = action.payload;
            const localIds = Object.keys(components);

            // Update the components map for this RCSB ID
            state.rcsb_id_components_map[rcsbId] = localIds;

            // Add each component to the normalized store
            localIds.forEach(localId => {
                const component = components[localId];

                // Add RCSB ID to the component
                state.components[localId] = {
                    ...component,
                    rcsb_id: rcsbId,
                };
            });
        },

        mapAssetModelComponentsDeleteAll: (state, action: PayloadAction<RCSB_ID>) => {
            const rcsbId = action.payload;

            // Get all component IDs for this RCSB ID
            const localIds = state.rcsb_id_components_map[rcsbId] || [];

            // Remove each component
            localIds.forEach(localId => {
                const globalId = makeComponentId(rcsbId, localId);
                delete state.components[globalId];
            });

            // Remove the RCSB ID entry
            delete state.rcsb_id_components_map[rcsbId];
        },
        mapResetAll: (state) => {
            return initialState;
        }
       
    }
});

export const {
    mapAssetRootRefAdd,
    mapAssetRootRefDelete,
    mapAssetModelComponentsAdd,
    mapAssetModelComponentsDeleteAll,
    mapResetAll
} = handleReferencesSlice.actions;

export default handleReferencesSlice.reducer;


import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store'; // Assuming this is your store type

// Base selectors
const selectHandleReferences  = (state: RootState) => state.mstar_refs;
const selectComponents        = (state: RootState) => state.mstar_refs.components;
const selectRCSBRefMap        = (state: RootState) => state.mstar_refs.rcsb_id_root_ref_map;
const selectRCSBComponentsMap = (state: RootState) => state.mstar_refs.rcsb_id_components_map;

// Memoized selectors
export const selectMolstarRefForRCSB = createSelector(
    [selectRCSBRefMap, (_state, rcsbId: RCSB_ID) => rcsbId],
    (refMap, rcsbId) => refMap[rcsbId]
);

export const selectComponentsForRCSB = createSelector(
    [selectComponents, selectRCSBComponentsMap, (_state, rcsbId: RCSB_ID) => rcsbId],
    (components, componentsMap, rcsbId) => {
        const localIds = componentsMap[rcsbId] || [];
        return localIds.map(localId => components[`${rcsbId}_${localId}`]);
    }
);


export const selectComponentById = createSelector(
    [selectComponents, (_state, componentId: string) => componentId],
    (components, componentId) => components[componentId]
);

// Useful for getting a specific component when you have RCSB ID and local ID
export const selectComponentByRCSBAndLocalId = createSelector(
    [
        selectComponents,
        (_state, params: { rcsbId: RCSB_ID; localId: auth_asym_id | chemical_id }) => params
    ],
    (components, { rcsbId, localId }) => components[`${rcsbId}_${localId}`]
);

// Get all refs for components of a specific RCSB ID
export const selectRefsForRCSB = createSelector(
    [selectComponentsForRCSB],
    (components) => components.map(c => c.ref)
);