"use client"
import { MolScriptBuilder as MS, MolScriptBuilder } from 'molstar/lib/mol-script/language/builder';
import { DefaultPluginUISpec, PluginUISpec } from "molstar/lib/mol-plugin-ui/spec";
import './mstar.css'
import "molstar/lib/mol-plugin-ui/skin/light.scss";
import { PluginConfig } from 'molstar/lib/mol-plugin/config';
import { StructureComponentControls } from 'molstar/lib/mol-plugin-ui/structure/components';
import { StructureSourceControls } from 'molstar/lib/mol-plugin-ui/structure/source';
import { StructureQuickStylesControls } from 'molstar/lib/mol-plugin-ui/structure/quick-styles';
import { VolumeStreamingControls, VolumeSourceControls } from 'molstar/lib/mol-plugin-ui/structure/volume'
import { PluginUIComponent } from 'molstar/lib/mol-plugin-ui/base';
import { BuildSvg, Icon } from 'molstar/lib/mol-plugin-ui/controls/icons';
import { PluginBehaviors } from 'molstar/lib/mol-plugin/behavior'
import React, { forwardRef } from "react";
import { PluginSpec } from "molstar/lib/mol-plugin/spec";
import { StateTransforms } from "molstar/lib/mol-plugin-state/transforms";
import { BoxifyVolumeStreaming, CreateVolumeStreamingBehavior, InitVolumeStreaming } from "molstar/lib/mol-plugin/behavior/dynamic/volume-streaming/transformers";
import { StateActions } from 'molstar/lib/mol-plugin-state/actions'
import { BuiltInTrajectoryFormat } from "molstar/lib/mol-plugin-state/formats/trajectory";
import {StructureSelectionQuery} from "molstar/lib/mol-plugin-state/helpers/structure-selection-query";
import { StructureProperties } from "molstar/lib/mol-model/structure/structure/properties";
import { Queries } from "molstar/lib/mol-model/structure/query";
import { createPluginUI } from "molstar/lib/mol-plugin-ui";
import { renderReact18 } from "molstar/lib/mol-plugin-ui/react18";
import { Expression } from 'molstar/lib/mol-script/language/expression';
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import { createStructureRepresentationParams } from 'molstar/lib/mol-plugin-state/helpers/structure-representation-params';
import { Asset } from 'molstar/lib/mol-util/assets';

