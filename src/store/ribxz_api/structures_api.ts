import { createAsyncThunk } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { set_current_structures } from '../slices/slice_structures';

export const structuresApi = createApi({
  reducerPath: 'structures_api',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_DJANGO_URL }),
  endpoints: (builder) => ({
    getStructures: builder.mutation({  // Change this to mutation
      query: (args) => ({
        url: 'structures/list_structures',
        method: 'POST',
        body: args,
      }),
    }),
  }),
})



export const prefetchStructuresData = createAsyncThunk('prefetch_structures_data',
  async (_, { dispatch }) => {
    const result = await dispatch(structuresApi.endpoints.getStructures.initiate({
      cursor: null,
      limit: 20,
    }));

    if ('data' in result) {
      const { next_cursor, structures, total_count } = result.data;
      dispatch(set_current_structures(structures));

    }

  }
);

export const { useGetStructuresMutation } = structuresApi 