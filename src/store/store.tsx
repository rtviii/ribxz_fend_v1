import { configureStore } from '@reduxjs/toolkit'
import { ribxz_api_schema } from './ribxz_api_schema'

export const makeStore = () => {
  return configureStore({
    reducer: {
      [ribxz_api_schema.reducerPath]: ribxz_api_schema.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(ribxz_api_schema.middleware),
  })
}

export type AppStore    = ReturnType<typeof makeStore>
export type RootState   = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']