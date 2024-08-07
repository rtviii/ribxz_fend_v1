'use client'
import { MolScriptBuilder as MS, MolScriptBuilder } from 'molstar/lib/mol-script/language/builder';
import { Queries, StructureQuery, StructureSelection } from "molstar/lib/mol-model/structure";
import { Structure, StructureElement, StructureProperties } from 'molstar/lib/mol-model/structure/structure'
import { StructureSelectionQueries, StructureSelectionQuery } from 'molstar/lib/mol-plugin-state/helpers/structure-selection-query'
import { compileIdListSelection } from 'molstar/lib/mol-script/util/id-list'
import { log } from 'console';
import { Asset } from 'molstar/lib/mol-util/assets';
import { InteractivityManager } from 'molstar/lib/mol-plugin-state/manager/interactivity';
import { StateObjectRef } from 'molstar/lib/mol-state/object';
import { compile } from "molstar/lib/mol-script/runtime/query/compiler";
import { superpose } from 'molstar/lib/mol-model/structure/structure/util/superposition'
import { QueryContext } from "molstar/lib/mol-model/structure/query/context";
import { Expression } from "molstar/lib/mol-script/language/expression";
import { PluginStateObject as PSO } from "molstar/lib/mol-plugin-state/objects";
import { Mat4 } from "molstar/lib/mol-math/linear-algebra/3d/mat4";
import { createStructureRepresentationParams } from 'molstar/lib/mol-plugin-state/helpers/structure-representation-params';
import { PluginCommands } from 'molstar/lib/mol-plugin/commands';
import { createPluginUI } from "molstar/lib/mol-plugin-ui";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import { renderReact18 } from "molstar/lib/mol-plugin-ui/react18";
import './mstar.css'
import "molstar/lib/mol-plugin-ui/skin/light.scss";
import { StateTransforms } from "molstar/lib/mol-plugin-state/transforms";
import { MySpec } from "./lib";
import _ from "lodash";
import { StateElements } from './functions';
import { Script } from 'molstar/lib/mol-script/script';
import { PresetStructureRepresentations } from 'molstar/lib/mol-plugin-state/builder/structure/representation-preset';
import { Color } from 'molstar/lib/mol-util/color/color';
import { QuickStyles } from 'molstar/lib/mol-plugin-ui/structure/quick-styles';
import { components } from 'react-select';
import { Loci } from 'molstar/lib/mol-model/structure/structure/element/element';
import { setSubtreeVisibility } from 'molstar/lib/mol-plugin/behavior/static/state';
import { ArbitrarySphereRepresentationProvider } from './sphere_drawing';
const { parsed: { DJANGO_URL }, } = require("dotenv").config({ path: "./../../../.env.local" });

_.memoize.Cache = WeakMap;


declare global {
  interface Window {
    // molstar?: PluginUIContext;
    // molstar_secondary?: PluginUIContext;
  }
}

export type Residue = {
  label_seq_id  : number,
  label_comp_id : string,
  auth_seq_id: number,
  auth_asym_id  : string,
  rcsb_id       : string,
  polymer_class?: string,
}

export type ResidueList = Residue[]

export class MolstarRibxz {

  //@ts-ignore
  ctx: PluginUIContext;
  constructor() { }

  async init(parent: HTMLElement) {

    this.ctx = await createPluginUI({
      target: parent,
      spec  : MySpec,
      render: renderReact18
    });

  this.ctx.representation.structure.registry.add(ArbitrarySphereRepresentationProvider);

  }


  async addSpheres( structure_ref:string, spheres: Partial<{ x: number, y: number, z: number, radius: number, color: Color}>[]) {
      spheres.map((s) => {
          this.ctx.builders.structure.representation.addRepresentation(
              structure_ref, {
                  type: 'arbitrary-sphere' as any, // Coerce TypeScript into accepting the representation name
                  typeParams: s,
                  colorParams: s.color ? { value:  s.color } : void 0,
              },
          );
      });
  }


