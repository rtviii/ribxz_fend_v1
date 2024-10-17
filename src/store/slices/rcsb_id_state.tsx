'use client'
import { createAsyncThunk, createListenerMiddleware, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { ChainsByStruct, PolymerByStruct, ribxz_api } from '../ribxz_api/ribxz_api';


export interface StructurePageState {
    tunnel:{
        mstar_ref:string | null
        ptc: any
    },
  }


const initialState: StructurePageState = {
    tunnel:{
        mstar_ref: null,
        ptc:null
    }
}

export const structurePageSlice = createSlice({
  name: 'structure_page',
  initialState,
  reducers: {
    set_tunnel_shape_ref(state, action: PayloadAction<string>) {
        Object.assign(state, {tunnel:{mstar_ref: action.payload, ptc: state.tunnel.ptc}})
    },
  },
  extraReducers: (builder) => {
    // builder.addCase(initiatePluginUIContext.fulfilled, (state, action) => {
    //   Object.assign(state, { ui_plugin: action.payload })
    // })
  }
})

export const {
set_tunnel_shape_ref
} = structurePageSlice.actions
export default structurePageSlice.reducer




export const prefetchAllStructsOverview = createAsyncThunk( 'all_structs_overview/prefetchAllStructsOverview',
  async (_, { dispatch }) => {
    const result = await dispatch(ribxz_api.endpoints.routersRouterStructOverview.initiate());
    dispatch(set_all_structures_overview( result.data as StructutrePageState[]));
  }
)