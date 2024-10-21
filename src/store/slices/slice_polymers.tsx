'use client'
import { createAsyncThunk, createListenerMiddleware, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum, LigandTransposition, Polymer, Protein, RibosomeStructure, ribxz_api, Rna } from '@/store/ribxz_api/ribxz_api'
import { StructureFilters } from './slice_structures'


interface PolymerFilters {
    current_polymer_class: null | CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum,
    uniprot_id           : string | null
    has_motif            : string | null
}

type PolymersFilters = StructureFilters & PolymerFilters

export interface PolymersSlice {
    current_polymers    : Array<Polymer | Rna | Protein>,
    total_polymers_count: number | null,
    total_paren_structures_count: number | null,
    filters             : PolymersFilters
}

const initialState: PolymersSlice = {
    current_polymers    : [],
    total_polymers_count: null,
    total_paren_structures_count: null,
    filters             : {
        current_polymer_class: null,
        uniprot_id           : null,
        has_motif            : null,

        search          : '',
        subunit_presence: null,
        year            : [null, null],
        resolution      : [null, null],
        polymer_classes : [],
        source_taxa     : [],
        host_taxa       : [],
    },
}

export const polymers_slice = createSlice({
    name: 'polymers_slice',
    initialState,
    reducers: {

        set_total_polymers_count(state, action: PayloadAction<number>) {
            state.total_polymers_count = action.payload
        },
        set_total_parent_structures_count(state, action: PayloadAction<number>) {
            state.total_paren_structures_count = action.payload
        },
        set_current_polymers(state, action: PayloadAction<Array<Polymer | Rna | Protein>>) {
            state.current_polymers = action.payload
        },
        set_polymer_filter(state, action: PayloadAction<{ filter_type: keyof PolymersFilters, value: typeof state.filters[keyof PolymersFilters] }>) {
            Object.assign(state.filters, { [action.payload.filter_type]: action.payload.value })
        },

    },
})
export const {
    set_current_polymers,
    set_polymer_filter,
    set_total_polymers_count,
    set_total_parent_structures_count
}  = polymers_slice.actions
export default polymers_slice.reducer