export class CustomStructureTools extends PluginUIComponent {
  render() {
    return <>
      <div className='msp-section-header'>
        <Icon svg={BuildSvg} /> Structure Tools</div>
      <StructureSourceControls />
      <StructureComponentControls />
      <VolumeStreamingControls />
      <VolumeSourceControls />
      <StructureQuickStylesControls />
    </>;
  }
}
export const __MyOldSpec: PluginUISpec = {
  ...DefaultPluginUISpec(),

  behaviors: [
    PluginSpec.Behavior(PluginBehaviors.Representation.HighlightLoci, { mark: true }),
    PluginSpec.Behavior(PluginBehaviors.Representation.DefaultLociLabelProvider),
    PluginSpec.Behavior(PluginBehaviors.Camera.FocusLoci),
    PluginSpec.Behavior(PluginBehaviors.Representation.FocusLoci),
    // PluginSpec.Behavior(PluginBehaviors.CustomProps.Interactions),
    PluginSpec.Behavior(PluginBehaviors.Representation.HighlightLoci),
    PluginSpec.Behavior(PluginBehaviors.Representation.SelectLoci),
    PluginSpec.Behavior(PluginBehaviors.Representation.FocusLoci),
    PluginSpec.Behavior(PluginBehaviors.Camera.FocusLoci),
    PluginSpec.Behavior(PluginBehaviors.Camera.CameraAxisHelper),

    PluginSpec.Behavior(PluginBehaviors.CustomProps.StructureInfo),
    // PluginSpec.Behavior(PluginBehaviors.CustomProps.AccessibleSurfaceArea),
    PluginSpec.Behavior(PluginBehaviors.CustomProps.Interactions),
    PluginSpec.Behavior(PluginBehaviors.CustomProps.SecondaryStructure),
    PluginSpec.Behavior(PluginBehaviors.CustomProps.ValenceModel),
    PluginSpec.Behavior(PluginBehaviors.CustomProps.CrossLinkRestraint),

  ],
  config: [
    [PluginConfig.VolumeStreaming.Enabled, true],
    [PluginConfig.Viewport.ShowSelectionMode, true],
    [PluginConfig.Viewport.ShowSettings, true],
    [PluginConfig.Viewport.ShowAnimation, true],
    [PluginConfig.Viewport.ShowTrajectoryControls, true],

  ],
  actions: [
    PluginSpec.Action(StateActions.Structure.DownloadStructure),
    PluginSpec.Action(StateActions.Volume.DownloadDensity),
    PluginSpec.Action(StateActions.DataFormat.DownloadFile),
    PluginSpec.Action(StateActions.DataFormat.OpenFiles),
    PluginSpec.Action(StateActions.Structure.LoadTrajectory),
    PluginSpec.Action(StateActions.Structure.EnableModelCustomProps),
    PluginSpec.Action(StateActions.Structure.EnableStructureCustomProps),

    // Volume streaming
    PluginSpec.Action(InitVolumeStreaming),
    PluginSpec.Action(BoxifyVolumeStreaming),
    PluginSpec.Action(CreateVolumeStreamingBehavior),

    PluginSpec.Action(StateTransforms.Data.Download),
    PluginSpec.Action(StateTransforms.Data.ParseCif),
    PluginSpec.Action(StateTransforms.Data.ParseCcp4),
    PluginSpec.Action(StateTransforms.Data.ParseDsn6),

    PluginSpec.Action(StateTransforms.Model.TrajectoryFromMmCif),
    PluginSpec.Action(StateTransforms.Model.TrajectoryFromCifCore),
    PluginSpec.Action(StateTransforms.Model.TrajectoryFromPDB),
    PluginSpec.Action(StateTransforms.Model.TransformStructureConformation),
    PluginSpec.Action(StateTransforms.Model.StructureFromModel),
    PluginSpec.Action(StateTransforms.Model.StructureFromTrajectory),
    PluginSpec.Action(StateTransforms.Model.ModelFromTrajectory),
    PluginSpec.Action(StateTransforms.Model.StructureSelectionFromScript),

    PluginSpec.Action(StateTransforms.Representation.StructureRepresentation3D),
    PluginSpec.Action(StateTransforms.Representation.StructureSelectionsDistance3D),
    PluginSpec.Action(StateTransforms.Representation.StructureSelectionsAngle3D),
    PluginSpec.Action(StateTransforms.Representation.StructureSelectionsDihedral3D),
    PluginSpec.Action(StateTransforms.Representation.StructureSelectionsLabel3D),
    PluginSpec.Action(StateTransforms.Representation.StructureSelectionsOrientation3D),
    PluginSpec.Action(StateTransforms.Representation.ModelUnitcell3D),
    PluginSpec.Action(StateTransforms.Representation.StructureBoundingBox3D),
    PluginSpec.Action(StateTransforms.Representation.ExplodeStructureRepresentation3D),
    PluginSpec.Action(StateTransforms.Representation.SpinStructureRepresentation3D),
    PluginSpec.Action(StateTransforms.Representation.UnwindStructureAssemblyRepresentation3D),
    PluginSpec.Action(StateTransforms.Representation.OverpaintStructureRepresentation3DFromScript),
    PluginSpec.Action(StateTransforms.Representation.TransparencyStructureRepresentation3DFromScript),
    PluginSpec.Action(StateTransforms.Representation.ClippingStructureRepresentation3DFromScript),
    PluginSpec.Action(StateTransforms.Representation.SubstanceStructureRepresentation3DFromScript),
    PluginSpec.Action(StateTransforms.Representation.ThemeStrengthRepresentation3D),

    // PluginSpec.Action(AssignColorVolume),
    PluginSpec.Action(StateTransforms.Volume.VolumeFromCcp4),
    PluginSpec.Action(StateTransforms.Volume.VolumeFromDsn6),
    PluginSpec.Action(StateTransforms.Volume.VolumeFromCube),
    PluginSpec.Action(StateTransforms.Volume.VolumeFromDx),
    PluginSpec.Action(StateTransforms.Representation.VolumeRepresentation3D),

  ],
  layout: {
    initial: {
      controlsDisplay: 'portrait',
      showControls: false,
    },


  },

  components: {
    structureTools: CustomStructureTools,
    // TODO: hook up current state to custom sequence viewer
    // sequenceViewer:
    controls:{
        // bottom:'none',
        // left:'none'
        
    },
    remoteState: 'none',

  }


}

