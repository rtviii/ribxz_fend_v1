import { createSlice } from "@reduxjs/toolkit";

interface StructData {
    title  : string
    authors: string[],
    pdbid  : string
}

export interface StructState{
    data: StructData, 
    error: string | null,
    loading: boolean
}
const initialState = {
    data   : {},
    error  : null,
    loading: false

};

const structSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
  setStructureData: (state, action) => {
      state.data    = action.payload;
      state.loading = false;
      state.error   = null;
    },
    setStructureLoading: (state, action) => {
      state.loading = action.payload;
    },
    setStructureError : (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});


export const { setStructureData, setStructureLoading, setStructureError } = structSlice.actions;
export default structSlice.reducer;