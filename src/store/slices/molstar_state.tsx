import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './../store'
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { MySpec } from '../molstar_lib/default';
import { createPluginUI } from 'molstar/lib/mol-plugin-ui';
import { unescape } from 'querystring';

// TODO: Factor out
declare global {
  interface Window {
    molstar?: PluginUIContext;
  }
}

// const waitForThreeSeconds  = async(): Promise<number> => {

//   console.log('waiting for three seconds');
//   return new Promise<number>((resolve) => {
//     setTimeout(() => {
//       console.log('done waiting for three seconds');
//       resolve(42); 
//     }, 3000); 
//   });
// }

// export const waitThreeThunk  = createAsyncThunk('molstar/waitandlearn', waitForThreeSeconds)


// First, create the thunk
export const initiatePluginUIContext = createAsyncThunk(
  'users/fetchByIdStatus',
  async (target: string | HTMLElement, ThunkAPI)=> {
    return await createPluginUI(typeof target === 'string' ? document.getElementById(target)! : target, MySpec)
  },
)

const { fulfilled:molstar_inited} = initiatePluginUIContext;

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
        builder.addCase(molstar_inited, (state, action) => {
          Object.assign(state, {ui_plugin: action.payload})
          // state.ui_plugin = action.payload
        })
        // builder.addCase(waitThreeThunk.fulfilled, (state, action) => {
        //   console.log('waitThreeThunk.fulfilled')
        //   console.log('got payload: ', action.payload)
        //   state.count = action.payload
        // })
  },
})

export const {toggle_tools} = molstarSlice.actions
export const {} = molstarSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState) => state.counter.value

export default molstarSlice.reducer