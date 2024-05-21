import { createAsyncThunk, createListenerMiddleware, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum } from '@/store/ribxz_api/ribxz_api'

interface Filters {
    search: string
    year: [number | null, number | null]
    resolution: [number | null, number | null]
    polymer_classes: CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum[]
    source_taxa: number[]
    host_taxa: number[]
}


interface Pagination {
    current_page: number
    page_size: number
    total_pages: number

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
        total_pages: 100
    }


}

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
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
            if (state.pagination.current_page < state.pagination.total_pages) {
                state.pagination.current_page += 1
            }
        },
    },
    //   extraReducers: (builder) => { builder.addCase(initiatePluginUIContext.fulfilled, (state, action) => { Object.assign(state, { ui_plugin: action.payload }) }) }
})

export const {
    set_filter,
    pagination_next_page,
    pagination_prev_page
} = uiSlice.actions
export default uiSlice.reducer