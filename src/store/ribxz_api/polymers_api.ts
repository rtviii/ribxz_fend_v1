import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const polymersApi = createApi({
  reducerPath: 'polymers_api',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_DJANGO_URL }),
  endpoints: (builder) => ({
    getPolymers: builder.mutation({  // Change this to mutation
      query: (args) => ({
        url   : 'structures/list_polymers',
        method: 'POST',
        body  : args,
      }),
    }),
  }),
})
export const { useGetPolymersMutation} = polymersApi 