import { mapAssetModelComponentsAdd, mapAssetReprRefAdd, mapAssetRootRefAdd } from "@/store/molstar/slice_refs";
import { ribxzMstarv2 } from "./mstarv2";
import { AppDispatch } from "@/store/store";


export class MolstarStateController {

  private molstarViewer: ribxzMstarv2;
  private dispatch:      AppDispatch

  constructor(molstarViewer: ribxzMstarv2, dispatch: AppDispatch) {
    this.molstarViewer = molstarViewer;
    this.dispatch      = dispatch
  }

  async loadStructure(asset: { handle: string; rcsb_id: string }, nomenclature_map: Record<string, string>) {
    const { root_ref, repr_ref, components } = await this.molstarViewer.components.upload_mmcif_structure(asset.rcsb_id, nomenclature_map);
    this.dispatch(mapAssetModelComponentsAdd({ handle: asset.handle, components }));
    this.dispatch(mapAssetRootRefAdd([asset.handle, root_ref]));
    this.dispatch(mapAssetReprRefAdd([asset.handle, repr_ref]));
    return { root_ref, repr_ref, components };
  }

  async selectLigandAndSurroundings(chemicalId: string, radius: number = 5) {
    await this.molstarViewer.ligands.create_ligand_and_surroundings(chemicalId, radius);
  }

  async applyStylizedLighting() {
    await this.molstarViewer.representations.stylized_lighting();
  }
}