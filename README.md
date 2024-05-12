To codegen an rtk-api definition from the `openapi-config` (provided by the django backend):


`npx @rtk-query/codegen-openapi openapi-config.ts``


The config file looks something like this:

```typescript
// EXAMPLE (you have to provide correct parameters and rerun when the api changes)
import type { ConfigFile } from '@rtk-query/codegen-openapi'
const config: ConfigFile = {
  schemaFile: 'https://r8-kdd.math.ubc.ca/openapi.json',  //<-- this is where you get the actual schema from
  apiFile   : 'template_empty_api.ts', // <- this is the starter file 
  apiImport : 'emptySplitApi',         // <- the object into which the new api will be injected
  outputFile: 'template_empty_api.ts', // 
  exportName: 'ribxz_api_schema',      // <- the object that you actually want to import into the store at the end
  hooks     : true,
}

export default config
```


template_empty_api.ts is a file that looks like this:

```typescript
// Or from '@reduxjs/toolkit/query' if not using the auto-generated hooks
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// initialize an empty api service that we'll inject endpoints into later as needed
export const emptySplitApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: 'https://r8-kdd.math.ubc.ca' }),
  endpoints: () => ({}),
})
```