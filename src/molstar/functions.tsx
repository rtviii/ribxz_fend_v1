
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


const mstar = window.molstar!;

export async function load_from_server() {

  window.molstar?.clear()
  const myUrl = new URL('http://127.0.0.1:8000/comp/get_chain/')
  myUrl.searchParams.append('auth_asym_id', 'A');
  myUrl.searchParams.append('rcsb_id', '3j7z');

  const data = await window.molstar!.builders.data.download({ url: Asset.Url(myUrl.toString()), isBinary: false }, { state: { isGhost: true } });
  console.log("Got data:", data);

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

export function select_multiple() {
  const args = [['A', 10, 15], ['F', 10, 15]]

  const groups: Expression[] = [];
  for (var chain of args) {
    groups.push(MS.struct.generator.atomGroups({
      "chain-test": MS.core.rel.eq([MolScriptBuilder.struct.atomProperty.macromolecular.auth_asym_id(), chain[0]]),
      "residue-test": MS.core.rel.inRange([MolScriptBuilder.struct.atomProperty.macromolecular.label_seq_id(), chain[1], chain[2]])
    }));
  }
  mstar.managers.structure.selection.fromSelectionQuery('set', StructureSelectionQuery('multiple', MS.struct.combinator.merge(groups)))
  return MS.struct.combinator.merge(groups);

}

export function chainSelection(auth_asym_id: string) {
  return MS.struct.generator.atomGroups({
    'chain-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_asym_id(), auth_asym_id])
  });
}


export async function stream_volume() {
  const objdata = window.molstar!.managers.structure.hierarchy.current.structures[0].cell.obj!
  console.log(objdata);
  const params = InitVolumeStreaming.createDefaultParams(objdata, window.molstar);
  params.options.behaviorRef = 'assembly'
  params.defaultView = 'box';
  params.options.channelParams['fo-fc(+ve)'] = { wireframe: true };
  params.options.channelParams['fo-fc(-ve)'] = { wireframe: true };
  await window.molstar?.runTask(window.molstar.state.data.applyAction(InitVolumeStreaming, params));
  // this.experimentalDataElement = parent;
  // volumeStreamingControls(this.plugin, parent);

}

export async function download_another_struct(){
      const data       = await mstar.builders.data.download({ url: "https://files.rcsb.org/download/5AFI.cif" }, { state: { isGhost: true } });
      const trajectory = await mstar.builders.structure.parseTrajectory(data, "mmcif");
      await mstar.builders.structure.hierarchy.applyPreset(trajectory, "default");
}

// const __select_chain = () => {
//   var selection: any = (l: any) => StructureProperties.chain.auth_asym_id(l.element) === 'A'
//   var k = Queries.combinators.merge([Queries.generators.atoms(selection)])
//   const { core, struct } = MolScriptBuilder;

//   const expressions = []

//   var proteins = StructureSelectionQueries.protein
//   var polymer = StructureSelectionQueries.polymer


//   const propTests: Parameters<typeof struct.generator.atomGroups>[0] = {
//     'chain-test': core.rel.eq([struct.atomProperty.macromolecular.auth_asym_id, 'A']),
//     'group-by': struct.atomProperty.core.operatorName(),
//   }

//   expressions.push(struct.filter.first([struct.generator.atomGroups(propTests)]));
//   const e = struct.combinator.merge(expressions);

//   // const select_chain = StructureSelectionQuery('chain_A', chainSelection('B'))
//   const select_multiple_chains = StructureSelectionQuery('multiple', select_multiple())
//   console.log(select_multiple_chains);

//   // ! Via compiled selection
  const query = compileIdListSelection('A 12-200', 'auth');
  window.molstar?.managers.structure.selection.fromCompiledQuery('add',query);

// }




function next_residue_on_hover() {

  // root structure
  const objdata = window.molstar!.managers.structure.hierarchy.current.structures[0]!.cell.obj!.data;

  // subscribe to hover events
  window.molstar!.behaviors.interaction.hover.pipe(debounceTime(100)).subscribe((e: InteractivityManager.HoverEvent) => {
    if (e.current && e.current.loci && e.current.loci.kind !== 'empty-loci') {
      if (StructureElement.Loci.is(e.current.loci)) {
        const l = StructureElement.Loci.getFirstLocation(e.current.loci);
        if (l) {
          // get the residue number and auth asym id of parent chain
          const seq_id = StructureProperties.residue.label_seq_id(l);
          const chain_id = StructureProperties.chain.auth_asym_id(l)

          // create selection for the next residue ("seq_id+1") 
          var sel = Script.getStructureSelection(Q => Q.struct.generator.atomGroups({

            'chain-test': Q.core.rel.eq([Q.struct.atomProperty.macromolecular.auth_asym_id(), chain_id]),
            "residue-test": Q.core.rel.eq([Q.struct.atomProperty.macromolecular.label_seq_id(), seq_id + 1]),
          }), objdata)

          // create loci
          let loci = StructureSelection.toLociWithSourceUnits(sel);
          window.molstar!.managers.interactivity.lociHighlights.highlightOnly({ loci });

        }
      }
    }
  });
}