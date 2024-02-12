import { PluginContext } from "molstar/lib/mol-plugin/context";
import { DefaultParams, DefaultPluginUISpec, InitParams, createPluginUI } from "./spec";
import { PluginUISpec } from "molstar/lib/mol-plugin-ui/spec";
import {RxEventHelper} from "molstar/lib/mol-util/rx-event-helper"
import { PluginSpec } from "molstar/lib/mol-plugin/spec";
import { FocusLoci, SelectLoci } from "molstar/lib/mol-plugin/behavior/dynamic/representation";
import { GeometryExport} from 'molstar/lib/extensions/geo-export'
// import { Mp4Export} from 'molstar/lib/extensions/mp4-export'
import { BuiltInTrajectoryFormat } from "molstar/lib/mol-plugin-state/formats/trajectory";
import { Asset } from "molstar/lib/mol-util/assets";
import { createStructureRepresentationParams } from "molstar/lib/mol-plugin-state/helpers/structure-representation-params";
import { EmptyLoci, Loci } from "molstar/lib/mol-model/loci";
import { PluginStateObject } from "molstar/lib/mol-plugin-state/objects";
import Expression from 'molstar/lib/mol-script/language/expression';
import { StructureProperties } from "molstar/lib/mol-model/structure/structure/properties";
import { Queries, QueryContext, StructureQuery, StructureSelection } from "molstar/lib/mol-model/structure/query";
import { compile } from "molstar/lib/mol-script/runtime/query/compiler";
import { StructureComponentManager } from "molstar/lib/mol-plugin-state/manager/structure/component";
import{clearStructureOverpaint } from 'molstar/lib/mol-plugin-state/helpers/structure-overpaint'
import { ParamDefinition } from "molstar/lib/mol-util/param-definition";
import {PluginCommands} from 'molstar/lib/mol-plugin/commands'
import { StateSelection } from "molstar/lib/mol-state/state/selection";
import { StateTransform } from "molstar/lib/mol-state/transform";
import { InitVolumeStreaming } from "molstar/lib/mol-plugin/behavior/dynamic/volume-streaming/transformers";
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
};

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



// plugincontext -> plugin ui 


const createPluginUi = (target:string )

// TODO: Rebuild with your own rx event loop
// export class RibxzMolstar {

//     plugin       : PluginContext;
//     initParams   : InitParams;
//     targetElement: HTMLElement;

//     assemblyRef = '';
//     selectedParams      : any;
//     defaultRendererProps: any;
//     isHighlightColorUpdated = false;
//     isSelectedColorUpdated = false;


//     async render(target: string | HTMLElement, options: InitParams) {
//         if (!options) return;
//         this.initParams = { ...DefaultParams };
//         // for (let param in DefaultParams) {
//         //     if (typeof options[param] !== 'undefined') this.initParams[param] = options[param];
//         // }

//         // if (!this.initParams.moleculeId && !this.initParams.customData) return false;
//         // if (this.initParams.customData && this.initParams.customData.url && !this.initParams.customData.format) return false;

//         // Set PDBe Plugin Spec
//         const defaultPDBeSpec              = DefaultPluginUISpec();
//         const pdbePluginSpec: PluginUISpec = {
//             actions           : [...defaultPDBeSpec.actions || []],
//             behaviors         : [...defaultPDBeSpec.behaviors],
//             animations        : [...defaultPDBeSpec.animations || []],
//             customParamEditors: defaultPDBeSpec.customParamEditors,
//             config            : defaultPDBeSpec.config
//         };

//         // if (!this.initParams.ligandView && !this.initParams.superposition && this.initParams.selectInteraction) {
//         //     pdbePluginSpec.behaviors.push(PluginSpec.Behavior(StructureFocusRepresentation));
//         // }

//         // if (this.initParams.superposition) {
//         //     pdbePluginSpec.behaviors.push(PluginSpec.Behavior(SuperpositionFocusRepresentation), PluginSpec.Behavior(MAQualityAssessment, { autoAttach: true, showTooltip: true }));
//         // }

