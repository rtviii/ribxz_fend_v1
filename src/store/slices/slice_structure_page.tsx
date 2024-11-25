'use client'
import { createAsyncThunk, createListenerMiddleware, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { Loci } from 'molstar/lib/mol-model/structure/structure/element/loci';


type auth_asym_id = string;
export interface StructurePageState {
  selected: auth_asym_id[],
  saved_selections: { [name: string]: auth_asym_id[] },
  current_struct_representation_ref: string | null,
  tunnel: {
    loci: Loci | null
    ptc: any
  },
}


const initialState: StructurePageState = {
  selected: [],
  current_struct_representation_ref: null,
  saved_selections: {},
  tunnel: {
    loci: null,
    ptc: null
  }
}

export const structurePageSlice = createSlice({
  name: 'structure_page',
  initialState,
  reducers: {
    set_tunnel_shape_loci(state, action: PayloadAction<Loci>) {
      Object.assign(state, { tunnel: { loci: action.payload, ptc: state.tunnel.ptc } })
    },
    snapshot_selection(state, action: PayloadAction<{ [name: string]: auth_asym_id[] }>) {
      // TODO: should do uniqueness check or merge into same selection.
      Object.assign(state, Object.assign(state.saved_selections, action.payload))
    },
    set_id_to_selection(state, action: PayloadAction<auth_asym_id>) {
      Object.assign(state, { selected: state.selected.includes(action.payload) ? state.selected.filter(id => id !== action.payload) : [...state.selected, action.payload] })
    },
    set_current_struct_representation_ref(state, action: PayloadAction<string>) {
      Object.assign(state, {
        current_struct_representation_ref: action.payload
      })
    },
    clear_selection(state, action: PayloadAction<null>) {
      Object.assign(state, { selected: [] })
    }

  },
  extraReducers: (builder) => {
    // builder.addCase(initiatePluginUIContext.fulfilled, (state, action) => {
    //   Object.assign(state, { ui_plugin: action.payload })
    // })
  }
})

export const {
  set_tunnel_shape_loci,
  snapshot_selection,
  set_id_to_selection,
  clear_selection

} = structurePageSlice.actions
export default structurePageSlice.reducer


