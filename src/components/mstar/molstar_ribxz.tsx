'use client';
import {MolScriptBuilder as MS, MolScriptBuilder} from 'molstar/lib/mol-script/language/builder';
import {StructureSelection} from 'molstar/lib/mol-model/structure';
import {Structure, StructureElement, StructureProperties} from 'molstar/lib/mol-model/structure/structure';
import {StructureSelectionQuery} from 'molstar/lib/mol-plugin-state/helpers/structure-selection-query';
import {Asset} from 'molstar/lib/mol-util/assets';
import {StateObjectRef, StateObjectSelector} from 'molstar/lib/mol-state/object';
import {compile} from 'molstar/lib/mol-script/runtime/query/compiler';
import {superpose} from 'molstar/lib/mol-model/structure/structure/util/superposition';
import {QueryContext} from 'molstar/lib/mol-model/structure/query/context';
import {Expression} from 'molstar/lib/mol-script/language/expression';
import {PluginStateObject, PluginStateObject as PSO} from 'molstar/lib/mol-plugin-state/objects';
import {Mat4} from 'molstar/lib/mol-math/linear-algebra/3d/mat4';
import {createStructureRepresentationParams} from 'molstar/lib/mol-plugin-state/helpers/structure-representation-params';
import {PluginCommands} from 'molstar/lib/mol-plugin/commands';
import {createPluginUI} from 'molstar/lib/mol-plugin-ui';
import {PluginUIContext} from 'molstar/lib/mol-plugin-ui/context';
import {renderReact18} from 'molstar/lib/mol-plugin-ui/react18';
import 'molstar/lib/mol-plugin-ui/skin/light.scss';
import {StateTransforms} from 'molstar/lib/mol-plugin-state/transforms';
import {ribxzSpec} from './lib';
import _ from 'lodash';
import {Script} from 'molstar/lib/mol-script/script';
import {Color} from 'molstar/lib/mol-util/color/color';
import {setSubtreeVisibility} from 'molstar/lib/mol-plugin/behavior/static/state';
import {ArbitrarySphereRepresentationProvider} from './providers/sphere_provider';
import {Loci} from 'molstar/lib/mol-model/structure/structure/element/loci';
import {PluginUISpec} from 'molstar/lib/mol-plugin-ui/spec';
import {PluginUIComponent} from 'molstar/lib/mol-plugin-ui/base';
import './mstar.css';
import {StructureQueryHelper} from 'molstar/lib/mol-plugin-state/helpers/structure-query';
import {chainSelectionPreset as ribxzPolymersPreset} from './providers/polymer_preset';

_.memoize.Cache = WeakMap;

export enum StateElements {
    Model = 'model',
    ModelProps = 'model-props',
    Assembly = 'assembly',
    VolumeStreaming = 'volume-streaming',
    Sequence = 'sequence',
    SequenceVisual = 'sequence-visual',
    Het = 'het',
    HetVisual = 'het-visual',
    Het3DSNFG = 'het-3dsnfg',
    Water = 'water',
    WaterVisual = 'water-visual',
    HetGroupFocus = 'het-group-focus',
    HetGroupFocusGroup = 'het-group-focus-group'
}

export type Residue = {
    label_seq_id: number | null | undefined;
    label_comp_id: string | null | undefined;
    auth_seq_id: number;
    auth_asym_id: string;
    rcsb_id: string;
    polymer_class?: string;
};

export type ResidueList = Residue[];

export class MolstarRibxz {
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
        this.ctx.builders.structure.representation.registerPreset(ribxzPolymersPreset);
        this.ctx.canvas3d?.setProps({camera: {helper: {axes: {name: 'off', params: {}}}}});
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

