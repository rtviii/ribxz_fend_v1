'use client'
import { createAsyncThunk, createListenerMiddleware, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { ChainsByStruct, PolymerByStruct, ribxz_api } from '../ribxz_api/ribxz_api';
import { Loci } from 'molstar/lib/mol-model/structure/structure/element/loci';


export interface StructurePageState {
    tunnel:{
        loci:Loci | null
        ptc: any
    },
  }


const initialState: StructurePageState = {
    tunnel:{
        loci: null,
        ptc : null
    }
}

export const structurePageSlice = createSlice({
  name: 'structure_page',
  initialState,
  reducers: {
    set_tunnel_shape_loci(state, action: PayloadAction<Loci>) {
      console.log("got new loci", action);
      
        Object.assign(state, {tunnel:{loci: action.payload, ptc: state.tunnel.ptc}})
      console.log("finalized state", state);
    },
  },
  extraReducers: (builder) => {
    // builder.addCase(initiatePluginUIContext.fulfilled, (state, action) => {
    //   Object.assign(state, { ui_plugin: action.payload })
    // })
  }
})

export const {
set_tunnel_shape_loci
} = structurePageSlice.actions
export default structurePageSlice.reducer


