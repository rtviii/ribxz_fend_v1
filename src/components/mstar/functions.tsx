'use client'
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
  Model      = 'model',
  ModelProps = 'model-props',
  Assembly   = 'assembly',

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




export function structure_sel(ctx: PluginContext, assemblyId: string) {
  const state = ctx.state.data;
  const model = state.build().to(StateElements.Model);
  const props = {
    type: assemblyId ? {
      name: 'assembly' as const,
      params: { id: assemblyId }
    } : {
      name: 'model' as const,
      params: {}
    }
  };

  const s = model
    .apply(StateTransforms.Model.StructureFromModel, props, { ref: StateElements.Assembly });

  s.apply(StateTransforms.Model.StructureComplexElement, { type: 'atomic-sequence' }, { ref: StateElements.Sequence });
  s.apply(StateTransforms.Model.StructureComplexElement, { type: 'atomic-het' }, { ref: StateElements.Het });
  s.apply(StateTransforms.Model.StructureComplexElement, { type: 'water' }, { ref: StateElements.Water });

  console.log("sturcture");
  console.log(s);

  return s;
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

export async function apply_style() {
  var mst = window.molstar!;
  var builder = mst.build()
  builder.toRoot()
}

export const transform = (ctx: PluginContext) => {

  const structureData = ctx.managers.structure.hierarchy.current.structures[0]
  const cell = structureData.cell
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


export const select_current_struct = (ctx: PluginUIContext) => {


  const structureData      = ctx.managers.structure.hierarchy.current.structures[0]
  var   components         = structureData.components
  const cell_transform_ref = structureData.cell.transform.ref
  const state_data         = ctx.state.data.select(cell_transform_ref)[0].obj as PluginStateObject.Molecule.Structure

  ctx.managers.structure.selection
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