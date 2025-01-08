import {createPluginUI} from 'molstar/lib/mol-plugin-ui';
import {PluginUIContext} from 'molstar/lib/mol-plugin-ui/context';
import {ArbitrarySphereRepresentationProvider} from './providers/sphere_provider';
import {renderReact18} from 'molstar/lib/mol-plugin-ui/react18';
import {PluginUISpec} from 'molstar/lib/mol-plugin-ui/spec';
import {ribxzSpec} from './spec';
import {chainSelectionPreset} from './providers/polymer_preset';
import {PluginCommands} from 'molstar/lib/mol-plugin/commands';
import {Color} from 'molstar/lib/mol-util/color';
import {StateTransforms} from 'molstar/lib/mol-plugin-state/transforms';
import {
    QueryContext,
    Structure,
    StructureElement,
    StructureProperties,
    StructureSelection
} from 'molstar/lib/mol-model/structure';
import {StructureQueryHelper} from 'molstar/lib/mol-plugin-state/helpers/structure-query';
import {MolScriptBuilder, MolScriptBuilder as MS} from 'molstar/lib/mol-script/language/builder';
import {Script} from 'molstar/lib/mol-script/script';
import {Expression} from 'molstar/lib/mol-script/language/expression';
import {LigandComponent, PolymerComponent} from '@/store/molstar/slice_refs';
import {createStructureRepresentationParams} from 'molstar/lib/mol-plugin-state/helpers/structure-representation-params';
import {compile} from 'molstar/lib/mol-script/runtime/query/base';
// import {StateElements} from './__molstar_ribxz';
import {StateObjectSelector, StateSelection} from 'molstar/lib/mol-state';
import {setSubtreeVisibility} from 'molstar/lib/mol-plugin/behavior/static/state';
import {StructureSelectionQueries} from 'molstar/lib/mol-plugin-state/helpers/structure-selection-query';

import {debounceTime} from 'rxjs/operators';
import {InteractivityManager} from 'molstar/lib/mol-plugin-state/manager/interactivity';
import {ResidueData} from '@/app/components/sequence_viewer';
import {Asset} from 'molstar/lib/mol-util/assets';
import {Loci} from 'molstar/lib/mol-model/loci';
import PolymerColorschemeWarm from './providers/colorschemes/colorscheme_warm';
import {ArbitraryCylinderRepresentationProvider} from './providers/cylinder_provider';

export interface HoverEventDetail {
    residueNumber?: number;
    chainId?: string;
    structureId?: string;
}
// How should the objects be stored? What kind of selections and operations do we like to make a lot?

// - toggle/ select/highligh/focus/get nbhd for objects
// object:
// atom?
// - residue
// - ligand
// - chain
// - collections thereof
// manipulate

declare global {
    interface Window {
        molstar?: PluginUIContext;
    }
}
export class ribxzMstarv2 {
    //@ts-ignore
    ctx: PluginUIContext;
    constructor() {}
    async init(parent: HTMLElement, spec: PluginUISpec = ribxzSpec) {
     while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
    }
const pluginContainer = document.createElement('div');
    pluginContainer.style.width = '100%';
    pluginContainer.style.height = '100%';
    parent.appendChild(pluginContainer);
        this.ctx = await createPluginUI({target: parent, spec: spec, render: renderReact18});
        this.ctx.representation.structure.registry.add(ArbitrarySphereRepresentationProvider);
        this.ctx.representation.structure.registry.add(ArbitraryCylinderRepresentationProvider);
        this.ctx.builders.structure.representation.registerPreset(chainSelectionPreset);
        this.ctx.canvas3d?.setProps({
            camera: {helper: {axes: {name: 'off', params: {}}}}
        });
        const rendererParams: any = {
            backgroundColor: Color.fromRgb(255, 255, 255)
        };
        const renderer = this.ctx.canvas3d?.props.renderer;
        PluginCommands.Canvas3D.SetSettings(this.ctx, {
            settings: {renderer: {...renderer, ...rendererParams}}
        });

