"use client"

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
import { Mat4 } from "molstar/lib/mol-math/linear-algebra/3d/mat4";
import { Loci } from 'molstar/lib/mol-model/loci';
import { StateSelection } from 'molstar/lib/mol-state';
import { createStructureRepresentationParams } from 'molstar/lib/mol-plugin-state/helpers/structure-representation-params';
import { StructureComponent } from 'molstar/lib/mol-plugin-state/transforms/model';
import { StructureRepresentation3D } from 'molstar/lib/mol-plugin-state/transforms/representation';
import { PluginCommands } from 'molstar/lib/mol-plugin/commands';
import { createPluginUI } from "molstar/lib/mol-plugin-ui";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import { DefaultPluginUISpec, PluginUISpec } from "molstar/lib/mol-plugin-ui/spec";
import { useEffect, createRef, createContext, Ref, forwardRef, RefObject } from "react";
import { renderReact18 } from "molstar/lib/mol-plugin-ui/react18";
import './mstar.css'
import "molstar/lib/mol-plugin-ui/skin/light.scss";
import { PluginConfig, PluginConfigItem } from 'molstar/lib/mol-plugin/config';
import { StructureComponentControls } from 'molstar/lib/mol-plugin-ui/structure/components';
import { StructureSourceControls } from 'molstar/lib/mol-plugin-ui/structure/source';
import { StructureQuickStylesControls } from 'molstar/lib/mol-plugin-ui/structure/quick-styles';
import { VolumeStreamingControls, VolumeSourceControls } from 'molstar/lib/mol-plugin-ui/structure/volume'
import { PluginUIComponent } from 'molstar/lib/mol-plugin-ui/base';
import { BuildSvg, Icon } from 'molstar/lib/mol-plugin-ui/controls/icons';
import { PluginBehaviors } from 'molstar/lib/mol-plugin/behavior'
import React from "react";
import { PluginSpec } from "molstar/lib/mol-plugin/spec";
import { PluginLayoutControlsDisplay } from "molstar/lib/mol-plugin/layout";
import { ObjectKeys } from "molstar/lib/mol-util/type-helpers";
import { StateTransforms } from "molstar/lib/mol-plugin-state/transforms";
import { AssignColorVolume } from "molstar/lib/mol-plugin-state/actions/volume";
import { BoxifyVolumeStreaming, CreateVolumeStreamingBehavior, InitVolumeStreaming } from "molstar/lib/mol-plugin/behavior/dynamic/volume-streaming/transformers";
import { StateActions } from 'molstar/lib/mol-plugin-state/actions'

import { MySpec } from "./lib";
import { addListener } from "@reduxjs/toolkit";
import { useAppDispatch } from "@/store/store";
import { molstarSlice } from "@/store/slices/molstar_state";
import _ from "lodash";
import { StateElements } from './functions';

_.memoize.Cache = WeakMap;


// TODO : 
//! - It's a class component tthat initiates into a given div element
//! - mapstate and mapdispatch listens to redux state


declare global {
  interface Window {
    molstar?: PluginUIContext;
  }
}


export class MolstarRibxz {

  plugin: PluginUIContext;
  constructor() { }

  async init(parent: HTMLElement) {
    this.plugin = await createPluginUI({
      target: parent,
      spec: MySpec,
      render: renderReact18
    });

  }


  select_chain = (auth_asym_id: string) => {

    const data = this.plugin.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
    if (!data) return;
    const sel = Script.getStructureSelection(
      Q => Q.struct.generator.atomGroups({
        'chain-test': Q.core.rel.eq([Q.struct.atomProperty.macromolecular.auth_asym_id(), auth_asym_id]),
      }), data);

    let loci = StructureSelection.toLociWithSourceUnits(sel);
    this.plugin.managers.structure.selection.clear();
    this.plugin.managers.structure.selection.fromLoci('add', loci);
    this.plugin.managers.camera.focusLoci(loci);
  }

  removeHighlight = () => {
    this.plugin.managers.interactivity.lociHighlights.clearHighlights();
  }

  _highlightChain = (auth_asym_id: string) => {
    const data = this.plugin.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;

    if (!data) {
      console.log("no data");
      return;
    } else {
      console.log("data found");
    }

    const sel = Script.getStructureSelection(Q => Q.struct.generator.atomGroups({
      'chain-test': Q.core.rel.eq([Q.struct.atomProperty.macromolecular.auth_asym_id(), auth_asym_id]),
    }), data);
    let loci = StructureSelection.toLociWithSourceUnits(sel);
    this.plugin.managers.interactivity.lociHighlights.highlight({ loci });
  }

