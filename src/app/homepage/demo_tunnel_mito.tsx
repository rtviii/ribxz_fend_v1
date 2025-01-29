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
import {PluginUIContext} from 'molstar/lib/mol-plugin-ui/context';
import {Asset} from 'molstar/lib/mol-util/assets';
export class EmptyViewportControls extends PluginUIComponent<{}, {}> {
    render() {
        return <div className={'msp-viewport-controls'}> </div>;
    }
}
const range = (start: number, end: number): number[] => {
    return Array.from({length: end - start + 1}, (_, i) => start + i);
};

async function createChainRangeVisualization(
    ctx: ribxzMstarv2,
    params: {
        rcsb_id: string;
        auth_asym_id: string;
        range_start: number;
        range_end: number;
        color: number;
        label?: string;
    }
) {
    const {rcsb_id, auth_asym_id, range_start, range_end, color, label = `${auth_asym_id} cluster`} = params;

    // Generate the range of residues
    const residues = Array.from({length: range_end - range_start + 1}, (_, i) => range_start + i);

    // Upload the chain
    const chain = await ctx.components.upload_mmcif_chain(rcsb_id, auth_asym_id);
    if (!chain?.obj?.data) {
        console.error(`${auth_asym_id} data not loaded properly`);
        return;
    }

    // Create residue expression
    const expr = ctx.residues.residue_cluster_expression(residues.map(r => ({auth_asym_id, auth_seq_id: r})));

    // Build the visualization
    const update = ctx.ctx.build();
    const group = update.to(chain.cell).group(StateTransforms.Misc.CreateGroup, {label}, {ref: `${auth_asym_id}_res`});

    const selection = group.apply(
        StateTransforms.Model.StructureSelectionFromExpression,
        {
            label: `${auth_asym_id}_selection`,
            expression: expr
        },
        {ref: `${auth_asym_id}_selection`}
    );

    selection.apply(
        StateTransforms.Representation.StructureRepresentation3D,
        createStructureRepresentationParams(ctx.ctx, chain.obj.data, {
            type: 'ball-and-stick',
            color: 'uniform',
            colorParams: {
                value: Color(color)
            },
            typeParams: {
                ignoreLight: true,
                sizeFactor: 0.25
            }
        }),
        {ref: `${auth_asym_id}_repr`}
    );

    await PluginCommands.State.Update(ctx.ctx, {
        state: ctx.ctx.state.data,
        tree: update
    });

    console.log(`${auth_asym_id} cluster created successfully`);
}

export const TunnelDemoMito = () => {
    const [ctx, setCtx] = useState<ribxzMstarv2 | null>(null);
    const rcsb_id = '7A5G';
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

                // ul4m  = F3 120 150
                // ul22 = T3 150 170
            try {
                await createChainRangeVisualization(ctx, {
                    rcsb_id: rcsb_id,
                    auth_asym_id: 'F3',
                    range_start: 120,
                    range_end: 150,
                    color: 0x93c5fd, // Now required
                    label: 'uL4m tail' // Still optional
                });
                await createChainRangeVisualization(ctx, {
                    rcsb_id: rcsb_id,
                    auth_asym_id: 'T3',
                    range_start: 150,
                    range_end: 170,
                    color: 0xea580c, // Now required
                    label: 'uL22m tail' // Still optional
                });
            } catch (error) {
                console.error('Error creating residue clusters:', error);
            }

            await ctx.tunnel_geometry(rcsb_id);
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
        <Card className="w-1/3 h-80 rounded-md p-2 shadow-inner">
            <MolstarNode ref={molstarNodeRef} />
        </Card>
    );
};
