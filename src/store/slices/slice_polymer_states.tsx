import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface PolymerUIState {
    visible: boolean;
    selected: boolean;
    isolated: boolean;
}

interface PolymerIdentifier {
    rcsb_id: string;
    auth_asym_id: string;
}

interface PolymerStatesState {
    // Map of rcsb_id -> Map of auth_asym_id -> UI state
    states: Record<string, Record<string, PolymerUIState>>;
}

const initialState: PolymerStatesState = {
    states: {}
};

export const polymerStatesSlice = createSlice({
    name: 'polymerStates',
    initialState,
    reducers: {
        initializePolymerStates: (state, action: PayloadAction<PolymerIdentifier[]>) => {
            action.payload.forEach(({rcsb_id, auth_asym_id}) => {
                if (!state.states[rcsb_id]) {
                    state.states[rcsb_id] = {};
                }
                if (!state.states[rcsb_id][auth_asym_id]) {
                    state.states[rcsb_id][auth_asym_id] = {
                        visible: true,
                        selected: false,
                        isolated: false
                    };
                }
            });
        },
        setPolymerVisibility: (
            state,
            action: PayloadAction<{
                rcsb_id: string;
                auth_asym_id: string;
                visible: boolean;
            }>
        ) => {
            const {rcsb_id, auth_asym_id, visible} = action.payload;
            if (state.states[rcsb_id]?.[auth_asym_id]) {
                state.states[rcsb_id][auth_asym_id].visible = visible;
            }
            
        },
        setPolymerSelected: (
            state,
            action: PayloadAction<{
                rcsb_id: string;
                auth_asym_id: string;
                selected: boolean;
            }>
        ) => {
            const {rcsb_id, auth_asym_id, selected} = action.payload;
            if (state.states[rcsb_id]?.[auth_asym_id]) {
                state.states[rcsb_id][auth_asym_id].selected = selected;
            }
        },
        setPolymerIsolated: (
            state,
            action: PayloadAction<{
                rcsb_id: string;
                auth_asym_id: string;
                isolated: boolean;
            }>
        ) => {
            const {rcsb_id, auth_asym_id, isolated} = action.payload;
            if (state.states[rcsb_id]?.[auth_asym_id]) {
                state.states[rcsb_id][auth_asym_id].isolated = isolated;
            }
        }
    }
});

export const {initializePolymerStates, setPolymerVisibility, setPolymerSelected, setPolymerIsolated} =
    polymerStatesSlice.actions;

export default polymerStatesSlice.reducer;
