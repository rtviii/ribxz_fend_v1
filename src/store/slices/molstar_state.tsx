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


async function _download_struct(plugin: PluginUIContext):Promise<null> {
      const data       = await plugin.builders.data.download({ url: "https://files.rcsb.org/download/5AFI.cif" }, { state: { isGhost: true } });
      const trajectory = await plugin.builders.structure.parseTrajectory(data, "mmcif");
      await plugin.builders.structure.hierarchy.applyPreset(trajectory, "default");
      return null
}
export const download_struct =   createAsyncThunk(
  'molstar/download_struct',
  _download_struct
)


// First, create the thunk
export const initiatePluginUIContext = createAsyncThunk(
  'molstar/initiatePluginUIContext',
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
        }),
        builder.addCase(download_struct.fulfilled, (state, action) => {
          console.log("Downloaded the structure")
        })
        builder.addCase(download_struct.pending, (state, action) => {
          console.log("Downloaded the structure")
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