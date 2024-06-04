import { MolScriptBuilder as MS, MolScriptBuilder } from 'molstar/lib/mol-script/language/builder';
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
import { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects';
import { QueryHelper } from './lib';
import { StructureFocusControls } from 'molstar/lib/mol-plugin-ui/structure/focus'
import { StateObjectRef } from 'molstar/lib/mol-state/object';
import { BuiltInTrajectoryFormat } from "molstar/lib/mol-plugin-state/formats/trajectory";
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { compile } from "molstar/lib/mol-script/runtime/query/compiler";
import { superpose } from 'molstar/lib/mol-model/structure/structure/util/superposition'
import { QueryContext } from "molstar/lib/mol-model/structure/query/context";
import { Expression } from "molstar/lib/mol-script/language/expression";
import { PluginStateObject as PSO } from "molstar/lib/mol-plugin-state/objects";
import { StateTransforms } from "molstar/lib/mol-plugin-state/transforms";
import { Mat4 } from "molstar/lib/mol-math/linear-algebra/3d/mat4";
import _ from 'lodash'
import { Loci } from 'molstar/lib/mol-model/loci';
import { StateSelection } from 'molstar/lib/mol-state';
import { createStructureRepresentationParams } from 'molstar/lib/mol-plugin-state/helpers/structure-representation-params';
import { StructureComponent } from 'molstar/lib/mol-plugin-state/transforms/model';
import { StructureRepresentation3D } from 'molstar/lib/mol-plugin-state/transforms/representation';
import { PluginCommands } from 'molstar/lib/mol-plugin/commands';

export enum StateElements {
  Model = 'model',
  ModelProps = 'model-props',
  Assembly = 'assembly',

  VolumeStreaming = 'volume-streaming',

  Sequence = 'sequence',
  SequenceVisual = 'sequence-visual',
  Het = 'het',
  HetVisual = 'het-visual',
  Het3DSNFG = 'het-3dsnfg',
  Water = 'water',
  WaterVisual = 'water-visual',

  HetGroupFocus = 'het-group-focus',
  HetGroupFocusGroup = 'het-group-focus-group'
}




// export function structure_sel(ctx: PluginContext, assemblyId: string) {
//   const state = ctx.state.data;
//   const model = state.build().to(StateElements.Model);
//   const props = {
//     type: assemblyId ? {
//       name: 'assembly' as const,
//       params: { id: assemblyId }
//     } : {
//       name: 'model' as const,
//       params: {}
//     }
//   };

//   const s = model
//     .apply(StateTransforms.Model.StructureFromModel, props, { ref: StateElements.Assembly });

//   s.apply(StateTransforms.Model.StructureComplexElement, { type: 'atomic-sequence' }, { ref: StateElements.Sequence });
//   s.apply(StateTransforms.Model.StructureComplexElement, { type: 'atomic-het' }, { ref: StateElements.Het });
//   s.apply(StateTransforms.Model.StructureComplexElement, { type: 'water' }, { ref: StateElements.Water });

//   console.log("sturcture");
//   console.log(s);

//   return s;
// }

export function create_ligand_surroundings(ctx: PluginContext, chemicalId: string) {
  return ctx.dataTransaction(async () => {
    const RADIUS = 5

    let structures = ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({ structureRef, number: i + 1 }));
    const struct = structures[0];
    const update = ctx.build();


    const core = MS.struct.filter.first([
      MS.struct.generator.atomGroups({
        'residue-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.label_comp_id(), chemicalId]),
        'group-by': MS.core.str.concat([MS.struct.atomProperty.core.operatorName(), MS.struct.atomProperty.macromolecular.residueKey()])
      })
    ]);

    const surr_sel = MS.struct.modifier.includeSurroundings({ 0: core, radius: RADIUS, 'as-whole-residues': true });


    const group = update.to(struct.structureRef.cell).group(StateTransforms.Misc.CreateGroup, { label: 'group' }, { ref: StateElements.HetGroupFocusGroup });
    const coreSel = group.apply(StateTransforms.Model.StructureSelectionFromExpression, { label: `${chemicalId} Neighborhood (${RADIUS} Å)`, expression: surr_sel }, { ref: StateElements.HetGroupFocus });

    coreSel.apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(ctx, struct.structureRef.cell.obj?.data, { type: 'ball-and-stick' }));
    coreSel.apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(ctx, struct.structureRef.cell.obj?.data, { type: 'label', typeParams: { level: 'residue' } }));

    await PluginCommands.State.Update(ctx, { state: ctx.state.data, tree: update });

    const compiled = compile<StructureSelection>(surr_sel);
    const selection = compiled(new QueryContext(struct.structureRef.cell.obj?.data!));
    let loci = StructureSelection.toLociWithSourceUnits(selection);
    ctx.managers.structure.selection.clear();
    ctx.managers.structure.selection.fromLoci('add', loci);
    ctx.managers.camera.focusLoci(loci);
  })
}
export function create_ligand(ctx: PluginContext, chemicalId: string) {
  return ctx.dataTransaction(async () => {
    console.log("create ligand");
    console.log("got chemid ", chemicalId);



    let structures = ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({ structureRef, number: i + 1 }));
    const struct = structures[0];
    const update = ctx.build();

    const core = MS.struct.filter.first([
      MS.struct.generator.atomGroups({
        'residue-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.label_comp_id(), chemicalId]),
        'group-by': MS.core.str.concat([MS.struct.atomProperty.core.operatorName(), MS.struct.atomProperty.macromolecular.residueKey()])
      })
    ]);

    const group = update.to(struct.structureRef.cell).group(StateTransforms.Misc.CreateGroup, { label: 'ligand_group' }, { ref: StateElements.HetGroupFocusGroup });
    const coreSel = group.apply(StateTransforms.Model.StructureSelectionFromExpression, { label: chemicalId, expression: core }, { ref: StateElements.HetGroupFocus });

    coreSel.apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(ctx, struct.structureRef.cell.obj?.data, { type: 'ball-and-stick' }));
    coreSel.apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(ctx, struct.structureRef.cell.obj?.data, { type: 'label', typeParams: { level: 'residue' } }));

    await PluginCommands.State.Update(ctx, { state: ctx.state.data, tree: update });

    const compiled = compile<StructureSelection>(core);
    const selection = compiled(new QueryContext(struct.structureRef.cell.obj?.data!));
    let loci = StructureSelection.toLociWithSourceUnits(selection);
    ctx.managers.structure.selection.clear();
    ctx.managers.structure.selection.fromLoci('add', loci);
    ctx.managers.camera.focusLoci(loci);


  });
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
  const data = await plugin.builders.data.download({ url: "https://files.rcsb.org/download/5AFI.cif" }, { state: { isGhost: true } });
  const trajectory = await plugin.builders.structure.parseTrajectory(data, "mmcif");
  await plugin.builders.structure.hierarchy.applyPreset(trajectory, "default");
}

