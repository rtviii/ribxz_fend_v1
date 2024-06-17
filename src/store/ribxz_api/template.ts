// Or from '@reduxjs/toolkit/query' if not using the auto-generated hooks
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const { parsed: { DJANGO_URL }, } = require("dotenv").config({ path: "./../../../.env.local" });
// initialize an empty api service that we'll inject endpoints into later as needed
export const empty_api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: DJANGO_URL,
} ),
  endpoints: () => ({}),
})