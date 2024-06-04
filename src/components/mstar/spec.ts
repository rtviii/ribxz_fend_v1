import { Loci } from "molstar/lib/mol-model/loci";
import { StateActions } from "molstar/lib/mol-plugin-state/actions";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import { VolumeStreamingCustomControls } from "molstar/lib/mol-plugin-ui/custom/volume";
import { PluginUISpec } from "molstar/lib/mol-plugin-ui/spec";
import { PluginBehaviors } from "molstar/lib/mol-plugin/behavior";
import { CreateVolumeStreamingBehavior } from "molstar/lib/mol-plugin/behavior/dynamic/volume-streaming/transformers";
import { PluginConfig } from "molstar/lib/mol-plugin/config";
import { PluginSpec } from "molstar/lib/mol-plugin/spec";

export const DefaultPluginSpec = (): PluginSpec => ({
    actions: [
        PluginSpec.Action(StateActions.Structure.EnableStructureCustomProps)
    ],
    behaviors: [
        PluginSpec.Behavior(PluginBehaviors.Representation.HighlightLoci),
        PluginSpec.Behavior(PluginBehaviors.Representation.SelectLoci),
        // PluginSpec.Behavior(PDBeLociLabelProvider),
        PluginSpec.Behavior(PluginBehaviors.Representation.FocusLoci),
        PluginSpec.Behavior(PluginBehaviors.Camera.FocusLoci),
        PluginSpec.Behavior(PluginBehaviors.Camera.CameraAxisHelper),
        PluginSpec.Behavior(PluginBehaviors.CustomProps.StructureInfo),
        PluginSpec.Behavior(PluginBehaviors.CustomProps.AccessibleSurfaceArea),
        // PluginSpec.Behavior(PDBeSIFTSMapping, {autoAttach: true, showTooltip: true}),
        PluginSpec.Behavior(PluginBehaviors.CustomProps.Interactions),
        PluginSpec.Behavior(PluginBehaviors.CustomProps.SecondaryStructure),
        PluginSpec.Behavior(PluginBehaviors.CustomProps.ValenceModel),
        PluginSpec.Behavior(PluginBehaviors.CustomProps.CrossLinkRestraint),
    ],
    // animations: [],
    config: [
        [PluginConfig.VolumeStreaming.DefaultServer, 'https://www.ebi.ac.uk/pdbe/volume-server']
    ]
});

export const DefaultPluginUISpec = (): PluginUISpec => ({
    ...DefaultPluginSpec(),
    customParamEditors: [
        [CreateVolumeStreamingBehavior, VolumeStreamingCustomControls]
    ],
});

export async function createPluginUI(target: HTMLElement, spec?: PluginUISpec, options?: { onBeforeUIRender?: (ctx: PluginUIContext) => (Promise<void> | void) }) {

    const ctx = new PluginUIContext(spec || DefaultPluginUISpec());
    await ctx.init();
    if (options?.onBeforeUIRender) {
        await options.onBeforeUIRender(ctx);
    }
    var plugin  = await createPluginUI(typeof target === 'string' ? document.getElementById(target)! : target, spec);
    return ctx;
}

export type InitParams = {
    moleculeId        ?: string,                                                        superposition ?: boolean,                                                                 pdbeUrl            ?: string,                                                                                                                     loadMaps         ?: boolean, validationAnnotation?: boolean, domainAnnotation  ?: boolean,
    lowPrecisionCoords?: boolean,                                                       landscape     ?: boolean,                                                                 reactive           ?: boolean,                                                                                                                    expanded         ?: boolean, hideControls        ?: boolean, hideCanvasControls?: ['expand', 'selection', 'animation', 'controlToggle', 'controlInfo'],
    subscribeEvents   ?: boolean,                                                       pdbeLink      ?: boolean,                                                                 assemblyId         ?: string,                                                                                                                     selectInteraction?: boolean, sequencePanel       ?: boolean,
    // ligandView        ?: LigandQueryParam,                                              defaultPreset ?: 'default' | "unitcell" | "all-models" | "supercell",
    bgColor           ?: {r: number, g: number, b: number},                             customData?    : {url: string, format: string, binary: boolean},                          loadCartoonsOnly?   : boolean,                                                                                                                    alphafoldView    ?: boolean, selectBindings      ?: any,     focusBindings     ?: any,                                                                  lighting?: 'flat' | 'matte' | 'glossy' | 'metallic' | 'plastic' | undefined,
    selectColor       ?: {r: number, g: number, b: number},                             highlightColor?: {r: number, g: number, b: number},                                       superpositionParams?: {matrixAccession?: string, segment?: number, cluster?: number[], superposeCompleteCluster?: boolean, ligandView?: boolean},
    hideStructure     ?: ['polymer', 'het', 'water', 'carbs', 'nonStandard', 'coarse'], visualStyle   ?: 'cartoon' | 'ball-and-stick',                                            encoding            : 'cif' | 'bcif'
    granularity       ?: Loci.Granularity,                                              selection     ?: { data: QueryParam[], nonSelectedColor?: any, clearPrevious?: boolean }, mapSettings         : any,                                                                                                                        [key: string]     : any;
}

export const DefaultParams: InitParams = {
    moleculeId          : undefined,
    superposition       : undefined,
    superpositionParams : undefined,
    customData          : undefined,
    ligandView          : undefined,
    assemblyId          : undefined,
    visualStyle         : undefined,
    highlightColor      : undefined,
    selectColor         : undefined,
    hideStructure       : undefined,
    hideCanvasControls  : undefined,
    granularity         : undefined,
    selection           : undefined,
    mapSettings         : undefined,
    selectBindings      : undefined,
    focusBindings       : undefined,
    defaultPreset       : 'default',
    pdbeUrl             : 'https://www.ebi.ac.uk/pdbe/',
    bgColor             : {r:0, g:0, b:0},
    lighting            : undefined,
    encoding            : 'bcif',
    selectInteraction   : true,
    loadMaps            : false,
    validationAnnotation: false,
    domainAnnotation    : false,
    lowPrecisionCoords  : false,
    expanded            : false,
    hideControls        : false,
    pdbeLink            : true,
    loadCartoonsOnly    : false,
    landscape           : false,
    reactive            : false,
    subscribeEvents     : false,
    alphafoldView       : false,
    sequencePanel       : false
};