'use client'
import { ResidueData } from '@/app/components/sequence_viewer';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export type RCSB_ID = string;
export type UUIDHandle = string;
export type MolstarRef = string;
export type auth_asym_id = string;
export type chemical_id = string;

export type ComponentType = 'polymer' | 'ligand' | 'bsite';

interface BaseComponent {
    type   : ComponentType;
    rcsb_id: RCSB_ID;
    ref    : MolstarRef;
}

export interface PolymerComponent extends BaseComponent {
    type: 'polymer';
    auth_asym_id: auth_asym_id;
    sequence: ResidueData[];
}

export interface LigandComponent extends BaseComponent {
    type: 'ligand';
    chemicalId: chemical_id;
    repr_ref?: MolstarRef;
    sel_ref?: MolstarRef;
}

export interface BsiteComponent extends BaseComponent {
    type: 'bsite';
    chemicalId: chemical_id;
    repr_ref: MolstarRef;
    sel_ref: MolstarRef;
}

export type MolstarInstanceId = 'main' | 'auxiliary';
export type SubComponent = PolymerComponent | LigandComponent | BsiteComponent;

interface HandleReferencesState {
    instances: Record<MolstarInstanceId, {
        rcsb_id_root_ref_map: Record<RCSB_ID, MolstarRef>;
        rcsb_id_components_map: Record<RCSB_ID, Array<auth_asym_id | chemical_id>>;
        components: Record<string, SubComponent>;
    }>;
}

const initialState: HandleReferencesState = {
    instances: {
        main: {
            rcsb_id_root_ref_map: {},
            rcsb_id_components_map: {},
            components: {}
        },
        auxiliary: {
            rcsb_id_root_ref_map: {},
            rcsb_id_components_map: {},
            components: {}
        }
    }
};

// Utility function to generate component IDs
const makeComponentId = (rcsbId: RCSB_ID, localId: auth_asym_id | chemical_id) =>
    `${rcsbId}_${localId}`;

export const handleReferencesSlice = createSlice({
    name: 'handleReferences',
    initialState,
    reducers: {
        mapAssetRootRefAdd: (
            state,
            action: PayloadAction<{
                instanceId: MolstarInstanceId;
                payload: [RCSB_ID, MolstarRef];
            }>
        ) => {
            const { instanceId, payload: [rcsbId, ref] } = action.payload;
            state.instances[instanceId].rcsb_id_root_ref_map[rcsbId] = ref;
        },

        mapAssetRootRefDelete: (
            state,
            action: PayloadAction<{
                instanceId: MolstarInstanceId;
                rcsbId: RCSB_ID;
            }>
        ) => {
            const { instanceId, rcsbId } = action.payload;
            delete state.instances[instanceId].rcsb_id_root_ref_map[rcsbId];
        },

        mapAssetModelComponentsAdd: (
            state,
            action: PayloadAction<{
                instanceId: MolstarInstanceId;
                rcsbId: RCSB_ID;
                components: Record<string, SubComponent>;
            }>
        ) => {
            const { instanceId, rcsbId, components } = action.payload;
            const instance = state.instances[instanceId];
            const localIds = Object.keys(components);

            instance.rcsb_id_components_map[rcsbId] = [
                ...(instance.rcsb_id_components_map[rcsbId] || []),
                ...localIds
            ];

            localIds.forEach(localId => {
                instance.components[localId] = {
                    ...components[localId],
                    rcsb_id: rcsbId,
                };
            });
        },

        mapAssetModelComponentsDeleteAll: (
            state,
            action: PayloadAction<{
                instanceId: MolstarInstanceId;
                rcsbId: RCSB_ID;
            }>
        ) => {
            const { instanceId, rcsbId } = action.payload;
            const instance = state.instances[instanceId];
            const localIds = instance.rcsb_id_components_map[rcsbId] || [];
            localIds.forEach(localId => {
                delete instance.components[localId];
            });
            delete instance.rcsb_id_components_map[rcsbId];
        },

        mapResetAll: (state) => {
            return initialState;
        },

        mapResetInstance: (
            state,
            action: PayloadAction<{
                instanceId: MolstarInstanceId;
            }>
        ) => {
            state.instances[action.payload.instanceId] = {
                rcsb_id_root_ref_map: {},
                rcsb_id_components_map: {},
                components: {}
            };
        }
    }
});

