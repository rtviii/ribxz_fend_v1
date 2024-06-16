import type { ConfigFile } from '@rtk-query/codegen-openapi'

// const { parsed: { DJANGO_URL }, } = require("dotenv").config({ path: "./../../../.env.local" });

const config: ConfigFile = {
  schemaFile: 'http://127.0.0.1:8000/openapi',
  apiFile   : './template.ts',
  apiImport : 'empty_api',
  outputFile: 'ribxz_api.ts',
  exportName: 'ribxz_api',
  hooks     : true,
}

export default config