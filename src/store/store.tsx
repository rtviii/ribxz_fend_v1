import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './counter/counter'
import structureReducer from './structure/structure'
import { structAPI } from './structure/structure'
import { ribxz_api_schema } from './ribxz_api_schema'

export const makeStore = () => {
  return configureStore({
    reducer: {
      counter                : counterReducer,
      struct                 : structureReducer,
      // [structAPI.reducerPath]: structAPI.reducer,
      [ribxz_api_schema.reducerPath]: ribxz_api_schema.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(ribxz_api_schema.middleware),
  })
}

export type AppStore    = ReturnType<typeof makeStore>
export type RootState   = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']