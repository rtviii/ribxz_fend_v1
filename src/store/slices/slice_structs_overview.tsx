'use client'
import { createAsyncThunk, createListenerMiddleware, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChainsByStruct, PolymerByStruct, ribxz_api } from '../ribxz_api/ribxz_api';


export interface StructureOverview {
    tax_name     : string
    tax_id       : number
    mitochondrial: boolean
    rcsb_id      : string
    title      : string
  }

export interface AllStructuresOverview {
    structures: StructureOverview[],
    selected  : StructureOverview| null

}

const initialState: AllStructuresOverview = {
    structures: [],
    selected: null
}

export const allStructuresOverviewSlice = createSlice({
  name: 'structures_overview',
  initialState,
  reducers: {
    set_all_structures_overview(state, action: PayloadAction<StructureOverview[]>) {
        Object.assign(state, { structures: action.payload })
    },
    select_structure(state, action: PayloadAction<StructureOverview>) {
        Object.assign(state, {selected: action.payload})
    }
  },
  extraReducers: (builder) => {
    // builder.addCase(initiatePluginUIContext.fulfilled, (state, action) => {
    //   Object.assign(state, { ui_plugin: action.payload })
    // })
  }
})

export const {
    set_all_structures_overview,
    select_structure
} = allStructuresOverviewSlice.actions
export default allStructuresOverviewSlice.reducer




export const prefetchAllStructsOverview = createAsyncThunk( 'all_structs_overview/prefetchAllStructsOverview',
  async (_, { dispatch }) => {
    const result = await dispatch(ribxz_api.endpoints.routersRouterStructOverview.initiate());
    dispatch(set_all_structures_overview( result.data as StructureOverview[]));
  }
);