  toggleSpin() {
    if (!this.ctx.canvas3d) return this;

    const trackball = this.ctx.canvas3d.props.trackball;

    PluginCommands.Canvas3D.SetSettings(this.ctx, {
      settings: {
        trackball: {
          ...trackball,
          animate: trackball.animate.name === 'spin'
            ? { name: 'off', params: {} }
            : { name: 'spin', params: { speed: 1 } }
        }
      }
    });
    // if (this.ctx.canvas3d.props.trackball.animate.name !== 'spin') {
    //   PluginCommands.Camera.Reset(this.ctx, {});
    // }
    return this
  }


  select_residueCluster = (chain_residue_tuples: {
    auth_asym_id: string,
    auth_seq_id : number,
  }[]) => {

    const expr     = this.selectionResidueClusterExpression(chain_residue_tuples)
    const data:any = this.ctx.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
    const sel      = Script.getStructureSelection(expr, data);
    let   loci     = StructureSelection.toLociWithSourceUnits(sel);
    this.ctx.managers.structure.selection.clear();
    this.ctx.managers.structure.selection.fromLoci('add', loci);
    this.ctx.managers.camera.focusLoci(loci);

  }

  select_chain = (auth_asym_id: string) => {
    const data = this.ctx.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
    if (!data) return;
    const sel = Script.getStructureSelection(
      Q => Q.struct.generator.atomGroups({
        'chain-test': Q.core.rel.eq([Q.struct.atomProperty.macromolecular.auth_asym_id(), auth_asym_id]),
      }), data);

    let loci = StructureSelection.toLociWithSourceUnits(sel);
    this.ctx.managers.structure.selection.clear();
    this.ctx.managers.structure.selection.fromLoci('add', loci);
    this.ctx.managers.camera.focusLoci(loci);
  }

  removeHighlight = () => {
    this.ctx.managers.interactivity.lociHighlights.clearHighlights();
  }

  _highlightChain = (auth_asym_id: string) => {
    const data:any = this.ctx.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
    if (data ===undefined){
      return
    }
    const sel = Script.getStructureSelection(Q => Q.struct.generator.atomGroups({ 'chain-test': Q.core.rel.eq([Q.struct.atomProperty.macromolecular.auth_asym_id(), auth_asym_id]), }), data);
    let loci = StructureSelection.toLociWithSourceUnits(sel);
    this.ctx.managers.interactivity.lociHighlights.highlight({ loci });
  }

  highlightChain = _.memoize(_highlightChain =>
    _.debounce((auth_asym_id) => {
      _highlightChain(auth_asym_id)
    }, 50, { "leading": true, "trailing": true })
  )(this._highlightChain);


  selectionResidueClusterExpression = (chain_residues_tuples_tuples: {
    auth_asym_id: string,
    auth_seq_id: number,
  }[]): Expression => {
    const groups: Expression[] = [];
    for (var chain_residue_tuple of chain_residues_tuples_tuples) {
      groups.push(MS.struct.generator.atomGroups({
        "chain-test": MS.core.rel.eq([MolScriptBuilder.struct.atomProperty.macromolecular.auth_asym_id(), chain_residue_tuple.auth_asym_id]),
        "residue-test": MS.core.rel.eq([MolScriptBuilder.struct.atomProperty.macromolecular.auth_seq_id(), chain_residue_tuple.auth_seq_id]),
      }));
    }
    var expression = MS.struct.combinator.merge(groups);
    return expression
  }


  _highlightResidueCluster = (chain_residues_tuples: {
    auth_asym_id: string,
    auth_seq_id: number,
  }[]) => {
    const data = this.ctx.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
    if (data === undefined) return;
    const expr = this.selectionResidueClusterExpression(chain_residues_tuples)
    const sel  = Script.getStructureSelection(expr, data);
    let   loci = StructureSelection.toLociWithSourceUnits(sel);

    this.ctx.managers.interactivity.lociHighlights.highlight({ loci });
  }

