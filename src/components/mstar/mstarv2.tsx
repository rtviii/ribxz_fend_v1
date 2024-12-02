import {createPluginUI} from 'molstar/lib/mol-plugin-ui';
import {PluginUIContext} from 'molstar/lib/mol-plugin-ui/context';
import {ArbitrarySphereRepresentationProvider} from './providers/sphere_provider';
import {renderReact18} from 'molstar/lib/mol-plugin-ui/react18';
import {PluginUISpec} from 'molstar/lib/mol-plugin-ui/spec';
import {ribxzSpec} from './lib';
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
import {StateElements} from './molstar_ribxz';

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
        this.ctx = await createPluginUI({
            target: parent,
            spec: spec,
            render: renderReact18
        });
        this.ctx.representation.structure.registry.add(ArbitrarySphereRepresentationProvider);
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
    }

    components = {
        upload_mmcif_structure: async (
            rcsb_id: string,
            nomenclature_map:Record<string,string>
        ): Promise<{
            root_ref: string;
            repr_ref: string;
            components: {
                ligand: LigandComponent[];
                polymer: PolymerComponent[];
            };
        }> => {
            let asset_url: string;
            let structure_components = {
                ligand: [],
                polymer: []
            };


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
            const model      = await this.ctx.builders.structure.createModel(trajectory);
            const structure  = await this.ctx.builders.structure.createStructure(model);

            console.log(this.ctx.builders.structure.representation);
            const {components, representations, metadata} = await this.ctx.builders.structure.representation.applyPreset(structure.ref, 'polymers-ligand-ribxz-theme', {
                    structureId: rcsb_id,
                    nomenclature_map 
                });

            structure_components = metadata;
            this.representations.stylized_lighting();
            return {
                root_ref: structure.ref,
                repr_ref: structure.ref,
                components: structure_components
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

    async get_selection_constituents(chemicalId: string | undefined, radius: number): Promise<ResidueList> {
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

        const residueList: ResidueList = [];

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
}
