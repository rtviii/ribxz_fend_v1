'use client'
import { createAsyncThunk, createListenerMiddleware, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum,  LigandTransposition,  Polymer, Protein, RibosomeStructure, ribxz_api, Rna  } from '@/store/ribxz_api/ribxz_api'
import { structuresApi } from '../ribxz_api/structures_api'


// export interface PaginationState {
//     current_polymers_page  : number
//     total_polymers_pages   : number | null

//     current_structures_page: number
//     total_structures_pages : number | null
// }

export type LigandInstances = Array<[{
    chemicalId          : string
    chemicalName        : string
    drugbank_description: string
    drugbank_id         : string
    pdbx_description    : string
    formula_weight      : number
    number_of_instances : number

}, Array<{
    rcsb_id: string
    tax_node: {
        rank: string, scientific_name: string, ncbi_tax_id: number
    }
}>]>

export type LigandInstance = {
    ligand: {
        chemicalId          : string
        chemicalName        : string
        drugbank_description: string
        drugbank_id         : string
        pdbx_description    : string
        formula_weight      : number
        number_of_instances : number

    }, parent_structure: {
        rcsb_id: string
        tax_node: {
            rank: string, scientific_name: string, ncbi_tax_id: number
        }
    }
}

export interface UIState {
    taxid_dict: Record<number, string>,
    ligands_page: {
        data              : LigandInstances,
        filtered_data     : LigandInstances
        current_ligand    : LigandInstance | null,
        radius            : number,

        prediction_data   : LigandTransposition | null
        prediction_pending: boolean

    },
    // data: {
    //     current_polymers  : Array<Polymer | Rna | Protein>,
    //     total_polymers_count  : number | null
    // },
    // polymers: {
    //     current_polymer_class: CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum | null,
    // }

}

const initialState: UIState = {
    taxid_dict: {},
    ligands_page: {
        data              : [],
        radius            : 10,
        current_ligand    : null,
        filtered_data     : [],
        prediction_data   : null,
        prediction_pending: false

    },
    // data: {
    //     current_polymers  : [],
    //     total_polymers_count  : null
    // },
    // polymers: { // polymers_page
    //     current_polymer_class: "EF-Tu"
    // },
    // pagination: {
    //     current_structures_page: 1,
    //     total_structures_pages: null,

    //     current_polymers_page: 1,
    //     total_polymers_pages: null
    // }
}


// OK there is the filter list endpoint
// We want to :
// -   prefetch the total number of structures on loadup
// -   dispatch update the moment any set_filter changes (that means set new count, set page to 1)
// -   dispatch pagination update the moment a page changes 


// Create the middleware instance and methods
const UIUpdateListenerMiddelware = createListenerMiddleware()

