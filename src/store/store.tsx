import { configureStore } from '@reduxjs/toolkit'
import { ribxz_api } from './ribxz_api/ribxz_api'
import counterReducer from './slices/counterSlice'
import { TypedUseSelectorHook, useDispatch, useSelector, useStore } from 'react-redux'
import { molstarSlice } from './slices/molstar_state'

export const makeStore = () => {
  return configureStore({
    reducer: {
      [ribxz_api.reducerPath]: ribxz_api.reducer,
      counter                : counterReducer,
      molstar                : molstarSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    }
    ).concat(ribxz_api.middleware),
  })
}


export type AppStore    = ReturnType<typeof makeStore>
export type RootState   = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

export const useAppDispatch: () => AppDispatch               = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppStore: () => AppStore                     = useStore
