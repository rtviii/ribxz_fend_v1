'use client'
import { createAsyncThunk, createListenerMiddleware, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum, Polymer, Protein, RibosomeStructure, ribxz_api, Rna, useRoutersRouterStructFilterListQuery } from '@/store/ribxz_api/ribxz_api'

const PAGE_SIZE_STRUCTURES = 20;
const PAGE_SIZE_POLYMERS = 50;
export interface FiltersState {
    search: string | null
    year: [number | null, number | null]
    resolution: [number | null, number | null]
    polymer_classes: CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum[]
    source_taxa: number[]
    host_taxa: number[]
}

export interface PaginationState {
    current_polymers_page: number
    total_polymers_pages: number | null

    current_structures_page: number
    total_structures_pages: number | null
}
// array of tuples [{ ligand info }, all structs in which it is present : [ {rcsb id, taxnodeinfo} ]]
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
        chemicalId: string
        chemicalName: string
        drugbank_description: string
        drugbank_id: string
        pdbx_description: string
        formula_weight: number
        number_of_instances: number

    }, parent_structure: {
        rcsb_id: string
        tax_node: {
            rank: string, scientific_name: string, ncbi_tax_id: number
        }
    }
}

export interface UIState {
    taxid_dict: Record<number, [string, "Bacteria" | "Eukaryota" | "Archaea"]>,
    ligands_page: {
        data          : LigandInstances,
        filtered_data : LigandInstances
        current_ligand: LigandInstance | null
    },
    data: {
        current_structures: RibosomeStructure[],
        current_polymers: Array<Polymer | Rna | Protein>,

        total_structures_count: number | null,
        total_polymers_count: number | null
    },
    polymers: {
        current_polymer_class: CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum | null,
    }

    filters: FiltersState,
    pagination: PaginationState
}

const initialState: UIState = {
    taxid_dict: {},
    ligands_page: {
        data: [],
        current_ligand:  null,
        filtered_data: []
    },
    data: {
        current_structures: [],
        current_polymers: [],
        total_structures_count: null,
        total_polymers_count: null
    },
    polymers: { // polymers_page
        current_polymer_class: null
    },
    filters: {
        search: '',
        year: [null, null],
        resolution: [null, null],
        polymer_classes: [],
        source_taxa: [],
        host_taxa: [],
    },
    pagination: {
        current_structures_page: 1,
        total_structures_pages: null,

        current_polymers_page: 1,
        total_polymers_pages: null
    }
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
        set_ligands_data(state, action: PayloadAction<LigandInstances>) {
            state.ligands_page.data = action.payload
        },
        set_ligands_data_filtered(state, action: PayloadAction<LigandInstances>) {
            state.ligands_page.filtered_data = action.payload
        },

        set_current_ligand(state, action: PayloadAction<LigandInstance>) {
            state.ligands_page.current_ligand = action.payload
        },


        set_tax_dict(state, action: PayloadAction<Record<number, [string, "Bacteria" | "Eukaryota" | "Archaea"]>>) {
            state.taxid_dict = action.payload
        },
        set_new_structs(state, action: PayloadAction<RibosomeStructure[]>) {
            state.data.current_structures = action.payload
        },
        set_current_polymers(state, action: PayloadAction<Array<Polymer | Rna | Protein>>) {
            state.data.current_polymers = action.payload
        },

        set_current_polymer_class(state, action: PayloadAction<string>) {
            Object.assign(state.polymers, { current_polymer_class: action.payload })
        },
        set_filter(state, action: PayloadAction<{ filter_type: keyof FiltersState, value: typeof state.filters[keyof FiltersState] }>) {
            Object.assign(state.filters, { [action.payload.filter_type]: action.payload.value })
        },

        pagination_prev_page(state, action: PayloadAction<{
            slice_name: 'structures' | 'polymers',
        }>) {
            if (action.payload.slice_name === 'polymers') {
                if (1 < state.pagination.current_polymers_page) {
                    state.pagination.current_polymers_page -= 1
                }
            }
            if (action.payload.slice_name === 'structures') {
                if (1 < state.pagination.current_structures_page) {
                    state.pagination.current_structures_page -= 1
                }
            }
        },
        pagination_set_page(state, action: PayloadAction<{ slice_name: 'structures' | 'polymers', set_to_page: number }>) {
            if (action.payload.slice_name === 'polymers') {
                if (action.payload.set_to_page <= state.pagination.total_polymers_pages! && 1 <= action.payload.set_to_page) {
                    state.pagination.current_polymers_page = action.payload.set_to_page
                }
            } else if (action.payload.slice_name === 'structures') {
                if (action.payload.set_to_page <= state.pagination.total_structures_pages! && 1 <= action.payload.set_to_page) {
                    state.pagination.current_structures_page = action.payload.set_to_page
                }

            }
        },
        pagination_next_page(state, action: PayloadAction<{ slice_name: 'structures' | 'polymers', }>) {
            if (action.payload.slice_name == 'polymers') {
                if (state.pagination.current_polymers_page < state.pagination.total_polymers_pages!) {
                    state.pagination.current_polymers_page += 1
                }
            } else if (action.payload.slice_name == 'structures') {
                if (state.pagination.current_structures_page < state.pagination.total_structures_pages!) {
                    state.pagination.current_structures_page += 1
                }
            }
        },

    },
    extraReducers: (builder) => {
        builder.addMatcher(ribxz_api.endpoints.routersRouterStructFilterList.matchFulfilled, (state, action) => {

            // @ts-ignore
            state.data.current_structures = action.payload.structures
            // @ts-ignore
            state.data.total_structures_count = action.payload.count
            // @ts-ignore
            state.pagination.total_structures_pages = Math.ceil(action.payload.count / PAGE_SIZE_STRUCTURES)
        });

        builder.addMatcher(ribxz_api.endpoints.routersRouterStructPolymersByStructure.matchFulfilled, (state, action) => {
            console.log("Dispatch fetch polymer BY STRUCTURE matchFulfilled");

            // @ts-ignore
            state.data.current_polymers = action.payload.polymers
            // @ts-ignore
            state.data.total_polymers_count = action.payload.count
            // @ts-ignore
            state.pagination.total_polymers_pages = Math.ceil(action.payload.count / PAGE_SIZE_POLYMERS)
        });

        builder.addMatcher(ribxz_api.endpoints.routersRouterStructPolymersByPolymerClass.matchFulfilled, (state, action) => {

            console.log("Dispatch fetch polymer BY POLYCLASS matchFulfilled");

            // @ts-ignore
            state.data.current_polymers = action.payload.polymers
            // @ts-ignore
            state.data.total_polymers_count = action.payload.count
            // @ts-ignore
            state.pagination.total_polymers_pages = Math.ceil(action.payload.count / PAGE_SIZE_POLYMERS)
        })
    }
})


export const {

    set_ligands_data,
    set_ligands_data_filtered,
    set_current_ligand,


    set_tax_dict,
    set_current_polymers,
    set_current_polymer_class,
    set_new_structs,
    set_filter,
    pagination_set_page,
    pagination_next_page,
    pagination_prev_page
} = uiSlice.actions
export default uiSlice.reducer




export const prefetchLigandsData = createAsyncThunk( 'ui/fetchAndSetLigandsData',
  async (_, { dispatch }) => {
    const result = await dispatch(ribxz_api.endpoints.routersRouterStructListLigands.initiate());
    if ('data' in result) {
      dispatch(set_ligands_data(result.data));
    }
  }
);