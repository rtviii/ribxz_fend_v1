import {mapAssetModelComponentsAdd, mapAssetReprRefAdd, mapAssetRootRefAdd} from '@/store/molstar/slice_refs';
import {ribxzMstarv2} from './mstarv2';
import {AppDispatch, AppStore, RootState} from '@/store/store';
import {v5 as uuidv5} from 'uuid';
import { ConstrictionSite, PtcInfo } from '@/store/ribxz_api/ribxz_api';

export function createAssetHandle(asset_value: string): string {
    //just random hash
    const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
    return uuidv5(asset_value, namespace);
}

export class MolstarStateController {
    private viewer: ribxzMstarv2;
    private dispatch: AppDispatch;
    private state: RootState;

    constructor(molstarViewer: ribxzMstarv2, dispatch: AppDispatch, state: RootState) {
        this.viewer = molstarViewer;
        this.dispatch = dispatch;
        this.state = state;
    }

    mute_polymers = async (rcsb_id:string) => {
        for (const auth_asym_id of Object.keys(this.state.mstar_refs.handle_model_components_map[rcsb_id])) {
            const ref = this.retrievePolymerRef(rcsb_id, auth_asym_id);
            ref && this.viewer.interactions.toggle_visibility(ref, true);
        }

    }
    landmarks = {
        ptc: async (rcsb_id: string) => {
            const response     = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_URL}/structures/ptc?rcsb_id=${rcsb_id}`);
            const data:PtcInfo = await response.json();
            this.viewer.landmarks.ptc(data.location)
        },
        constriction_site : async (rcsb_id: string) => {
            const response              = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_URL}/structures/constriction_site?rcsb_id=${rcsb_id}`);
            const data:ConstrictionSite = await response.json();
            this.viewer.landmarks.constriction_site(data.location)
        }
    };

    async loadStructure(rcsb_id: string, nomenclature_map: Record<string, string>) {
        rcsb_id = rcsb_id.toUpperCase();
        const {root_ref, repr_ref, objects_polymer, objects_ligand} = await this.viewer.components.upload_mmcif_structure(
            rcsb_id,
            nomenclature_map
        );
        const components = {...objects_polymer, ...objects_ligand};
        this.dispatch(mapAssetRootRefAdd([rcsb_id, root_ref]));
        this.dispatch(mapAssetReprRefAdd([rcsb_id, repr_ref]));
        this.dispatch(mapAssetModelComponentsAdd({handle: rcsb_id, components}));
        console.log("Created ref", root_ref, repr_ref, components);
        
        return {root_ref, repr_ref, components};
    }

    retrievePolymerRef(rcsb_id: string, auth_asym_id: string): string | undefined {
        if (this.state.mstar_refs.handle_model_components_map[rcsb_id] === undefined) {
            return;
        }
        return this.state.mstar_refs.handle_model_components_map[rcsb_id][auth_asym_id].ref;
    }

    polymers = {
        selectPolymerComponent: async (rcsb_id: string, auth_asym_id: string, isSelected: boolean) => {
            var ref = this.retrievePolymerRef(rcsb_id, auth_asym_id);
            ref && this.viewer.interactions.selection(ref, isSelected ? 'add' : 'remove');
        },
        focusPolymerComponent: async (rcsb_id: string, auth_asym_id: string) => {
            var ref = this.retrievePolymerRef(rcsb_id, auth_asym_id);
            ref && this.viewer.interactions.focus(ref);
        },
        highlightPolymerComponent: async (rcsb_id: string, auth_asym_id: string) => {
            var ref = this.retrievePolymerRef(rcsb_id, auth_asym_id);
            ref && this.viewer.interactions.highlight(ref);
        },
        togglePolymerComponent: async (rcsb_id: string, auth_asym_id: string, isSelected: boolean) => {
            var ref = this.retrievePolymerRef(rcsb_id, auth_asym_id);
            ref && this.viewer.interactions.toggle_visibility(ref, isSelected);
        }
    };

    async selectLigandAndSurroundings(chemicalId: string, radius: number = 5) {
        await this.viewer.ligands.create_ligand_and_surroundings(chemicalId, radius);
    }



    async applyStylizedLighting() {
        await this.viewer.representations.stylized_lighting();
    }

    experimental = {

        cylinder_residues: async () => {
            const response   = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_URL}/structures/cylinder_residues`);
            const data       = await response.json();
            const struct_ref = Object.values(this.state.mstar_refs.handle_root_ref_map)[0]

            console.log("Got struct ref", struct_ref);


            this.viewer.experimental.cylinder_residues(struct_ref,data);
            console.log(data);
            
        }

    }
}
