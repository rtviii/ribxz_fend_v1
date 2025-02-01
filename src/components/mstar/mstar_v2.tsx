import {createPluginUI} from 'molstar/lib/mol-plugin-ui';
import {PluginUIContext} from 'molstar/lib/mol-plugin-ui/context';
import {ArbitrarySphereRepresentationProvider} from './providers/sphere_provider';
import {renderReact18} from 'molstar/lib/mol-plugin-ui/react18';
import {PluginUISpec} from 'molstar/lib/mol-plugin-ui/spec';
import {ribxzSpec} from './spec';
import {SplitPolymerPreset as SplitPolymerPreset} from './providers/polymer_preset';
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
import {BsiteComponent, LigandComponent, PolymerComponent} from '@/store/molstar/slice_refs';
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

declare global {
    interface Window {
        molstar?: PluginUIContext;
    }
}
const numToHexColor = (colorValue: number) => {
    // Convert to hex string and pad with zeros if needed
    const hexString = '#' + colorValue.toString(16).padStart(6, '0');
    return hexString;
};
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
        this.ctx.builders.structure.representation.registerPreset(SplitPolymerPreset);
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

        ptc: (xyz: number[]) => {
            let [x, y, z] = xyz;
            let sphere = {
                x: x,
                y: y,
                z: z,
                radius: 2,
                label: 'PTC', // Add custom label
                selectable: true // Make it selectable
            };

            const structureRef = this.ctx.managers.structure.hierarchy.current.structures[0]?.cell.transform.ref;

            this.ctx.builders.structure.representation.addRepresentation(structureRef, {
                type: 'arbitrary-sphere' as any,
                typeParams: sphere,
                colorParams: {value: Color(0x0000ff)} // Blue color
            });

        },

        constriction_site: (xyz: number[]) => {
            let [x, y, z] = xyz;
            console.log(x, y, z);

            let sphere = {
                x: x,
                y: y,
                z: z,
                radius: 2,
                label: 'Constriction Site', // Add custom label
                selectable: true // Make it selectable
            };

            const structureRef = this.ctx.managers.structure.hierarchy.current.structures[0]?.cell.transform.ref;

            this.ctx.builders.structure.representation.addRepresentation(structureRef, {
                type: 'arbitrary-sphere' as any,
                typeParams: sphere,
                colorParams: {value: Color(0xff0000)} // Red color
            });

            console.log('Constriction site added');
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

        upload_mmcif_chain: async (rcsb_id: string, auth_asym_id: string) => {
            const myUrl = `${process.env.NEXT_PUBLIC_DJANGO_URL}/mmcif/polymer?rcsb_id=${rcsb_id}&auth_asym_id=${auth_asym_id}`;
            const data = await this.ctx.builders.data.download(
                {url: Asset.Url(myUrl.toString()), isBinary: false},
                {state: {isGhost: true}}
            );
            const trajectory = await this.ctx.builders.structure.parseTrajectory(data, 'mmcif');
            const model = await this.ctx.builders.structure.createModel(trajectory);
            const structure = await this.ctx.builders.structure.createStructure(model);
            return structure;
        },
        upload_mmcif_nonpolymer: async (rcsb_id: string, chemicalId: string) => {
            const myUrl = `${process.env.NEXT_PUBLIC_DJANGO_URL}/mmcif/nonpolymer?rcsb_id=${rcsb_id}&chemicalId=${chemicalId}`;
            const data = await this.ctx.builders.data.download(
                {url: Asset.Url(myUrl.toString()), isBinary: false},
                {state: {isGhost: true}}
            );
            const trajectory = await this.ctx.builders.structure.parseTrajectory(data, 'mmcif');
            const model = await this.ctx.builders.structure.createModel(trajectory);
            const structure = await this.ctx.builders.structure.createStructure(model);
            const ligand_color = 0x00ff00;

            await this.ctx.builders.structure.representation.addRepresentation(structure, {
                color: 'uniform',

                colorParams: {
                    value: Color(ligand_color)
                },
                typeParams: {
                    emissive: 0.2,
                    sizeFactor: 0.6,
                    sizeAspectRatio: 0.8
                },

                type: 'ball-and-stick',
                size: 'uniform',
                sizeParams: {}
            });

            await this.ctx.builders.structure.representation.addRepresentation(
                structure,
                {
                    color: 'uniform',
                    colorParams: {value: `${ligand_color}`},
                    type: 'label',
                    typeParams: {
                        attachment: 'top-left',
                        level: 'residue',
                        tether: true,
                        tetherBaseWidth: 1,
                        tetherLength: 2.5,
                        borderColor: Color(0x000000)
                    },
                    size: 'uniform',
                    sizeParams: {value: 10}
                },
                {tag: `${chemicalId}_`} // tag is optional, but useful for later reference
            );

            console.log('Created non-polymer structure', structure);

            return structure;
        }
    };

    residues = {
        select_residue_cluster: (
            chain_residue_tuples: {
                auth_asym_id: string;
                auth_seq_id: number;
            }[]
        ) => {
            const expr = this.residues.residue_cluster_expression(chain_residue_tuples);
            const data: any = this.ctx.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
            const sel = Script.getStructureSelection(expr, data);
            let loci = StructureSelection.toLociWithSourceUnits(sel);
            this.ctx.managers.structure.selection.clear();
            this.ctx.managers.structure.selection.fromLoci('add', loci);
            this.ctx.managers.camera.focusLoci(loci);
        },

        residue_cluster_expression: (
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

        createResidueExpression: (auth_asym_id: string, auth_seq_id: number) => {
            return MS.struct.generator.atomGroups({
                'chain-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_asym_id(), auth_asym_id]),
                'residue-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_seq_id(), auth_seq_id])
            });
        },

        // Create a selection for the residue and return its refs
        createResidueSelection: async (rcsb_id: string, auth_asym_id: string, auth_seq_id: number) => {
            const structures = this.ctx.managers.structure.hierarchy.current.structures;
            if (!structures.length) return null;

            const struct = structures[0];
            const update = this.ctx.build();

            const residueExpr = this.residues.createResidueExpression(auth_asym_id, auth_seq_id);

            // Create a unique group for this residue
            const selectionId = `residue_${auth_asym_id}_${auth_seq_id}`;
            const group = update
                .to(struct.cell)
                .group(
                    StateTransforms.Misc.CreateGroup,
                    {label: `Residue ${auth_asym_id}:${auth_seq_id}`},
                    {ref: `${selectionId}_group`}
                );

            const selection = group.apply(
                StateTransforms.Model.StructureSelectionFromExpression,
                {
                    label: `Residue ${auth_asym_id}:${auth_seq_id}`,
                    expression: residueExpr
                },
                {ref: `${selectionId}_sel`}
            );

            await PluginCommands.State.Update(this.ctx, {
                state: this.ctx.state.data,
                tree: update
            });

            return {
                groupRef: `${selectionId}_group`,
                selRef: `${selectionId}_sel`
            };
        },

        // Focus on a specific residue
        focusResidue: async (rcsb_id: string, auth_asym_id: string, auth_seq_id: number) => {
            const residueExpr = this.residues.createResidueExpression(auth_asym_id, auth_seq_id);
            const compiled = compile<StructureSelection>(residueExpr)(
                new QueryContext(this.ctx.managers.structure.hierarchy.current.structures[0].cell.obj?.data!)
            );
            const loci = StructureSelection.toLociWithSourceUnits(compiled);

            this.ctx.managers.camera.focusLoci(loci);
        },

        // Highlight a specific residue
        highlightResidue: async (rcsb_id: string, auth_asym_id: string, auth_seq_id: number) => {
            const residueExpr = this.residues.createResidueExpression(auth_asym_id, auth_seq_id);
            const compiled = compile<StructureSelection>(residueExpr)(
                new QueryContext(this.ctx.managers.structure.hierarchy.current.structures[0].cell.obj?.data!)
            );
            const loci = StructureSelection.toLociWithSourceUnits(compiled);

            this.ctx.managers.interactivity.lociHighlights.highlightOnly({loci});
        },

        // Select a specific residue
        selectResidue: async (
            rcsb_id: string,
            auth_asym_id: string,
            auth_seq_id: number,
            addToExisting: boolean = false
        ) => {
            const residueExpr = this.residues.createResidueExpression(auth_asym_id, auth_seq_id);
            const compiled = compile<StructureSelection>(residueExpr)(
                new QueryContext(this.ctx.managers.structure.hierarchy.current.structures[0].cell.obj?.data!)
            );
            const loci = StructureSelection.toLociWithSourceUnits(compiled);

            if (!addToExisting) {
                this.ctx.managers.structure.selection.clear();
            }
            this.ctx.managers.structure.selection.fromLoci('add', loci);
        },

        // Comprehensive interaction method that combines multiple actions
        interactWithResidue: async (
            rcsb_id: string,
            auth_asym_id: string,
            auth_seq_id: number,
            options: {
                focus?: boolean;
                highlight?: boolean;
                select?: boolean;
                addToSelection?: boolean;
            } = {}
        ) => {
            const {focus = true, highlight = true, select = true, addToSelection = false} = options;

            if (select) {
                await this.residues.selectResidue(rcsb_id, auth_asym_id, auth_seq_id, addToSelection);
            }
            if (highlight) {
                await this.residues.highlightResidue(rcsb_id, auth_asym_id, auth_seq_id);
            }
            if (focus) {
                await this.residues.focusResidue(rcsb_id, auth_asym_id, auth_seq_id);
            }
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

        // const group = update
        //     .to(cell)
        //     .group(StateTransforms.Misc.CreateGroup, {label: `${chemicalId} Surroundins Group`}, {ref: 'surroundings'});
        // const surroundingsSel = group.apply(
        //     StateTransforms.Model.StructureSelectionFromExpression,
        //     {
        //         label: `${chemicalId} Surroundings (${RADIUS} Å)`,
        //         expression: surroundingsWithoutLigand
        //     },
        //     {ref: 'surroundingsSel'}
        // );

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
        create_ligand: async (rcsb_id: string, chemicalId: string): Promise<LigandComponent> => {
            let ligandRefs: LigandComponent;

            await this.ctx.dataTransaction(async () => {
                const structures = this.ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({
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

                // Create ligand group with consistent ref naming
                const group = update
                    .to(struct.structureRef.cell)
                    .group(
                        StateTransforms.Misc.CreateGroup,
                        {label: `${chemicalId} Ligand`},
                        {ref: `${chemicalId}_ligand_group`}
                    );

                // Create selection with consistent ref naming
                const coreSel = group.apply(
                    StateTransforms.Model.StructureSelectionFromExpression,
                    {
                        label: chemicalId,
                        expression: ligand
                    },
                    {ref: `${chemicalId}_ligand_sel`}
                );

                // Create ball-and-stick representation with consistent ref naming
                const ballAndStickRepr = coreSel.apply(
                    StateTransforms.Representation.StructureRepresentation3D,
                    createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {
                        type: 'ball-and-stick',
                        color: 'uniform',
                        colorParams: {value: Color(0xe24e1b)},
                        typeParams: {ignoreLight: true, emissive: 0.1, sizeFactor: 0.2}
                    }),
                    {ref: `${chemicalId}_ligand_repr`}
                );

                // Optional: Add label representation
                // coreSel.apply(
                //     StateTransforms.Representation.StructureRepresentation3D,
                //     createStructureRepresentationParams(this.ctx, struct.structureRef.cell.obj?.data, {
                //         type: 'label',
                //         typeParams: {level: 'residue'}
                //     })
                // );

                await PluginCommands.State.Update(this.ctx, {
                    state: this.ctx.state.data,
                    tree: update
                });

                // Create properly typed LigandComponent
                ligandRefs = {
                    type: 'ligand',
                    rcsb_id,
                    chemicalId,
                    ref: `${chemicalId}_ligand_group`,
                    repr_ref: `${chemicalId}_ligand_repr`,
                    sel_ref: `${chemicalId}_ligand_sel`
                };
            });

            return ligandRefs!;
        },
        createBindingSiteComponent: async (
            rcsb_id: string,
            cell: StateObjectCell,
            residues: {auth_asym_id: string; auth_seq_id: number}[],
            chemicalId: string,
            nomenclature_map: Record<string, string>
        ): Promise<BsiteComponent> => {
            const ctx = this.ctx;
            const update = ctx.build();

            // Create bsite group
            const bsiteGroup = update
                .to(cell)
                .group(
                    StateTransforms.Misc.CreateGroup,
                    {label: `${chemicalId} Binding Site`},
                    {ref: `${chemicalId}_bsite_group`}
                );

            // Group residues by chain
            const residuesByChain = residues.reduce((acc, residue) => {
                if (!acc[residue.auth_asym_id]) {
                    acc[residue.auth_asym_id] = [];
                }
                acc[residue.auth_asym_id].push(residue);
                return acc;
            }, {} as Record<string, typeof residues>);

            // Create chain-specific selections and representations
            const chainExpressions: Expression[] = []; // Keep track of all chain expressions

            for (const [chain, chainResidues] of Object.entries(residuesByChain)) {
                const chainExpr = MS.struct.combinator.merge(
                    chainResidues.map(r =>
                        MS.struct.generator.atomGroups({
                            'chain-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_asym_id(), chain]),
                            'residue-test': MS.core.rel.eq([
                                MS.struct.atomProperty.macromolecular.auth_seq_id(),
                                r.auth_seq_id
                            ])
                        })
                    )
                );
                chainExpressions.push(chainExpr); // Add to our collection

                const chainGroup = bsiteGroup.apply(
                    StateTransforms.Model.StructureSelectionFromExpression,
                    {
                        label: `${chemicalId} Chain ${chain} Selection`,
                        expression: chainExpr
                    },
                    {ref: `${chemicalId}_chain_${chain}_sel`}
                );

                chainGroup.apply(
                    StateTransforms.Representation.StructureRepresentation3D,
                    createStructureRepresentationParams(ctx, cell.obj?.data, {
                        type: 'ball-and-stick',
                        color: 'uniform',
                        colorParams: {
                            value: PolymerColorschemeWarm[nomenclature_map[chain] as PolymerClass]
                        },
                        typeParams: {
                            ignoreLight: true,
                            emissive: 0.1
                        }
                    }),
                    {ref: `${chemicalId}_chain_${chain}_repr`}
                );
            }

            // Create unified selection that combines all chain expressions
            const unifiedSel = bsiteGroup.apply(StateTransforms.Model.StructureSelectionFromExpression, {
                label: `${chemicalId} Complete Binding Site`,
                expression: MS.struct.combinator.merge(chainExpressions)
            });

            await PluginCommands.State.Update(ctx, {
                state: ctx.state.data,
                tree: update
            });

            return {
                chemicalId: chemicalId,
                rcsb_id,
                type: 'bsite',
                ref: `${chemicalId}_bsite_group`,
                sel_ref: unifiedSel.ref,
                repr_ref: `${chemicalId}_bsite_group` // Use group ref since it contains all representations
            };
        },

        addBonds: async (
            rcsb_id: string,
            cell: StateObjectCell,
            residues: {auth_asym_id: string; auth_seq_id: number}[],
            chemicalId: string,
            nomenclature_map: Record<string, string>
        ) => {
            // TODO
            // https://github.com/molstar/molstar/issues/449
        },

        create_ligand_surroundings: async (
            rcsb_id: string,
            chemicalId: string | undefined,
            radius: number,
            nomenclature_map: Record<string, string>
        ) => {
            if (!chemicalId) return undefined;
            const refs = {};

            await this.ctx.dataTransaction(async () => {
                const structures = this.ctx.managers.structure.hierarchy.current.structures.map((structureRef, i) => ({
                    structureRef,
                    number: i + 1
                }));
                const struct = structures[0];
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

                // Get surroundings residues
                const compiled = compile<StructureSelection>(surroundingsWithoutLigand)(
                    new QueryContext(struct.structureRef.cell.obj?.data!)
                );
                const surroundingsWithoutLigandLoci = StructureSelection.toLociWithSourceUnits(compiled);

                // Convert loci to residue list
                const surroundingResidues: {auth_asym_id: string; auth_seq_id: number}[] = [];
                const struct_Element = StructureElement.Loci.toStructure(surroundingsWithoutLigandLoci);

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
                    rcsb_id,
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
            rcsb_id: string,
            root_ref: string,
            prediction_data: ResidueSummary[],
            chemical_id: string,
            nomenclature_map: Record<string, string>
        ) => {
            const cell = this.ctx.state.data.select(StateSelection.Generators.byRef(root_ref))[0];

            const residues = prediction_data.map(r => ({
                auth_asym_id: r.auth_asym_id,
                auth_seq_id: r.auth_seq_id
            }));

            return await this.ligands.createBindingSiteComponent(
                rcsb_id,
                cell,
                residues,
                chemical_id,
                nomenclature_map
            );
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
            console.log('Returned cell', cell);
            if (!cell?.obj) return;
            const loci = Structure.toStructureElementLoci(cell.obj.data);
            console.log('But loci?', loci);
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
            const expr = this.residues.residue_cluster_expression(cluster);
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
    loci_from_expr = (expr: Expression, data: any): Loci => {
        const compiled = compile<StructureSelection>(expr)(new QueryContext(data));
        const loci = StructureSelection.toLociWithSourceUnits(compiled);
        return loci;
    };

    toggleSpin(speed: number = 1) {
        if (!this.ctx) {
            return;
        }
        const trackball = this.ctx?.canvas3d.props.trackball;

        PluginCommands.Canvas3D.SetSettings(this.ctx, {
            settings: {
                trackball: {
                    ...trackball,
                    animate:
                        trackball.animate.name === 'spin'
                            ? {name: 'off', params: {}}
                            : {name: 'spin', params: {speed: speed}}
                }
            }
        });
        return this;
    }
    tunnel_geometry = async (rcsb_id: string, transparency: number = 0.6): Promise<Loci> => {
        // 1. Get provider and fetch data
        const provider = this.ctx.dataFormats.get('ply')!;
        const myurl = `${process.env.NEXT_PUBLIC_DJANGO_URL}/structures/tunnel_geometry?rcsb_id=${rcsb_id}&is_ascii=true`;
        const data = await this.ctx.builders.data.download({
            url: Asset.Url(myurl.toString()),
            isBinary: false
        });
        const parsed = await provider!.parse(this.ctx, data!);

        if (!provider.visuals) {
            throw Error('provider.visuals is undefined for this `ply` data format');
        }

        // 2. Create the visual and wait for state update to complete
        const visual = await provider.visuals!(this.ctx, parsed);
        const update1 = this.ctx.build();

        // 3. Get ref for created visual and ensure it exists in state
        const shape_ref = visual.ref;
        await PluginCommands.State.Update(this.ctx, {
            state: this.ctx.state.data,
            tree: update1
        });

        // 4. Now that state is updated, we can select and modify
        const meshObject = this.ctx.state.data.select(shape_ref)[0];
        if (!meshObject?.obj?.data) {
            throw Error('Failed to find mesh object in state');
        }

        const params = {
            alpha: transparency, // Try direct param modification
            material: {
                transparency: true,
                opacity: transparency
            }
        };

        const update2 = this.ctx.build();
        update2.to(meshObject).update(params);

        await PluginCommands.State.Update(this.ctx, {
            state: this.ctx.state.data,
            tree: update2
        });

        // 7. Get loci after all updates complete
        const shape_loci = await meshObject.obj.data.repr.getAllLoci();
        return shape_loci;
    };
}

export async function createChainRangeVisualization(
    ctx: ribxzMstarv2,
    params: {
        rcsb_id: string;
        auth_asym_id: string;
        range_start: number;
        range_end: number;
        color: number;
        label?: string;
        showLabels?: boolean;
        emissive?: number;
        representation?: 'cartoon' | 'ball-and-stick';
        point_representation?: boolean;
        labelParams?: {
            level?: 'residue' | 'chain';
            fontSize?: number;
            attachment?: 'bottom-left' | 'top-left' | 'top-right' | 'bottom-right';
            offsetX?: number;
            offsetY?: number;
        };
    }
) {
    const {
        rcsb_id,
        auth_asym_id,
        range_start,
        range_end,
        color,
        label = `${auth_asym_id} cluster`,
        showLabels = false,
        emissive = 0,
        representation,
        point_representation = false,
        labelParams = {
            level: 'chain',
            attachment: 'bottom-left',
            offsetX: 0,
            offsetY: 0
        }
    } = params;

    // Generate the range of residues
    const residues = Array.from({length: range_end - range_start + 1}, (_, i) => range_start + i);

    // Upload the chain
    const chain = await ctx.components.upload_mmcif_chain(rcsb_id, auth_asym_id);
    if (!chain?.obj?.data) {
        console.error(`${auth_asym_id} data not loaded properly`);
        return;
    }

    const expr      = ctx.residues.residue_cluster_expression(residues.map(r => ({auth_asym_id, auth_seq_id: r})));
    const update    = ctx.ctx.build();
    const group     = update.to(chain.cell).group(StateTransforms.Misc.CreateGroup, {label}, {ref: `${auth_asym_id}_res`});
    const selection = group.apply(
        StateTransforms.Model.StructureSelectionFromExpression,
        {
            label: `${auth_asym_id}_selection`,
            expression: expr
        },
        {ref: `${auth_asym_id}_selection`}
    );

    if (!point_representation) {
        selection.apply(
            StateTransforms.Representation.StructureRepresentation3D,
            createStructureRepresentationParams(ctx.ctx, chain.obj.data, {
                type: representation,
                color: 'uniform',
                colorParams: {
                    value: Color(color)
                },
                typeParams: {
                    emissive: emissive,
                    ignoreLight: true,
                    sizeFactor: 0.25
                }
            }),
            {ref: `${auth_asym_id}_repr`}
        );
    } else {
        selection.apply(
            StateTransforms.Representation.StructureRepresentation3D,
            createStructureRepresentationParams(ctx.ctx, chain.obj.data, {
                type: 'point',
                color: 'uniform',
                colorParams: {
                    value: Color(color)
                },
                typeParams: {
                    emissive: 0.2,
                    pointStyle: 'circle',
                    sizeFactor: 4
                }
            }),
            {ref: `${auth_asym_id}_repr`}
        );
    }

    // Add label representation if enabled
    if (showLabels) {
        selection.apply(
            StateTransforms.Representation.StructureRepresentation3D,
            createStructureRepresentationParams(ctx.ctx, chain.obj.data, {
                type: 'label',
                color: 'uniform',
                colorParams: {
                    value: Color(color)
                },
                typeParams: {
                    level: labelParams.level,
                    attachment: labelParams.attachment,
                    borderColor: Color(0x000000),
                    backgroundOpacity: 0.5,
                    offsetX: labelParams.offsetX,
                    offsetY: labelParams.offsetY
                },
                size: 'uniform'
            }),
            {ref: `${auth_asym_id}_label`}
        );
    }

    await PluginCommands.State.Update(ctx.ctx, {
        state: ctx.ctx.state.data,
        tree: update
    });

    console.log(`${auth_asym_id} cluster created successfully`);
}
