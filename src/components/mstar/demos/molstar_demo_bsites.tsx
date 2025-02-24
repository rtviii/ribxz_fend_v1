import {MolScriptBuilder as MS, MolScriptBuilder} from 'molstar/lib/mol-script/language/builder';
import {Queries, StructureQuery, StructureSelection} from 'molstar/lib/mol-model/structure';
import {Structure, StructureElement, StructureProperties} from 'molstar/lib/mol-model/structure/structure';
import {StructureSelectionQuery} from 'molstar/lib/mol-plugin-state/helpers/structure-selection-query';
import {StateObjectRef, StateObjectSelector} from 'molstar/lib/mol-state/object';
import {compile} from 'molstar/lib/mol-script/runtime/query/compiler';
import {QueryContext} from 'molstar/lib/mol-model/structure/query/context';
import {Expression} from 'molstar/lib/mol-script/language/expression';
import {createStructureRepresentationParams} from 'molstar/lib/mol-plugin-state/helpers/structure-representation-params';
import {PluginCommands} from 'molstar/lib/mol-plugin/commands';
import {createPluginUI} from 'molstar/lib/mol-plugin-ui';
import {PluginUIContext} from 'molstar/lib/mol-plugin-ui/context';
import {renderReact18} from 'molstar/lib/mol-plugin-ui/react18';
import 'molstar/lib/mol-plugin-ui/skin/light.scss';
import {StateTransforms} from 'molstar/lib/mol-plugin-state/transforms';
import _, {range} from 'lodash';
import {Script} from 'molstar/lib/mol-script/script';
import {Color} from 'molstar/lib/mol-util/color/color';
import {setSubtreeVisibility} from 'molstar/lib/mol-plugin/behavior/static/state';
import {ArbitrarySphereRepresentationProvider} from '../providers/arbitrary_sphere_provider';
import {PluginUISpec} from 'molstar/lib/mol-plugin-ui/spec';
import '../mstar.css';
import {ThemeDataContext} from 'molstar/lib/mol-theme/theme';
import {CustomElementProperty} from 'molstar/lib/mol-model-props/common/custom-element-property';
import {Model, ElementIndex} from 'molstar/lib/mol-model/structure';
import {VaryingResidueColorThemeProvider} from './color-scheme';
import {ribxzMstarv2} from '../mstar_v2';
import {bindingSitesPreset, compositeBSitesPreset} from '@/app/homepage/bsite_preset';
import {SplitPolymerPreset} from '../providers/polymer_preset';

export interface ScoredBsite {
    [chain_auth_asym_id: string]: {[auth_seq_id: number]: number};
}

export const BsiteResidues = CustomElementProperty.create<number>({
    label: 'Composite Binding Site',
    name: 'binding-site-demo',
    getData(model: Model) {
        const map = new Map<ElementIndex, number>();
        const residueIndex = model.atomicHierarchy.residueAtomSegments.index;
        for (let i = 0, _i = model.atomicHierarchy.atoms._rowCount; i < _i; i++) {
            map.set(i as ElementIndex, residueIndex[i] % 2);
        }
        return {value: map};
    },
    coloring: {
        getColor(e) {
            return e === 0 ? Color(0xff0000) : Color(0x0000ff);
        },
        defaultColor: Color(0x777777)
    },
    getLabel(e) {
        return e === 0 ? 'Odd stripe' : 'Even stripe';
    }
});

_.memoize.Cache = WeakMap;
export class MolstarDemoBsites extends ribxzMstarv2 {
    //@ts-ignore
    ctx: PluginUIContext;
    constructor() {
        super();
    }
    async init(parent: HTMLElement, spec: PluginUISpec) {
        this.ctx = await createPluginUI({
            target: parent,
            spec: spec,
            render: renderReact18
        });

        this.ctx.representation.structure.themes.colorThemeRegistry.add(VaryingResidueColorThemeProvider);
        this.ctx.builders.structure.representation.registerPreset(bindingSitesPreset);
        this.ctx.builders.structure.representation.registerPreset(SplitPolymerPreset);
        this.ctx.builders.structure.representation.registerPreset(compositeBSitesPreset);
        this.ctx.representation.structure.registry.add(ArbitrarySphereRepresentationProvider);
        this.ctx.canvas3d?.setProps({
            camera: {helper: {axes: {name: 'off', params: {}}}}
        });

        // ! set bg color to white
        const rendererParams: any = {
            backgroundColor: Color.fromRgb(255, 255, 255)
        };
        const renderer = this.ctx.canvas3d?.props.renderer;
        PluginCommands.Canvas3D.SetSettings(this.ctx, {
            settings: {renderer: {...renderer, ...rendererParams}}
        });
    }