  highlightResidueCluster = _.memoize(_highlightResidueCluster =>
    _.debounce((chain_residues_tuples: {
      auth_asym_id: string,
      auth_seq_id: number,
    }[]) => {
      _highlightResidueCluster(chain_residues_tuples)
    }, 50, { "leading": true, "trailing": true })
  )(this._highlightResidueCluster);








  private async siteVisual(s: StateObjectRef<PSO.Molecule.Structure>, pivot: Expression,) {
    const center = await this.ctx.builders.structure.tryCreateComponentFromExpression(s, pivot, 'pivot');
    if (center) await this.ctx.builders.structure.representation.addRepresentation(center, { type: 'ball-and-stick', color: 'residue-name' });

    // const surr = await plugin.builders.structure.tryCreateComponentFromExpression(s, rest, 'rest');
    // if (surr) await plugin.builders.structure.representation.addRepresentation(surr, { type: 'ball-and-stick', color: 'uniform', size: 'uniform', sizeParams: { value: 0.33 } });
  }

  private transform(s: StateObjectRef<PSO.Molecule.Structure>, matrix: Mat4) {
    const b = this.ctx.state.data.build().to(s).insert(StateTransforms.Model.TransformStructureConformation, { transform: { name: 'matrix', params: { data: matrix, transpose: false } } });
    return this.ctx.runTask(this.ctx.state.data.updateTree(b));
  }

  dynamicSuperimpose(pivot_auth_asym_id: string) {
    return this.ctx.dataTransaction(async () => {




      const pivot = MS.struct.filter.first([
        MS.struct.generator.atomGroups({
          'chain-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_asym_id(), pivot_auth_asym_id]),
          'group-by': MS.struct.atomProperty.macromolecular.residueKey()
        })
      ]);

      const query = compile<StructureSelection>(pivot);
      const structureRefs = this.ctx.managers.structure.hierarchy.current.structures;
      const selections = structureRefs.map(s => StructureSelection.toLociWithCurrentUnits(query(new QueryContext(s.cell.obj!.data))));
      const transforms = superpose(selections);
      console.log({ ...transforms });

      await this.siteVisual(structureRefs[0].cell, pivot)

      for (let i = 1; i < selections.length; i++) {
        await this.transform(structureRefs[i].cell, transforms[i - 1].bTransform);
        await this.siteVisual(structureRefs[i].cell, pivot)
      }
    });
  }

  async load_mmcif_chain({ rcsb_id, auth_asym_id }: { rcsb_id: string, auth_asym_id: string }) {
    const myUrl = `${DJANGO_URL}/mmcif/polymer?rcsb_id=${rcsb_id}&auth_asym_id=${auth_asym_id}`
    const data = await this.ctx.builders.data.download({ url: Asset.Url(myUrl.toString()), isBinary: false }, { state: { isGhost: true } });

    const trajectory = await this.ctx.builders.structure.parseTrajectory(data, 'mmcif');
    await this.ctx.builders.structure.hierarchy.applyPreset(trajectory, 'default');
  }


  select_multiple_residues(chain_residues_tuples: [string, number[]][]) {

    const groups: Expression[] = [];
    for (var chain_residue_tuple of chain_residues_tuples) {
      for (var res_index of chain_residue_tuple[1]) {
        groups.push(MS.struct.generator.atomGroups({
          "chain-test": MS.core.rel.eq([MolScriptBuilder.struct.atomProperty.macromolecular.auth_asym_id(), chain_residue_tuple[0]]),
          "residue-test": MS.core.rel.eq([MolScriptBuilder.struct.atomProperty.macromolecular.label_seq_id(), res_index]),
        }));
      }
    }
    this.ctx.managers.structure.selection.fromSelectionQuery('set', StructureSelectionQuery('multiple', MS.struct.combinator.merge(groups)))
    var   expression = MS.struct.combinator.merge(groups);
    const data       = this.ctx.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;

    if (data===undefined) return;

    const sel  = Script.getStructureSelection(expression, data);
    let   loci = StructureSelection.toLociWithSourceUnits(sel);

    this.ctx.managers.structure.selection.clear();
    this.ctx.managers.structure.selection.fromLoci('add', loci);
    this.ctx.managers.camera.focusLoci(loci);
  }

