import { createAsyncThunk, createListenerMiddleware, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './../store'
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { createPlugin, _download_struct, load_mmcif_chain } from '../molstar/lib';
import { PolymerByStruct } from '../ribxz_api/ribxz_api';

// TODO: Factor out
declare global {
  interface Window {
    molstar?: PluginUIContext;
  }
}

export const molstarListenerMiddleware = createListenerMiddleware()

export const download_struct         = createAsyncThunk('molstar/download_struct', _download_struct)
export const initiatePluginUIContext = createAsyncThunk('molstar/initiatePluginUIContext', createPlugin)
export const loadMmcifChain          = createAsyncThunk('molstar/loadMmcifChain', load_mmcif_chain)



export interface SuperimposeState {
  pivot        : PolymerByStruct |null,
  active_chains: PolymerByStruct[]
}


export interface MolstarReduxCore {
  ui_plugin     : PluginUIContext | undefined,
  tools_expanded: boolean,
  count         : undefined | number,
  superimpose   : SuperimposeState
}

const initialState: MolstarReduxCore = {
  ui_plugin     : undefined,
  tools_expanded: false,
  count         : undefined,
  superimpose   : {
    pivot: null,
    active_chains: []
  }
}

export const molstarSlice = createSlice({
  name: 'molstar',
  initialState,
  reducers: {
    toggle_tools: state => { state.tools_expanded = !state.tools_expanded },

    superimpose_select_pivot_chain(state, action: PayloadAction<{rcsb_id:string, polymer: PolymerByStruct }>) {


    },
    superimpose_add_chain(state, action: PayloadAction<{rcsb_id:string, polymer: PolymerByStruct }>) {
      state.superimpose.active_chains.push(action.payload.polymer)
      load_mmcif_chain({rcsb_id:action.payload.rcsb_id, auth_asym_id: action.payload.polymer.auth_asym_id})
    },
    superimpose_pop_chain(state, action: PayloadAction<PolymerByStruct>) {
      state.superimpose.active_chains.push(action.payload)
    }
  },
  extraReducers: (builder) => {
    builder.addCase(initiatePluginUIContext.fulfilled, (state, action) => {
      Object.assign(state, { ui_plugin: action.payload })
    })
  }
})

export const { toggle_tools,superimpose_add_chain, superimpose_pop_chain } = molstarSlice.actions
export default molstarSlice.reducer