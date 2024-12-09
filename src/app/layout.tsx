'use client';
import {Inter} from 'next/font/google';
import './globals.css';
import StoreProvider from './store_provider';
import { SequenceViewerProvider } from './components/sequence_viewer';

const inter = Inter({subsets: ['latin']});

export default function RootLayout({children}: {children: React.ReactNode}) {
    return (
        <html lang="en">
            <StoreProvider>
                <SequenceViewerProvider>
                    <body className={inter.className}>{children}</body>
                </SequenceViewerProvider>
            </StoreProvider>
        </html>
    );
}
function useEffect(
    arg0: () => void,
    arg1: (((
        action: import('redux').Action<'listenerMiddleware/add'>
    ) => import('@reduxjs/toolkit').UnsubscribeListener) &
        import('redux-thunk').ThunkDispatch<
            {
                api: import('@reduxjs/toolkit/query').CombinedState<
                    {
                        routersRouterStructAllRcsbIds: import('@reduxjs/toolkit/query').QueryDefinition<
                            void,
                            import('@reduxjs/toolkit/query').BaseQueryFn<
                                string | import('@reduxjs/toolkit/query').FetchArgs,
                                unknown,
                                import('@reduxjs/toolkit/query').FetchBaseQueryError,
                                {},
                                import('@reduxjs/toolkit/query').FetchBaseQueryMeta
                            >,
                            never,
                            import('../store/ribxz_api/ribxz_api').RoutersRouterStructAllRcsbIdsApiResponse,
                            'api'
                        >;
                        routersRouterStructPolymerClassesStats: import('@reduxjs/toolkit/query').QueryDefinition<
                            void,
                            import('@reduxjs/toolkit/query').BaseQueryFn<
                                string | import('@reduxjs/toolkit/query').FetchArgs,
                                unknown,
                                import('@reduxjs/toolkit/query').FetchBaseQueryError,
                                {},
                                import('@reduxjs/toolkit/query').FetchBaseQueryMeta
                            >,
                            never,
                            import('../store/ribxz_api/ribxz_api').RoutersRouterStructPolymerClassesStatsApiResponse,
                            'api'
                        >;
                        routersRouterStructTaxDict: import('@reduxjs/toolkit/query').QueryDefinition<
                            void,
                            import('@reduxjs/toolkit/query').BaseQueryFn<
                                string | import('@reduxjs/toolkit/query').FetchArgs,
                                unknown,
                                import('@reduxjs/toolkit/query').FetchBaseQueryError,
                                {},
                                import('@reduxjs/toolkit/query').FetchBaseQueryMeta
                            >,
                            never,
                            object,
                            'api'
                        >;
                        routersRouterStructPolymerClassificationReport: import('@reduxjs/toolkit/query').QueryDefinition<
                            import('../store/ribxz_api/ribxz_api').RoutersRouterStructPolymerClassificationReportApiArg,
                            import('@reduxjs/toolkit/query').BaseQueryFn<
                                string | import('@reduxjs/toolkit/query').FetchArgs,
                                unknown,
                                import('@reduxjs/toolkit/query').FetchBaseQueryError,
                                {},
                                import('@reduxjs/toolkit/query').FetchBaseQueryMeta
                            >,
                            never,
                            unknown,
                            'api'
                        >;
                        routersRouterStructStructureCompositionStats: import('@reduxjs/toolkit/query').QueryDefinition<
                            void,
                            import('@reduxjs/toolkit/query').BaseQueryFn<
                                string | import('@reduxjs/toolkit/query').FetchArgs,
                                unknown,
                                import('@reduxjs/toolkit/query').FetchBaseQueryError,
                                {},
                                import('@reduxjs/toolkit/query').FetchBaseQueryMeta
                            >,
                            never,
                            import('../store/ribxz_api/ribxz_api').StructureCompositionStats,
                            'api'
                        >;
                        routersRouterStructRandomProfile: import('@reduxjs/toolkit/query').QueryDefinition<
                            void,
                            import('@reduxjs/toolkit/query').BaseQueryFn<
                                string | import('@reduxjs/toolkit/query').FetchArgs,
                                unknown,
                                import('@reduxjs/toolkit/query').FetchBaseQueryError,
                                {},
                                import('@reduxjs/toolkit/query').FetchBaseQueryMeta
                            >,
                            never,
                            import('../store/ribxz_api/ribxz_api').RibosomeStructure,
                            'api'
                        >;
                        routersRouterStructPolymersByPolymerClass: import('@reduxjs/toolkit/query').QueryDefinition<
                            import('../store/ribxz_api/ribxz_api').RoutersRouterStructPolymersByPolymerClassApiArg,
                            import('@reduxjs/toolkit/query').BaseQueryFn<
                                string | import('@reduxjs/toolkit/query').FetchArgs,
                                unknown,
                                import('@reduxjs/toolkit/query').FetchBaseQueryError,
                                {},
                                import('@reduxjs/toolkit/query').FetchBaseQueryMeta
                            >,
                            never,
                            object,
                            'api'
                        >;
                        routersRouterStructPolymersByStructure: import('@reduxjs/toolkit/query').QueryDefinition<
                            import('../store/ribxz_api/ribxz_api').RoutersRouterStructPolymersByStructureApiArg,
                            import('@reduxjs/toolkit/query').BaseQueryFn<
                                string | import('@reduxjs/toolkit/query').FetchArgs,
                                unknown,
                                import('@reduxjs/toolkit/query').FetchBaseQueryError,
                                {},
                                import('@reduxjs/toolkit/query').FetchBaseQueryMeta
                            >,
                            never,
                            object,
                            'api'
                        >;
                        routersRouterStructStructurePtc: import('@reduxjs/toolkit/query').QueryDefinition<
                            import('../store/ribxz_api/ribxz_api').RoutersRouterStructStructurePtcApiArg,
                            import('@reduxjs/toolkit/query').BaseQueryFn<
                                string | import('@reduxjs/toolkit/query').FetchArgs,
                                unknown,
                                import('@reduxjs/toolkit/query').FetchBaseQueryError,
                                {},
                                import('@reduxjs/toolkit/query').FetchBaseQueryMeta
                            >,
                            never,
                            object,
                            'api'
                        >;
                        routersRouterStructListLigands: import('@reduxjs/toolkit/query').QueryDefinition<
                            void,
                            import('@reduxjs/toolkit/query').BaseQueryFn<
                                string | import('@reduxjs/toolkit/query').FetchArgs,
                                unknown,
                                import('@reduxjs/toolkit/query').FetchBaseQueryError,
                                {},
                                import('@reduxjs/toolkit/query').FetchBaseQueryMeta
                            >,
                            never,
                            import('../store/ribxz_api/ribxz_api').RoutersRouterStructListLigandsApiResponse,
                            'api'
                        >;
                        routersRouterStructFilterList: import('@reduxjs/toolkit/query').QueryDefinition<
                            import('../store/ribxz_api/ribxz_api').RoutersRouterStructFilterListApiArg,
                            import('@reduxjs/toolkit/query').BaseQueryFn<
                                string | import('@reduxjs/toolkit/query').FetchArgs,
                                unknown,
                                import('@reduxjs/toolkit/query').FetchBaseQueryError,
                                {},
                                import('@reduxjs/toolkit/query').FetchBaseQueryMeta
                            >,
                            never,
                            object,
                            'api'
                        >;
                        routersRouterStructStructureProfile: import('@reduxjs/toolkit/query').QueryDefinition<
                            import('../store/ribxz_api/ribxz_api').RoutersRouterStructStructureProfileApiArg,
                            import('@reduxjs/toolkit/query').BaseQueryFn<
                                string | import('@reduxjs/toolkit/query').FetchArgs,
                                unknown,
                                import('@reduxjs/toolkit/query').FetchBaseQueryError,
                                {},
                                import('@reduxjs/toolkit/query').FetchBaseQueryMeta
                            >,
                            never,
                            import('../store/ribxz_api/ribxz_api').RibosomeStructure,
                            'api'
                        >;
                        routersRouterStructChainsByStruct: import('@reduxjs/toolkit/query').QueryDefinition<
                            void,
                            import('@reduxjs/toolkit/query').BaseQueryFn<
                                string | import('@reduxjs/toolkit/query').FetchArgs,
                                unknown,
                                import('@reduxjs/toolkit/query').FetchBaseQueryError,
                                {},
                                import('@reduxjs/toolkit/query').FetchBaseQueryMeta
                            >,
                            never,
                            import('../store/ribxz_api/ribxz_api').RoutersRouterStructChainsByStructApiResponse,
                            'api'
                        >;
                        routersRouterStructPolymerClassesNomenclature: import('@reduxjs/toolkit/query').QueryDefinition<
                            void,
                            import('@reduxjs/toolkit/query').BaseQueryFn<
                                string | import('@reduxjs/toolkit/query').FetchArgs,
                                unknown,
                                import('@reduxjs/toolkit/query').FetchBaseQueryError,
                                {},
                                import('@reduxjs/toolkit/query').FetchBaseQueryMeta
                            >,
                            never,
                            import('../store/ribxz_api/ribxz_api').NomenclatureSet,
                            'api'
                        >;
                        routersRouterStructListSourceTaxa: import('@reduxjs/toolkit/query').QueryDefinition<
                            import('../store/ribxz_api/ribxz_api').RoutersRouterStructListSourceTaxaApiArg,
                            import('@reduxjs/toolkit/query').BaseQueryFn<
                                string | import('@reduxjs/toolkit/query').FetchArgs,
                                unknown,
                                import('@reduxjs/toolkit/query').FetchBaseQueryError,
                                {},
                                import('@reduxjs/toolkit/query').FetchBaseQueryMeta
                            >,
                            never,
                            import('../store/ribxz_api/ribxz_api').RoutersRouterStructListSourceTaxaApiResponse,
                            'api'
                        >;
                        routersRouterClassesPolynucleotideClass: import('@reduxjs/toolkit/query').QueryDefinition<
                            import('../store/ribxz_api/ribxz_api').RoutersRouterClassesPolynucleotideClassApiArg,
                            import('@reduxjs/toolkit/query').BaseQueryFn<
                                string | import('@reduxjs/toolkit/query').FetchArgs,
                                unknown,
                                import('@reduxjs/toolkit/query').FetchBaseQueryError,
                                {},
                                import('@reduxjs/toolkit/query').FetchBaseQueryMeta
                            >,
                            never,
                            import('../store/ribxz_api/ribxz_api').RoutersRouterClassesPolynucleotideClassApiResponse,
                            'api'
                        >;
                        routersRouterClassesPolypeptideClass: import('@reduxjs/toolkit/query').QueryDefinition<
                            import('../store/ribxz_api/ribxz_api').RoutersRouterClassesPolypeptideClassApiArg,
                            import('@reduxjs/toolkit/query').BaseQueryFn<
                                string | import('@reduxjs/toolkit/query').FetchArgs,
                                unknown,
                                import('@reduxjs/toolkit/query').FetchBaseQueryError,
                                {},
                                import('@reduxjs/toolkit/query').FetchBaseQueryMeta
                            >,
                            never,
                            import('../store/ribxz_api/ribxz_api').RoutersRouterClassesPolypeptideClassApiResponse,
                            'api'
                        >;
                        routersRouterClassesLifecycleFactorClass: import('@reduxjs/toolkit/query').QueryDefinition<
                            import('../store/ribxz_api/ribxz_api').RoutersRouterClassesLifecycleFactorClassApiArg,
                            import('@reduxjs/toolkit/query').BaseQueryFn<
                                string | import('@reduxjs/toolkit/query').FetchArgs,
                                unknown,
                                import('@reduxjs/toolkit/query').FetchBaseQueryError,
                                {},
                                import('@reduxjs/toolkit/query').FetchBaseQueryMeta
                            >,
                            never,
                            import('../store/ribxz_api/ribxz_api').RoutersRouterClassesLifecycleFactorClassApiResponse,
                            'api'
                        >;
                        routersRouterMmcifPolymer: import('@reduxjs/toolkit/query').QueryDefinition<
                            import('../store/ribxz_api/ribxz_api').RoutersRouterMmcifPolymerApiArg,
                            import('@reduxjs/toolkit/query').BaseQueryFn<
                                string | import('@reduxjs/toolkit/query').FetchArgs,
                                unknown,
                                import('@reduxjs/toolkit/query').FetchBaseQueryError,
                                {},
                                import('@reduxjs/toolkit/query').FetchBaseQueryMeta
                            >,
                            never,
                            unknown,
                            'api'
                        >;
                    },
                    never,
                    'api'
                >;
                molstar: import('../store/slices/molstar_state').MolstarReduxCore;
                ui: import('../store/slices/ui_reducer').UIState;
            },
            undefined,
            import('redux').UnknownAction
        > &
        import('redux').Dispatch<import('redux').UnknownAction>)[]
) {
    throw new Error('Function not implemented.');
}
