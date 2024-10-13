"use client"
import { configureStore, createAsyncThunk, createListenerMiddleware } from '@reduxjs/toolkit'
import { ribxz_api } from './ribxz_api/ribxz_api'
import { TypedUseSelectorHook, useDispatch, useSelector, useStore } from 'react-redux'
import { molstarListenerMiddleware, molstarSlice } from './slices/molstar_state'
import { fetchPredictionData, prefetchLigandsData, uiSlice } from './slices/ui_state'
import { allStructuresOverviewSlice, prefetchAllStructsOverview } from './slices/all_structs_overview_state'
import { structuresApi } from './ribxz_api/structures_api'



export const makeStore = () => {
  const store=  configureStore({
    reducer: {
      [ribxz_api.reducerPath]    : ribxz_api.reducer,
      molstar                    : molstarSlice.reducer,

      ui                         : uiSlice.reducer,
      homepage_overview    : allStructuresOverviewSlice.reducer,   // this feeds the homepage overview
      [structuresApi.reducerPath]: structuresApi.reducer,
    },

    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
    .prepend(molstarListenerMiddleware.middleware)
    .concat(ribxz_api.middleware)
    .concat(structuresApi.middleware), 
  })

  //* All prefetching can happen here via thunks.
  store.dispatch(prefetchLigandsData())
  store.dispatch(prefetchAllStructsOverview())
  //* All prefetching can happen here via thunks.

  return store
}

export type AppStore    = ReturnType<typeof makeStore>
export type RootState   = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

export const useAppDispatch: () => AppDispatch               = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