  async toggle_visibility_by_ref(representation: any, on_off: boolean) {
    // "representation" is saved on structure creation: const st = await this.ctx.builders.structure.hierarchy.applyPreset(trajectory, "default");
    if (representation['components'] === undefined) { return }
    setSubtreeVisibility(this.ctx.state.data, representation['components']['polymer']['ref'], on_off)
  }

  async download_struct(rcsb_id: string, clear?: boolean): Promise<{ ctx: MolstarRibxz, struct_representation: any }> {

    if (clear) {
      await this.ctx.clear()
    }

    const data       = await this.ctx.builders.data.download({ url: `https://files.rcsb.org/download/${rcsb_id.toUpperCase()}.cif` }, { state: { isGhost: true } });
    const trajectory = await this.ctx.builders.structure.parseTrajectory(data, "mmcif");
    const st         = await this.ctx.builders.structure.hierarchy.applyPreset(trajectory, "default");

    st?.structure.ref
    st?.model.ref

    this.ctx.managers.structure.component.setOptions({ ...this.ctx.managers.structure.component.state.options, ignoreLight: true });
    if (this.ctx.canvas3d) {
      const pp = this.ctx.canvas3d.props.postprocessing;
      this.ctx.canvas3d.setProps({
        postprocessing: {
          outline: {
            name: 'on',
            params: pp.outline.name === 'on'
              ? pp.outline.params
              : { scale: 1, color: Color(0x000000), threshold: 0.33 }
          },
          occlusion: {
            name: 'on',
            params: pp.occlusion.name === 'on'
              ? pp.occlusion.params
              : { bias: 0.8, blurKernelSize: 15, radius: 5, samples: 32, resolutionScale: 1 }
          },
        }
      });
    }

    return { ctx: this, struct_representation: st?.representation }
  }

  async select_focus_ligand(chemicalId: string | undefined, focus_select: Array<'focus' | 'select' | 'highlight'>) {
    let structures = this.ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({ structureRef, number: i + 1 }));
    const struct = structures[0];
    if (chemicalId === undefined || !struct) {
      return
    }
    const ligand_sel = MS.struct.filter.first([
      MS.struct.generator.atomGroups({
        'residue-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.label_comp_id(), chemicalId]),
        'group-by': MS.core.str.concat([MS.struct.atomProperty.core.operatorName(), MS.struct.atomProperty.macromolecular.residueKey()])
      })
    ]);
    const compiled = compile<StructureSelection>(ligand_sel);
    const ligand_selection = compiled(new QueryContext(struct.structureRef.cell.obj?.data!));
    let loci = StructureSelection.toLociWithSourceUnits(ligand_selection);

