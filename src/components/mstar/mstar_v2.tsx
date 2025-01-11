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
import {StateObjectCell, StateObjectSelector, StateSelection} from 'molstar/lib/mol-state';
import {setSubtreeVisibility} from 'molstar/lib/mol-plugin/behavior/static/state';
import {StructureSelectionQueries} from 'molstar/lib/mol-plugin-state/helpers/structure-selection-query';

import {debounceTime} from 'rxjs/operators';
import {InteractivityManager} from 'molstar/lib/mol-plugin-state/manager/interactivity';
import {ResidueData} from '@/app/components/sequence_viewer';
import {Asset} from 'molstar/lib/mol-util/assets';
import {Loci} from 'molstar/lib/mol-model/loci';
import PolymerColorschemeWarm from './providers/colorschemes/colorscheme_warm';
import {ArbitraryCylinderRepresentationProvider} from './providers/cylinder_provider';

export type ResidueSummary = {
    label_seq_id: number | null | undefined;
    label_comp_id: string | null | undefined;
    auth_seq_id: number;
    auth_asym_id: string;
    rcsb_id: string;
};
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
        },
        create_from_selection: async (selection: StateObjectSelector) => {}
    };

    residues = {
        select_residue_cluster: (
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
        }
    };

    async get_selection_constituents(
        struct_ref: string,
        chemicalId: string | undefined,
        radius: number
    ): Promise<Omit<ResidueSummary, 'polymer_class'>[]> {
        if (!chemicalId) {
            return [];
        }
        const RADIUS = radius;
        // let structures = this.ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({
        //     structureRef,
        //     number: i + 1
        // }));
        // const struct = structures[0];
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

        const state = this.ctx.state.data;
        const cell = state.select(StateSelection.Generators.byRef(struct_ref))[0];

        const group = update
            .to(cell)
            .group(StateTransforms.Misc.CreateGroup, {label: `${chemicalId} Surroundins Group`}, {ref: 'surroundings'});
        const surroundingsSel = group.apply(
            StateTransforms.Model.StructureSelectionFromExpression,
            {
                label: `${chemicalId} Surroundings (${RADIUS} Å)`,
                expression: surroundingsWithoutLigand
            },
            {ref: 'surroundingsSel'}
        );

        // surroundingsSel.apply(
        //     StateTransforms.Representation.StructureRepresentation3D,
        //     createStructureRepresentationParams(this.ctx, cell.obj?.data, {
        //         type: 'ball-and-stick'
        //     }),
        //     {ref: 'surroundingsBallAndStick'}
        // );
        // surroundingsSel.apply(
        //     StateTransforms.Representation.StructureRepresentation3D,
        //     createStructureRepresentationParams(this.ctx, cell.obj?.data, {
        //         type: 'label',
        //         typeParams: {level: 'residue'}
        //     }),
        //     {ref: 'surroundingsLabels'}
        // );

        await PluginCommands.State.Update(this.ctx, {
            state: this.ctx.state.data,
            tree: update
        });

        const compiled2 = compile<StructureSelection>(surroundingsWithoutLigand);
        const selection2 = compiled2(new QueryContext(cell.obj?.data!));
        const loci = StructureSelection.toLociWithSourceUnits(selection2);

        const residueList: any[] = [];

        const struct_Element = StructureElement.Loci.toStructure(loci);
        Structure.eachAtomicHierarchyElement(struct_Element, {
            residue: loc => {
                residueList.push({
                    label_seq_id: StructureProperties.residue.label_seq_id(loc),
                    label_comp_id: StructureProperties.atom.label_comp_id(loc),
                    auth_seq_id: StructureProperties.residue.auth_seq_id(loc),
                    auth_asym_id: StructureProperties.chain.auth_asym_id(loc),
                    rcsb_id: StructureProperties.unit.model_entry_id(loc)
                });
            }
        });
        // console.log('Residue List', residueList);

        return residueList;
    }

    ligands = {
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
        },
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

        createBindingSiteComponent: async (
            cell: StateObjectCell,
            residues: {auth_asym_id: string; auth_seq_id: number}[],
            componentId: string,
            nomenclature_map: Record<string, string>
        ) => {
            const ctx = this.ctx;
            const update = ctx.build();

            // Group residues by chain
            const residuesByChain = residues.reduce((acc, residue) => {
                if (!acc[residue.auth_asym_id]) {
                    acc[residue.auth_asym_id] = [];
                }
                acc[residue.auth_asym_id].push(residue);
                return acc;
            }, {} as Record<string, typeof residues>);

            // Create bsite group
            const bsiteGroup = update
                .to(cell)
                .group(
                    StateTransforms.Misc.CreateGroup,
                    {label: `${componentId} Binding Site`},
                    {ref: `${componentId}_bsite_group`}
                );

            // Create expressions for each chain's residues
            const chainExpressions = Object.entries(residuesByChain).map(([chain, residues]) => {
                const residueExpressions = residues.map(r =>
                    MS.struct.generator.atomGroups({
                        'chain-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_asym_id(), chain]),
                        'residue-test': MS.core.rel.eq([
                            MS.struct.atomProperty.macromolecular.auth_seq_id(),
                            r.auth_seq_id
                        ])
                    })
                );
                return {
                    chain,
                    expression: MS.struct.combinator.merge(residueExpressions)
                };
            });

            // Combine all expressions
            const combinedExpr = MS.struct.combinator.merge(chainExpressions.map(ce => ce.expression));

            // Create selection
            const bsiteSel = bsiteGroup.apply(
                StateTransforms.Model.StructureSelectionFromExpression,
                {
                    label: `${componentId} Binding Site Selection`,
                    expression: combinedExpr
                },
                {ref: `${componentId}_bsite_sel`}
            );

            // Create a representation for each chain with correct color
            for (const {chain} of chainExpressions) {
                bsiteSel.apply(
                    StateTransforms.Representation.StructureRepresentation3D,
                    createStructureRepresentationParams(ctx, cell.obj?.data, {
                        type: 'ball-and-stick',
                        color: 'uniform',
                        colorParams: {
                            value: PolymerColorschemeWarm[
                                nomenclature_map[chain] as keyof typeof PolymerColorschemeWarm
                            ]
                        }
                    }),
                    {ref: `${componentId}_bsite_repr_${chain}`}
                );
            }

            await PluginCommands.State.Update(ctx, {
                state: ctx.state.data,
                tree: update
            });

            return {
                ref: `${componentId}_bsite_group`,
                sel_ref: `${componentId}_bsite_sel`,
                repr_ref: `${componentId}_bsite_repr_ball-and-stick`
            };
        },

        create_ligand_and_surroundings: async (
            chemicalId: string | undefined,
            radius: number,
            nomenclature_map: Record<string, string>
        ) => {
            if (!chemicalId) return undefined;

            const refs = {
                [chemicalId]: {
                    ref: `${chemicalId}_group`,
                    sel_ref: `${chemicalId}_sel`,
                    repr_ref: `${chemicalId}_repr_ball-and-stick`
                }
            };

            await this.ctx.dataTransaction(async () => {
                const structures = this.ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({
                    structureRef,
                    number: i + 1
                }));
                const struct = structures[0];
                const update = this.ctx.build();

                // Ligand expression creation
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

                // Create ligand group
                const ligandGroup = update
                    .to(struct.structureRef.cell)
                    .group(
                        StateTransforms.Misc.CreateGroup,
                        {label: `${chemicalId} Ligand Group`},
                        {ref: refs[chemicalId].ref}
                    );

                const ligandSel = ligandGroup.apply(
                    StateTransforms.Model.StructureSelectionFromExpression,
                    {label: `${chemicalId} Ligand`, expression: ligand},
                    {ref: refs[chemicalId].sel_ref}
                );

                ligandSel.apply(
                    StateTransforms.Representation.StructureRepresentation3D,
                    createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {
                        type: 'ball-and-stick'
                    }),
                    {ref: refs[chemicalId].repr_ref}
                );

                await PluginCommands.State.Update(this.ctx, {
                    state: this.ctx.state.data,
                    tree: update
                });

                // Get surroundings residues
                const compiled = compile<StructureSelection>(surroundingsWithoutLigand)(
                    new QueryContext(struct.structureRef.cell.obj?.data!)
                );
                const surroundingsLoci = StructureSelection.toLociWithSourceUnits(compiled);

                // Convert loci to residue list
                const surroundingResidues: {auth_asym_id: string; auth_seq_id: number}[] = [];
                const struct_Element = StructureElement.Loci.toStructure(surroundingsLoci);

                Structure.eachAtomicHierarchyElement(struct_Element, {
                    residue: loc => {
                        surroundingResidues.push({
                            auth_asym_id: StructureProperties.chain.auth_asym_id(loc),
                            auth_seq_id: StructureProperties.residue.auth_seq_id(loc)
                        });
                    }
                });

                // Create binding site using helper
                const bsiteRefs = await this.ligands.createBindingSiteComponent(
                    struct.structureRef.cell,
                    surroundingResidues,
                    chemicalId,
                    nomenclature_map
                );

                refs[`${chemicalId}_bsite`] = bsiteRefs;
            });

            return refs;
        },

        create_from_prediction_data: async (
            root_ref: string,
            prediction_data: ResidueSummary[],
            nomenclature_map: Record<string, string>
        ) => {
            const cell = this.ctx.state.data.select(StateSelection.Generators.byRef(root_ref))[0];

            const residues = prediction_data.map(r => ({
                auth_asym_id: r.auth_asym_id,
                auth_seq_id: r.auth_seq_id
            }));

            return await this.ligands.createBindingSiteComponent(cell, residues, 'predicted_bsite', nomenclature_map);
        },

        // create_ligand_and_surroundings: async (chemicalId: string | undefined, radius: number) => {
        //     if (!chemicalId) {
        //         return undefined;
        //     }

        //     // Create an object to store our refs with the new naming scheme
        //     const refs = {
        //         [chemicalId]: {
        //             ref: `${chemicalId}_group`,
        //             sel_ref: `${chemicalId}_sel`,
        //             repr_ref: `${chemicalId}_repr_ball-and-stick`
        //         },
        //         [`${chemicalId}_bsite`]: {
        //             ref: `${chemicalId}_bsite_group`,
        //             sel_ref: `${chemicalId}_bsite_sel`,
        //             repr_ref: `${chemicalId}_bsite_repr_ball-and-stick`
        //         }
        //     };

        //     await this.ctx.dataTransaction(async () => {
        //         const RADIUS = radius;
        //         let structures = this.ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({
        //             structureRef,
        //             number: i + 1
        //         }));
        //         const struct = structures[0];
        //         const update = this.ctx.build();

        //         // Ligand expression creation
        //         const ligand = MS.struct.filter.first([
        //             MS.struct.generator.atomGroups({
        //                 'residue-test': MS.core.rel.eq([
        //                     MS.struct.atomProperty.macromolecular.label_comp_id(),
        //                     chemicalId
        //                 ]),
        //                 'group-by': MS.core.str.concat([
        //                     MS.struct.atomProperty.core.operatorName(),
        //                     MS.struct.atomProperty.macromolecular.residueKey()
        //                 ])
        //             })
        //         ]);

        //         const surroundings = MS.struct.modifier.includeSurroundings({
        //             0: ligand,
        //             radius: radius,
        //             'as-whole-residues': true
        //         });
        //         const surroundingsWithoutLigand = MS.struct.modifier.exceptBy({
        //             0: surroundings,
        //             by: ligand
        //         });

        //         // Create ligand group with new ref naming
        //         const group1 = update
        //             .to(struct.structureRef.cell)
        //             .group(
        //                 StateTransforms.Misc.CreateGroup,
        //                 {label: `${chemicalId} Ligand Group`},
        //                 {ref: refs[chemicalId].ref}
        //             );

        //         const ligandSel = group1.apply(
        //             StateTransforms.Model.StructureSelectionFromExpression,
        //             {label: `${chemicalId} Ligand`, expression: ligand},
        //             {ref: refs[chemicalId].sel_ref}
        //         );

        //         ligandSel.apply(
        //             StateTransforms.Representation.StructureRepresentation3D,
        //             createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {
        //                 type: 'ball-and-stick'
        //             }),
        //             {ref: refs[chemicalId].repr_ref}
        //         );

        //         await PluginCommands.State.Update(this.ctx, {
        //             state: this.ctx.state.data,
        //             tree: update
        //         });

        //         // Create surroundings group with new ref naming
        //         const update2 = this.ctx.build();
        //         const group2 = update2
        //             .to(struct.structureRef.cell)
        //             .group(
        //                 StateTransforms.Misc.CreateGroup,
        //                 {label: `${chemicalId} Binding Site`},
        //                 {ref: refs[`${chemicalId}_bsite`].ref}
        //             );

        //         // Create surroundings selection with new ref naming
        //         const surroundingsSel = group2.apply(
        //             StateTransforms.Model.StructureSelectionFromExpression,
        //             {
        //                 label: `${chemicalId} Binding Site (${RADIUS} Å)`,
        //                 expression: surroundingsWithoutLigand
        //             },
        //             {ref: refs[`${chemicalId}_bsite`].sel_ref}
        //         );

        //         // Create surroundings representation with new ref naming
        //         surroundingsSel.apply(
        //             StateTransforms.Representation.StructureRepresentation3D,
        //             createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {
        //                 type: 'ball-and-stick'
        //             }),
        //             {ref: refs[`${chemicalId}_bsite`].repr_ref}
        //         );

        //         await PluginCommands.State.Update(this.ctx, {
        //             state: this.ctx.state.data,
        //             tree: update2
        //         });

        //         const ligand_selection = compile<StructureSelection>(ligand)(
        //             new QueryContext(struct.structureRef.cell.obj?.data!)
        //         );
        //         let loci = StructureSelection.toLociWithSourceUnits(ligand_selection);
        //         this.ctx.managers.structure.selection.fromLoci('add', loci);
        //         this.ctx.managers.camera.focusLoci(loci);
        //     });
        //     return refs;
        // },
        // create_from_prediction_data: async (
        //     root_ref: string,
        //     prediction_data: ResidueSummary[],
        //     nomenclature_map: Record<string, string>
        // ) => {
        //     // Group residues by chain
        //     const residuesByChain = prediction_data.reduce((acc, residue) => {
        //         if (!acc[residue.auth_asym_id]) {
        //             acc[residue.auth_asym_id] = [];
        //         }
        //         acc[residue.auth_asym_id].push({
        //             auth_asym_id: residue.auth_asym_id,
        //             auth_seq_id: residue.auth_seq_id
        //         });
        //         return acc;
        //     }, {} as Record<string, {auth_asym_id: string; auth_seq_id: number}[]>);

        //     const chainExpressions = Object.entries(residuesByChain).map(([chain, residues]) => {
        //         const residueExpressions = residues.map(r =>
        //             MS.struct.generator.atomGroups({
        //                 'chain-test': MS.core.rel.eq([
        //                     MS.struct.atomProperty.macromolecular.auth_asym_id(),
        //                     r.auth_asym_id
        //                 ]),
        //                 'residue-test': MS.core.rel.eq([
        //                     MS.struct.atomProperty.macromolecular.auth_seq_id(),
        //                     r.auth_seq_id
        //                 ])
        //             })
        //         );
        //         return {
        //             chain,
        //             expression: MS.struct.combinator.merge(residueExpressions)
        //         };
        //     });

        //     // Create separate components for each chain to maintain colors
        //     const state = this.ctx.state.data;
        //     const cell = state.select(StateSelection.Generators.byRef(root_ref))[0];
        //     const update = this.ctx.build();

        //     const components: {ref: string; chain: string}[] = [];

        //     for (const {chain, expression} of chainExpressions) {
        //         const component = await this.ctx.builders.structure.tryCreateComponentFromExpression(
        //             root_ref,
        //             expression,
        //             `predicted-binding-site-${chain}`,
        //             {
        //                 label: `Predicted Binding Site ${chain}`,
        //                 tags: ['predicted-binding-site', chain]
        //             }
        //         );

        //         if (component) {
        //             // Add representation with the chain's color from nomenclature map
        //             const representation = await this.ctx.builders.structure.representation.addRepresentation(
        //                 component,
        //                 {
        //                     type: 'ball-and-stick',
        //                     color: 'uniform',
        //                     colorParams: {
        //                         value: PolymerColorschemeWarm[
        //                             nomenclature_map[chain] as keyof typeof PolymerColorschemeWarm
        //                         ]
        //                     }
        //                 }
        //             );

        //             components.push({
        //                 ref: component.ref,
        //                 chain
        //             });
        //         }
        //     }

        //     await update.commit();

        //     return components;
        // },

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

        //!  this method covers the molstar_sync residue selections across multiple chains
        select_residues: (parent_polymer_ref: string, residues: ResidueData[], modifier: 'add' | 'remove' | 'set') => {
            type ResiduesByParent = Map<string, ResidueData[]>;
            function groupResiduesByParent(residues: ResidueData[]): ResiduesByParent {
                return residues.reduce((groups, residue) => {
                    const existing = groups.get(parent_polymer_ref) || [];
                    groups.set(parent_polymer_ref, [...existing, residue]);
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

    cell_from_ref = (ref: string): StateObjectCell => {
        const state = this.ctx.state.data;
        const cell = state.select(StateSelection.Generators.byRef(ref))[0];
        return cell;
    };
    loci_from_ref = (ref: string): Loci | undefined => {
        const state = this.ctx.state.data;
        const state_sel = state.select(StateSelection.Generators.byRef(ref));
        const cell = state_sel[0];
        if (!cell?.obj) return;
        return Structure.toStructureElementLoci(cell.obj.data);
    };
}
