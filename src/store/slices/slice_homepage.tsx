'use client'
import { createAsyncThunk, createListenerMiddleware, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChainsByStruct, PolymerByStruct, ribxz_api } from '../ribxz_api/ribxz_api';


export interface HomepageSliceState {
    ref_uL4  : string| null
    ref_uL22 : string| null

}

const initialState: HomepageSliceState = {
    ref_uL22:null,
    ref_uL4 :null
}

export const HomepageSlice = createSlice({
  name: 'homepage_slice',
  initialState,
  reducers: {
    set_ref_ul4(state, action: PayloadAction<string>) {
        Object.assign(state, { ref_uL4: action.payload })
    },
    set_ref_ul22(state, action: PayloadAction<string>) {
        Object.assign(state, { ref_uL22: action.payload })
    },
  },
})

export const {
    set_ref_ul22,
    set_ref_ul4
} = HomepageSlice.actions
export default HomepageSlice.reducer

