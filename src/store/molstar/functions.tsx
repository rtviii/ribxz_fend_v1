
import { MolScriptBuilder as MS, MolScriptBuilder } from 'molstar/lib/mol-script/language/builder';
import { Expression } from 'molstar/lib/mol-script/language/expression';
import { Queries, StructureQuery, StructureSelection } from "molstar/lib/mol-model/structure";
import { CalendarIcon, ChartPieIcon, DocumentDuplicateIcon, FolderIcon, HomeIcon, UsersIcon, } from '@heroicons/react/24/outline'
import { Structure, StructureElement, StructureProperties } from 'molstar/lib/mol-model/structure/structure'
import { StructureSelectionQueries, StructureSelectionQuery } from 'molstar/lib/mol-plugin-state/helpers/structure-selection-query'
import { compileIdListSelection } from 'molstar/lib/mol-script/util/id-list'
import { log } from 'console';
import { Asset } from 'molstar/lib/mol-util/assets';
import { InteractivityManager } from 'molstar/lib/mol-plugin-state/manager/interactivity';
import { debounceTime } from 'rxjs';
import { Script } from 'molstar/lib/mol-script/script';
import { InitVolumeStreaming } from 'molstar/lib/mol-plugin/behavior/dynamic/volume-streaming/transformers';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms';
import { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects';
import { QueryHelper } from './lib';

export async function load_from_server() {
  window.molstar?.clear()
  const myUrl = new URL('http://127.0.0.1:8000/comp/get_chain/')
  myUrl.searchParams.append('auth_asym_id', 'A');
  myUrl.searchParams.append('rcsb_id', '3j7z');

  const data       = await window.molstar!.builders.data.download({ url: Asset.Url(myUrl.toString()), isBinary: false }, { state: { isGhost: true } });
  const trajectory = await window.molstar!.builders.structure.parseTrajectory(data, 'mmcif');
  await window.molstar!.builders.structure.hierarchy.applyPreset(trajectory, 'default', {
    structure: 1 ? {
      name: 'assembly',
      params: { id: 1 }
    } : {
      name: 'model',
      params: {}
    },
    showUnitcell: false,
    representationPreset: 'auto'
  });
}

export function create_fromSelection() {
  // window.molstar?.managers.structure.component.add({},)
}

export function select_multiple(molstar_plugin: PluginUIContext) {
  const args = [['A', 10, 15], ['F', 10, 15]]

  const groups: Expression[] = [];
  for (var chain of args) {
    groups.push(MS.struct.generator.atomGroups({
      "chain-test": MS.core.rel.eq([MolScriptBuilder.struct.atomProperty.macromolecular.auth_asym_id(), chain[0]]),
      "residue-test": MS.core.rel.inRange([MolScriptBuilder.struct.atomProperty.macromolecular.label_seq_id(), chain[1], chain[2]])
    }));
  }
  molstar_plugin.managers.structure.selection.fromSelectionQuery('set', StructureSelectionQuery('multiple', MS.struct.combinator.merge(groups)))
  return MS.struct.combinator.merge(groups);

}

export function chainSelection(auth_asym_id: string) {
  return MS.struct.generator.atomGroups({
    'chain-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_asym_id(), auth_asym_id])
  });
}


export async function stream_volume() {
  const objdata = window.molstar!.managers.structure.hierarchy.current.structures[0].cell.obj!
  // console.log(objdata);
  const params = InitVolumeStreaming.createDefaultParams(objdata, window.molstar);
  params.options.behaviorRef = 'assembly'
  params.defaultView = 'box';
  params.options.channelParams['fo-fc(+ve)'] = { wireframe: true };
  params.options.channelParams['fo-fc(-ve)'] = { wireframe: true };
  await window.molstar?.runTask(window.molstar.state.data.applyAction(InitVolumeStreaming, params));
  // this.experimentalDataElement = parent;
  // volumeStreamingControls(this.plugin, parent);

}

export async function download_struct(plugin: PluginUIContext) {
      const data       = await plugin.builders.data.download({ url: "https://files.rcsb.org/download/5AFI.cif" }, { state: { isGhost: true } });
      const trajectory = await plugin.builders.structure.parseTrajectory(data, "mmcif");
      await plugin.builders.structure.hierarchy.applyPreset(trajectory, "default");
}

export async function apply_style(){
  var mst = window.molstar!;
  var builder = mst.build()
  builder.toRoot()
  



}

export const  highlightInViewer = (plugin:PluginUIContext,seq_id: string) =>{
    const data = plugin.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
    if (!data) return;

    // console.log("Got cell obj data", data);
    
    const sel = Script.getStructureSelection(Q => Q.struct.generator.atomGroups({
        'chain-test': Q.core.rel.eq([Q.struct.atomProperty.macromolecular.auth_asym_id(), seq_id]),
        // 'group-by': Q.struct.atomProperty.macromolecular.residueKey()
    }), data);

    let loci = StructureSelection.toLociWithSourceUnits(sel);
    // loci = StructureElement.Loci.firstResidue(loci);
    plugin.managers.interactivity.lociHighlights.highlight({ loci });
    // plugin.managers.camera.focusLoci(loci);
}
export const removeHighlight = (plugin:PluginUIContext) =>{
    plugin.managers.interactivity.lociHighlights.clearHighlights();
}


// const current = StructureSelectionQuery('Current Selection', MS.struct.atomProperty.macromolecular., { category: '', referencesCurrent: true });
export const select_current_struct = (ctx:PluginUIContext) => {
          const structureData = ctx.managers.structure.hierarchy.current.structures[0]

          var   components         = structureData.components
          const cell_transform_ref = structureData.cell.transform.ref

          console.log(structureData);
          console.log(components);
          console.log(cell_transform_ref);

         const state_data = ctx.state.data.select(cell_transform_ref)[0].obj as PluginStateObject.Molecule.Structure
         const data = state_data.data;
         ctx.managers.structure.selection

         console.log(state_data);
         console.log(data);
         


  // window.molstar?.managers.structure.selection.fromSelectionQuery('add',StructureSelectionQuery('struct', query));
}

const applyStyle =  (ctx:PluginUIContext) => {

            const q = MS.struct.generator.atomGroups({
                'chain-test': MS.core.rel.eq([
                    MS.ammp('label_asym_id'),
                    'B',
                ]),
                'residue-test': MS.core.logic.and([
                    MS.core.rel.gre([
                        MS.ammp('auth_seq_id'),
                        330
                    ]),
                    MS.core.rel.lte([
                        MS.ammp('auth_seq_id'),
                        340
                    ])
                ]),
            })

            const update2 = ctx.build();
            update2.to(structure)
                .apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(ctx, structure.data, {
                    type: 'cartoon',
                    color: 'uniform',
                }));
}



