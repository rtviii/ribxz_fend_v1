import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const structuresApi = createApi({
  reducerPath: 'structures_api',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_DJANGO_URL }),
  endpoints: (builder) => ({
    getStructures: builder.mutation({  // Change this to mutation
      query: (args) => ({
        url   : 'structures/list_structures',
        method: 'POST',
        body  : args,
      }),
    }),
  }),
})
export const { useGetStructuresMutation } = structuresApi 