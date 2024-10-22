'use client'
import { createAsyncThunk, createListenerMiddleware, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum, LigandTransposition, Polymer, Protein, RibosomeStructure, ribxz_api, Rna } from '@/store/ribxz_api/ribxz_api'

export interface StructureFilters {
    search          : string | null
    year            : [number | null, number | null]
    resolution      : [number | null, number | null]
    subunit_presence: 'LSU+SSU' | 'SSU' | 'LSU' | null
    polymer_classes : CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum[]
    source_taxa     : number[]
    host_taxa       : number[]
}

export interface StructuresSlice {
    current_structures: RibosomeStructure[],
    total_structures_count: number | null,
    filters: StructureFilters,
}

const initialState: StructuresSlice = {
    current_structures: [],
    total_structures_count: null,
    filters: {
        search          : '',
        subunit_presence: null,
        year            : [null, null],
        resolution      : [null, null],
        polymer_classes : [],
        source_taxa     : [],
        host_taxa       : [],
    },
}

export const structures_slice = createSlice({
    name: 'structures_slice',
    initialState,
    reducers: {

        set_current_structures(state, action: PayloadAction<RibosomeStructure[]>) {
            state.current_structures = action.payload
        },
        set_total_structures_count(state, action: PayloadAction<number>) {
            state.total_structures_count = action.payload
        },
        set_filter(state, action: PayloadAction<{ filter_type: keyof StructureFilters, value: typeof state.filters[keyof StructureFilters] }>) {
            Object.assign(state.filters, { [action.payload.filter_type]: action.payload.value })
        },

    },
    extraReducers: (builder) => {
        //  DONE: Replaced with the POST mutation based approach
        // builder.addMatcher(ribxz_api.endpoints.routersRouterStructFilterList.matchFulfilled, (state, action) => {
        //     // @ts-ignore
        //     state.data.current_structures = action.payload.structures
        //     // @ts-ignore
        //     state.data.total_structures_count = action.payload.count
        //     // @ts-ignore
        //     state.pagination.total_structures_pages = Math.ceil(action.payload.count / PAGE_SIZE_STRUCTURES)
        // });
    }
})

export const {


    set_current_structures,
    set_total_structures_count,
    set_filter: set_structures_filter,


} = structures_slice.actions
export default structures_slice.reducer