'use client';
import '@/components/mstar/mstar.css';
import {useEffect, useRef, useState} from 'react';
import * as React from 'react';
import {Card} from '@/components/ui/card';
import {MolstarNode, ribxzSpec} from '@/components/mstar/spec';
import {MolScriptBuilder, MolScriptBuilder as MS} from 'molstar/lib/mol-script/language/builder';
import {DefaultPluginUISpec, PluginUISpec} from 'molstar/lib/mol-plugin-ui/spec';
import {Quat, Vec3} from 'molstar/lib/mol-math/linear-algebra';
import {MolstarDemoBsites, ScoredBsite} from '@/components/mstar/demos/molstar_demo_bsites';
import {
    ribxz_api,
    useRoutersRouterLigDemo7K00Query,
    useRoutersRouterStructStructureProfileQuery,
    
    

} from '@/store/ribxz_api/ribxz_api';
import {AppDispatch, useAppDispatch, useAppSelector} from '@/store/store';
import {EmptyViewportControls} from './demo_tunnel_human';
import {MolstarStateController} from '@/components/mstar/mstar_controller';
import {ribxzMstarv2} from '@/components/mstar/mstar_v2';
import {Expression} from 'molstar/lib/mol-script/language/expression';
import {StateTransforms} from 'molstar/lib/mol-plugin-state/transforms';
import {createStructureRepresentationParams} from 'molstar/lib/mol-plugin-state/helpers/structure-representation-params';
import {Color} from 'molstar/lib/mol-util/color/color';
import {PluginCommands} from 'molstar/lib/mol-plugin/commands';
import {
    addBindingSite,
    batchSetVisibility,
    BindingSite,
    setBindingSiteRef,
    setBindingSiteVisibility
} from './demo_bsite_slice';
import {setSubtreeVisibility} from 'molstar/lib/mol-plugin/behavior/static/state';
import LigandCategoryViewer from './lig_category_viewer';

interface Ligand {
    chemicalId: string;
    purported_7K00_binding_site: Array<[string, number]>;
}

export const toggleBindingSiteVisibility = (
    viewer: ribxzMstarv2,
    dispatch: AppDispatch,
    chemicalId: string,
    visible: boolean
) => {
    console.time('toggleBindingSiteVisibility');
    const ref = `bsite_${chemicalId}`;

    // Toggle visibility in Molstar
    setSubtreeVisibility(viewer.ctx.state.data, ref, visible);

    // Update visibility in Redux state
    dispatch(setBindingSiteVisibility({chemicalId, isVisible: visible}));

    console.timeEnd('toggleBindingSiteVisibility');
};
// new utility function
const updateMolstarState = async (viewer: ribxzMstarv2, operations: (update: any) => Promise<void>) => {
    await viewer.ctx.dataTransaction(async () => {
        const update = viewer.ctx.build();
        await operations(update);
        await PluginCommands.State.Update(viewer.ctx, {
            state: viewer.ctx.state.data,
            tree: update
        });
    });
};

// Modified createBindingSites
export const createBindingSites = async (
    viewer: ribxzMstarv2,
    dispatch: AppDispatch,
    ligands: Ligand[],
    bindingSites: Record<string, BindingSite>
) => {
    console.time('createBindingSites');
    const structRef = viewer.ctx.managers.structure.hierarchy.current.structures[0]?.cell.transform.ref;
    if (!structRef) return;

    await updateMolstarState(viewer, async update => {
        // Create single group for all new sites
        const bsitesGroup = update
            .to(structRef)
            .group(StateTransforms.Misc.CreateGroup, {label: 'Binding Sites'}, {ref: 'bsites_group'});

        // Group residues by chemical ID
        const siteGroups = ligands.reduce((acc, {chemicalId, purported_7K00_binding_site}) => {
            if (bindingSites[chemicalId]?.ref) return acc;

            const groups = purported_7K00_binding_site.map(([chain, residue]) =>
                MS.struct.generator.atomGroups({
                    'chain-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_asym_id(), chain]),
                    'residue-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_seq_id(), residue])
                })
            );

            acc[chemicalId] = MS.struct.combinator.merge(groups);
            return acc;
        }, {});

        // Create single selection with all sites
        const selection = bsitesGroup.apply(
            StateTransforms.Model.StructureSelectionFromExpression,
            {
                expression: MS.struct.combinator.merge(Object.values(siteGroups))
            },
            {ref: 'bsites_selection'}
        );

        // Single representation for all sites
        selection.apply(
            StateTransforms.Representation.StructureRepresentation3D,
            createStructureRepresentationParams(
                viewer.ctx,
                viewer.ctx.managers.structure.hierarchy.current.structures[0].cell.obj?.data,
                {
                    type: 'ball-and-stick',
                    color: 'uniform',
                    colorParams: {value: Color(0xe24e1b)}
                }
            )
        );

        // Update Redux state
        Object.keys(siteGroups).forEach(chemicalId => {
            const bindingSiteRef = `bsite_${chemicalId}`;
            dispatch(
                addBindingSite({
                    chemicalId,
                    residues:
                        ligands
                            .find(l => l.chemicalId === chemicalId)
                            ?.purported_7K00_binding_site.map(([chain, residue]) => ({
                                auth_asym_id: chain,
                                auth_seq_id: residue
                            })) || []
                })
            );
            dispatch(setBindingSiteRef({chemicalId, ref: bindingSiteRef}));
        });
    });

    console.timeEnd('createBindingSites');
};

