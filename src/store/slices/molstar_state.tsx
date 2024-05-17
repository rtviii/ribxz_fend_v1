import { createAsyncThunk, createListenerMiddleware, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './../store'
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { createPlugin, _download_struct } from '../molstar/lib';

// TODO: Factor out
declare global {
  interface Window {
    molstar?: PluginUIContext;
  }
}

export const download_struct         = createAsyncThunk( 'molstar/download_struct', _download_struct )
export const initiatePluginUIContext = createAsyncThunk('molstar/initiatePluginUIContext', createPlugin)

export interface MolstarReduxCore {
    ui_plugin     : PluginUIContext | undefined,
    tools_expanded: boolean,
    count         : undefined | number
}

const initialState: MolstarReduxCore = {
    ui_plugin     : undefined,
    tools_expanded: false,
    count         :undefined
}



export const molstarListenerMiddleware = createListenerMiddleware()

molstarListenerMiddleware.startListening({
  actionCreator: initiatePluginUIContext.fulfilled,
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(download_struct(window.molstar))
  },
})




export const molstarSlice = createSlice({
  name: 'molstar',
  initialState,
  reducers: {
    toggle_tools: state => {
      state.tools_expanded = !state.tools_expanded
    },
    // initiate_plugin: state => {
    //   state.tools_expanded = !state.tools_expanded
    // },
  },
    extraReducers: (builder) => {
        builder.addCase(initiatePluginUIContext.fulfilled, (state, action) => {
          Object.assign(state, {ui_plugin: action.payload})
        }),
        builder.addCase(download_struct.fulfilled, (state, action) => {
          console.log("Downloaded the structure")
        })
        builder.addCase(download_struct.pending, (state, action) => {
          console.log("Downloaded the structure")
        })
  },
})

export const {toggle_tools} = molstarSlice.actions
export default molstarSlice.reducer