const MySpec: PluginUISpec = {
    ...DefaultPluginUISpec(),
    config: [
            [PluginConfig.VolumeStreaming.Enabled, false]
    ]
}


export async function _download_struct({plugin, rcsb_id}:{ plugin: PluginUIContext, rcsb_id:string }):Promise<null> {
      const data       = await plugin.builders.data.download({ url: `https://files.rcsb.org/download/${rcsb_id}.cif` }, { state: { isGhost: true } });
      const trajectory = await plugin.builders.structure.parseTrajectory(data, "mmcif");
            // const model = await ctx.builders.structure.createModel(traj);
            // const structure = await ctx.builders.structure.createStructure(model);
      await plugin.builders.structure.hierarchy.applyPreset(trajectory, "default");
      return null
}

export async function load_mmcif_chain({ rcsb_id, auth_asym_id }: { rcsb_id: string, auth_asym_id: string}) {
  window.molstar?.clear()
  const myUrl = `http://localhost:8000/mmcif_structures/chain?rcsb_id=${rcsb_id}&auth_asym_id=${auth_asym_id}`
  const data = await window.molstar!.builders.data.download({ url: Asset.Url(myUrl.toString()), isBinary: false }, { state: { isGhost: true } });
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

export async function createPlugin({parent_element, initiate_with_structure}:{ parent_element: HTMLElement, initiate_with_structure?: string }):Promise<PluginUIContext> {
    const ctx = await createPluginUI({ target: parent_element, spec  : __MyOldSpec, render: renderReact18 });
    window.molstar = ctx;
    if ( initiate_with_structure !== undefined){
      const data       = await ctx.builders.data.download({ url: `https://files.rcsb.org/download/${initiate_with_structure}.cif` }, { state: { isGhost: true } });
      const trajectory = await ctx.builders.structure.parseTrajectory(data, "mmcif");
      await ctx.builders.structure.hierarchy.applyPreset(trajectory, "default");
    }
    return ctx;
}

export async function on_hover_chain(parent: HTMLElement):Promise<PluginUIContext> {
    const plugin = await createPluginUI({ target: parent, spec  : __MyOldSpec, render: renderReact18 });
    window.molstar = plugin;
    return plugin;
}

export type QueryParam = {

    auth_seq_id                 ?: number,
    entity_id                   ?: string,
    auth_asym_id                ?: string,
    struct_asym_id              ?: string,
    residue_number              ?: number,
    start_residue_number        ?: number,
    end_residue_number          ?: number,
    auth_residue_number         ?: number,
    auth_ins_code_id            ?: string,
    start_auth_residue_number   ?: number,
    start_auth_ins_code_id      ?: string,
    end_auth_residue_number     ?: number,
    end_auth_ins_code_id        ?: string,
    atoms                       ?: string[],
    label_comp_id               ?: string,
    color                       ?: any,
    sideChain                   ?: boolean,
    representation              ?: string,
    representationColor         ?: any,
    focus                       ?: boolean,
    tooltip                     ?: string,
    start                       ?: any,
    end                         ?: any,
    atom_id                     ?: number[],
    uniprot_accession           ?: string,
    uniprot_residue_number      ?: number,
    start_uniprot_residue_number?: number,
    end_uniprot_residue_number  ?: number
}

export namespace QueryHelper {

    export function getQueryObject(params: QueryParam[], contextData: any): Expression.Expression {

        let selections: any = [];
        let siftMappings: any;
        let currentAccession: string;

        params.forEach(param => {
            let selection: any = {};

            // entity
            if (param.entity_id) selection['entityTest'] = (l: any) => StructureProperties.entity.id(l.element) === param.entity_id;

            // chain
            if (param.struct_asym_id) {
                selection['chainTest'] = (l: any) => StructureProperties.chain.label_asym_id(l.element) === param.struct_asym_id;
            } else if (param.auth_asym_id) {
                selection['chainTest'] = (l: any) => StructureProperties.chain.auth_asym_id(l.element) === param.auth_asym_id;
            }

            // residues
            if (param.label_comp_id) {
                selection['residueTest'] = (l: any) => StructureProperties.atom.label_comp_id(l.element) === param.label_comp_id;
            } else if (param.uniprot_accession && param.uniprot_residue_number) {
                selection['residueTest'] = (l: any) => {
                    if (!siftMappings || currentAccession !== param.uniprot_accession) {
                        // siftMappings = SIFTSMapping.Provider.get(contextData.models[0]).value;
                        currentAccession = param.uniprot_accession!;
                    }
                    const rI = StructureProperties.residue.key(l.element);
                    return param.uniprot_accession === siftMappings.accession[rI] && param.uniprot_residue_number === +siftMappings.num[rI];
                }
            } else if (param.uniprot_accession && param.start_uniprot_residue_number && param.end_uniprot_residue_number) {
                selection['residueTest'] = (l: any) => {
                    if (!siftMappings || currentAccession !== param.uniprot_accession) {
                        // siftMappings = SIFTSMapping.Provider.get(contextData.models[0]).value;
                        currentAccession = param.uniprot_accession!;
                    }
                    const rI = StructureProperties.residue.key(l.element);
                    return param.uniprot_accession === siftMappings.accession[rI] && (param.start_uniprot_residue_number! <= +siftMappings.num[rI] && param.end_uniprot_residue_number! >= +siftMappings.num[rI]);
                }
            } else if (param.residue_number) {
                selection['residueTest'] = (l: any) => StructureProperties.residue.label_seq_id(l.element) === param.residue_number;
            } else if ((param.start_residue_number && param.end_residue_number) && (param.end_residue_number > param.start_residue_number)) {
                selection['residueTest'] = (l: any) => {
                    const labelSeqId = StructureProperties.residue.label_seq_id(l.element);
                    return labelSeqId >= param.start_residue_number! && labelSeqId <= param.end_residue_number!;
                };

            } else if ((param.start_residue_number && param.end_residue_number) && (param.end_residue_number === param.start_residue_number)) {
                selection['residueTest'] = (l: any) => StructureProperties.residue.label_seq_id(l.element) === param.start_residue_number;
            } else if (param.auth_seq_id) {
                selection['residueTest'] = (l: any) => StructureProperties.residue.auth_seq_id(l.element) === param.auth_seq_id;
            } else if (param.auth_residue_number && !param.auth_ins_code_id) {
                selection['residueTest'] = (l: any) => StructureProperties.residue.auth_seq_id(l.element) === param.auth_residue_number;
            } else if (param.auth_residue_number && param.auth_ins_code_id) {
                selection['residueTest'] = (l: any) => StructureProperties.residue.auth_seq_id(l.element) === param.auth_residue_number;
            } else if ((param.start_auth_residue_number && param.end_auth_residue_number) && (param.end_auth_residue_number > param.start_auth_residue_number)) {
                selection['residueTest'] = (l: any) => {
                    const authSeqId = StructureProperties.residue.auth_seq_id(l.element);
                    return authSeqId >= param.start_auth_residue_number! && authSeqId <= param.end_auth_residue_number!;
                };
            } else if ((param.start_auth_residue_number && param.end_auth_residue_number) && (param.end_auth_residue_number === param.start_auth_residue_number)) {
                selection['residueTest'] = (l: any) => StructureProperties.residue.auth_seq_id(l.element) === param.start_auth_residue_number;
            }

            // atoms
            if (param.atoms) {
                selection['atomTest'] = (l: any) => param.atoms!.includes(StructureProperties.atom.label_atom_id(l.element));
            }

            if (param.atom_id) {
                selection['atomTest'] = (l: any) => param.atom_id!.includes(StructureProperties.atom.id(l.element));
            }

            selections.push(selection);
        });

        let atmGroupsQueries: any[] = [];
        selections.forEach((selection: any) => { atmGroupsQueries.push(Queries.generators.atoms(selection)); });
        return Queries.combinators.merge(atmGroupsQueries);
    }

    export function getInteractivityLoci(params: any, contextData: any) {

        const sel = StructureQuery.run(QueryHelper.getQueryObject(params, contextData) as any, contextData);
        return StructureSelection.toLociWithSourceUnits(sel);
    }

    export function getHetLoci(queryExp: Expression.Expression, contextData: any) {
        const query = compile<StructureSelection>(queryExp);
        const sel = query(new QueryContext(contextData));
        return StructureSelection.toLociWithSourceUnits(sel);
    }
}
export type LoadParams = { url: string, format?: BuiltInTrajectoryFormat, assemblyId?: string, isHetView?: boolean, isBinary?: boolean }



export const MolstarNode = forwardRef<HTMLDivElement, {}>( function MolstarNode(_, ref) { return <div ref={ref} id='molstar-wrapper' className="min-h-screen" /> })