function next_residue_on_hover() {
  const objdata = window.molstar!.managers.structure.hierarchy.current.structures[0]!.cell.obj!.data;
  window.molstar!.behaviors.interaction.hover.pipe(debounceTime(100)).subscribe((e: InteractivityManager.HoverEvent) => {
    if (e.current && e.current.loci && e.current.loci.kind !== 'empty-loci') {

      if (StructureElement.Loci.is(e.current.loci)) {

        const l = StructureElement.Loci.getFirstLocation(e.current.loci);

        if (l) {
          // get the residue number and auth asym id of parent chain
          const seq_id   = StructureProperties.residue.label_seq_id(l);
          const chain_id = StructureProperties.chain.auth_asym_id(l)

          // create selection for the next residue ("seq_id+1") 
          var sel = Script.getStructureSelection(Q => Q.struct.generator.atomGroups({
            'chain-test': Q.core.rel.eq([Q.struct.atomProperty.macromolecular.auth_asym_id(), chain_id]),
            // "residue-test": Q.core.rel.eq([Q.struct.atomProperty.macromolecular.label_seq_id(), seq_id + 1]),
          }), objdata)

          // create loci
          let loci = StructureSelection.toLociWithSourceUnits(sel);
          window.molstar!.managers.interactivity.lociHighlights.highlightOnly({ loci });

        }
      }
    }
  });
}