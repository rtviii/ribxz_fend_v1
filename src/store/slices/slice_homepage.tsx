'use client';
import {createAsyncThunk, createListenerMiddleware, createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface HomepageSliceState {
    taxid_dict: Record<number, string>;
    ref_uL4: string | null;
    ref_uL22: string | null;
}

const initialState: HomepageSliceState = {
    taxid_dict: {},
    ref_uL22: null,
    ref_uL4: null
};

export const HomepageSlice = createSlice({
    name: 'homepage_slice',
    initialState,
    reducers: {
        set_ref_ul4(state, action: PayloadAction<string>) {
            Object.assign(state, {ref_uL4: action.payload});
        },
        set_ref_ul22(state, action: PayloadAction<string>) {
            Object.assign(state, {ref_uL22: action.payload});
        },

        set_tax_dict(state, action: PayloadAction<Record<number, string>>) {
            state.taxid_dict = action.payload;
        }
    }
});

export const {set_ref_ul22, set_ref_ul4, set_tax_dict} = HomepageSlice.actions;
export default HomepageSlice.reducer;