  highlightChain = _.memoize(_highlightChain =>
    _.debounce((auth_asym_id) => {
      _highlightChain(auth_asym_id)
    }, 50, { "leading": true, "trailing": true })
  )(this._highlightChain);



  async download_struct(rcsb_id: string): Promise<MolstarRibxz> {
    const data = await this.plugin.builders.data.download({ url: `https://files.rcsb.org/download/${rcsb_id.toUpperCase()}.cif` }, { state: { isGhost: true } });
    const trajectory = await this.plugin.builders.structure.parseTrajectory(data, "mmcif");
    await this.plugin.builders.structure.hierarchy.applyPreset(trajectory, "default");
    return this
    // return null
  }

 create_ligand_surroundings( chemicalId: string) {
  return this.plugin.dataTransaction(async () => {
    const RADIUS = 5

    let structures = this.plugin.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({ structureRef, number: i + 1 }));
    const struct = structures[0];
    const update =this.plugin.build();


    const core = MS.struct.filter.first([
      MS.struct.generator.atomGroups({
        'residue-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.label_comp_id(), chemicalId]),
        'group-by': MS.core.str.concat([MS.struct.atomProperty.core.operatorName(), MS.struct.atomProperty.macromolecular.residueKey()])
      })
    ]);

    const surr_sel = MS.struct.modifier.includeSurroundings({ 0: core, radius: RADIUS, 'as-whole-residues': true });


    const group = update.to(struct.structureRef.cell).group(StateTransforms.Misc.CreateGroup, { label: 'group' }, { ref: StateElements.HetGroupFocusGroup });
    const coreSel = group.apply(StateTransforms.Model.StructureSelectionFromExpression, { label: `${chemicalId} Neighborhood (${RADIUS} Å)`, expression: surr_sel }, { ref: StateElements.HetGroupFocus });

    coreSel.apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(this.plugin, struct.structureRef.cell.obj?.data, { type: 'ball-and-stick' }));
    coreSel.apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(this.plugin, struct.structureRef.cell.obj?.data, { type: 'label', typeParams: { level: 'residue' } }));

    await PluginCommands.State.Update(this.plugin, { state: this.plugin.state.data, tree: update });

    const compiled = compile<StructureSelection>(surr_sel);
    const selection = compiled(new QueryContext(struct.structureRef.cell.obj?.data!));
    let loci = StructureSelection.toLociWithSourceUnits(selection);
    this.plugin.managers.structure.selection.clear();
    this.plugin.managers.structure.selection.fromLoci('add', loci);
    this.plugin.managers.camera.focusLoci(loci);
  })
}
 create_ligand( chemicalId: string) {
  return this.plugin.dataTransaction(async () => {
    console.log("create ligand");
    console.log("got chemid ", chemicalId);



    let structures = this.plugin.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({ structureRef, number: i + 1 }));
    const struct = structures[0];
    const update = this.plugin.build();

    const core = MS.struct.filter.first([
      MS.struct.generator.atomGroups({
        'residue-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.label_comp_id(), chemicalId]),
        'group-by': MS.core.str.concat([MS.struct.atomProperty.core.operatorName(), MS.struct.atomProperty.macromolecular.residueKey()])
      })
    ]);

    const group = update.to(struct.structureRef.cell).group(StateTransforms.Misc.CreateGroup, { label: 'ligand_group' }, { ref: StateElements.HetGroupFocusGroup });
    const coreSel = group.apply(StateTransforms.Model.StructureSelectionFromExpression, { label: chemicalId, expression: core }, { ref: StateElements.HetGroupFocus });

    coreSel.apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(this.plugin, struct.structureRef.cell.obj?.data, { type: 'ball-and-stick' }));
    coreSel.apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(this.plugin, struct.structureRef.cell.obj?.data, { type: 'label', typeParams: { level: 'residue' } }));

    await PluginCommands.State.Update(this.plugin, { state: this.plugin.state.data, tree: update });

    const compiled = compile<StructureSelection>(core);
    const selection = compiled(new QueryContext(struct.structureRef.cell.obj?.data!));
    let loci = StructureSelection.toLociWithSourceUnits(selection);
    this.plugin.managers.structure.selection.clear();
    this.plugin.managers.structure.selection.fromLoci('add', loci);
    this.plugin.managers.camera.focusLoci(loci);


  });
}


}