        this.setupHoverEvent(this.ctx, parent);
    }

    landmarks = {
        tunnel_mesh_cylinder: async (
            start: [number, number, number],
            end: [number, number, number],
            radius: number = 0.5
        ) => {
            const structureRef = this.ctx.managers.structure.hierarchy.current.structures[0]?.cell.transform.ref;

            if (!structureRef) {
                console.error('No structure loaded');
                return;
            }

            await this.ctx.builders.structure.representation.addRepresentation(structureRef, {
                type: 'arbitrary-cylinder' as any,
                typeParams: {
                    startX: start[0],
                    startY: start[1],
                    startZ: start[2],
                    endX: end[0],
                    endY: end[1],
                    endZ: end[2],
                    radius
                },
                colorParams: {value: Color(0x000000)} // Black color
            });
        },
        tunnel_geometry: async (rcsb_id: string): Promise<Loci> => {
            const provider = this.ctx.dataFormats.get('ply')!;
            const myurl = `${process.env.NEXT_PUBLIC_DJANGO_URL}/structures/tunnel_geometry?rcsb_id=${rcsb_id}&is_ascii=true`;
            const data = await this.ctx.builders.data.download({
                url: Asset.Url(myurl.toString()),
                isBinary: false
            });
            const parsed = await provider!.parse(this.ctx, data!);

            if (provider.visuals) {
                const visual = await provider.visuals!(this.ctx, parsed);
                const shape_ref = visual.ref;
                const meshObject = this.ctx.state.data.select(shape_ref)[0];
                const shape_loci = await meshObject.obj.data.repr.getAllLoci();
                return shape_loci;
            } else {
                throw Error('provider.visuals is undefined for this `ply` data format');
            }
        },
        ptc: async (xyz: number[]) => {
            let [x, y, z] = xyz;
            let sphere = {x: x, y: y, z: z, radius: 2, color: 'blue'};
            const structureRef = this.ctx.managers.structure.hierarchy.current.structures[0]?.cell.transform.ref;
            this.ctx.builders.structure.representation.addRepresentation(structureRef, {
                type: 'arbitrary-sphere' as any,
                typeParams: sphere,
                colorParams: sphere.color ? {value: Color(0xffffff)} : void 0
            });
            this.ligands.create_surroundings(structureRef);
        },
        constriction_site: (xyz: number[]) => {
            let [x, y, z] = xyz;
            let sphere = {x: x, y: y, z: z, radius: 2, color: 'red'};
            const structureRef = this.ctx.managers.structure.hierarchy.current.structures[0]?.cell.transform.ref;
            this.ctx.builders.structure.representation.addRepresentation(structureRef, {
                type: 'arbitrary-sphere' as any,
                typeParams: sphere,
                colorParams: sphere.color ? {value: Color(0xffffff)} : void 0
            });
        }
    };

    components = {
        upload_mmcif_structure: async (
            rcsb_id: string,
            nomenclature_map: Record<string, string>
        ): Promise<{
            root_ref: string;
            repr_ref: string;
            objects_polymer: Record<string, {ref: string; sequence: ResidueData[]}>;
            objects_ligand: Record<string, {ref: string}>;
        }> => {
            let asset_url: string;
            asset_url = `https://models.rcsb.org/${rcsb_id.toUpperCase()}.bcif`;
            const data = await this.ctx.builders.data.download(
                {
                    url: asset_url,
                    isBinary: true,
                    label: `${rcsb_id.toUpperCase()}`
                },
                {state: {isGhost: true}}
            );
            const trajectory = await this.ctx.builders.structure.parseTrajectory(data, 'mmcif');
            const model = await this.ctx.builders.structure.createModel(trajectory);
            const structure = await this.ctx.builders.structure.createStructure(model);

            //     structure,
            //     {
            //         type: 'cartoon',
            //         typeParams: {alpha: 0.01},
            //         color: 'sequence-id'
            //     },
            //     {tag: 'canvas'}
            // );

            const {components, representations, objects_polymer, objects_ligand} =
                await this.ctx.builders.structure.representation.applyPreset(
                    structure.ref,
                    'polymers-ligand-ribxz-theme',
                    {
                        structureId: rcsb_id,
                        nomenclature_map
                    }
                );

            this.representations.stylized_lighting();
            return {
                root_ref: structure.ref,
                repr_ref: structure.ref,
                objects_polymer,
                objects_ligand
            };
        }
    };

    residues = {
        select_residueCluster: (
            chain_residue_tuples: {
                auth_asym_id: string;
                auth_seq_id: number;
            }[]
        ) => {
            const expr = this.residues.selectionResidueClusterExpression(chain_residue_tuples);
            const data: any = this.ctx.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
            const sel = Script.getStructureSelection(expr, data);
            let loci = StructureSelection.toLociWithSourceUnits(sel);
            this.ctx.managers.structure.selection.clear();
            this.ctx.managers.structure.selection.fromLoci('add', loci);
            this.ctx.managers.camera.focusLoci(loci);
        },

        selectionResidueClusterExpression: (
            chain_residues_tuples_tuples: {
                auth_asym_id: string;
                auth_seq_id: number;
            }[]
        ): Expression => {
            const groups: Expression[] = [];
            for (var chain_residue_tuple of chain_residues_tuples_tuples) {
                groups.push(
                    MS.struct.generator.atomGroups({
                        'chain-test': MS.core.rel.eq([
                            MolScriptBuilder.struct.atomProperty.macromolecular.auth_asym_id(),
                            chain_residue_tuple.auth_asym_id
                        ]),
                        'residue-test': MS.core.rel.eq([
                            MolScriptBuilder.struct.atomProperty.macromolecular.auth_seq_id(),
                            chain_residue_tuple.auth_seq_id
                        ])
                    })
                );
            }
            var expression = MS.struct.combinator.merge(groups);
            return expression;
        },

        select_chain: (auth_asym_id: string, modifier: 'set' | 'add' | 'remove' | 'intersect') => {
            const data = this.ctx.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
            if (!data) return;
            const sel = Script.getStructureSelection(
                Q =>
                    Q.struct.generator.atomGroups({
                        'chain-test': Q.core.rel.eq([Q.struct.atomProperty.macromolecular.auth_asym_id(), auth_asym_id])
                    }),
                data
            );
            let loci = StructureSelection.toLociWithSourceUnits(sel);
            this.ctx.managers.structure.selection.fromLoci(modifier, loci);
        },
        select_expression: (auth_asym_id: string): Expression => {
            let expression = MS.struct.generator.atomGroups({
                'chain-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_asym_id(), auth_asym_id])
            });
            return expression;
        }
    };

    async get_selection_constituents(chemicalId: string | undefined, radius: number): Promise<any[]> {
        if (!chemicalId) {
            return [];
        }
        const RADIUS = radius;
        let structures = this.ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({
            structureRef,
            number: i + 1
        }));
        const struct = structures[0];
        const update = this.ctx.build();

        const ligand = MS.struct.filter.first([
            MS.struct.generator.atomGroups({
                'residue-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.label_comp_id(), chemicalId]),
                'group-by': MS.core.str.concat([
                    MS.struct.atomProperty.core.operatorName(),
                    MS.struct.atomProperty.macromolecular.residueKey()
                ])
            })
        ]);

        const surroundings = MS.struct.modifier.includeSurroundings({
            0: ligand,
            radius: RADIUS,
            'as-whole-residues': true
        });
        const surroundingsWithoutLigand = MS.struct.modifier.exceptBy({
            0: surroundings,
            by: ligand
        });

        const group = update
            .to(struct.structureRef.cell)
            .group(StateTransforms.Misc.CreateGroup, {label: `${chemicalId} Surroundins Group`}, {ref: 'surroundings'});
        const surroundingsSel = group.apply(
            StateTransforms.Model.StructureSelectionFromExpression,
            {
                label: `${chemicalId} Surroundings (${RADIUS} Å)`,
                expression: surroundingsWithoutLigand
            },
            {ref: 'surroundingsSel'}
        );

        surroundingsSel.apply(
            StateTransforms.Representation.StructureRepresentation3D,
            createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {
                type: 'ball-and-stick'
            }),
            {ref: 'surroundingsBallAndStick'}
        );
        surroundingsSel.apply(
            StateTransforms.Representation.StructureRepresentation3D,
            createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {
                type: 'label',
                typeParams: {level: 'residue'}
            }),
            {ref: 'surroundingsLabels'}
        );

        await PluginCommands.State.Update(this.ctx, {
            state: this.ctx.state.data,
            tree: update
        });

        const compiled2 = compile<StructureSelection>(surroundingsWithoutLigand);
        const selection2 = compiled2(new QueryContext(struct.structureRef.cell.obj?.data!));
        const loci = StructureSelection.toLociWithSourceUnits(selection2);

        const residueList: any[] = [];

        const struct_Element = StructureElement.Loci.toStructure(loci);
        Structure.eachAtomicHierarchyElement(struct_Element, {
            residue: loc => {
                residueList.push({
                    label_seq_id: StructureProperties.residue.label_seq_id(loc),
                    auth_seq_id: StructureProperties.residue.auth_seq_id(loc),

                    label_comp_id: StructureProperties.atom.label_comp_id(loc),
                    auth_asym_id: StructureProperties.chain.auth_asym_id(loc),
                    rcsb_id: StructureProperties.unit.model_entry_id(loc)
                });
            }
        });
        return residueList;
    }

    ligands = {
        create_surroundings: async (ref: string) => {
            const state = this.ctx.state.data;
            const cell = state.select(StateSelection.Generators.byRef(ref))[0];
            if (!cell?.obj) return;
            const loci = Structure.toStructureElementLoci(cell.obj.data);

            const x = StructureSelectionQueries.surroundings.expression;

            const surroundings = MS.struct.modifier.includeSurroundings({
                0: x,
                radius: 5,
                'as-whole-residues': true
            });

            let structures = this.ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({
                structureRef,
                number: i + 1
            }));

            const struct = structures[0];
            const update2 = this.ctx.build();
            const group2 = update2
                .to(struct.structureRef.cell)
                .group(StateTransforms.Misc.CreateGroup, {label: ` Surroundins Group`}, {ref: 'surroundings'});
            // Create surroundings selection and representations
            const surroundingsSel = group2.apply(
                StateTransforms.Model.StructureSelectionFromExpression,
                {
                    label: ` PTC Surroundings (5 Å)`,
                    expression: surroundings
                },
                {ref: 'surroundingsSel'}
            );
            surroundingsSel.apply(
                StateTransforms.Representation.StructureRepresentation3D,
                createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {
                    type: 'ball-and-stick'
                }),
                {ref: 'surroundingsBallAndStick'}
            );
            // surroundingsSel.apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, { type: 'label', typeParams: { level: 'residue' } }), { ref: 'surroundingsLabels' });
            await PluginCommands.State.Update(this.ctx, {
                state: this.ctx.state.data,
                tree: update2
            });
        },
        create_ligand_and_surroundings: async (chemicalId: string | undefined, radius: number) => {
            if (!chemicalId) {
                return this;
            }
            await this.ctx.dataTransaction(async () => {
                const RADIUS = radius;
                let structures = this.ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({
                    structureRef,
                    number: i + 1
                }));
                const struct = structures[0];
                const update = this.ctx.build();
                const ligand = MS.struct.filter.first([
                    MS.struct.generator.atomGroups({
                        'residue-test': MS.core.rel.eq([
                            MS.struct.atomProperty.macromolecular.label_comp_id(),
                            chemicalId
                        ]),
                        'group-by': MS.core.str.concat([
                            MS.struct.atomProperty.core.operatorName(),
                            MS.struct.atomProperty.macromolecular.residueKey()
                        ])
                    })
                ]);

                const surroundings = MS.struct.modifier.includeSurroundings({
                    0: ligand,
                    radius: radius,
                    'as-whole-residues': true
                });
                const surroundingsWithoutLigand = MS.struct.modifier.exceptBy({
                    0: surroundings,
                    by: ligand
                });

                // Create a group for both ligand and surroundings
                const group1 = update
                    .to(struct.structureRef.cell)
                    .group(StateTransforms.Misc.CreateGroup, {label: `${chemicalId} Ligand Group`}, {ref: 'ligand'});
                // Create ligand selection and representations
                const ligandSel = group1.apply(
                    StateTransforms.Model.StructureSelectionFromExpression,
                    {label: `${chemicalId} Ligand`, expression: ligand},
                    {ref: 'ligandSel'}
                );
                ligandSel.apply(
                    StateTransforms.Representation.StructureRepresentation3D,
                    createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {
                        type: 'ball-and-stick'
                    }),
                    {ref: 'ligandBallAndStick'}
                );
                ligandSel.apply(
                    StateTransforms.Representation.StructureRepresentation3D,
                    createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {
                        type: 'label',
                        typeParams: {level: 'residue'}
                    }),
                    {ref: 'ligandLabel'}
                );
                await PluginCommands.State.Update(this.ctx, {
                    state: this.ctx.state.data,
                    tree: update
                });

                const update2 = this.ctx.build();
                const group2 = update2
                    .to(struct.structureRef.cell)
                    .group(
                        StateTransforms.Misc.CreateGroup,
                        {label: `${chemicalId} Surroundins Group`},
                        {ref: 'surroundings'}
                    );
                // Create surroundings selection and representations
                const surroundingsSel = group2.apply(
                    StateTransforms.Model.StructureSelectionFromExpression,
                    {
                        label: `${chemicalId} Surroundings (${RADIUS} Å)`,
                        expression: surroundingsWithoutLigand
                    },
                    {ref: 'surroundingsSel'}
                );
                surroundingsSel.apply(
                    StateTransforms.Representation.StructureRepresentation3D,
                    createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {
                        type: 'ball-and-stick'
                    }),
                    {ref: 'surroundingsBallAndStick'}
                );
                // surroundingsSel.apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, { type: 'label', typeParams: { level: 'residue' } }), { ref: 'surroundingsLabels' });
                await PluginCommands.State.Update(this.ctx, {
                    state: this.ctx.state.data,
                    tree: update2
                });

                const ligand_selection = compile<StructureSelection>(ligand)(
                    new QueryContext(struct.structureRef.cell.obj?.data!)
                );
                let loci = StructureSelection.toLociWithSourceUnits(ligand_selection);
                this.ctx.managers.structure.selection.fromLoci('add', loci);
                this.ctx.managers.camera.focusLoci(loci);
            });
            return this;
        },

        select_focus_ligand_surroundings: async (
            chemicalId: string | undefined,
            radius: number,
            focus_select: Array<'focus' | 'select' | 'highlight'>
        ) => {
            const RADIUS = radius;
            let structures = this.ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({
                structureRef,
                number: i + 1
            }));
            const struct = structures[0];
            if (!chemicalId || !struct) {
                return this;
            }

            const ligand = MS.struct.filter.first([
                MS.struct.generator.atomGroups({
                    'residue-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.label_comp_id(), chemicalId]),
                    'group-by': MS.core.str.concat([
                        MS.struct.atomProperty.core.operatorName(),
                        MS.struct.atomProperty.macromolecular.residueKey()
                    ])
                })
            ]);
            const surroundings = MS.struct.modifier.includeSurroundings({
                0: ligand,
                radius: RADIUS,
                'as-whole-residues': true
            });
            const surroundingsWithoutLigand = MS.struct.modifier.exceptBy({
                0: surroundings,
                by: ligand
            });

            const surr_selection = compile<StructureSelection>(surroundingsWithoutLigand)(
                new QueryContext(struct.structureRef.cell.obj?.data!)
            );
            let loci = StructureSelection.toLociWithSourceUnits(surr_selection);

            if (focus_select.includes('focus')) {
                this.ctx.managers.camera.focusLoci(loci);
            }
            if (focus_select.includes('select')) {
                this.ctx.managers.structure.selection.clear();
                this.ctx.managers.structure.selection.fromLoci('add', loci);
            }
            if (focus_select.includes('highlight')) {
                this.ctx.managers.interactivity.lociHighlights.highlight({loci});
            }
        },

        create_ligand: async (chemicalId: string) => {
            await this.ctx.dataTransaction(async () => {
                let structures = this.ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({
                    structureRef,
                    number: i + 1
                }));
                const struct = structures[0];
                const update = this.ctx.build();

                const ligand = MS.struct.filter.first([
                    MS.struct.generator.atomGroups({
                        'residue-test': MS.core.rel.eq([
                            MS.struct.atomProperty.macromolecular.label_comp_id(),
                            chemicalId
                        ]),
                        'group-by': MS.core.str.concat([
                            MS.struct.atomProperty.core.operatorName(),
                            MS.struct.atomProperty.macromolecular.residueKey()
                        ])
                    })
                ]);

                const group = update
                    .to(struct.structureRef.cell)
                    .group(StateTransforms.Misc.CreateGroup, {label: 'ligand_group'}, {ref: `ligand_${chemicalId}`});
                const coreSel = group.apply(
                    StateTransforms.Model.StructureSelectionFromExpression,
                    {label: chemicalId, expression: ligand},
                    {ref: StateElements.HetGroupFocus}
                );

                coreSel.apply(
                    StateTransforms.Representation.StructureRepresentation3D,
                    createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {
                        type: 'ball-and-stick'
                    })
                );
                coreSel.apply(
                    StateTransforms.Representation.StructureRepresentation3D,
                    createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {
                        type: 'label',
                        typeParams: {level: 'residue'}
                    })
                );

                await PluginCommands.State.Update(this.ctx, {
                    state: this.ctx.state.data,
                    tree: update
                });

                // const compiled = ;
                const selection = compile<StructureSelection>(ligand)(
                    new QueryContext(struct.structureRef.cell.obj?.data!)
                );
                let loci = StructureSelection.toLociWithSourceUnits(selection);

                this.ctx.managers.structure.selection.clear();
                this.ctx.managers.structure.selection.fromLoci('add', loci);
                this.ctx.managers.camera.focusLoci(loci);
            });

            return this;
        }
    };

    representations = {
        makeTransparent: () => {
            const sel = MolScriptBuilder.struct.generator.all();
            const struct = this.ctx.managers.structure.hierarchy.current.structures[0];
            const repr = struct.components[0].representations[0].cell;

            const {selection} = StructureQueryHelper.createAndRun(struct.cell.obj!.data.root, sel);
            const bundle = StructureElement.Bundle.fromSelection(selection);
            const update = this.ctx.build();

            update.to(repr).apply(StateTransforms.Representation.TransparencyStructureRepresentation3DFromBundle, {
                layers: [{bundle, value: 0.1}]
            });

            return update.commit();
        },
        stylized_lighting: async () => {
            this.ctx.managers.structure.component.setOptions({
                ...this.ctx.managers.structure.component.state.options,
                ignoreLight: true
            });

            if (this.ctx.canvas3d) {
                const pp = this.ctx.canvas3d.props.postprocessing;
                this.ctx.canvas3d.setProps({
                    postprocessing: {
                        outline: {
                            name: 'on',
                            params:
                                pp.outline.name === 'on'
                                    ? pp.outline.params
                                    : {
                                          scale: 1,
                                          color: Color(0x000000),
                                          threshold: 0.33,
                                          // @ts-ignore
                                          includeTransparent: true
                                      }
                        },
                        occlusion: {
                            name: 'on',
                            params:
                                pp.occlusion.name === 'on'
                                    ? pp.occlusion.params
                                    : {
                                          // @ts-ignore
                                          multiScale: {
                                              name: 'off',
                                              params: {}
                                          },
                                          radius: 5,
                                          bias: 0.8,
                                          blurKernelSize: 15,
                                          blurDepthBias: 0.5,
                                          samples: 32,
                                          resolutionScale: 1,
                                          color: Color(0x000000)
                                      }
                        },
                        shadow: {name: 'off', params: {}}
                    }
                });
            }
        }
    };

    interactions = {
        // setColor: async (ref: string, color: string | number) => {
        //     // Convert color to numeric format if it's a string (hex or named color)
        //     const colorValue = 0xffffff;
        //     const state = this.ctx.state.data;
        //     const cell = state.select(StateSelection.Generators.byRef(ref))[0];
        //     if (!cell?.obj) return;

        //     const update = this.ctx.build();
        //     const representations = state.select(
        //         StateSelection.Generators.ofType(PluginStateObject.Molecule.Structure.Representation3D, ref)
        //     );

        //     for (const repr of representations) {
        //         if (!repr.transform.ref.includes(ref)) continue;
        //         update.to(repr).apply(StateTransforms.Representation.StructureRepresentation3D, {
        //             colorTheme: {
        //                 name: 'uniform',
        //                 params: {value: colorValue}
        //             }
        //         });
        //     }

        //     const cartoon = structure.representation.representations.polymer;

        //     const updateTheme = await this.ctx.build().to(cartoon).update(reprParamsStructureResetColor);

        //     await updateTheme.commit();
        // },

        setSubtreeVisibility: (ref: string, is_visible: boolean) => {
            setSubtreeVisibility(this.ctx.state.data, ref, !is_visible);
        },
        focus: (ref: string) => {
            const state = this.ctx.state.data;
            const cell = state.select(StateSelection.Generators.byRef(ref))[0];
            if (!cell?.obj) return;
            const loci = Structure.toStructureElementLoci(cell.obj.data);
            this.ctx.managers.camera.focusLoci(loci);
            return;
        },
        highlight: (ref: string) => {
            const state = this.ctx.state.data;
            const cell = state.select(StateSelection.Generators.byRef(ref))[0];
            if (!cell?.obj) return;
            const loci = Structure.toStructureElementLoci(cell.obj.data);
            this.ctx.managers.interactivity.lociHighlights.highlight({loci});
            return;
        },
        selection: (ref: string, modifier: 'add' | 'remove') => {
            console.log('selection', ref, modifier);
            const state = this.ctx.state.data;
            const state_sel = state.select(StateSelection.Generators.byRef(ref));
            const cell = state_sel[0];
            if (!cell?.obj) return;
            const loci = Structure.toStructureElementLoci(cell.obj.data);
            this.ctx.managers.structure.selection.fromLoci(modifier, loci);
            return;
        },
        select_residues: (parent_ref: string, residues: ResidueData[], modifier: 'add' | 'remove' | 'set') => {
            type ResiduesByParent = Map<string, ResidueData[]>;
            function groupResiduesByParent(residues: ResidueData[]): ResiduesByParent {
                return residues.reduce((groups, residue) => {
                    const existing = groups.get(parent_ref) || [];
                    groups.set(parent_ref, [...existing, residue]);
                    return groups;
                }, new Map<string, ResidueData[]>());
            }
            const res_grouped_by_ref = groupResiduesByParent(residues);
            res_grouped_by_ref.forEach((residues, parentComponentRef) => {
                const groups: Expression[] = [];
                for (var residue of residues) {
                    groups.push(
                        MolScriptBuilder.struct.generator.atomGroups({
                            'residue-test': MolScriptBuilder.core.rel.eq([
                                MolScriptBuilder.struct.atomProperty.macromolecular.auth_seq_id(),
                                residue[1]
                            ])
                        })
                    );
                }
                const expression = MolScriptBuilder.struct.combinator.merge(groups);
                const cell = this.ctx.state.data.select(StateSelection.Generators.byRef(parentComponentRef))[0];
                const data = cell.obj?.data!;
                const sel = Script.getStructureSelection(expression, data);
                let loci = StructureSelection.toLociWithSourceUnits(sel);
                this.ctx.managers.structure.selection.fromLoci(modifier, loci);
                if (data === undefined) {
                    return;
                }
            });
        }
    };

    experimental = {
        ___cylinder_residues: async (
            struct_ref: string,
            data: {[chain: string]: number[]},
            nomenclature_map: Record<string, string>
        ) => {
            const structures = this.ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({
                structureRef,
                number: i + 1
            }));
            const struct = structures[0];
            const update = this.ctx.build();

            // Create a group for the cylinder representation
            const group = update
                .to(struct.structureRef.cell)
                .group(StateTransforms.Misc.CreateGroup, {label: 'Cylinder Residues'}, {ref: 'cylinder_group'});

            // Create selections for each chain
            for (const chain in data) {
                // Create residue expressions for each residue in the chain
                const residueExpressions = data[chain].map(residue =>
                    MS.struct.generator.atomGroups({
                        'chain-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_asym_id(), chain]),
                        'residue-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_seq_id(), residue])
                    })
                );

                // Merge all residue expressions for this chain
                const chainExpr = MS.struct.combinator.merge(residueExpressions);
                const chainSel = group.apply(
                    StateTransforms.Model.StructureSelectionFromExpression,
                    {
                        label: `Chain ${chain}`,
                        expression: chainExpr
                    },
                    {ref: `chain_sel_${chain}`}
                );

                // Apply representation with the color from your scheme
                chainSel.apply(
                    StateTransforms.Representation.StructureRepresentation3D,
                    createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {
                        type: 'cartoon',
                        color: 'uniform',
                        colorParams: {
                            // @ts-ignore
                            value: PolymerColorschemeWarm[nomenclature_map[chain]]
                            // value: Color(0xfafafa)
                        }
                    }),
                    {ref: `repr_chain_${chain}`}
                );

                // chainSel.apply(
                //     StateTransforms.Representation.StructureRepresentation3D,
                //     createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {
                //         type: 'point',
                //         color: 'uniform',
                //         typeParams: {
                //             emissive: 0.15,
                //             pointStyle: 'square',
                //             sizeFactor: 10
                //          },
                //         colorParams: {
                //             value: PolymerColorschemeWarm[nomenclature_map[chain]]
                //         }
                //     }),
                //     {ref: `repr_chain_${chain}`}
                // );
            }

            await PluginCommands.State.Update(this.ctx, {
                state: this.ctx.state.data,
                tree: update
            });

            // Apply post-processing effects
            this.ctx.managers.structure.component.setOptions({
                ...this.ctx.managers.structure.component.state.options,
                ignoreLight: true
            });

            if (this.ctx.canvas3d) {
                const pp = this.ctx.canvas3d.props.postprocessing;
                this.ctx.canvas3d.setProps({
                    postprocessing: {
                        outline: {
                            name: 'on',
                            params:
                                pp.outline.name === 'on'
                                    ? pp.outline.params
                                    : {scale: 1, color: Color(0x000000), threshold: 0.33}
                        },
                        occlusion: {
                            name: 'on',
                            params:
                                pp.occlusion.name === 'on'
                                    ? pp.occlusion.params
                                    : {
                                          bias: 0.8,
                                          blurKernelSize: 15,
                                          radius: 5,
                                          samples: 32,
                                          resolutionScale: 1
                                      }
                        }
                    }
                });
            }
        },
        cylinder_residues: async (
            struct_ref: string,
            data: {[chain: string]: number[]},
            nomenclature_map: Record<string, string>
        ) => {
            const cluster = [];
            for (var chain in data) {
                for (var residue of data[chain]) {
                    cluster.push({auth_asym_id: chain, auth_seq_id: residue});
                }
            }

            // const state = this.ctx.state.data;
            // const cell = state.select(StateSelection.Generators.byRef(struct_ref))[0];
            const expr = this.residues.selectionResidueClusterExpression(cluster);
            let structures = this.ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({
                structureRef,
                number: i + 1
            }));
            const struct = structures[0];
            const update = this.ctx.build();
            const group = update
                .to(struct.structureRef.cell)
                .group(StateTransforms.Misc.CreateGroup, {label: 'somelavle'}, {ref: `somelalb`});

            const chain_sel = group.apply(
                StateTransforms.Model.StructureSelectionFromExpression,
                {label: 'some', expression: expr},
                {ref: 'any'}
            );
            chain_sel.apply(
                StateTransforms.Representation.StructureRepresentation3D,
                createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {
                    type: 'cartoon',
                    color: 'uniform',
                    colorParams: {
                        // @ts-ignore
                        value: PolymerColorschemeWarm[nomenclature_map[chain]]
                        // value: Color(0xfafafa)
                    }
                }),
                {ref: `repr_any_cartoon`}
            );

            // chain_sel.apply(
            //     StateTransforms.Representation.StructureRepresentation3D,
            //     createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {
            //             type: 'point',
            //             color: 'uniform',
            //             typeParams: {
            //                 emissive: 0.15,
            //                 pointStyle: 'square',
            //                 sizeFactor: 10
            //              },
            //             colorParams: {
            //                 value: PolymerColorschemeWarm[nomenclature_map[chain]]
            //             }
            //         }),
            //     {ref: `repr_any_cartoon`}
            // );
            await PluginCommands.State.Update(this.ctx, {
                state: this.ctx.state.data,
                tree: update
            });

            this.ctx.managers.structure.component.setOptions({
                ...this.ctx.managers.structure.component.state.options,
                ignoreLight: true
            });
            if (this.ctx.canvas3d) {
                const pp = this.ctx.canvas3d.props.postprocessing;
                this.ctx.canvas3d.setProps({
                    postprocessing: {
                        outline: {
                            name: 'on',
                            params:
                                pp.outline.name === 'on'
                                    ? pp.outline.params
                                    : {scale: 1, color: Color(0x000000), threshold: 0.33}
                        },
                        occlusion: {
                            name: 'on',
                            params:
                                pp.occlusion.name === 'on'
                                    ? pp.occlusion.params
                                    : {
                                          bias: 0.8,
                                          blurKernelSize: 15,
                                          radius: 5,
                                          samples: 32,
                                          resolutionScale: 1
                                      }
                        }
                    }
                });
            }
        }
    };

    setupHoverEvent(ctx: PluginUIContext, targetElement: HTMLElement) {
        const hoverEvent = new MouseEvent('molstar.hover', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        const mouseOutEvent = new MouseEvent('molstar.mouseout', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        function getElementDetails(location: StructureElement.Location) {
            return {
                entity_id: StructureProperties.chain.label_entity_id(location),
                label_asym_id: StructureProperties.chain.label_asym_id(location),
                auth_asym_id: StructureProperties.chain.auth_asym_id(location),
                seq_id: StructureProperties.residue.label_seq_id(location),
                auth_seq_id: StructureProperties.residue.auth_seq_id(location),
                comp_id: StructureProperties.atom.label_comp_id(location)
            };
        }

        function getLociDetails(loci: any) {
            if (loci.kind === 'element-loci') {
                const stats = StructureElement.Stats.ofLoci(loci);
                const {elementCount, residueCount, chainCount} = stats;

                if (elementCount === 1 && residueCount === 0 && chainCount === 0) {
                    return getElementDetails(stats.firstElementLoc);
                } else if (elementCount === 0 && residueCount === 1 && chainCount === 0) {
                    return getElementDetails(stats.firstResidueLoc);
                }
            }
            return undefined;
        }
        ctx.behaviors.interaction.hover.pipe(debounceTime(200)).subscribe((e: InteractivityManager.HoverEvent) => {
            if (e.current && e.current.loci && e.current.loci.kind !== 'empty-loci') {
                const eventData = getLociDetails(e.current.loci);
                if (eventData) {
                    (hoverEvent as any).eventData = eventData;
                    targetElement.dispatchEvent(hoverEvent);
                }
            } else {
                targetElement.dispatchEvent(mouseOutEvent);
            }
        });
    }
}
