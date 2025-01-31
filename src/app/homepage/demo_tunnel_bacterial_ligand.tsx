'use client';
import {MolScriptBuilder, MolScriptBuilder as MS} from 'molstar/lib/mol-script/language/builder';
import '@/components/mstar/mstar.css';
import {useEffect, useRef, useState} from 'react';
import * as React from 'react';
import {Card} from '@/components/ui/card';
import {MolstarNode, ribxzSpec} from '@/components/mstar/spec';
import {DefaultPluginUISpec, PluginUISpec} from 'molstar/lib/mol-plugin-ui/spec';
import {Quat, Vec3} from 'molstar/lib/mol-math/linear-algebra';
import {createChainRangeVisualization, ribxzMstarv2} from '@/components/mstar/mstar_v2';
import {PluginUIComponent} from 'molstar/lib/mol-plugin-ui/base';
import {StateTransforms} from 'molstar/lib/mol-plugin-state/transforms';
import {createStructureRepresentationParams} from 'molstar/lib/mol-plugin-state/helpers/structure-representation-params';
import {Color} from 'molstar/lib/mol-util/color/color';
import {PluginCommands} from 'molstar/lib/mol-plugin/commands';

export class EmptyViewportControls extends PluginUIComponent<{}, {}> {
    render() {
        return <div className={'msp-viewport-controls'}> </div>;
    }
}
const range = (start: number, end: number): number[] => {
    return Array.from({length: end - start + 1}, (_, i) => start + i);
};



export const TunnelDemoBacterial = () => {
    const [ctx, setCtx]  = useState<ribxzMstarv2 | null>(null);
    const rcsb_id        = '3J7Z';
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
                // ul4  = E
                // ul22 = S
                await createChainRangeVisualization(ctx, {
                    rcsb_id     : rcsb_id,
                    auth_asym_id: 'E',
                    range_start : 55,
                    range_end   : 78,
                    color       : 0x93c5fd,   // Now required
                    label       : 'uL4 tail'   // Still optional
                });
                await createChainRangeVisualization(ctx, {
                    rcsb_id: rcsb_id,
                    auth_asym_id: 'S',
                    range_start: 80,
                    range_end: 100,
                    color: 0xea580c, 
                    label: 'uL22 tail'
                });
                await createChainRangeVisualization(ctx, {
                    rcsb_id: rcsb_id,
                    auth_asym_id: 'a',
                    range_start: 3,
                    range_end: 9,
                    color: 0xea580c, 
                    label: 'Nascent Chain'
                });
            } catch (error) {
                console.error('Error creating residue clusters:', error);
            }

            ctx.components.upload_mmcif_nonpolymer(rcsb_id,'ERY');
            ctx.tunnel_geometry(rcsb_id);

            ctx.toggleSpin();
            ctx.ligands.create_ligand(rcsb_id,'ERY')
            // Camera and tunnel setup

            // if (ctx.ctx) {
            //     const snapshot = ctx.ctx.canvas3d?.camera.getSnapshot();
            //     if (snapshot) {
            //         const newSnapshot = {
            //             ...snapshot,
            //             up: Vec3.create(-1, 0, 0)
            //         };
            //         ctx.ctx.canvas3d?.camera.setState(newSnapshot, 300);
            //     }
            // }
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