export const BsiteDemo = () => {
    const [ctx, setCtx] = useState<MolstarDemoBsites | null>(null);
    const rcsb_id = '7K00';
    const molstarNodeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        (async () => {
            const x = new MolstarDemoBsites();
            const custom_spec: PluginUISpec = {
                ...DefaultPluginUISpec(),
                actions: [],
                config: [],
                components: {
                    disableDragOverlay: true,
                    hideTaskOverlay: true,
                    viewport: {
                        controls: EmptyViewportControls
                    },
                    controls: {
                        right: 'none',
                        bottom: 'none',
                        left: 'none',
                        top: 'none'
                    },
                    remoteState: 'none'
                },
                layout: {
                    initial: {
                        showControls: false,
                        regionState: {
                            bottom: 'hidden',
                            left: 'hidden',
                            right: 'hidden',
                            top: 'hidden'
                        },
                        isExpanded: false
                    }
                }
            };
            await x.init(molstarNodeRef.current!, custom_spec);
            setCtx(x);
        })();
    }, []);

    const {data: ligands_data} = useRoutersRouterLigDemo7K00Query()
    const {
        data: structure_data,
        isLoading: isLoadingProfile,
        error: profileError
    } = useRoutersRouterStructStructureProfileQuery({rcsbId: '7K00'});
    useEffect(() => {
        if (!ctx || !ligands_data) return;
        (async () => {
            let asset_url: string;
            asset_url = `https://models.rcsb.org/${rcsb_id.toUpperCase()}.bcif`;
            const data = await ctx.ctx.builders.data.download(
                {
                    url: asset_url,
                    isBinary: true,
                    label: `${rcsb_id.toUpperCase()}`
                },
                {state: {isGhost: true}}
            );
            const trajectory = await ctx.ctx.builders.structure.parseTrajectory(data, 'mmcif');
            const model = await ctx.ctx.builders.structure.createModel(trajectory);
            const structure = await ctx.ctx.builders.structure.createStructure(model);

            await ctx.ctx.builders.structure.representation.addRepresentation(structure, {
                type: 'cartoon',
                color: 'uniform',
                colorParams: {
                    value: Color(0xffffff)
                },
                typeParams: {
                    alpha: 0.01
                }
            });

            await ctx.ctx.builders.structure.representation.applyPreset(structure.ref, 'composite-bsites-preset', {
                processedData: ligands_data
            });

            ctx.representations.stylized_lighting();
            ctx?.toggleSpin(0.2);
        })();
    }, [ctx, structure_data, ligands_data]);

    return (
        <div className="bg-slate-100 rounded-md shadow-inner p-4">
            <div className="flex gap-4 h-[32rem]">
                {ligands_data && (
                    <div className="w-96 bg-white rounded-md p-2 shadow-sm">
                        <LigandCategoryViewer ctx={ctx!} data={ligands_data} />
                    </div>
                )}
                <div className="flex-1 bg-white rounded-md p-2 shadow-sm">
                    <MolstarNode ref={molstarNodeRef} />
                </div>
            </div>
        </div>
    );
};