//         // // Add custom properties
//         // if (this.initParams.domainAnnotation) {
//         //     pdbePluginSpec.behaviors.push(PluginSpec.Behavior(PDBeDomainAnnotations, { autoAttach: true, showTooltip: false }));
//         // }

//         // if (this.initParams.validationAnnotation) {
//         //     pdbePluginSpec.behaviors.push(PluginSpec.Behavior(PDBeStructureQualityReport, { autoAttach: true, showTooltip: false }));
//         // }

//         // pdbePluginSpec.layout = {
//         //     initial: {
//         //         isExpanded  : this.initParams.landscape ? false: this.initParams.expanded,
//         //         showControls: !this.initParams.hideControls
//         //     }
//         // };




//         // // Add animation props
//         // if (!this.initParams.ligandView && !this.initParams.superposition) {
//         //     // pdbePluginSpec['animations'] = [AnimateModelIndex, AnimateCameraSpin, AnimateCameraRock, AnimateStateSnapshots, AnimateAssemblyUnwind, AnimateStructureSpin, AnimateStateInterpolation];
//         //     // pdbePluginSpec.behaviors.push(PluginSpec.Behavior(Mp4Export));
//         //     pdbePluginSpec.behaviors.push(PluginSpec.Behavior(GeometryExport));
//         // }



//         // override default event bindings
//         if (this.initParams.selectBindings) {
//             pdbePluginSpec.behaviors.push(
//                 PluginSpec.Behavior(SelectLoci, { bindings: this.initParams.selectBindings })
//             )
//         }

//         if (this.initParams.focusBindings) {
//             pdbePluginSpec.behaviors.push(
//                 PluginSpec.Behavior(FocusLoci, { bindings: this.initParams.focusBindings })
//             )
//         }

//         this.targetElement = typeof target === 'string' ? document.getElementById(target)! : target;

//         // Create/ Initialise Plugin
//         this.plugin = await createPluginUI(this.targetElement, pdbePluginSpec);


//         // Set selection granularity
//         if (this.initParams.granularity) {
//             this.plugin.managers.interactivity.setProps({ granularity: this.initParams.granularity });
//         }


//         // Save renderer defaults
//         this.defaultRendererProps = { ...this.plugin.canvas3d!.props.renderer };


//     }
//     getMoleculeSrcUrl() {
//         const supportedFormats = ['mmcif', 'pdb', 'sdf'];
//         let id = this.initParams.moleculeId;
//         if (!id && !this.initParams.customData) {
//             throw new Error(`Mandatory parameters missing!`);
//         }

//         let query = 'full';
//         let sep = '?';

//         if (this.initParams.ligandView) {
//             let queryParams = ['data_source=pdb-h'];

//             if (!this.initParams.ligandView.label_comp_id_list) {
//                 if (this.initParams.ligandView.label_comp_id) {
//                     queryParams.push('label_comp_id=' + this.initParams.ligandView.label_comp_id);

//                 } else if (this.initParams.ligandView.auth_seq_id) {
//                     queryParams.push('auth_seq_id=' + this.initParams.ligandView.auth_seq_id);
//                 }

//                 if (this.initParams.ligandView.auth_asym_id) queryParams.push('auth_asym_id=' + this.initParams.ligandView.auth_asym_id);
//             }

//             query = 'residueSurroundings?' + queryParams.join('&');
//             sep = '&';
//         }

//         let url = `${this.initParams.pdbeUrl}model-server/v1/${id}/${query}${sep}encoding=${this.initParams.encoding}${this.initParams.lowPrecisionCoords ? '&lowPrecisionCoords=1' : ''}`;
//         let isBinary = this.initParams.encoding === 'bcif' ? true : false;
//         let format = 'mmcif';

//         if (this.initParams.customData) {
//             if (!this.initParams.customData.url || !this.initParams.customData.format) {
//                 throw new Error(`Provide all custom data parameters`);
//             }

