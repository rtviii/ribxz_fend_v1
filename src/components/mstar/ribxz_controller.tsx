import { mapAssetModelComponentsAdd, mapAssetReprRefAdd, mapAssetRootRefAdd } from "@/store/molstar/slice_refs";
import { ribxzMstarv2 } from "./mstarv2";
import { AppDispatch } from "@/store/store";
import { v5 as uuidv5 } from 'uuid';


export function createAssetHandle(asset_value: string): string {
    //just random hash
    const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
    return uuidv5(asset_value, namespace);
}


export class MolstarStateController {

  private molstarViewer: ribxzMstarv2;
  private dispatch: AppDispatch

  constructor(molstarViewer: ribxzMstarv2, dispatch:AppDispatch) {
    this.molstarViewer = molstarViewer;
    this.dispatch = dispatch
  }

  async loadStructure( rcsb_id:string, nomenclature_map: Record<string, string>) {
    const handle = createAssetHandle(rcsb_id);
    const { root_ref, repr_ref, components } = await this.molstarViewer.components.upload_mmcif_structure(rcsb_id, nomenclature_map);
    this.dispatch(mapAssetRootRefAdd([handle, root_ref]));
    this.dispatch(mapAssetReprRefAdd([handle, repr_ref]));
    this.dispatch(mapAssetModelComponentsAdd({ handle, components }));
    return { root_ref, repr_ref, components };
  }

  async selectLigandAndSurroundings(chemicalId: string, radius: number = 5) {
    await this.molstarViewer.ligands.create_ligand_and_surroundings(chemicalId, radius);
  }

  async applyStylizedLighting() {
    await this.molstarViewer.representations.stylized_lighting();
  }
}