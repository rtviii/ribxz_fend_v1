'use client';
import {configureStore, createAsyncThunk, createListenerMiddleware} from '@reduxjs/toolkit';
import {ribxz_api} from './ribxz_api/ribxz_api';
import {TypedUseSelectorHook, useDispatch, useSelector, useStore} from 'react-redux';
// import { molstarListenerMiddleware, molstarSlice } from './slices/slice_molstar'
import {fetchPredictionData, prefetchLigandsData, uiSlice} from './slices/ui_reducer';
import {allStructuresOverviewSlice, prefetchAllStructsOverview} from './slices/slice_structs_overview';
import {prefetchStructuresData, structuresApi} from './ribxz_api/structures_api';
import {structurePageSlice} from './slices/slice_structure_page';
import {structures_slice} from './slices/slice_structures';
import {polymers_slice} from './slices/slice_polymers';
import {polymersApi} from './ribxz_api/polymers_api';
import {HomepageSlice} from './slices/slice_homepage';

import {handleReferencesSlice} from './molstar/slice_refs';
import {sequenceViewerSlice} from './molstar/slice_seq_viewer';
import {polymerStatesSlice} from './slices/slice_polymer_states';

export const makeStore = () => {
    const store = configureStore({
        reducer: {
            [ribxz_api.reducerPath]: ribxz_api.reducer,
            ui: uiSlice.reducer,

            homepage_overview: allStructuresOverviewSlice.reducer, // this feeds the homepage overview
            structure_page: structurePageSlice.reducer,
            structures_page: structures_slice.reducer,
            polymers_page: polymers_slice.reducer,
            homepage: HomepageSlice.reducer,
            [structuresApi.reducerPath]: structuresApi.reducer,
            [polymersApi.reducerPath]: polymersApi.reducer,

            mstar_refs: handleReferencesSlice.reducer,

            sequenceViewer: sequenceViewerSlice.reducer,
            polymer_states: polymerStatesSlice.reducer
            // mstar_seq_viewer           : sequenceViewerSlice.reducer,
        },

        middleware: getDefaultMiddleware =>
            getDefaultMiddleware({serializableCheck: false})
                .concat(ribxz_api.middleware)
                .concat(structuresApi.middleware)
    });

    //* All prefetching can happen here via thunks.
    store.dispatch(prefetchLigandsData());
    store.dispatch(prefetchAllStructsOverview());
    store.dispatch(prefetchStructuresData());
    //* All prefetching can happen here via thunks.

    return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