export async function apply_style() {
  var mst = window.molstar!;
  var builder = mst.build()
  builder.toRoot()




}

export const transform = (ctx: PluginContext) => {

  // const b = plugin.state.data.build().to(s).insert(StateTransforms.Model.TransformStructureConformation, { transform: { name: 'matrix', params: { data: matrix, transpose: false } } });

  const structureData = ctx.managers.structure.hierarchy.current.structures[0]
  const cell = structureData.cell

  // const cell = structureData.model?.cell
  const mx = Mat4.rotX90
  const b = ctx.state.data.build().to(cell).insert(StateTransforms.Model.TransformStructureConformation, {
    transform: {
      name: 'matrix', params: {
        data: mx, transpose: false
      }
    }
  });
  return ctx.runTask(ctx.state.data.updateTree(b));
}

export const selectChain = (plugin: PluginUIContext, auth_asym_id: string) => {
  console.log("Got context", plugin);
  
  const data = plugin.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
  if (!data) return;

  const sel = Script.getStructureSelection(
    Q => Q.struct.generator.atomGroups({
      'chain-test': Q.core.rel.eq([Q.struct.atomProperty.macromolecular.auth_asym_id(), auth_asym_id]),
    }), data);

  let loci = StructureSelection.toLociWithSourceUnits(sel);
  plugin.managers.structure.selection.clear();
  plugin.managers.structure.selection.fromLoci('add', loci);
  plugin.managers.camera.focusLoci(loci);
}



const _highlightChain = (plugin: PluginUIContext, auth_asym_id: string) => {
  console.log("Hl chain go", auth_asym_id);

  const data = plugin.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
  if (!data) {
    console.log("no data");
    return;
  } else {
    console.log("data found");
  }

  const sel = Script.getStructureSelection(Q => Q.struct.generator.atomGroups({
    // 'chain-test': Q.core.rel.eq([Q.struct.atomProperty.macromolecular.auth_asym_id(), auth_asym_id]),
    'chain-test': Q.core.rel.eq([Q.struct.atomProperty.macromolecular.label_asym_id(), auth_asym_id]),
  }), data);
  let loci = StructureSelection.toLociWithSourceUnits(sel);
  console.log("loci", loci);
  plugin.managers.interactivity.lociHighlights.highlight({ loci });

}
_.memoize.Cache = WeakMap;

export const highlightChain = _.memoize(_highlightChain =>
  _.debounce((ctx, auth_asym_id) => {
    _highlightChain(ctx, auth_asym_id)
  }, 50, { "leading": true, "trailing": true })
)(_highlightChain);





export const removeHighlight = (plugin: PluginUIContext) => {
  plugin.managers.interactivity.lociHighlights.clearHighlights();
}

export const select_current_struct = (ctx: PluginUIContext) => {


  const structureData = ctx.managers.structure.hierarchy.current.structures[0]
  var components = structureData.components
  const cell_transform_ref = structureData.cell.transform.ref
  const state_data = ctx.state.data.select(cell_transform_ref)[0].obj as PluginStateObject.Molecule.Structure

  ctx.managers.structure.selection




  // window.molstar?.managers.structure.selection.fromSelectionQuery('add',StructureSelectionQuery('struct', query));
}

const applyStyle = (ctx: PluginUIContext) => {

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
          const seq_id = StructureProperties.residue.label_seq_id(l);
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