"use client"
import { createPluginUI } from "molstar/lib/mol-plugin-ui";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import { DefaultPluginUISpec, PluginUISpec } from "molstar/lib/mol-plugin-ui/spec";
import { useEffect, createRef, createContext, Ref, forwardRef, RefObject } from "react";
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
import {StateActions} from 'molstar/lib/mol-plugin-state/actions'


declare global {
  interface Window {
    molstar?: PluginUIContext;
  }
}

declare global {
  interface Window {
    molstar?: PluginUIContext;
  }
}

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

export const MySpec: PluginUISpec = {
    ...DefaultPluginUISpec(),
    
    behaviors:[
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
        [PluginConfig.VolumeStreaming.Enabled               , true],
        [PluginConfig.Viewport       .ShowSelectionMode     , true],
        [PluginConfig.Viewport       .ShowSettings          , true],
        [PluginConfig.Viewport       .ShowAnimation         , true],
        [PluginConfig.Viewport       .ShowTrajectoryControls, true],
        
    ],
    actions:[
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
            showControls   : true,
        },
    },

    
            components: {
                structureTools: CustomStructureTools,
                remoteState: 'default'
            }


}

export class BasicWrapper {

    plugin: PluginUIContext 

    constructor (_:PluginUIContext) {
      this.plugin = _
    }

    static async init(target: string | HTMLElement) {
        var plugin  = await createPluginUI(typeof target === 'string' ? document.getElementById(target)! : target, MySpec);
        return new BasicWrapper(plugin)
    }
    


  }


// ! Keep this.
// export class RibosomeXYZMolstarViewer {
//     constructor(public plugin: PluginUIContext) {
//     }
//     static async create(element: Ref<HTMLDivElement>) {
//         const defaultSpec = DefaultPluginUISpec();
//         // const element = typeof elementOrId === 'string'
//         //     ? document.getElementById(elementOrId)
//         //     : elementOrId;
//         // if (!element) throw new Error(`Could not get element with id '${elementOrId}'`);
//         return new RibosomeXYZMolstarViewer();
//     }
//     static async create(node_ref:RefObject<HTMLDivElement>) {
//         const ribxz_plugin = await createPluginUI(node_ref.current, MySpec);
//         const data              = await ribxz_plugin.builders.data.download({ url: "https://files.rcsb.org/download/3PTB.pdb" }, { state: { isGhost: true } });
//         const trajectory        = await ribxz_plugin.builders.structure.parseTrajectory(data, "pdb");
//         await ribxz_plugin.builders.structure.hierarchy.applyPreset(trajectory, "default");
//         return new RibosomeXYZMolstarViewer(ribxz_plugin);
//       }
//     readonly params = new BehaviorSubject<ParamDefinition.For<Params>>({} as any);
//     readonly state = new BehaviorSubject<Params>({ show: { name: 'orbital', params: { index: 32 } }, isoValue: 1, gpuSurface: true });
//     private selectors?: Selectors = void 0;
//     private basis?: StateObjectSelector<BasisAndOrbitals> = void 0;

//     private currentParams: Params = { ...this.state.value };

//     private clearVolume() {
//         if (!this.selectors) return;
//         const v = this.selectors.volume;
//         this.selectors = void 0;
//         return this.ribxz_plugin.build().delete(v).commit();
//     }

//     private async syncVolume() {
//         if (!this.basis?.isOk) return;

//         const state = this.state.value;

//         if (state.show.name !== this.selectors?.type) {
//             await this.clearVolume();
//         }

//         const update = this.ribxz_plugin.build();
//         if (state.show.name === 'orbital') {
//             if (!this.selectors) {
//                 const volume = update
//                     .to(this.basis)
//                     .apply(CreateOrbitalVolume, { index: state.show.params.index });

//                 const positive = volume.apply(CreateOrbitalRepresentation3D, this.volumeParams('positive', ColorNames.blue)).selector;
//                 const negative = volume.apply(CreateOrbitalRepresentation3D, this.volumeParams('negative', ColorNames.red)).selector;

