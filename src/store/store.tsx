import { configureStore } from '@reduxjs/toolkit'
import { ribxz_api_schema } from './ribxz_api_schema'
import counterReducer from './slices/counterSlice'
import { TypedUseSelectorHook, useDispatch, useSelector, useStore } from 'react-redux'

export const makeStore = () => {
  return configureStore({
    reducer: {
      [ribxz_api_schema.reducerPath]: ribxz_api_schema.reducer,
      counter: counterReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(ribxz_api_schema.middleware),
  })
}

export type AppStore    = ReturnType<typeof makeStore>

export type RootState   = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

export const useAppDispatch: () => AppDispatch               = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppStore: () => AppStore                     = useStore