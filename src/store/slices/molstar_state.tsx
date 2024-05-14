import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './../store'
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { MySpec } from '../molstar_lib/default';
import { createPluginUI } from 'molstar/lib/mol-plugin-ui';

// TODO: Factor out
declare global {
  interface Window {
    molstar?: PluginUIContext;
  }
}


async function waitForThreeSeconds(): Promise<number> {
  return new Promise<number>((resolve) => {
    setTimeout(() => {
      resolve(42); 
    }, 3000); 
  });
}



// First, create the thunk
const initiatePluginUIContext = createAsyncThunk(
  'users/fetchByIdStatus',
  async (target: string | HTMLElement, ThunkAPI)=> {
    const p = createPluginUI(typeof target === 'string' ? document.getElementById(target)! : target, MySpec);
    return p
  },
)


const { fulfilled,pending,rejected} = initiatePluginUIContext;


export interface MolstarReduxCore {
    ui_plugin     : PluginUIContext | undefined,
    tools_expanded: boolean,
}

const initialState: MolstarReduxCore = {
    ui_plugin     : undefined,
    tools_expanded: false
}


export const molstarSlice = createSlice({
  name: 'molstar',
  initialState,
  reducers: {
    toggle_tools: state => {
      state.tools_expanded = !state.tools_expanded
    },
    initiate_plugin: state => {
      state.tools_expanded = !state.tools_expanded
    },
  },
    extraReducers: (builder) => {
        builder.addCase(fulfilled, (state, action) => {
          Object.assign(state, { 'ui_plugin' :action.payload })
        })
        builder.addCase(pending, (state, action) => {

        })
  },
})

export const {toggle_tools} = molstarSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState) => state.counter.value

export default molstarSlice.reducer