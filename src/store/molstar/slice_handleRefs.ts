import { createSelector } from '@reduxjs/toolkit';
import { ResidueData } from '@/app/components/sequence_viewer';

// Types
export type RCSB_ID = string;
export type MolstarRef = string;
export type auth_asym_id = string;

// Normalized State Structure
interface NormalizedState {
    // Entities
    roots: {
        byId: Record<RCSB_ID, MolstarRef>,
        allIds: RCSB_ID[]
    },
    representations: {
        byId: Record<RCSB_ID, MolstarRef>,
        allIds: RCSB_ID[]
    },
    polymers: {
        byId: Record<string, {
            ref: MolstarRef,
            seq: ResidueData[],
            handle: RCSB_ID,
            auth_asym_id: auth_asym_id
        }>,
        allIds: string[]
    },
    ligands: {
        byId: Record<string, {
            ref: MolstarRef,
            handle: RCSB_ID,
            auth_asym_id: auth_asym_id
        }>,
        allIds: string[]
    }
}

const initialState: NormalizedState = {
    roots: { byId: {}, allIds: [] },
    representations: { byId: {}, allIds: [] },
    polymers: { byId: {}, allIds: [] },
    ligands: { byId: {}, allIds: [] }
};

// Selectors
const getRoots = (state: NormalizedState) => state.roots;
const getRepresentations = (state: NormalizedState) => state.representations;
const getPolymers = (state: NormalizedState) => state.polymers;
const getLigands = (state: NormalizedState) => state.ligands;

// Memoized Selectors
export const selectRootRefByHandle = createSelector(
    [getRoots, (_state, handle: RCSB_ID) => handle],
    (roots, handle) => roots.byId[handle]
);

export const selectReprRefByHandle = createSelector(
    [getRepresentations, (_state, handle: RCSB_ID) => handle],
    (representations, handle) => representations.byId[handle]
);

export const selectPolymersByHandle = createSelector(
    [getPolymers, (_state, handle: RCSB_ID) => handle],
    (polymers, handle) =>
        polymers.allIds
            .map(id => polymers.byId[id])
            .filter(polymer => polymer.handle === handle)
);

export const selectLigandsByHandle = createSelector(
    [getLigands, (_state, handle: RCSB_ID) => handle],
    (ligands, handle) =>
        ligands.allIds
            .map(id => ligands.byId[id])
            .filter(ligand => ligand.handle === handle)
);

export const selectAllComponentsByHandle = createSelector(
    [selectPolymersByHandle, selectLigandsByHandle],
    (polymers, ligands) => ({ polymers, ligands })
);

// Slice
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {  LigandComponent,  PolymerComponent } from './slice_refs';

export const molecularComponentsSlice = createSlice({
    name: 'molecularComponents',
    initialState,
    reducers: {
        addRootRef: (state, action: PayloadAction<{ handle: RCSB_ID, ref: MolstarRef }>) => {
            const { handle, ref } = action.payload;
            state.roots.byId[handle] = ref;
            if (!state.roots.allIds.includes(handle)) {
                state.roots.allIds.push(handle);
            }
        },
        addReprRef: (state, action: PayloadAction<{ handle: RCSB_ID, ref: MolstarRef }>) => {
            const { handle, ref } = action.payload;
            state.representations.byId[handle] = ref;
            if (!state.representations.allIds.includes(handle)) {
                state.representations.allIds.push(handle);
            }
        },
        addComponents: (state, action: PayloadAction<{
            handle: RCSB_ID,
            components: Record<string, PolymerComponent | LigandComponent>
        }>) => {
            const { handle, components } = action.payload;

            Object.entries(components).forEach(([auth_asym_id, component]) => {
                const id = `${handle}_${auth_asym_id}`;

                if ('seq' in component) {
                    // Polymer
                    state.polymers.byId[id] = {
                        ref: component.ref,
                        // @ts-ignore
                        seq: component.seq,
                        handle,
                        auth_asym_id
                    };
                    if (!state.polymers.allIds.includes(id)) {
                        state.polymers.allIds.push(id);
                    }
                } else {
                    // Ligand
                    state.ligands.byId[id] = {
                        ref: component.ref,
                        handle,
                        auth_asym_id
                    };
                    if (!state.ligands.allIds.includes(id)) {
                        state.ligands.allIds.push(id);
                    }
                }
            });
        },
        removeHandle: (state, action: PayloadAction<RCSB_ID>) => {
            const handle = action.payload;

            // Remove from roots
            delete state.roots.byId[handle];
            state.roots.allIds = state.roots.allIds.filter(id => id !== handle);

            // Remove from representations
            delete state.representations.byId[handle];
            state.representations.allIds = state.representations.allIds.filter(id => id !== handle);

            // Remove associated polymers and ligands
            state.polymers.allIds = state.polymers.allIds.filter(id => {
                if (state.polymers.byId[id].handle === handle) {
                    delete state.polymers.byId[id];
                    return false;
                }
                return true;
            });

            state.ligands.allIds = state.ligands.allIds.filter(id => {
                if (state.ligands.byId[id].handle === handle) {
                    delete state.ligands.byId[id];
                    return false;
                }
                return true;
            });
        }
    }
});

export const {
    addRootRef,
    addReprRef,
    addComponents,
    removeHandle
} = molecularComponentsSlice.actions;

export default molecularComponentsSlice.reducer;