    if (focus_select.includes('focus')) {
      this.ctx.managers.camera.focusLoci(loci);
    }
    if (focus_select.includes('select')) {
      this.ctx.managers.structure.selection.clear();
      this.ctx.managers.structure.selection.fromLoci('add', loci);
    }
    if (focus_select.includes('highlight')) {
      this.ctx.managers.interactivity.lociHighlights.highlight({ loci });
    }
    // this.ctx.managers.structure.selection.fromLoci('add', loci);
    // this.ctx.managers.camera.focusLoci(loci);
    // this.ctx.managers.interactivity.lociHighlights.highlight({ loci });


  }

  async get_selection_constituents(chemicalId: string | undefined, radius:number): Promise<ResidueList> {
    if (!chemicalId) {
      return []
    }

    const RADIUS = radius

    let structures = this.ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({ structureRef, number: i + 1 }));
    const struct = structures[0];
    const update = this.ctx.build();

    const ligand = MS.struct.filter.first([
      MS.struct.generator.atomGroups({
        'residue-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.label_comp_id(), chemicalId]),
        'group-by': MS.core.str.concat([MS.struct.atomProperty.core.operatorName(), MS.struct.atomProperty.macromolecular.residueKey()])
      })
    ]);

    const surroundings = MS.struct.modifier.includeSurroundings({ 0: ligand, radius: RADIUS, 'as-whole-residues': true });
    const surroundingsWithoutLigand = MS.struct.modifier.exceptBy({ 0: surroundings, by: ligand });

    const group = update.to(struct.structureRef.cell).group(StateTransforms.Misc.CreateGroup, { label: `${chemicalId} Surroundins Group` }, { ref: 'surroundings' });
    const surroundingsSel = group.apply(StateTransforms.Model.StructureSelectionFromExpression, { label: `${chemicalId} Surroundings (${RADIUS} Å)`, expression: surroundingsWithoutLigand }, { ref: 'surroundingsSel' });

    surroundingsSel.apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, { type: 'ball-and-stick' }), { ref: 'surroundingsBallAndStick' });
    surroundingsSel.apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, { type: 'label', typeParams: { level: 'residue' } }), { ref: 'surroundingsLabels' });

    await PluginCommands.State.Update(this.ctx, { state: this.ctx.state.data, tree: update });

    const compiled2 = compile<StructureSelection>(surroundingsWithoutLigand);
    const selection2 = compiled2(new QueryContext(struct.structureRef.cell.obj?.data!));
    const loci = StructureSelection.toLociWithSourceUnits(selection2);

    const residueList: ResidueList = [];

    const struct_Element = StructureElement.Loci.toStructure(loci)
    Structure.eachAtomicHierarchyElement(struct_Element, {
      residue: (loc) => {
        residueList.push({
          label_seq_id : StructureProperties.residue.label_seq_id(loc),
          auth_seq_id  : StructureProperties.residue.auth_seq_id(loc),

          label_comp_id: StructureProperties.atom.label_comp_id(loc),
          auth_asym_id : StructureProperties.chain.auth_asym_id(loc),
          rcsb_id      : StructureProperties.unit.model_entry_id(loc),
        });
      },
    });
    return residueList
  }

  async create_ligand_and_surroundings(chemicalId: string | undefined, radius:number) {
    if (!chemicalId) {
      return this
    }
    await this.ctx.dataTransaction(async () => {
      const RADIUS = radius

      let structures = this.ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({ structureRef, number: i + 1 }));
      const struct = structures[0];
      const update = this.ctx.build();

      const ligand = MS.struct.filter.first([
        MS.struct.generator.atomGroups({
          'residue-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.label_comp_id(), chemicalId]),
          'group-by': MS.core.str.concat([MS.struct.atomProperty.core.operatorName(), MS.struct.atomProperty.macromolecular.residueKey()])
        })
      ]);
      const surroundings              = MS.struct.modifier.includeSurroundings({ 0: ligand, radius: radius, 'as-whole-residues': true });
      const surroundingsWithoutLigand = MS.struct.modifier.exceptBy({ 0: surroundings, by: ligand });

      // Create a group for both ligand and surroundings
      const group1 = update.to(struct.structureRef.cell).group(StateTransforms.Misc.CreateGroup, { label: `${chemicalId} Ligand Group` }, { ref: 'ligand' });

      // Create ligand selection and representations
      const ligandSel = group1.apply(StateTransforms.Model.StructureSelectionFromExpression, { label: `${chemicalId} Ligand`, expression: ligand }, { ref: 'ligandSel' });
      ligandSel.apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, { type: 'ball-and-stick' }), { ref: 'ligandBallAndStick' });
      ligandSel.apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, { type: 'label', typeParams: { level: 'residue' } }), { ref: 'ligandLabel' });

      await PluginCommands.State.Update(this.ctx, { state: this.ctx.state.data, tree: update });

      const update2 = this.ctx.build();
      const group2 = update2.to(struct.structureRef.cell).group(StateTransforms.Misc.CreateGroup, { label: `${chemicalId} Surroundins Group` }, { ref: 'surroundings' });
      // Create surroundings selection and representations
      const surroundingsSel = group2.apply(StateTransforms.Model.StructureSelectionFromExpression, { label: `${chemicalId} Surroundings (${RADIUS} Å)`, expression: surroundingsWithoutLigand }, { ref: 'surroundingsSel' });
      surroundingsSel.apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, { type: 'ball-and-stick' }), { ref: 'surroundingsBallAndStick' });
      // surroundingsSel.apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, { type: 'label', typeParams: { level: 'residue' } }), { ref: 'surroundingsLabels' });
      await PluginCommands.State.Update(this.ctx, { state: this.ctx.state.data, tree: update2 });

      const ligand_selection = compile<StructureSelection>(ligand)(new QueryContext(struct.structureRef.cell.obj?.data!));
      let loci = StructureSelection.toLociWithSourceUnits(ligand_selection);
      this.ctx.managers.structure.selection.fromLoci('add', loci);
      this.ctx.managers.camera.focusLoci(loci);
    })
    return this
  }

  async select_focus_ligand_surroundings(chemicalId: string | undefined,radius:number, focus_select: Array<'focus' | 'select' | 'highlight'>) {
    const RADIUS = radius
    let structures = this.ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({ structureRef, number: i + 1 }));
    const struct = structures[0];
    if (!chemicalId || !struct) {
      return this
    }

    const ligand = MS.struct.filter.first([
      MS.struct.generator.atomGroups({
        'residue-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.label_comp_id(), chemicalId]),
        'group-by': MS.core.str.concat([MS.struct.atomProperty.core.operatorName(), MS.struct.atomProperty.macromolecular.residueKey()])
      })
    ]);
    const surroundings = MS.struct.modifier.includeSurroundings({ 0: ligand, radius: RADIUS, 'as-whole-residues': true });
    const surroundingsWithoutLigand = MS.struct.modifier.exceptBy({ 0: surroundings, by: ligand });

    const surr_selection = compile<StructureSelection>(surroundingsWithoutLigand)(new QueryContext(struct.structureRef.cell.obj?.data!));
    let loci = StructureSelection.toLociWithSourceUnits(surr_selection);

    if (focus_select.includes('focus')) {
      this.ctx.managers.camera.focusLoci(loci);
    }
    if (focus_select.includes('select')) {
      this.ctx.managers.structure.selection.clear();
      this.ctx.managers.structure.selection.fromLoci('add', loci);
    }
    if (focus_select.includes('highlight')) {
      this.ctx.managers.interactivity.lociHighlights.highlight({ loci });
    }

  }



  async create_ligand(chemicalId: string) {
    await this.ctx.dataTransaction(async () => {

      let structures = this.ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({ structureRef, number: i + 1 }));
      const struct = structures[0];
      const update = this.ctx.build();

      const ligand = MS.struct.filter.first([
        MS.struct.generator.atomGroups({
          'residue-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.label_comp_id(), chemicalId]),
          'group-by': MS.core.str.concat([MS.struct.atomProperty.core.operatorName(), MS.struct.atomProperty.macromolecular.residueKey()])
        })
      ]);


      const group = update.to(struct.structureRef.cell).group(StateTransforms.Misc.CreateGroup, { label: 'ligand_group' }, { ref: `ligand_${chemicalId}` });
      const coreSel = group.apply(StateTransforms.Model.StructureSelectionFromExpression,
        { label: chemicalId, expression: ligand },
        { ref: StateElements.HetGroupFocus });

      coreSel.apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, { type: 'ball-and-stick' }));
      coreSel.apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, { type: 'label', typeParams: { level: 'residue' } }));

      await PluginCommands.State.Update(this.ctx, { state: this.ctx.state.data, tree: update });

      // const compiled = ;
      const selection = compile<StructureSelection>(ligand)(new QueryContext(struct.structureRef.cell.obj?.data!));
      let loci = StructureSelection.toLociWithSourceUnits(selection);

      this.ctx.managers.structure.selection.clear();
      this.ctx.managers.structure.selection.fromLoci('add', loci);
      this.ctx.managers.camera.focusLoci(loci);
    });

    return this
  }
}

// (window as any).MolstarRibxz = new MolstarRibxz();