//             url = this.initParams.customData.url;
//             format = this.initParams.customData.format;
//             if (format === 'cif' || format === 'bcif') format = 'mmcif';
//             // Validate supported format
//             if (supportedFormats.indexOf(format) === -1) {
//                 throw new Error(`${format} not supported.`);
//             }
//             isBinary = this.initParams.customData.binary ? this.initParams.customData.binary : false;
//         }

//         return {
//             url: url,
//             format: format,
//             isBinary: isBinary
//         };
//     }
//     getLociForParams(params: QueryParam[], structureNumber?: number) {
//         let assemblyRef = this.assemblyRef;
//         if (structureNumber) {
//             assemblyRef = this.plugin.managers.structure.hierarchy.current.structures[structureNumber - 1].cell.transform.ref;
//         }

//         if (assemblyRef === '') return EmptyLoci;
//         const data = (this.plugin.state.data.select(assemblyRef)[0].obj as PluginStateObject.Molecule.Structure).data;
//         if (!data) return EmptyLoci;
//         return QueryHelper.getInteractivityLoci(params, data);
//     }
//     async clear() {
//         this.plugin.clear();

//         this.assemblyRef             = '';
//         this.selectedParams          = void 0;
//         this.isHighlightColorUpdated = false;
//         this.isSelectedColorUpdated  = false;
//     }
//     get state() {
//         return this.plugin.state.data;
//     }

//     applyVisualParams = () => {
//         const TagRefs: any = {
//             'structure-component-static-polymer': 'polymer',
//             'structure-component-static-ligand': 'het',
//             'structure-component-static-branched': 'carbs',
//             'structure-component-static-water': 'water',
//             'structure-component-static-coarse': 'coarse',
//             'non-standard': 'nonStandard'
//         };

//         const componentGroups = this.plugin.managers.structure.hierarchy.currentComponentGroups;
//         componentGroups.forEach((compGrp) => {
//             const compGrpIndex = compGrp.length - 1;
//             const key = compGrp[compGrpIndex].key;
//             let rm = false;
//             if (key && this.initParams.hideStructure) {
//                 const structType: any = TagRefs[key];
//                 if (structType && this.initParams.hideStructure?.indexOf(structType) > -1) rm = true;
//             }
//             if (rm) {
//                 this.plugin.managers.structure.hierarchy.remove([compGrp[compGrpIndex]]);
//             }

//             if (!rm && this.initParams.visualStyle) {
//                 if (compGrp[compGrpIndex] && compGrp[compGrpIndex].representations) {
//                     compGrp[compGrpIndex].representations.forEach(rep => {
//                         const currentParams = createStructureRepresentationParams(this.plugin, void 0, { type: this.initParams.visualStyle });
//                         this.plugin.managers.structure.component.updateRepresentations([compGrp[compGrpIndex]], rep, currentParams);
//                     });
//                 }
//             }
//         });
//     }

//     visual = {
//         highlight: (params: { data: QueryParam[], color?: any, focus?: boolean, structureNumber?: number }) => {

//             const loci = this.getLociForParams(params.data, params.structureNumber);
//             if (Loci.isEmpty(loci)) return;
//             if (params.color) {
//                 this.visual.setColor({ highlight: params.color });
//             }
//             this.plugin.managers.interactivity.lociHighlights.highlightOnly({ loci });
//             if (params.focus) this.plugin.managers.camera.focusLoci(loci);

//         },
//         clearHighlight: async () => {
//             this.plugin.managers.interactivity.lociHighlights.highlightOnly({ loci: EmptyLoci });
//             if (this.isHighlightColorUpdated) this.visual.reset({ highlightColor: true });
//         },
//         select: async (params: { data: QueryParam[], nonSelectedColor?: any, addedRepr?: boolean, structureNumber?: number }) => {

//             // clear prvious selection
//             if (this.selectedParams) {
//                 await this.visual.clearSelection(params.structureNumber);
//             }

//             // Structure list to apply selection
//             let structureData = this.plugin.managers.structure.hierarchy.current.structures;
//             if (params.structureNumber) {
//                 structureData = [this.plugin.managers.structure.hierarchy.current.structures[params.structureNumber - 1]];
//             }