// Selectors
const selectHandleReferences = (state: RootState) => state.mstar_refs;
const selectInstances = (state: RootState) => state.mstar_refs.instances;
const selectInstance = (state: RootState, instanceId: MolstarInstanceId) =>
    state.mstar_refs.instances[instanceId];

// Basic selectors
export const selectMolstarRefForRCSB = createSelector(
    [selectInstances, (_state, params: { instanceId: MolstarInstanceId; rcsbId: RCSB_ID }) => params],
    (instances, { instanceId, rcsbId }) =>
        instances[instanceId].rcsb_id_root_ref_map[rcsbId]
);

// Updated to include type filtering
export const selectComponentsForRCSB = createSelector(
    [
        selectInstances,
        (_state, params: {
            instanceId: MolstarInstanceId;
            rcsbId: RCSB_ID;
            componentType?: ComponentType;
        }) => params
    ],
    (instances, { instanceId, rcsbId, componentType }) => {
        const instance = instances[instanceId];
        const localIds = instance.rcsb_id_components_map[rcsbId] || [];
        const components = localIds.map(localId => instance.components[localId]);
        
        if (componentType) {
            return components.filter(component => component.type === componentType);
        }
        return components;
    }
);

export const selectComponentById = createSelector(
    [selectInstances, (_state, params: { instanceId: MolstarInstanceId; componentId: string }) => params],
    (instances, { instanceId, componentId }) =>
        instances[instanceId].components[componentId]
);

// Updated to support type-specific component selection
export const selectComponentByRCSBAndLocalId = createSelector(
    [
        selectInstances,
        (_state, params: {
            instanceId: MolstarInstanceId;
            rcsbId: RCSB_ID;
            localId: auth_asym_id | chemical_id;
        }) => params
    ],
    (instances, { instanceId, rcsbId, localId }) =>
        instances[instanceId].components[`${rcsbId}_${localId}`]
);

export const selectRefsForRCSB = createSelector(
    [selectComponentsForRCSB],
    (components) => components.map(c => c.ref)
);

// New selector for filtering components by type
export const selectComponentsByType = createSelector(
    [
        selectInstances,
        (_state, params: {
            instanceId: MolstarInstanceId;
            componentType: ComponentType;
        }) => params
    ],
    (instances, { instanceId, componentType }) => {
        const instance = instances[instanceId];
        return Object.values(instance.components)
            .filter(component => component.type === componentType);
    }
);

export const selectAllComponentsForInstance = createSelector(
    [selectInstances, (_state, instanceId: MolstarInstanceId) => instanceId],
    (instances, instanceId) => instances[instanceId].components
);

export const selectRCSBIdsForInstance = createSelector(
    [selectInstances, (_state, instanceId: MolstarInstanceId) => instanceId],
    (instances, instanceId) =>
        Object.keys(instances[instanceId].rcsb_id_root_ref_map)
);

export const selectBsiteForLigand = createSelector(
    [
        selectInstances,
        (_state, params: {
            instanceId: MolstarInstanceId;
            rcsbId: RCSB_ID;
            chemicalId: chemical_id;
        }) => params
    ],
    (instances, { instanceId, rcsbId, chemicalId }) => {
        const instance = instances[instanceId];
        const bsiteComponents = Object.values(instance.components)
            .filter((component): component is BsiteComponent => 
                component.type === 'bsite' && 
                component.chemicalId === chemicalId &&
                component.rcsb_id === rcsbId
            );
        return bsiteComponents[0];
    }
);

// Export actions
export const {
    mapAssetRootRefAdd,
    mapAssetRootRefDelete,
    mapAssetModelComponentsAdd,
    mapAssetModelComponentsDeleteAll,
    mapResetAll,
    mapResetInstance
} = handleReferencesSlice.actions;

export default handleReferencesSlice.reducer;
