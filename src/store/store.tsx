import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './counter/counter'
import structureReducer from './structure/structure'
import { structAPI } from './structure/structure'

export const makeStore = () => {
  return configureStore({
    reducer: {
      counter: counterReducer,
      struct: structureReducer,
      [structAPI.reducerPath]: structAPI.reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(structAPI.middleware),
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']