//             // set non selected theme color
//             if (params.nonSelectedColor) {
//                 for await (const s of structureData) {
//                     await this.plugin.managers.structure.component.updateRepresentationsTheme(s.components, { color: 'uniform', colorParams: { value: this.normalizeColor(params.nonSelectedColor) } });
//                 }
//             }

//             // apply individual selections
//             for await (const param of params.data) {
//                 // get loci from param
//                 const loci = this.getLociForParams([param], params.structureNumber);
//                 if (Loci.isEmpty(loci)) return;
//                 // set default selection color to minimise change display
//                 this.visual.setColor({ select: param.color ? param.color : { r: 255, g: 112, b: 3 } });
//                 // apply selection
//                 this.plugin.managers.interactivity.lociSelects.selectOnly({ loci });
//                 // create theme param values and apply them to create overpaint
//                 const themeParams = StructureComponentManager.getThemeParams(this.plugin, this.plugin.managers.structure.component.pivotStructure);
//                 const colorValue = ParamDefinition.getDefaultValues(themeParams);
//                 // colorValue.action.params = { color: param.color ? this.normalizeColor(param.color) : Color.fromRgb(255, 112, 3), opacity: 1 };
//                 await this.plugin.managers.structure.component.applyTheme(colorValue, structureData);
//                 // add new representations
//                 if (param.sideChain || param.representation) {
//                     let repr = 'ball-and-stick';
//                     if (param.representation) repr = param.representation;
//                     const defaultParams = StructureComponentManager.getAddParams(this.plugin, { allowNone: false, hideSelection: true, checkExisting: true });
//                     let defaultValues = ParamDefinition.getDefaultValues(defaultParams);
//                     defaultValues.options = { label: 'selection-by-script', checkExisting: params.structureNumber ? false : true };
//                     const values = { ...defaultValues, ...{ representation: repr } };
//                     const structures = this.plugin.managers.structure.hierarchy.getStructuresWithSelection();
//                     await this.plugin.managers.structure.component.add(values, structures);

//                     // Apply uniform theme
//                     if (param.representationColor) {
//                         let updatedStructureData = this.plugin.managers.structure.hierarchy.current.structures;
//                         if (params.structureNumber) {
//                             updatedStructureData = [this.plugin.managers.structure.hierarchy.current.structures[params.structureNumber - 1]];
//                         }
//                         const comps = updatedStructureData[0].components;
//                         const lastCompsIndex = comps.length - 1;
//                         const recentRepComp = [comps[lastCompsIndex]];
//                         // const uniformColor = param.representationColor ? this.normalizeColor(param.representationColor) : Color.fromRgb(255, 112, 3);
//                         this.plugin.managers.structure.component.updateRepresentationsTheme(recentRepComp, { color: 'uniform', });
//                     }

//                     params.addedRepr = true;
//                 }
//                 // focus loci
//                 if (param.focus) this.plugin.managers.camera.focusLoci(loci);
//                 // remove selection
//                 this.plugin.managers.interactivity.lociSelects.deselect({ loci });
//             }

//             // reset selection color
//             this.visual.reset({ selectColor: true });
//             // save selection params to optimise clear
//             this.selectedParams = params;

//         },
//         clearSelection: async (structureNumber?: number) => {

//             const structIndex = structureNumber ? structureNumber - 1 : 0;
//             this.plugin.managers.interactivity.lociSelects.deselectAll();
//             // reset theme to default
//             if (this.selectedParams && this.selectedParams.nonSelectedColor) {
//                 this.visual.reset({ theme: true });
//             }
//             // remove overpaints
//             await clearStructureOverpaint(this.plugin, this.plugin.managers.structure.hierarchy.current.structures[structIndex].components);
//             // remove selection representations
//             if (this.selectedParams && this.selectedParams.addedRepr) {
//                 let selReprCells: any = [];
//                 for (const c of this.plugin.managers.structure.hierarchy.current.structures[structIndex].components) {
//                     if (c.cell && c.cell.params && c.cell.params.values && c.cell.params.values.label === 'selection-by-script') selReprCells.push(c.cell);
//                 }
//                 if (selReprCells.length > 0) {
//                     for await (const selReprCell of selReprCells) {
//                         await PluginCommands.State.RemoveObject(this.plugin, { state: selReprCell.parent!, ref: selReprCell.transform.ref });
//                     };
//                 }

