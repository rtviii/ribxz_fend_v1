import { createAsyncThunk, createListenerMiddleware, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum, ribxz_api } from '@/store/ribxz_api/ribxz_api'

interface Filters {
    search         : string
    year           : [number | null, number | null]
    resolution     : [number | null, number | null]
    polymer_classes: CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum[]
    source_taxa    : number[]
    host_taxa      : number[]
}

interface Pagination {
    current_page: number
    page_size: number
    total_pages: number | null

}

export interface UIState {
    filters: Filters,
    pagination: Pagination
}

const initialState: UIState = {
    filters: {
        search: '',
        year: [null, null],
        resolution: [null, null],
        polymer_classes: [],
        source_taxa: [],
        host_taxa: [],
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







export const uiSlice = createSlice({
    initialState,
    name: 'ui',
    reducers: {
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
        builder.addMatcher(
            ribxz_api.endpoints.routersRouterStructFilterList.matchFulfilled,
            (state, { payload }) => {
                console.log("match list struct")
                console.log(state)
                console.log(payload)
            });

        // builder.addMatcher(
        //     set_filter.match, //updated
        //     (state, action) => {
        //         console.log("match set filter")
        //         console.log("new state", state.filters.host_taxa, state.filters.resolution);
        //         console.log(action.payload);
                
        //     }
        // );
    },
})






// Add one or more listener entries that look for specific actions.
// They may contain any sync or async logic, similar to thunks.
UIUpdateListenerMiddelware.startListening({
  actionCreator: set_filter,
  effect: async (action, listenerApi) => {
  },
})

export const {
    set_filter,
    pagination_next_page,
    pagination_prev_page
} = uiSlice.actions
export default uiSlice.reducer