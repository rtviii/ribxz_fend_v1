import { createPluginUI } from "molstar/lib/mol-plugin-ui";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import { DefaultPluginUISpec } from "molstar/lib/mol-plugin-ui/spec";
import { useEffect, createRef, createContext, Ref, forwardRef, RefObject } from "react";
import './mstar.css'
import "molstar/lib/mol-plugin-ui/skin/light.scss";
import { MySpec } from "./mstar_config";
import React from "react";


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


export const MolstarNode = forwardRef<HTMLDivElement, {}>(function MolstarNode(_, ref){
  return <div ref={ref} id='molstar-wrapper'/>
})
export class ribxzMolstarPlugin {
    ribxz_plugin: PluginUIContext;

    async init(node_ref:RefObject<HTMLDivElement>) {

              this.ribxz_plugin = await createPluginUI(node_ref.current, MySpec);
        const data              = await this.ribxz_plugin.builders.data.download({ url: "https://files.rcsb.org/download/3j7z.pdb" }, { state: { isGhost: true } });
        const trajectory        = await this.ribxz_plugin.builders.structure.parseTrajectory(data, "pdb");
        await this.ribxz_plugin.builders.structure.hierarchy.applyPreset(trajectory, "default");
        return this.ribxz_plugin
      }


    // readonly params = new BehaviorSubject<ParamDefinition.For<Params>>({} as any);
    // readonly state = new BehaviorSubject<Params>({ show: { name: 'orbital', params: { index: 32 } }, isoValue: 1, gpuSurface: true });
    // private selectors?: Selectors = void 0;
    // private basis?: StateObjectSelector<BasisAndOrbitals> = void 0;

    // private currentParams: Params = { ...this.state.value };

    // private clearVolume() {
    //     if (!this.selectors) return;
    //     const v = this.selectors.volume;
    //     this.selectors = void 0;
    //     return this.ribxz_plugin.build().delete(v).commit();
    // }

    // private async syncVolume() {
    //     if (!this.basis?.isOk) return;

    //     const state = this.state.value;

    //     if (state.show.name !== this.selectors?.type) {
    //         await this.clearVolume();
    //     }

    //     const update = this.ribxz_plugin.build();
    //     if (state.show.name === 'orbital') {
    //         if (!this.selectors) {
    //             const volume = update
    //                 .to(this.basis)
    //                 .apply(CreateOrbitalVolume, { index: state.show.params.index });

    //             const positive = volume.apply(CreateOrbitalRepresentation3D, this.volumeParams('positive', ColorNames.blue)).selector;
    //             const negative = volume.apply(CreateOrbitalRepresentation3D, this.volumeParams('negative', ColorNames.red)).selector;

    //             this.selectors = { type: 'orbital', volume: volume.selector, positive, negative };
    //         } else {
    //             const index = state.show.params.index;
    //             update.to(this.selectors.volume).update(CreateOrbitalVolume, () => ({ index }));
    //         }
    //     } else {
    //         if (!this.selectors) {
    //             const volume = update
    //                 .to(this.basis)
    //                 .apply(CreateOrbitalDensityVolume);
    //             const positive = volume.apply(CreateOrbitalRepresentation3D, this.volumeParams('positive', ColorNames.blue)).selector;
    //             this.selectors = { type: 'density', volume: volume.selector, positive };
    //         }
    //     }

    //     await update.commit();

    //     if (this.currentParams.gpuSurface !== this.state.value.gpuSurface) {
    //         await this.setIsovalue();
    //     }

    //     this.currentParams = this.state.value;
    // }

    // private setIsovalue() {
    //     if (!this.selectors) return;

    //     this.currentParams = this.state.value;
    //     const update = this.ribxz_plugin.build();
    //     update.to(this.selectors.positive).update(this.volumeParams('positive', ColorNames.blue));
    //     if (this.selectors?.type === 'orbital') {
    //         update.to(this.selectors.negative).update(this.volumeParams('negative', ColorNames.red));
    //     }
    //     return update.commit();
    // }

    // private volumeParams(kind: 'positive' | 'negative', color: Color): StateTransformer.Params<typeof CreateOrbitalRepresentation3D> {
    //     return {
    //         alpha: 0.85,
    //         color,
    //         kind,
    //         relativeIsovalue: this.state.value.isoValue,
    //         pickable: false,
    //         xrayShaded: true,
    //         tryUseGpu: true
    //     };
    // }

    // async load(input: DemoInput) {
    //     await this.ribxz_plugin.clear();

    //     const data = await this.ribxz_plugin.builders.data.rawData({ data: input.moleculeSdf }, { state: { isGhost: true } });
    //     const trajectory = await this.ribxz_plugin.builders.structure.parseTrajectory(data, 'mol');
    //     const model = await this.ribxz_plugin.builders.structure.createModel(trajectory);
    //     const structure = await this.ribxz_plugin.builders.structure.createStructure(model);

    //     const all = await this.ribxz_plugin.builders.structure.tryCreateComponentStatic(structure, 'all');
    //     if (all) await this.ribxz_plugin.builders.structure.representation.addRepresentation(all, { type: 'ball-and-stick', color: 'element-symbol', colorParams: { carbonColor: { name: 'element-symbol', params: {} } } });


    //     this.basis = await this.ribxz_plugin.build().toRoot()
    //         .apply(StaticBasisAndOrbitals, { basis: input.basis, order: input.order, orbitals: input.orbitals })
    //         .commit();

    //     await this.syncVolume();

    //     this.params.next({
    //         show: ParamDefinition.MappedStatic('orbital', {
    //             'orbital': ParamDefinition.Group({
    //                 index: ParamDefinition.Numeric(32, { min: 0, max: input.orbitals.length - 1 }, { immediateUpdate: true, isEssential: true }),
    //             }),
    //             'density': ParamDefinition.EmptyGroup()
    //         }, { cycle: true }),
    //         isoValue: ParamDefinition.Numeric(this.currentParams.isoValue, { min: 0.5, max: 3, step: 0.1 }, { immediateUpdate: true, isEssential: false }),
    //         gpuSurface: ParamDefinition.Boolean(this.currentParams.gpuSurface, { isHidden: true })
    //     });

    //     this.state.pipe(skip(1), debounceTime(1000 / 24)).subscribe(async params => {
    //         if (params.show.name !== this.currentParams.show.name
    //             || (params.show.name === 'orbital' && this.currentParams.show.name === 'orbital' && params.show.params.index !== this.currentParams.show.params.index)) {
    //             this.syncVolume();
    //         } else if (params.isoValue !== this.currentParams.isoValue || params.gpuSurface !== this.currentParams.gpuSurface) {
    //             this.setIsovalue();
    //         }
    //     });
    // }
}