    tunnel_geoemetry = async (rcsb_id: string): Promise<Loci> => {
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

    select_chain = (auth_asym_id: string, modifier: 'set' | 'add' | 'remove' | 'intersect') => {
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
    };
    select_expression = (auth_asym_id: string): Expression => {
        let expression = MS.struct.generator.atomGroups({
            'chain-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_asym_id(), auth_asym_id])
        });
        return expression;
    };

    create_neighborhood_selection_from_expr = async (e: Expression) => {
        const RADIUS = 5;
        let structures = this.ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({
            structureRef,
            number: i + 1
        }));
        const struct = structures[0];

        // const update = this.ctx.build();

        // const group1 = update.to(struct.structureRef.cell).group(StateTransforms.Misc.CreateGroup, { label: `Surroundings Group` }, { ref: 'surroundings' });

        // // Create ligand selection and representations
        // const ligandSel = group1.apply(StateTransforms.Model.StructureSelectionFromExpression, { label: `${chemicalId} Ligand`, expression: ligand }, { ref: 'ligandSel' });
        // ligandSel.apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, { type: 'ball-and-stick' }), { ref: 'ligandBallAndStick' });
        // ligandSel.apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, { type: 'label', typeParams: { level: 'residue' } }), { ref: 'ligandLabel' });
        // await PluginCommands.State.Update(this.ctx, { state: this.ctx.state.data, tree: update });

        const surroundings = MS.struct.modifier.includeSurroundings({
            0: e,
            radius: RADIUS,
            'as-whole-residues': true
        });
        const surroundingsWithoutLigand = MS.struct.modifier.exceptBy({
            0: surroundings,
            by: e
        });
        const update2 = this.ctx.build();
        const group2 = update2
            .to(struct.structureRef.cell)
            .group(StateTransforms.Misc.CreateGroup, {label: `Surroundings group`}, {ref: 'surroundings'});
        // Create surroundings selection and representations
        const surroundingsSel = group2.apply(
            StateTransforms.Model.StructureSelectionFromExpression,
            {
                label: `Selection Surroundings (${RADIUS} Å)`,
                expression: surroundingsWithoutLigand
            },
            {ref: 'surroundingsSel'}
        );
        surroundingsSel.apply(
            StateTransforms.Representation.StructureRepresentation3D,
            createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {type: 'ball-and-stick'}),
            {ref: 'surroundingsBallAndStick'}
        );
        // surroundingsSel.apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, { type: 'label', typeParams: { level: 'residue' } }), { ref: 'surroundingsLabels' });
        await PluginCommands.State.Update(this.ctx, {
            state: this.ctx.state.data,
            tree: update2
        });

