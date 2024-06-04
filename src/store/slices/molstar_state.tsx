import { createAsyncThunk, createListenerMiddleware, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './../store'
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { ChainsByStruct, PolymerByStruct } from '../ribxz_api/ribxz_api';

// TODO: Factor out
declare global {
  interface Window {
    molstar?: PluginUIContext;
  }
}

export const molstarListenerMiddleware = createListenerMiddleware()

// TODO : reimport from separte mstar module
// export const download_struct         = createAsyncThunk('molstar/download_struct', _download_struct)
// export const initiatePluginUIContext = createAsyncThunk('molstar/initiatePluginUIContext', createPlugin)
// export const loadMmcifChain          = createAsyncThunk('molstar/loadMmcifChain', load_mmcif_chain)



export interface SuperimposeState {

  pivot: {
    rcsb_id: string,
    polymer: PolymerByStruct
  } | null
  active_chains: {
    rcsb_id: string,
    polymer: PolymerByStruct
  }[],
  chain_search: string,
  struct_search: string
}


export interface MolstarReduxCore {
  ui_plugin: PluginUIContext | undefined,
  tools_expanded: boolean,
  count: undefined | number,
  superimpose: SuperimposeState
}

const initialState: MolstarReduxCore = {
  ui_plugin: undefined,
  tools_expanded: false,
  count: undefined,
  superimpose: {
    chain_search: '',
    struct_search: '',
    pivot: null,
    active_chains: []
  }
}

export const molstarSlice = createSlice({
  name: 'molstar',
  initialState,
  reducers: {
    toggle_tools: state => { state.tools_expanded = !state.tools_expanded },

    superimpose_set_chain_search(state, action: PayloadAction<string>) {
      Object.assign(state.superimpose, { chain_search: action.payload })
    },
    superimpose_set_struct_search(state, action: PayloadAction<string>) {
      Object.assign(state.superimpose, { struct_search: action.payload })
    },

    superimpose_select_pivot_chain(state, action: PayloadAction<{ rcsb_id: string, polymer: PolymerByStruct }>) {
      Object.assign(state.superimpose, { pivot: { polymer: action.payload.polymer, rcsb_id: action.payload.rcsb_id } })
    },
    superimpose_add_chain(state, action: PayloadAction<{ rcsb_id: string, polymer: PolymerByStruct }>) {
      state.superimpose.active_chains.push({ rcsb_id: action.payload.rcsb_id, polymer: action.payload.polymer })

      // load_mmcif_chain({ rcsb_id: action.payload.rcsb_id, auth_asym_id: action.payload.polymer.auth_asym_id })
      // if (state.superimpose.pivot === null) {
      //   Object.assign(state.superimpose, { pivot: { polymer: action.payload.polymer, rcsb_id: action.payload.rcsb_id } })
      // }
    },
    superimpose_pop_chain(state, action: PayloadAction<{ rcsb_id: string, polymer: PolymerByStruct }>) {
      Object.assign(state.superimpose, {
        active_chains: state.superimpose.active_chains.filter(
          (p) => p.polymer.auth_asym_id !== action.payload.polymer.auth_asym_id && p.rcsb_id !== action.payload.rcsb_id)
      }
      )
    }
  },
  extraReducers: (builder) => {
    // builder.addCase(initiatePluginUIContext.fulfilled, (state, action) => {
    //   Object.assign(state, { ui_plugin: action.payload })
    // })
  }
})

export const {
  toggle_tools,
  superimpose_add_chain,
  superimpose_pop_chain,
  superimpose_select_pivot_chain,
  superimpose_set_chain_search,
  superimpose_set_struct_search
} = molstarSlice.actions
export default molstarSlice.reducer