//             }
//             this.selectedParams = undefined;
//         },
//         update: async (options: InitParams, fullLoad?: boolean) => {
//             if (!options) return;

//             // for(let param in this.initParams){
//             //     if(options[param]) this.initParams[param] = options[param];
//             // }

//             this.initParams = { ...DefaultParams };
//             for (let param in DefaultParams) {
//                 if (typeof options[param] !== 'undefined') this.initParams[param] = options[param];
//             }

//             if (!this.initParams.moleculeId && !this.initParams.customData) return false;
//             if (this.initParams.customData && this.initParams.customData.url && !this.initParams.customData.format) return false;
//             (this.plugin.customState as any).initParams = this.initParams;

//             // Set background colour
//             // if (this.initParams.bgColor || this.initParams.lighting) {
//             //     const settings: any = {};
//             //     if (this.initParams.bgColor) settings.color = this.initParams.bgColor;
//             //     if (this.initParams.lighting) settings.lighting = this.initParams.lighting;
//             //     this.canvas.applySettings(settings);
//             // }

//             // Load Molecule CIF or coordQuery and Parse
//             let dataSource = this.getMoleculeSrcUrl();
//             if (dataSource) {
//                 this.load({ url: dataSource.url, format: dataSource.format as BuiltInTrajectoryFormat, assemblyId: this.initParams.assemblyId, isBinary: dataSource.isBinary }, fullLoad);
//             }
//         },
//         visibility: (data: { polymer?: boolean, het?: boolean, water?: boolean, carbs?: boolean, maps?: boolean, [key: string]: any }) => {

//             if (!data) return;

//             const refMap: any = {
//                 polymer: 'structure-component-static-polymer',
//                 het: 'structure-component-static-ligand',
//                 water: 'structure-component-static-water',
//                 carbs: 'structure-component-static-branched',
//                 maps: 'volume-streaming-info'
//             };

//             for (let visual in data) {
//                 const tagName = refMap[visual];
//                 const componentRef = StateSelection.findTagInSubtree(this.plugin.state.data.tree, StateTransform.RootRef, tagName);
//                 if (componentRef) {
//                     const compVisual = this.plugin.state.data.select(componentRef)[0];
//                     if (compVisual && compVisual.obj) {
//                         const currentlyVisible = (compVisual.state && compVisual.state.isHidden) ? false : true;
//                         if (data[visual] !== currentlyVisible) {
//                             PluginCommands.State.ToggleVisibility(this.plugin, { state: this.state, ref: componentRef });
//                         }
//                     }
//                 }

//             }

//         },
//         toggleSpin: (isSpinning?: boolean, resetCamera?: boolean) => {
//             if (!this.plugin.canvas3d) return;
//             const trackball = this.plugin.canvas3d.props.trackball;

//             let toggleSpinParam: any = trackball.animate.name === 'spin' ? { name: 'off', params: {} } : { name: 'spin', params: { speed: 1 } };

//             if (typeof isSpinning !== 'undefined') {
//                 toggleSpinParam = { name: 'off', params: {} };
//                 if (isSpinning) toggleSpinParam = { name: 'spin', params: { speed: 1 } };
//             }
//             PluginCommands.Canvas3D.SetSettings(this.plugin, { settings: { trackball: { ...trackball, animate: toggleSpinParam } } });
//             if (resetCamera) PluginCommands.Camera.Reset(this.plugin, {});
//         },
//         focus: async (params: QueryParam[], structureNumber?: number) => {
//             const loci = this.getLociForParams(params, structureNumber);
//             this.plugin.managers.camera.focusLoci(loci);
//         },
//         setColor: (param: { highlight?: any, select?: any }) => {
//             if (!this.plugin.canvas3d) return;
//             const renderer = this.plugin.canvas3d.props.renderer;
//             let rParam: any = {};
//             // if (param.highlight) rParam['highlightColor'] = this.normalizeColor(param.highlight);
//             // if (param.select) rParam['selectColor'] = this.normalizeColor(param.select);
//             PluginCommands.Canvas3D.SetSettings(this.plugin, { settings: { renderer: { ...renderer, ...rParam } } });
//             if (rParam.highlightColor) this.isHighlightColorUpdated = true;
//         },
//         reset: async (params: { camera?: boolean, theme?: boolean, highlightColor?: boolean, selectColor?: boolean }) => {

