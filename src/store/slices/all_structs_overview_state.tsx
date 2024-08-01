'use client'
import { createAsyncThunk, createListenerMiddleware, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { ChainsByStruct, PolymerByStruct, ribxz_api } from '../ribxz_api/ribxz_api';


export interface StructureOverview {
    tax_name     : string
    tax_id       : number
    mitochondrial: boolean
    rcsb_id      : string
  }

export interface AllStructuresOverview {
    structures: StructureOverview[]

}

const initialState: AllStructuresOverview = {
    structures: []
}

export const allStructuresOverviewSlice = createSlice({
  name: 'structures_overview',
  initialState,
  reducers: {
    set_all_structures_overview(state, action: PayloadAction<AllStructuresOverview>) {
        Object.assign(state, action.payload)
    }
    // toggle_tools: state => { state.tools_expanded = !state.tools_expanded },
    // superimpose_set_chain_search(state, action: PayloadAction<string>) {
    //   Object.assign(state.superimpose, { chain_search: action.payload })
    // },
    // superimpose_set_struct_search(state, action: PayloadAction<string>) {
    //   Object.assign(state.superimpose, { struct_search: action.payload })
    // },

    // superimpose_select_pivot_chain(state, action: PayloadAction<{ rcsb_id: string, polymer: PolymerByStruct }>) {
    //   Object.assign(state.superimpose, { pivot: { polymer: action.payload.polymer, rcsb_id: action.payload.rcsb_id } })
    // },
    // superimpose_add_chain(state, action: PayloadAction<{ rcsb_id: string, polymer: PolymerByStruct }>) {
    //   state.superimpose.active_chains.push({ rcsb_id: action.payload.rcsb_id, polymer: action.payload.polymer })
    //   if (state.superimpose.pivot === null) {
    //     Object.assign(state.superimpose, { pivot: { polymer: action.payload.polymer, rcsb_id: action.payload.rcsb_id } })
    //   }
    // },
    // superimpose_pop_chain(state, action: PayloadAction<{ rcsb_id: string, polymer: PolymerByStruct }>) {
    //   Object.assign(state.superimpose, {
    //     active_chains: state.superimpose.active_chains.filter(
    //       (p) => p.polymer.auth_asym_id !== action.payload.polymer.auth_asym_id && p.rcsb_id !== action.payload.rcsb_id)
    //   }
    //   )
    // }
  },
  extraReducers: (builder) => {
    // builder.addCase(initiatePluginUIContext.fulfilled, (state, action) => {
    //   Object.assign(state, { ui_plugin: action.payload })
    // })
  }
})

export const {
    set_all_structures_overview
} = allStructuresOverviewSlice.actions
export default allStructuresOverviewSlice.reducer




export const prefetchAllStructsOverview = createAsyncThunk( 'all_structs_overview/prefetchAllStructsOverview',
  async (_, { dispatch }) => {
    const result = await dispatch(ribxz_api.endpoints.routersRouterStructOverview.initiate());
    console.log("got result from prefetch", result);
    dispatch(set_all_structures_overview({structures: result.data as StructureOverview[]}));
  }
);