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

  constructor(molstarViewer: ribxzMstarv2) {
    this.molstarViewer = molstarViewer;
  }

  async loadStructure(dispatch:any, rcsb_id:string, nomenclature_map: Record<string, string>) {
    console.log("Ran 1");
    
    const handle = createAssetHandle(rcsb_id);
    const { root_ref, repr_ref, components } = await this.molstarViewer.components.upload_mmcif_structure(rcsb_id, nomenclature_map);
    dispatch(mapAssetRootRefAdd([handle, root_ref]));
    dispatch(mapAssetReprRefAdd([handle, repr_ref]));
    dispatch(mapAssetModelComponentsAdd({ handle, components }));
    console.log("Returned successfully");
    
    return { root_ref, repr_ref, components };
  }

  async selectLigandAndSurroundings(chemicalId: string, radius: number = 5) {
    await this.molstarViewer.ligands.create_ligand_and_surroundings(chemicalId, radius);
  }

  async applyStylizedLighting() {
    await this.molstarViewer.representations.stylized_lighting();
  }
}