// const [triggerRefetch, { data, error }] = ribxz_api.endpoints.routersRouterStructFilterList.useLazyQuery()
export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {

        // !---------------- Ligands
        set_ligands_data(state, action: PayloadAction<LigandInstances>) {
            state.ligands_page.data = action.payload
        },
        set_ligands_radius(state, action: PayloadAction<number>) {
            state.ligands_page.radius = action.payload
        },
        set_ligands_data_filtered(state, action: PayloadAction<LigandInstances>) {
            state.ligands_page.filtered_data = action.payload
        },
        set_current_ligand(state, action: PayloadAction<LigandInstance>) {
            state.ligands_page.current_ligand = action.payload
        },
        set_ligand_prediction_data(state, action: PayloadAction<LigandTransposition|null>) {
            state.ligands_page.prediction_data = action.payload
        },
        // !---------------- Taxonomy
        set_tax_dict(state, action: PayloadAction<Record<number, string>>) {
            state.taxid_dict = action.payload
        },
        // // !---------------- Structures
        // set_current_structures(state, action: PayloadAction<RibosomeStructure[]>) {
        //     state.data.current_structures = action.payload
        // },
        // set_total_structures_count(state, action: PayloadAction<number>) {
        //     state.data.total_structures_count = action.payload
        // },
        // // !---------------- Filters
        // set_filter(state, action: PayloadAction<{ filter_type: keyof FiltersState, value: typeof state.filters[keyof FiltersState] }>) {
        //     Object.assign(state.filters, { [action.payload.filter_type]: action.payload.value })
        // },

        // !---------------- Pagination
        // pagination_prev_page(state, action: PayloadAction<{
        //     slice_name: 'structures' | 'polymers',
        // }>) {
        //     if (action.payload.slice_name === 'polymers') {
        //         if (1 < state.pagination.current_polymers_page) {
        //             state.pagination.current_polymers_page -= 1
        //         }
        //     }
        //     if (action.payload.slice_name === 'structures') {
        //         if (1 < state.pagination.current_structures_page) {
        //             state.pagination.current_structures_page -= 1
        //         }
        //     }
        // },
        // pagination_set_page(state, action: PayloadAction<{ slice_name: 'structures' | 'polymers', set_to_page: number }>) {
        //     if (action.payload.slice_name === 'polymers') {
        //         if (action.payload.set_to_page <= state.pagination.total_polymers_pages! && 1 <= action.payload.set_to_page) {
        //             state.pagination.current_polymers_page = action.payload.set_to_page
        //         }
        //     } else if (action.payload.slice_name === 'structures') {
        //         if (action.payload.set_to_page <= state.pagination.total_structures_pages! && 1 <= action.payload.set_to_page) {
        //             state.pagination.current_structures_page = action.payload.set_to_page
        //         }

        //     }
        // },
        // pagination_next_page(state, action: PayloadAction<{ slice_name: 'structures' | 'polymers', }>) {
        //     if (action.payload.slice_name == 'polymers') {
        //         if (state.pagination.current_polymers_page < state.pagination.total_polymers_pages!) {
        //             state.pagination.current_polymers_page += 1
        //         }
        //     } else if (action.payload.slice_name == 'structures') {
        //         if (state.pagination.current_structures_page < state.pagination.total_structures_pages!) {
        //             state.pagination.current_structures_page += 1
        //         }
        //     }
        // },

    },
    extraReducers: (builder) => {

            builder.addMatcher(ribxz_api.endpoints.routersRouterLigLigTranspose.matchFulfilled, (state, action) => {
                state.ligands_page.prediction_data = action.payload
                state.ligands_page.prediction_pending = false
            });
            builder.addMatcher(ribxz_api.endpoints.routersRouterLigLigTranspose.matchPending, (state, action) => {
                state.ligands_page.prediction_pending = true
            });
            builder.addMatcher(ribxz_api.endpoints.routersRouterLigLigTranspose.matchRejected, (state, action) => {
                state.ligands_page.prediction_pending = false
            });
        //  TODO: Replaced with the POST mutation based approach
        // builder.addMatcher(ribxz_api.endpoints.routersRouterStructFilterList.matchFulfilled, (state, action) => {
        //     // @ts-ignore
        //     state.data.current_structures = action.payload.structures
        //     // @ts-ignore
        //     state.data.total_structures_count = action.payload.count
        //     // @ts-ignore
        //     state.pagination.total_structures_pages = Math.ceil(action.payload.count / PAGE_SIZE_STRUCTURES)
        // });

        // builder.addMatcher(ribxz_api.endpoints.routersRouterStructPolymersByStructure.matchFulfilled, (state, action) => {
        //     console.log("Dispatch fetch polymer BY STRUCTURE matchFulfilled");
        //     // @ts-ignore
        //     state.data.current_polymers = action.payload.polymers
        //     // @ts-ignore
        //     state.data.total_polymers_count = action.payload.count
        //     // @ts-ignore
        //     state.pagination.total_polymers_pages = Math.ceil(action.payload.count / PAGE_SIZE_POLYMERS)
        // });

        // builder.addMatcher(ribxz_api.endpoints.routersRouterStructPolymersByPolymerClass.matchFulfilled, (state, action) => {

        //     console.log("Dispatch fetch polymer BY POLYCLASS matchFulfilled");

        //     // @ts-ignore
        //     state.data.current_polymers = action.payload.polymers
        //     // @ts-ignore
        //     state.data.total_polymers_count = action.payload.count
        //     // @ts-ignore
        //     state.pagination.total_polymers_pages = Math.ceil(action.payload.count / PAGE_SIZE_POLYMERS)
        // })
    }
})


export const {
    set_ligands_data,
    set_ligands_data_filtered,
    set_current_ligand,
    set_ligands_radius,
    set_ligand_prediction_data,


    // set_current_polymers,
    // set_current_polymer_class,

    // set_current_structures,
    // set_total_structures_count,

    set_tax_dict,
    // set_filter,

    // pagination_set_page,
    // pagination_next_page,
    // pagination_prev_page

} = uiSlice.actions
export default uiSlice.reducer











export const prefetchLigandsData = createAsyncThunk( 'ui/fetchAndSetLigandsData',
  async (_, { dispatch }) => {
    const result = await dispatch(ribxz_api.endpoints.routersRouterStructListLigands.initiate());
    if ('data' in result) {
      dispatch(set_ligands_data(result.data as any));
    }
  }
);

export const fetchPredictionData = createAsyncThunk( 'ui/fetchPredictionData',
  async (params:{
    chemid: string,
    src   : string,
    tgt   : string,
    radius: number
  }, { dispatch }) => {
    const result = await dispatch(ribxz_api.endpoints.routersRouterLigLigTranspose.initiate({
        chemicalId     : params.chemid,
        sourceStructure: params.src,
        targetStructure: params.tgt,
        radius         : params.radius
    })).then((res) => {console.log("hit endpoint"); return res;
    });
    if ('data' in result) {
      dispatch(set_ligand_prediction_data(result.data as any));
      console.log("Dispatched prediction data:");
      console.log(result.data);
      
    }
  }
);