        const selection = compile<StructureSelection>(e)(new QueryContext(struct.structureRef.cell.obj?.data!));
        let loci = StructureSelection.toLociWithSourceUnits(selection);
        this.ctx.managers.structure.selection.fromLoci('add', loci);
        this.ctx.managers.camera.focusLoci(loci);
        return this;
    };

    // TODO ============================ Factor Out into separate neamespace
    removeHighlight = () => {
        this.ctx.managers.interactivity.lociHighlights.clearHighlights();
    };

    _highlightChain = (auth_asym_id: string) => {
        const data: any = this.ctx.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
        if (data === undefined) {
            return;
        }
        const sel = Script.getStructureSelection(
            Q =>
                Q.struct.generator.atomGroups({
                    'chain-test': Q.core.rel.eq([Q.struct.atomProperty.macromolecular.auth_asym_id(), auth_asym_id])
                }),
            data
        );
        let loci = StructureSelection.toLociWithSourceUnitts(sel);
        this.ctx.managers.interactivity.lociHighlights.highlight({loci});
    };

    highlightChain = _.memoize(_highlightChain =>
        _.debounce(
            auth_asym_id => {
                _highlightChain(auth_asym_id);
            },
            50,
            {leading: true, trailing: true}
        )
    )(this._highlightChain);

    _highlightResidueCluster = (
        chain_residues_tuples: {
            auth_asym_id: string;
            auth_seq_id: number;
        }[]
    ) => {
        const data = this.ctx.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
        if (data === undefined) return;
        const expr = this.selectionResidueClusterExpression(chain_residues_tuples);
        const sel = Script.getStructureSelection(expr, data);
        let loci = StructureSelection.toLociWithSourceUnits(sel);

        this.ctx.managers.interactivity.lociHighlights.highlight({loci});
    };

    highlightResidueCluster = _.memoize(_highlightResidueCluster =>
        _.debounce(
            (
                chain_residues_tuples: {
                    auth_asym_id: string;
                    auth_seq_id: number;
                }[]
            ) => {
                _highlightResidueCluster(chain_residues_tuples);
            },
            50,
            {leading: true, trailing: true}
        )
    )(this._highlightResidueCluster);

    // TODO ============================ Factor Out

    // TODO:  Try chaffing residues out of the trajectory without creating the full preset (when sub-polymer loading is required, ex. tunnel display case)
    async upload_mmcif_chain({
        rcsb_id,
        auth_asym_id
    }: {
        rcsb_id: string;
        auth_asym_id: string;
    }): Promise<StateObjectSelector | undefined> {
        const myUrl = `${process.env.NEXT_PUBLIC_DJANGO_URL}/mmcif/polymer?rcsb_id=${rcsb_id}&auth_asym_id=${auth_asym_id}`;
        const data = await this.ctx.builders.data.download(
            {url: Asset.Url(myUrl.toString()), isBinary: false},
            {state: {isGhost: true}}
        );
        const trajectory = await this.ctx.builders.structure.parseTrajectory(data, 'mmcif');
        const st = await this.ctx.builders.structure.hierarchy.applyPreset(trajectory, 'default');
        return st?.structure;
    }

    async upload_mmcif_structure(
        rcsb_id: string,
        nomenclature_map: {[key: string]: string},
        clear?: boolean
    ): Promise<{ctx: MolstarRibxz; struct_representation: any}> {
        if (clear) {
            await this.ctx.clear();
        }

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

        const {components, representations, metadata} = await this.ctx.builders.structure.representation.applyPreset(
            structure,
            'polymers-ligand-ribxz-theme',
            {structureId: rcsb_id, nomenclature_map}
        );
        this.stylized();
        return {ctx: this, struct_representation: null};
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

    toggleSpin() {
        if (!this.ctx.canvas3d) return this;
        const trackball = this.ctx.canvas3d.props.trackball;

        PluginCommands.Canvas3D.SetSettings(this.ctx, {
            settings: {
                trackball: {
                    ...trackball,
                    animate:
                        trackball.animate.name === 'spin'
                            ? {name: 'off', params: {}}
                            : {name: 'spin', params: {speed: 1}}
                }
            }
        });
        return this;
    }

    async toggle_visibility_by_ref(representation: any, on_off: boolean) {
        if (representation['components'] === undefined) {
            return;
        }
        setSubtreeVisibility(this.ctx.state.data, representation['components']['polymer']['ref'], on_off);
    }
    async color_all_white() {
        const componentGroups = this.ctx.managers.structure.hierarchy.currentComponentGroups;
        console.log(componentGroups);
        this.ctx.builders.structure.representation;
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
            console.log('Not found data');
            return;
        }

        const sel = Script.getStructureSelection(expression, data);
        let loci = StructureSelection.toLociWithSourceUnits(sel);

        this.ctx.managers.structure.selection.clear();
        this.ctx.managers.structure.selection.fromLoci('add', loci);
        this.ctx.managers.camera.focusLoci(loci);
    }

    expression_polymers_selection = (auth_asym_ids: string[]): Expression => {
        const groups: Expression[] = [];
        for (var aaid of auth_asym_ids) {
            groups.push(
                MS.struct.generator.atomGroups({
                    'chain-test': MS.core.rel.eq([
                        MolScriptBuilder.struct.atomProperty.macromolecular.auth_asym_id(),
                        aaid
                    ])
                })
            );
        }
        return MS.struct.combinator.merge(groups);
    };

    select_multiple_polymers = async (auth_asym_ids: string[], modifier: 'set' | 'add' | 'remove' | 'intersect') => {
        const e = this.expression_polymers_selection(auth_asym_ids);
        const data = this.ctx.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
        if (data === undefined) return;
        const sel = Script.getStructureSelection(e, data);
        let loci = StructureSelection.toLociWithSourceUnits(sel);
        this.ctx.managers.structure.selection.fromLoci(modifier, loci);
    };

    create_multiple_polymers = async (auth_asym_ids: string[], object_name: string) => {
        let structures = this.ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({
            structureRef,
            number: i + 1
        }));
        const struct = structures[0];

        const e      = this.expression_polymers_selection(auth_asym_ids);
        const update = this.ctx.build();
        const group  = update
            .to(struct.structureRef.cell)
            .group(StateTransforms.Misc.CreateGroup, {label: object_name}, {ref: `_${object_name}`});

        const chain_sel = group.apply(
            StateTransforms.Model.StructureSelectionFromExpression,
            {label: object_name, expression: e},
            {ref: object_name}
        );
        chain_sel.apply(
            StateTransforms.Representation.StructureRepresentation3D,
            createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {type: 'cartoon'}),
            {ref: `repr_${object_name}_cartoon`}
        );
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
    };

    create_subcomponent_by_auth_asym_id = async (auth_asym_ids: string[]) => {
        let structures = this.ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({
            structureRef,
            number: i + 1
        }));
        const struct = structures[0];
        let expression = MS.struct.generator.atomGroups({
            'chain-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_asym_id(), auth_asym_id])
        });

        const update = this.ctx.build();
        const group = update
            .to(struct.structureRef.cell)
            .group(StateTransforms.Misc.CreateGroup, {label: `Chain so and so `}, {ref: 'chain_so&so'});
        const chain_sel = group.apply(
            StateTransforms.Model.StructureSelectionFromExpression,
            {label: `ll`, expression: expression},
            {ref: 'chainso&so'}
        );
        chain_sel.apply(
            StateTransforms.Representation.StructureRepresentation3D,
            createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {type: 'cartoon'}),
            {ref: 'surroundingsBallAndStick'}
        );
        await PluginCommands.State.Update(this.ctx, {
            state: this.ctx.state.data,
            tree: update
        });
    };

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
            createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {type: 'ball-and-stick'}),
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
    dynamicSuperimpose(pivot_auth_asym_id: string) {
        const transform = (s: StateObjectRef<PSO.Molecule.Structure>, matrix: Mat4) => {
            const b = this.ctx.state.data
                .build()
                .to(s)
                .insert(StateTransforms.Model.TransformStructureConformation, {
                    transform: {
                        name: 'matrix',
                        params: {data: matrix, transpose: false}
                    }
                });
            return this.ctx.runTask(this.ctx.state.data.updateTree(b));
        };

        const siteVisual = async (s: StateObjectRef<PSO.Molecule.Structure>, pivot: Expression) => {
            const center = await this.ctx.builders.structure.tryCreateComponentFromExpression(s, pivot, 'pivot');
            if (center)
                await this.ctx.builders.structure.representation.addRepresentation(center, {
                    type: 'ball-and-stick',
                    color: 'residue-name'
                });
        };
        return this.ctx.dataTransaction(async () => {
            const pivot = MS.struct.filter.first([
                MS.struct.generator.atomGroups({
                    'chain-test': MS.core.rel.eq([
                        MS.struct.atomProperty.macromolecular.auth_asym_id(),
                        pivot_auth_asym_id
                    ]),
                    'group-by': MS.struct.atomProperty.macromolecular.residueKey()
                })
            ]);

            const query = compile<StructureSelection>(pivot);
            const structureRefs = this.ctx.managers.structure.hierarchy.current.structures;
            const selections = structureRefs.map(s =>
                StructureSelection.toLociWithCurrentUnits(query(new QueryContext(s.cell.obj!.data)))
            );
            const transforms = superpose(selections);
            console.log({...transforms});

            await siteVisual(structureRefs[0].cell, pivot);

            for (let i = 1; i < selections.length; i++) {
                await transform(structureRefs[i].cell, transforms[i - 1].bTransform);
                await siteVisual(structureRefs[i].cell, pivot);
            }
        });
    }

    // makeTransparentStructure(compId: string) {

    //   const struct = this.ctx.managers.structure.hierarchy.current.structures[0];
    //   const repr = struct.components[0].representations[0].cell;

    //   // Select the whole strucutre by its PDB ID:
    //   const structure_selection = MS.struct.generator.atomGroups({
    //     'atom-test': MS.core.rel.eq([MS.ammp('auth_asym_id'), 'A']),
    //   });

    //   const { selection } = StructureQueryHelper.createAndRun(struct.cell.obj!.data.root, structure_selection);
    //   const bundle = StructureElement.Bundle.fromSelection(selection);

    //   const update = this.ctx.build();
    //   // if you have more than one repr to apply this to, do this for each of them
    //   update.to(repr)
    //     .apply(StateTransforms.Representation.TransparencyStructureRepresentation3DFromBundle, {
    //       layers: [{ bundle, value: 0.5 }]
    //     });

    //   // this.set_stylized()
    //   return update.commit();
    // }

    makeTransparent() {
        const sel = MS.struct.generator.all();
        const struct = this.ctx.managers.structure.hierarchy.current.structures[0];
        const repr = struct.components[0].representations[0].cell;

        const {selection} = StructureQueryHelper.createAndRun(struct.cell.obj!.data.root, sel);
        const bundle = StructureElement.Bundle.fromSelection(selection);
        const update = this.ctx.build();

        update.to(repr).apply(StateTransforms.Representation.TransparencyStructureRepresentation3DFromBundle, {
            layers: [{bundle, value: 0.1}]
        });

        return update.commit();
    }
}

export class MyViewportControls extends PluginUIComponent<{}, {}> {
    render() {
        return <div className={'msp-viewport-controls'}> </div>;
    }
}