//             if (params.camera) await PluginCommands.Camera.Reset(this.plugin, { durationMs: 250 });

//             if (params.theme) {
//                 const defaultTheme: any = { color: this.initParams.alphafoldView ? 'plddt-confidence' : 'default' };
//                 const componentGroups = this.plugin.managers.structure.hierarchy.currentComponentGroups;
//                 componentGroups.forEach((compGrp) => {
//                     this.plugin.managers.structure.component.updateRepresentationsTheme(compGrp, defaultTheme);
//                 });
//             }

//             if (params.highlightColor || params.selectColor) {
//                 if (!this.plugin.canvas3d) return;
//                 const renderer = this.plugin.canvas3d.props.renderer;
//                 let rParam: any = {};
//                 if (params.highlightColor) rParam['highlightColor'] = this.defaultRendererProps.highlightColor;
//                 if (params.selectColor) rParam['selectColor'] = this.defaultRendererProps.selectColor;
//                 PluginCommands.Canvas3D.SetSettings(this.plugin, { settings: { renderer: { ...renderer, ...rParam } } });
//                 if (rParam.highlightColor) this.isHighlightColorUpdated = false;
//             }

//         }
//     }
//     async load({ url, format = 'mmcif', isBinary = false, assemblyId = '' }: LoadParams, fullLoad = true) {
//         if (fullLoad) this.clear();

//         const isHetView = this.initParams.ligandView ? true : false;

//         let downloadOptions: any = void 0;
//         let isBranchedView = false;
//         if (this.initParams.ligandView && this.initParams.ligandView.label_comp_id_list) {
//             isBranchedView = true;
//             downloadOptions = { body: JSON.stringify(this.initParams.ligandView!.label_comp_id_list), headers: [['Content-type', 'application/json']] };
//         }

//         const data = await this.plugin.builders.data.download({ url: Asset.Url(url, downloadOptions), isBinary }, { state: { isGhost: true } });
//         const trajectory = await this.plugin.builders.structure.parseTrajectory(data, format);

//         if (!isHetView) {
//             await this.plugin.builders.structure.hierarchy.applyPreset(trajectory, this.initParams.defaultPreset as any, {
//                 structure: assemblyId ? (assemblyId === 'preferred') ? void 0 : { name: 'assembly', params: { id: assemblyId } } : { name: 'model', params: {} },
//                 showUnitcell: false,
//                 representationPreset: 'auto'
//             });

//             if (this.initParams.hideStructure || this.initParams.visualStyle) {
//                 this.applyVisualParams();
//             }

//         } else {
//             const model = await this.plugin.builders.structure.createModel(trajectory);
//             await this.plugin.builders.structure.createStructure(model, { name: 'model', params: {} });
//         }

//         // show selection if param is set
//         if (this.initParams.selection) {
//             this.visual.select(this.initParams.selection);
//         }

//         // Store assembly ref
//         const pivotIndex = this.plugin.managers.structure.hierarchy.selection.structures.length - 1;
//         const pivot = this.plugin.managers.structure.hierarchy.selection.structures[pivotIndex];
//         if (pivot && pivot.cell.parent) this.assemblyRef = pivot.cell.transform.ref;



//         // TODO: Event Loop
//         // this.events.loadComplete.next(true);
//     }
// }
// // (window as any).RibxzMolstar = RibxzMolstar;