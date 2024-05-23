import { createAsyncThunk, createListenerMiddleware, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum, RibosomeStructure, ribxz_api, useRoutersRouterStructFilterListQuery } from '@/store/ribxz_api/ribxz_api'

export interface Filters {
    search         : string | null
    year           : [number | null, number | null]
    resolution     : [number | null, number | null]
    polymer_classes: CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum[]
    source_taxa    : number[]
    host_taxa      : number[]
}

export interface Pagination {
    current_page: number
    page_size   : number
    total_pages : number | null

}

export interface UIState {
    data:{
        current_structures: RibosomeStructure[],
        total_count       : number | null
    }
    filters   : Filters,
    pagination: Pagination
}

const initialState: UIState = {
    data:{
        current_structures: [],
        total_count: null
    },
    filters: {
        search         : null,
        year           : [null, null],
        resolution     : [null, null],
        polymer_classes: [],
        source_taxa    : [],
        host_taxa      : [],
    },
    pagination: {
        current_page: 1,
        page_size: 10,
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
        //* ------------------------- Filters and pagination 
        set_filter(state, action: PayloadAction<{
            filter_type: keyof Filters,
            value: typeof state.filters[keyof Filters]
        }>) {
            Object.assign(state.filters, { [action.payload.filter_type]: action.payload.value })
        },

        pagination_prev_page(state) {
            if (1 < state.pagination.current_page) {
                state.pagination.current_page -= 1
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
            state.data.total_count = action.payload.count
        })
    }

})






export const {
    set_new_structs,
    set_filter,
    pagination_next_page,
    pagination_prev_page
} = uiSlice.actions
export default uiSlice.reducer