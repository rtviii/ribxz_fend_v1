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

    current_polymers_page: number
    total_polymers_pages: number | null

    current_structures_page: number
    total_structures_pages: number | null

}

export interface UIState {
    data: {
        current_structures: RibosomeStructure[],
        current_polymers: Array<Polymer | Rna | Protein>,
        total_structures_count: number | null,
        total_polymers_count: number | null
    },
    polymers: {
        current_polymer_class: CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum | null,
    }
    filters: FiltersState,
    pagination: PaginationState
}

const initialState: UIState = {
    data: {
        current_structures: [],
        current_polymers: [],
        total_structures_count: null,
        total_polymers_count: null
    },
    polymers: {
        current_polymer_class: null
    },

    filters: {
        search: '',
        year: [null, null],
        resolution: [null, null],
        polymer_classes: [],
        source_taxa: [],
        host_taxa: [],
    },
    pagination: {
        current_structures_page: 1,
        total_structures_pages: null,

        current_polymers_page: 1,
        total_polymers_pages: null
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
        set_current_polymers(state, action: PayloadAction<Array<Polymer | Rna | Protein>>) {
            state.data.current_polymers = action.payload
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
        pagination_prev_page(state, action: PayloadAction<{
            slice_name: 'structures' | 'polymers',
        }>) {
            if (action.payload.slice_name === 'polymers') {
                if (1 < state.pagination.current_polymers_page) {
                    state.pagination.current_polymers_page -= 1
                }
            }
            if (action.payload.slice_name === 'structures') {
                if (1 < state.pagination.current_structures_page) {
                    state.pagination.current_structures_page -= 1
                }
            }
        },
        pagination_set_page(state, action: PayloadAction<{
            slice_name: 'structures' | 'polymers',
            set_to_page: number
        }>) {
            if (action.payload.slice_name === 'polymers') {
                if (action.payload.set_to_page <= state.pagination.total_polymers_pages! && 1 <= action.payload.set_to_page) {
                    state.pagination.current_polymers_page = action.payload.set_to_page
                }
            } else if (action.payload.slice_name === 'structures') {
                if (action.payload.set_to_page <= state.pagination.total_structures_pages! && 1 <= action.payload.set_to_page) {
                    state.pagination.current_structures_page = action.payload.set_to_page
                }

            }
        },
        pagination_next_page(state, action: PayloadAction<{
            slice_name: 'structures' | 'polymers',
        }>) {
            if (action.payload.slice_name == 'polymers') {
                if (state.pagination.current_polymers_page < state.pagination.total_polymers_pages!) {
                    state.pagination.current_polymers_page += 1
                }
            } else if (action.payload.slice_name == 'structures') {
                if (state.pagination.current_structures_page < state.pagination.total_structures_pages!) {
                    state.pagination.current_structures_page += 1
                }
            }
        },

    },
    extraReducers: (builder) => {

        builder.addMatcher(ribxz_api.endpoints.routersRouterStructFilterList.matchFulfilled, (state, action) => {
            state.data.current_structures           = action.payload.structures
            state.data.total_structures_count       = action.payload.count
            state.pagination.total_structures_pages = Math.ceil(action.payload.count / PAGE_SIZE_STRUCTURES)
        });

        builder.addMatcher(ribxz_api.endpoints.routersRouterStructPolymersByStructure.matchFulfilled, (state, action) => {
            console.log("Received polymers by structure");
            console.log({...action});
            
            state.data.current_polymers           = action.payload.polymers
            state.data.total_polymers_count       = action.payload.count
            state.pagination.total_polymers_pages = Math.ceil(action.payload.count / PAGE_SIZE_POLYMERS)
        });

        builder.addMatcher(ribxz_api.endpoints.routersRouterStructPolymersByPolymerClass.matchFulfilled, (state, action) => {

            console.log("Received polymers by polymer class");
            console.log({...action});

            state.data.current_polymers           = action.payload.polymers
            state.data.total_polymers_count       = action.payload.count
            state.pagination.total_polymers_pages = Math.ceil(action.payload.count / PAGE_SIZE_POLYMERS)
        })
    }
})


export const {
    set_current_polymers,
    set_current_polymer_class,
    set_new_structs,
    set_filter,
    pagination_set_page,
    pagination_next_page,
    pagination_prev_page
} = uiSlice.actions
export default uiSlice.reducer