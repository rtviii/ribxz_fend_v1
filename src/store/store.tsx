import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit'
import { ribxz_api } from './ribxz_api/ribxz_api'
import { TypedUseSelectorHook, useDispatch, useSelector, useStore } from 'react-redux'
import { listenerMiddleware, molstarSlice } from './slices/molstar_state'



export const makeStore = () => {
  return configureStore({
    reducer: {
      [ribxz_api.reducerPath]: ribxz_api.reducer,
      molstar                : molstarSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    }).prepend(listenerMiddleware.middleware).concat(ribxz_api.middleware),
  })
}


export type AppStore    = ReturnType<typeof makeStore>
export type RootState   = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

export const useAppDispatch: () => AppDispatch               = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
// export const useAppStore: () => AppStore                     = useStore
