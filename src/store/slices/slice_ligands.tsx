'use client';
import {createAsyncThunk, createListenerMiddleware, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {LigandTransposition, ribxz_api} from '@/store/ribxz_api/ribxz_api';

export type LigandInstance = {
    ligand: {
        chemicalId: string;
        chemicalName: string;
        drugbank_description: string;
        drugbank_id: string;
        pdbx_description: string;
        formula_weight: number;
        number_of_instances: number;
    };
    parent_structure: {
        rcsb_id: string;
        tax_node: {
            rank: string;
            scientific_name: string;
            ncbi_tax_id: number;
        };
    };
};

export interface LigandsSliceState {
    data: LigandInstance[];
    filtered_data: LigandInstance[];
    current_ligand: LigandInstance | null;
    selected_target_structure: string | null; // Added this field
    radius: number;
    prediction_data: LigandTransposition | null;
    prediction_pending: boolean;
}

const initialState: LigandsSliceState = {
    data: [],
    radius: 10,
    current_ligand: null,
    selected_target_structure: null,
    filtered_data: [],
    prediction_data: null,
    prediction_pending: false
};

export const ligandsSlice = createSlice({
    name: 'ligands',
    initialState,
    reducers: {
        set_ligands_data(state, action: PayloadAction<LigandInstance[]>) {
            state.data = action.payload;
        },
        set_ligands_radius(state, action: PayloadAction<number>) {
            state.radius = action.payload;
        },
        set_ligands_data_filtered(state, action: PayloadAction<LigandInstance[]>) {
            state.filtered_data = action.payload;
        },
        set_current_ligand(state, action: PayloadAction<LigandInstance>) {
            state.current_ligand = action.payload;
        },
        set_ligand_prediction_data(state, action: PayloadAction<LigandTransposition | null>) {
            state.prediction_data = action.payload;
        },
        set_selected_target_structure(state, action: PayloadAction<string | null>) {
            state.selected_target_structure = action.payload;
        }
    },
    extraReducers: builder => {
        builder.addMatcher(ribxz_api.endpoints.routersRouterLigLigTranspose.matchFulfilled, (state, action) => {
            state.prediction_data = action.payload;
            state.prediction_pending = false;
        });
        builder.addMatcher(ribxz_api.endpoints.routersRouterLigLigTranspose.matchPending, (state, action) => {
            state.prediction_pending = true;
        });
        builder.addMatcher(ribxz_api.endpoints.routersRouterLigLigTranspose.matchRejected, (state, action) => {
            state.prediction_pending = false;
        });
    }
});

export const {
    set_ligands_data,
    set_ligands_data_filtered,
    set_current_ligand,
    set_ligands_radius,
    set_ligand_prediction_data,
    set_selected_target_structure
} = ligandsSlice.actions;
export default ligandsSlice.reducer;

export const prefetchLigandsData = createAsyncThunk('ui/fetchAndSetLigandsData', async (_, {dispatch}) => {
    const result = await dispatch(ribxz_api.endpoints.routersRouterStructListLigands.initiate());
    if ('data' in result) {
        dispatch(set_ligands_data(result.data as any));
    }
});

export const fetchPredictionData = createAsyncThunk(
    'ui/fetchPredictionData',
    async (
        params: {
            chemid: string;
            src: string;
            tgt: string;
            radius: number;
        },
        {dispatch}
    ) => {
        const result = await dispatch(
            ribxz_api.endpoints.routersRouterLigLigTranspose.initiate({
                chemicalId: params.chemid,
                sourceStructure: params.src,
                targetStructure: params.tgt,
                radius: params.radius
            })
        );

        if ('data' in result) {
            dispatch(set_ligand_prediction_data(result.data));
            console.log('Dispatched prediction data:', result.data);
            return result.data; // <-- Return the data here
        }

        throw new Error('No data received from prediction endpoint'); // <-- Handle error case
    }
);
