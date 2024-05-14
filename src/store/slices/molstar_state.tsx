import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './../store'
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';

// TODO: Factor out
declare global {
  interface Window {
    molstar?: PluginUIContext;
  }
}


export interface MolstarReduxCore {
    ui_plugin: PluginUIContext | undefined,
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
    increment: state => {
      state.value += 1
    },
    decrement: state => {
      state.value -= 1
    },
    // Use the PayloadAction type to declare the contents of `action.payload`
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    }
  }
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState) => state.counter.value

export default counterSlice.reducer