//                 this.selectors = { type: 'orbital', volume: volume.selector, positive, negative };
//             } else {
//                 const index = state.show.params.index;
//                 update.to(this.selectors.volume).update(CreateOrbitalVolume, () => ({ index }));
//             }
//         } else {
//             if (!this.selectors) {
//                 const volume = update
//                     .to(this.basis)
//                     .apply(CreateOrbitalDensityVolume);
//                 const positive = volume.apply(CreateOrbitalRepresentation3D, this.volumeParams('positive', ColorNames.blue)).selector;
//                 this.selectors = { type: 'density', volume: volume.selector, positive };
//             }
//         }

//         await update.commit();

//         if (this.currentParams.gpuSurface !== this.state.value.gpuSurface) {
//             await this.setIsovalue();
//         }

//         this.currentParams = this.state.value;
//     }

//     private setIsovalue() {
//         if (!this.selectors) return;

//         this.currentParams = this.state.value;
//         const update = this.ribxz_plugin.build();
//         update.to(this.selectors.positive).update(this.volumeParams('positive', ColorNames.blue));
//         if (this.selectors?.type === 'orbital') {
//             update.to(this.selectors.negative).update(this.volumeParams('negative', ColorNames.red));
//         }
//         return update.commit();
//     }

//     private volumeParams(kind: 'positive' | 'negative', color: Color): StateTransformer.Params<typeof CreateOrbitalRepresentation3D> {
//         return {
//             alpha: 0.85,
//             color,
//             kind,
//             relativeIsovalue: this.state.value.isoValue,
//             pickable: false,
//             xrayShaded: true,
//             tryUseGpu: true
//         };
//     }

//     async load(input: DemoInput) {
//         await this.ribxz_plugin.clear();

//         const data = await this.ribxz_plugin.builders.data.rawData({ data: input.moleculeSdf }, { state: { isGhost: true } });
//         const trajectory = await this.ribxz_plugin.builders.structure.parseTrajectory(data, 'mol');
//         const model = await this.ribxz_plugin.builders.structure.createModel(trajectory);
//         const structure = await this.ribxz_plugin.builders.structure.createStructure(model);

//         const all = await this.ribxz_plugin.builders.structure.tryCreateComponentStatic(structure, 'all');
//         if (all) await this.ribxz_plugin.builders.structure.representation.addRepresentation(all, { type: 'ball-and-stick', color: 'element-symbol', colorParams: { carbonColor: { name: 'element-symbol', params: {} } } });


//         this.basis = await this.ribxz_plugin.build().toRoot()
//             .apply(StaticBasisAndOrbitals, { basis: input.basis, order: input.order, orbitals: input.orbitals })
//             .commit();

//         await this.syncVolume();

//         this.params.next({
//             show: ParamDefinition.MappedStatic('orbital', {
//                 'orbital': ParamDefinition.Group({
//                     index: ParamDefinition.Numeric(32, { min: 0, max: input.orbitals.length - 1 }, { immediateUpdate: true, isEssential: true }),
//                 }),
//                 'density': ParamDefinition.EmptyGroup()
//             }, { cycle: true }),
//             isoValue: ParamDefinition.Numeric(this.currentParams.isoValue, { min: 0.5, max: 3, step: 0.1 }, { immediateUpdate: true, isEssential: false }),
//             gpuSurface: ParamDefinition.Boolean(this.currentParams.gpuSurface, { isHidden: true })
//         });

//         this.state.pipe(skip(1), debounceTime(1000 / 24)).subscribe(async params => {
//             if (params.show.name !== this.currentParams.show.name
//                 || (params.show.name === 'orbital' && this.currentParams.show.name === 'orbital' && params.show.params.index !== this.currentParams.show.params.index)) {
//                 this.syncVolume();
//             } else if (params.isoValue !== this.currentParams.isoValue || params.gpuSurface !== this.currentParams.gpuSurface) {
//                 this.setIsovalue();
//             }
//         });
//     }
// }

export const MolstarNode = forwardRef<HTMLDivElement, {}>(function MolstarNode(_, ref){
  return <div ref={ref} id='molstar-wrapper' className="min-h-screen"/>
})
