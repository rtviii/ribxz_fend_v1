import type { ConfigFile } from '@rtk-query/codegen-openapi'

// Next automatically replaces process.env.NEXT_PUBLIC_DJANGO_URL with the value of the environment variable in prod
const SERVER_URL =  process.env.NEXT_PUBLIC_DJANGO_URL || 'http://localhost:8000'
const config: ConfigFile = {
  schemaFile: SERVER_URL  + '/openapi',
  apiFile   : './template.ts',
  apiImport : 'empty_api',
  outputFile: 'ribxz_api.ts',
  exportName: 'ribxz_api',
  hooks     : true,
}

export default config