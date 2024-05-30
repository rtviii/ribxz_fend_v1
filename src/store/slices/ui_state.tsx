import { createAsyncThunk, createListenerMiddleware, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum, Polymer, Protein, RibosomeStructure, ribxz_api, Rna, Rna, useRoutersRouterStructFilterListQuery } from '@/store/ribxz_api/ribxz_api'

const PAGE_SIZE_STRUCTURES = 20;
const PAGE_SIZE_POLYMERS = 50;
export interface FiltersState {
    search: string | null
    year: [number | null, number | null]
    resolution: [number | null, number | null]
    polymer_classes: CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum[]
    source_taxa: number[]
    host_taxa: number[]
}

export interface PaginationState {
    current_page: number
    total_pages: number | null

}

export interface UIState {
    data: {
        current_structures    : RibosomeStructure[],
        current_polymers      : Protein | Rna | Polymer[],
        total_structures_count: number | null,
        total_polymers_count  : number | null
    },
    polymers: {
        current_polymer_class: CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum | null,
    }
    filters: FiltersState,
    pagination: PaginationState
}

const initialState: UIState = {
    data: {
        current_structures    : [],
        current_polymers      : [],
        total_structures_count: null,
        total_polymers_count  : null
    },
    polymers: {
        current_polymer_class: null
    },

    filters: {
        search         : '',
        year           : [null, null],
        resolution     : [null, null],
        polymer_classes: [],
        source_taxa    : [],
        host_taxa      : [],
    },
    pagination: {
        current_page: 1,
        total_pages: null
    }
}

// OK there is the filter list endpoint
// We want to :
// -   prefetch the total number of structures on loadup
// -   dispatch update the moment any set_filter changes (that means set new count, set page to 1)
// -   dispatch pagination update the moment a page changes 


// Create the middleware instance and methods
const UIUpdateListenerMiddelware = createListenerMiddleware()

// const [triggerRefetch, { data, error }] = ribxz_api.endpoints.routersRouterStructFilterList.useLazyQuery()


export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        set_new_structs(state, action: PayloadAction<RibosomeStructure[]>) {
            state.data.current_structures = action.payload
        },
        //* ------------------------- Polymers
        set_current_polymer_class(state, action: PayloadAction<CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum>) {
            Object.assign(state.polymers, { current_polymer_class: action.payload })
        },
        //* ------------------------- Filters 
        set_filter(state, action: PayloadAction<{ filter_type: keyof FiltersState, value: typeof state.filters[keyof FiltersState] }>) {
            Object.assign(state.filters, { [action.payload.filter_type]: action.payload.value })
        },

        //* ------------------------- Pagination
        pagination_prev_page(state) {
            if (1 < state.pagination.current_page) {
                state.pagination.current_page -= 1
            }

        },
        pagination_set_page(state, action: PayloadAction<number>) {
            if (action.payload <= state.pagination.total_pages! && 1 <= action.payload) {
                state.pagination.current_page = action.payload
            }

        },
        pagination_next_page(state) {
            if (state.pagination.current_page < state.pagination.total_pages!) {
                state.pagination.current_page += 1
            }
        },

    },
    extraReducers: (builder) => {
        builder.addMatcher(ribxz_api.endpoints.routersRouterStructFilterList.matchFulfilled, (state, action) => {
            state.data.current_structures = action.payload.structures
            state.data.total_structures_count = action.payload.count
            state.pagination.total_pages = Math.ceil(action.payload.count / PAGE_SIZE_STRUCTURES)
        });
        builder.addMatcher(ribxz_api.endpoints.routersRouterStructPolymersByStructure.matchFulfilled, (state, action) => {
            state.data.current_polymers = action.payload.polymers
            state.data.total_polymers_count = action.payload.count
            state.pagination.total_pages = Math.ceil(action.payload.count / PAGE_SIZE_POLYMERS)
        })
    }

})






export const {
    set_current_polymer_class,
    set_new_structs,
    set_filter,
    pagination_set_page,
    pagination_next_page,
    pagination_prev_page
} = uiSlice.actions
export default uiSlice.reducer