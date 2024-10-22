import { createAsyncThunk } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { set_current_structures, set_structures_cursor, set_total_structures_count } from '../slices/slice_structures';

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
      dispatch(set_structures_cursor(next_cursor));
      dispatch(set_total_structures_count(total_count));

    }

  }
);

export const { useGetStructuresMutation } = structuresApi 