import type { ConfigFile } from '@rtk-query/codegen-openapi'

const config: ConfigFile = {
  schemaFile: process.env.NEXT_PUBLIC_DJANGO_URL  + '/openapi',
  apiFile   : './template.ts',
  apiImport : 'empty_api',
  outputFile: 'ribxz_api.ts',
  exportName: 'ribxz_api',
  hooks     : true,
}

export default config