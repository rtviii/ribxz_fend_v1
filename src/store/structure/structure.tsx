import { RibosomeStructure } from "@/ribosome_types";
import { createSlice } from "@reduxjs/toolkit";
import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'


interface StructData {
    title: string
    authors: string[],
    pdbid: string
}

export interface StructState {
    data: StructData,
    error: string | null,
    loading: boolean
}
const initialState = {
    data: {},
    error: null,
    loading: false

};

const structSlice = createSlice({
    name: "structure",
    initialState,
    reducers: {
        setStructureData: (state, action) => {
            state.data = {
                title: action.payload.citation_title,
                authors: action.payload.citation_rcsb_authors,
                pdbid: action.payload.rcsb_id
            };
            state.loading = false;
            state.error = null;
        },
        setStructureLoading: (state, action) => {
            state.loading = action.payload;
        },
        setStructureError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});


export const { setStructureData, setStructureLoading, setStructureError } = structSlice.actions;
export default structSlice.reducer;

//!//!//!//!/!                         -->> [ RTK ] <<--                         //!//!//!//!/!

export const structAPI = createApi({
  reducerPath: 'structureApi',
  baseQuery  : fetchBaseQuery({ baseUrl: 'http://localhost:8000/' }),
  endpoints  : builder => ({
    getStructureProfile: builder.query<RibosomeStructure, string>({
      query: (rcsb_id: string) => `comp/get_profile?rcsb_id=${rcsb_id}`
    })
  })
})

export const { useGetStructureProfileQuery } = structAPI




// export function fetchStructureProfile(rcsb_id: string) {
//     return async function fetchStructureProfile(dispatch, getState)=> {
//         console.log("hi");
            
//         try {
//             dispatch(setStructureLoading(true));
//             const response = await(await fetch(`http://localhost:8000/comp/get_profile?rcsb_id=3j7z`)).json()
//             dispatch(setStructureData(response))
//             dispatch(setStructureLoading(false));
//         } catch (error: any) {
//             dispatch(setStructureLoading(error.message));
//             dispatch(setStructureLoading(false));
//         }

//     }
// }