    async renderPTC(rcsb_id: string) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_URL}/structures/ptc?rcsb_id=${rcsb_id}`);
        const data = await response.json();
        let [x, y, z] = data['midpoint_coordinates'];
        let sphere = {x: x, y: y, z: z, radius: 5, color: 'blue'};

        const structureRef = this.ctx.managers.structure.hierarchy.current.structures[0]?.cell.transform.ref;
        this.ctx.builders.structure.representation.addRepresentation(structureRef, {
            type: 'arbitrary-sphere' as any,
            typeParams: sphere,
            colorParams: sphere.color ? {value: sphere.color} : void 0
        });
    }

    applyBsiteColors = async (bsite: ScoredBsite) => {
        this.ctx.dataTransaction(async () => {
            for (const s of this.ctx.managers.structure.hierarchy.current.structures) {
                var sites: {auth_asym_id: string; auth_seq_id: number}[] = [];
                for (var chain of Object.keys(bsite)) {
                    for (var auth_seq_id of Object.keys(bsite[chain])) {
                        sites.push({
                            auth_asym_id: chain,
                            auth_seq_id: Number.parseInt(auth_seq_id)
                        });
                    }
                }

                const expr = this.selectionResidueClusterExpression(sites);
                const update = this.ctx.build();
                let structure = this.ctx.managers.structure.hierarchy.current.structures[0].cell.obj?.data;
                let structures = this.ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({
                    structureRef,
                    number: i + 1
                }));
                const struct = structures[0];
                const group1 = update.to(struct.structureRef.cell);
                const bsiteSel = group1.apply(
                    StateTransforms.Model.StructureSelectionFromExpression,
                    {label: `onetwo Ligand`, expression: expr},
                    {ref: 'ligandSel'}
                );
                bsiteSel.apply(
                    StateTransforms.Representation.StructureRepresentation3D,
                    createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {
                        type: 'cartoon',
                        color: VaryingResidueColorThemeProvider.name as any,
                        colorParams: {
                            bsite: bsite
                        },
                        typeParams: {
                            alpha: 1
                        }
                    }),
                    {ref: 'ligandBallAndStick'}
                );
                await PluginCommands.State.Update(this.ctx, {
                    state: this.ctx.state.data,
                    tree: update
                });

                const transparency_layers = [];
                for (var chain of Object.keys(bsite)) {
                    for (var kv of Object.entries(bsite[chain])) {
                        var [auth_seq_id, score] = kv;
                        var selection = Script.getStructureSelection(
                            Q =>
                                Q.struct.generator.atomGroups({
                                    'chain-test': Q.core.rel.eq([
                                        Q.struct.atomProperty.macromolecular.auth_asym_id(),
                                        chain
                                    ]),
                                    'residue-test': Q.core.rel.eq([
                                        Q.struct.atomProperty.macromolecular.auth_seq_id(),
                                        Number.parseInt(auth_seq_id)
                                    ])
                                }),
                            structure!
                        );

                        transparency_layers.push({
                            bundle: StructureElement.Bundle.fromSelection(selection),
                            value: 1 - score
                        });
                    }
                }

                const repr =
                    this.ctx.managers.structure.hierarchy.current.structures[0].components[0].representations[0].cell;
                const update2 = this.ctx.build();
                update2.to(repr).apply(StateTransforms.Representation.TransparencyStructureRepresentation3DFromBundle, {
                    layers: transparency_layers
                });

                return update2.commit();
            }
        });
    };

    select_residueCluster = (
        chain_residue_tuples: {
            auth_asym_id: string;
            auth_seq_id: number;
        }[]
    ) => {
        const expr = this.selectionResidueClusterExpression(chain_residue_tuples);
        const data: any = this.ctx.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
        const sel = Script.getStructureSelection(expr, data);
        let loci = StructureSelection.toLociWithSourceUnits(sel);
        this.ctx.managers.structure.selection.clear();
        this.ctx.managers.structure.selection.fromLoci('add', loci);
        this.ctx.managers.camera.focusLoci(loci);
    };

    selectionResidueClusterExpression = (
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
    };

    async upload_mmcif_structure(
        rcsb_id: string,
        nomenclature_map: Record<string, string>
    ): Promise<StateObjectSelector> {
        // if (clear) {
        //   await this.ctx.clear();
        // }

        const data = await this.ctx.builders.data.download(
            {
                url: `https://models.rcsb.org/${rcsb_id.toUpperCase()}.bcif`,
                isBinary: true
            },
            {state: {isGhost: true}}
        );
        const trajectory = await this.ctx.builders.structure.parseTrajectory(data, 'mmcif');
        const model = await this.ctx.builders.structure.createModel(trajectory);
        const structure = await this.ctx.builders.structure.createStructure(model);

        const repr = await this.ctx.builders.structure.representation.addRepresentation(
            structure, // we pass a structure StateObject to apply the representation on the whole structure
            {
                type: 'cartoon',
                typeParams: {alpha: 0.01},
                color: 'sequence-id'
            },
            {tag: 'canvas'}
        );

        await this.stylized();
        return structure;
    }

    // TODO+============== REPRESENTATIONS

    async create_ball_and_stick_representation(selection: StateObjectSelector, label: string) {
        const update = this.ctx.build();
        update.to(selection.ref).apply(
            StateTransforms.Representation.StructureRepresentation3D,
            createStructureRepresentationParams(this.ctx, selection.data, {
                type: 'ball-and-stick'
            }),
            {ref: 'residues'}
        );
        await PluginCommands.State.Update(this.ctx, {
            state: this.ctx.state.data,
            tree: update
        });
    }

    async toggle_visibility_by_ref(representation: any, on_off: boolean) {
        if (representation['components'] === undefined) {
            return;
        }
        setSubtreeVisibility(this.ctx.state.data, representation['components']['polymer']['ref'], on_off);
    }

    async stylized() {
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
                                      includeTransparent: true
                                  }
                    },
                    occlusion: {
                        name: 'on',
                        params:
                            pp.occlusion.name === 'on'
                                ? pp.occlusion.params
                                : {
                                      multiScale: {name: 'off', params: {}},
                                      radius: 5,
                                      bias: 0.8,
                                      blurKernelSize: 15,
                                      blurDepthBias: 0.5,
                                      samples: 32,
                                      resolutionScale: 1,
                                      color: Color(0x000000),
                                      transparentThreshold: 0.4
                                  }
                    },
                    shadow: {name: 'off', params: {}}
                }
            });
        }
    }

    // TODO+============== REPRESENTATIONS

    // TODO: rewrite all instances of `select|highlihgtResidueCluster` in terms of this.
    select_multiple_residues(chain_residues_tuples: [string, number[]][], structure?: Structure) {
        const groups: Expression[] = [];
        for (var chain_residue_tuple of chain_residues_tuples) {
            for (var res_index of chain_residue_tuple[1]) {
                groups.push(
                    MS.struct.generator.atomGroups({
                        'chain-test': MS.core.rel.eq([
                            MolScriptBuilder.struct.atomProperty.macromolecular.auth_asym_id(),
                            chain_residue_tuple[0]
                        ]),
                        'residue-test': MS.core.rel.eq([
                            MolScriptBuilder.struct.atomProperty.macromolecular.label_seq_id(),
                            res_index
                        ])
                    })
                );
            }
        }
        this.ctx.managers.structure.selection.fromSelectionQuery(
            'set',
            StructureSelectionQuery('multiple', MS.struct.combinator.merge(groups))
        );
        const expression = MS.struct.combinator.merge(groups);

        const data = structure ?? this.ctx.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;

        if (data === undefined) {
            return;
        }

        const sel = Script.getStructureSelection(expression, data);
        let loci = StructureSelection.toLociWithSourceUnits(sel);

        this.ctx.managers.structure.selection.clear();
        this.ctx.managers.structure.selection.fromLoci('add', loci);
        this.ctx.managers.camera.focusLoci(loci);
    }

    //TODO: REFACTOR =============================================== LIGAND NAMESPACE
    async select_focus_ligand(chemicalId: string | undefined, focus_select: Array<'focus' | 'select' | 'highlight'>) {
        let structures = this.ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({
            structureRef,
            number: i + 1
        }));
        const struct = structures[0];
        if (chemicalId === undefined || !struct) {
            return;
        }
        const ligand_sel = MS.struct.filter.first([
            MS.struct.generator.atomGroups({
                'residue-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.label_comp_id(), chemicalId]),
                'group-by': MS.core.str.concat([
                    MS.struct.atomProperty.core.operatorName(),
                    MS.struct.atomProperty.macromolecular.residueKey()
                ])
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
            this.ctx.managers.interactivity.lociHighlights.highlight({loci});
        }
        // this.ctx.managers.structure.selection.fromLoci('add', loci);
        // this.ctx.managers.camera.focusLoci(loci);
        // this.ctx.managers.interactivity.lociHighlights.highlight({ loci });
    }

    // async get_selection_constituents(chemicalId: string | undefined, radius: number): Promise<ResidueList> {
    //     if (!chemicalId) {
    //         return [];
    //     }
    //     const RADIUS = radius;
    //     let structures = this.ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({
    //         structureRef,
    //         number: i + 1
    //     }));
    //     const struct = structures[0];
    //     const update = this.ctx.build();

    //     const ligand = MS.struct.filter.first([
    //         MS.struct.generator.atomGroups({
    //             'residue-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.label_comp_id(), chemicalId]),
    //             'group-by': MS.core.str.concat([
    //                 MS.struct.atomProperty.core.operatorName(),
    //                 MS.struct.atomProperty.macromolecular.residueKey()
    //             ])
    //         })
    //     ]);

    //     const surroundings = MS.struct.modifier.includeSurroundings({
    //         0: ligand,
    //         radius: RADIUS,
    //         'as-whole-residues': true
    //     });
    //     const surroundingsWithoutLigand = MS.struct.modifier.exceptBy({
    //         0: surroundings,
    //         by: ligand
    //     });

    //     const group = update
    //         .to(struct.structureRef.cell)
    //         .group(StateTransforms.Misc.CreateGroup, {label: `${chemicalId} Surroundins Group`}, {ref: 'surroundings'});
    //     const surroundingsSel = group.apply(
    //         StateTransforms.Model.StructureSelectionFromExpression,
    //         {
    //             label: `${chemicalId} Surroundings (${RADIUS} Å)`,
    //             expression: surroundingsWithoutLigand
    //         },
    //         {ref: 'surroundingsSel'}
    //     );

    //     surroundingsSel.apply(
    //         StateTransforms.Representation.StructureRepresentation3D,
    //         createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {type: 'ball-and-stick'}),
    //         {ref: 'surroundingsBallAndStick'}
    //     );
    //     surroundingsSel.apply(
    //         StateTransforms.Representation.StructureRepresentation3D,
    //         createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {
    //             type: 'label',
    //             typeParams: {level: 'residue'}
    //         }),
    //         {ref: 'surroundingsLabels'}
    //     );

    //     await PluginCommands.State.Update(this.ctx, {
    //         state: this.ctx.state.data,
    //         tree: update
    //     });

    //     const compiled2 = compile<StructureSelection>(surroundingsWithoutLigand);
    //     const selection2 = compiled2(new QueryContext(struct.structureRef.cell.obj?.data!));
    //     const loci = StructureSelection.toLociWithSourceUnits(selection2);

    //     const residueList: ResidueList = [];

    //     const struct_Element = StructureElement.Loci.toStructure(loci);
    //     Structure.eachAtomicHierarchyElement(struct_Element, {
    //         residue: loc => {
    //             residueList.push({
    //                 label_seq_id: StructureProperties.residue.label_seq_id(loc),
    //                 auth_seq_id: StructureProperties.residue.auth_seq_id(loc),

    //                 label_comp_id: StructureProperties.atom.label_comp_id(loc),
    //                 auth_asym_id: StructureProperties.chain.auth_asym_id(loc),
    //                 rcsb_id: StructureProperties.unit.model_entry_id(loc)
    //             });
    //         }
    //     });
    //     return residueList;
    // }

    async create_ligand_and_surroundings(chemicalId: string | undefined, radius: number) {
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
                    'residue-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.label_comp_id(), chemicalId]),
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
    }

    async select_focus_ligand_surroundings(
        chemicalId: string | undefined,
        radius: number,
        focus_select: Array<'focus' | 'select' | 'highlight'>
    ) {
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

    async create_ligand(chemicalId: string) {
        await this.ctx.dataTransaction(async () => {
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

    //TODO: REFACTOR =============================================== LIGAND NAMESPACE

    // TODO
}
