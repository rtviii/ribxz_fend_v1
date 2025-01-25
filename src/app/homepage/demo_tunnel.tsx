'use client';
import {MolScriptBuilder, MolScriptBuilder as MS} from 'molstar/lib/mol-script/language/builder';
import '@/components/mstar/mstar.css';
import {useEffect, useRef, useState} from 'react';
import * as React from 'react';
import {Card} from '@/components/ui/card';
import {MolstarNode, ribxzSpec} from '@/components/mstar/spec';
// import {MolstarRibxz, MyViewportControls} from '@/components/mstar/__molstar_ribxz';

import {DefaultPluginUISpec, PluginUISpec} from 'molstar/lib/mol-plugin-ui/spec';
import {Quat, Vec3} from 'molstar/lib/mol-math/linear-algebra';
import {MolstarContext, useMolstarService} from '@/components/mstar/mstar_service';
import {ribxzMstarv2} from '@/components/mstar/mstar_v2';
import {PluginUIComponent} from 'molstar/lib/mol-plugin-ui/base';
import {Script} from 'molstar/lib/mol-script/script';
import {StateTransforms} from 'molstar/lib/mol-plugin-state/transforms';
import {createStructureRepresentationParams} from 'molstar/lib/mol-plugin-state/helpers/structure-representation-params';
import {Color} from 'molstar/lib/mol-util/color/color';
import {PluginCommands} from 'molstar/lib/mol-plugin/commands';
import {Task} from 'molstar/lib/mol-task/task';
import {compile} from 'molstar/lib/mol-script/runtime/query/compiler';
import {QueryContext, StructureElement, StructureProperties, StructureSelection} from 'molstar/lib/mol-model/structure';
export class EmptyViewportControls extends PluginUIComponent<{}, {}> {
    render() {
        return <div className={'msp-viewport-controls'}> </div>;
    }
}
const range = (start: number, end: number): number[] => {
    return Array.from({length: end - start + 1}, (_, i) => start + i);
};

export const TunnelDemo = () => {
    const [ctx, setCtx]  = useState<ribxzMstarv2 | null>(null);
    const rcsb_id        = '4UG0';
    const molstarNodeRef = useRef<HTMLDivElement>(null);

    // !Autoload structure
    useEffect(() => {
        (async () => {
            const x = new ribxzMstarv2();
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
    useEffect(() => {
        (async () => {
            if (!ctx) return;
            try {
                const LP_residues = range(120, 144);
                const LP          = await ctx.components.upload_mmcif_chain('4UG0', 'LP');
                if (!LP?.obj?.data) {
                    console.error('LP data not loaded properly');
                    return;
                }

                const LP_expr = ctx.residues.residue_cluster_expression(
                    LP_residues.map(r => ({auth_asym_id: 'LP', auth_seq_id: r}))
                );

                const update_lp = ctx.ctx.build();
                const group_lp = update_lp
                    .to(LP.cell)
                    .group(StateTransforms.Misc.CreateGroup, {label: 'LP tail'}, {ref: 'lp_res'});

                const group_lp1 = group_lp.apply(
                    StateTransforms.Model.StructureSelectionFromExpression,
                    {
                        label: 'LP_selection',
                        expression: LP_expr
                    },
                    {ref: 'lp_selection'}
                );

                group_lp1.apply(
                    StateTransforms.Representation.StructureRepresentation3D,
                    createStructureRepresentationParams(ctx.ctx, LP.obj.data, {
                        type: 'ball-and-stick',
                        color: 'uniform',
                        colorParams: {
                            value: Color(0x93c5fd)
                        },
                        typeParams: {
                            ignoreLight: true,
                            sizeFactor: 0.25
                        }
                    }),
                    {ref: 'lp_repr'}
                );

                await PluginCommands.State.Update(ctx.ctx, {
                    state: ctx.ctx.state.data,
                    tree: update_lp
                });
                console.log('LP cluster created successfully');

                // Second cluster - LC
                console.log('Starting LC cluster creation...');
                const LC_residues = range(57, 103);
                const LC = await ctx.components.upload_mmcif_chain('4ug0', 'LC');

                if (!LC?.obj?.data) {
                    console.error('LC data not loaded properly');
                    return;
                }

                const LC_expr = ctx.residues.residue_cluster_expression(
                    LC_residues.map(r => ({auth_asym_id: 'LC', auth_seq_id: r}))
                );

                const update_lc = ctx.ctx.build();
                const group_lc = update_lc
                    .to(LC.cell)
                    .group(StateTransforms.Misc.CreateGroup, {label: 'LC tail'}, {ref: 'lc_res'});

                const group_lc1 = group_lc.apply(
                    StateTransforms.Model.StructureSelectionFromExpression,
                    {
                        label: 'LC_selection',
                        expression: LC_expr
                    },
                    {ref: 'lc_selection'}
                );

                group_lc1.apply(
                    StateTransforms.Representation.StructureRepresentation3D,
                    createStructureRepresentationParams(ctx.ctx, LC.obj.data, {
                        type: 'ball-and-stick',
                        color: 'uniform',
                        colorParams: {
                            value: Color(0xea580c)
                        },
                        typeParams: {
                            ignoreLight: true,
                            sizeFactor: 0.25
                        }
                    }),
                    {ref: 'lc_repr'}
                );

                await PluginCommands.State.Update(ctx.ctx, {
                    state: ctx.ctx.state.data,
                    tree: update_lc
                });
                console.log('LC cluster created successfully');
            } catch (error) {
                console.error('Error creating residue clusters:', error);
            }

            ctx.tunnel_geometry('4UG0');
            ctx.toggleSpin();
            // Camera and tunnel setup

            if (ctx.ctx) {
                const snapshot = ctx.ctx.canvas3d?.camera.getSnapshot();
                if (snapshot) {
                    const newSnapshot = {
                        ...snapshot,
                        up: Vec3.create(-1, 0, 0)
                    };
                    ctx.ctx.canvas3d?.camera.setState(newSnapshot, 300);
                }
            }
            setTimeout(() => {
                if (ctx.ctx?.canvas3d?.camera) {
                    ctx.ctx.canvas3d.requestCameraReset();
                }
            }, 300);
        })();
    }, [ctx, rcsb_id]);

    return (
        <Card className="flex-1 h-80 rounded-md p-2 shadow-inner">
            <MolstarNode ref={molstarNodeRef} />
        </Card>
    );
};
