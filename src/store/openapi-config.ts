import type { ConfigFile } from '@rtk-query/codegen-openapi'

const config: ConfigFile = {
  schemaFile: 'https://r8-kdd.math.ubc.ca/openapi.json',
  apiFile   : 'template_empty_api.ts',
  apiImport : 'emptySplitApi',
  outputFile: 'ribxz_api_schema.ts',
  exportName: 'ribxz_api_schema',
  hooks     : true,
}

export default config