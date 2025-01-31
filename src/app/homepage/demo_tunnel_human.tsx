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
import {createChainRangeVisualization, ribxzMstarv2} from '@/components/mstar/mstar_v2';
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

export const TunnelDemo = () => {
    const [ctx, setCtx] = useState<ribxzMstarv2 | null>(null);
    const rcsb_id = '4UG0';
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
                await createChainRangeVisualization(ctx, {
                    rcsb_id: rcsb_id,
                    auth_asym_id: 'Ll',
                    range_start: 20,
                    range_end: 42,
                    color: 0xcbc3e3,
                    label: 'eL39 tail',

                    point_representation:true
                    // showLabels: true
                });
                await createChainRangeVisualization(ctx, {
                    rcsb_id: rcsb_id,
                    auth_asym_id: 'LP',
                    range_start: 120,
                    range_end: 144,
                    color: 0xea580c,
                    label: 'uL4 tail',
                    point_representation:true
                    // showLabels: true
                });
                await createChainRangeVisualization(ctx, {
                    rcsb_id: rcsb_id,
                    auth_asym_id: 'LC',
                    range_start: 57,
                    range_end: 103,
                    color: 0x93c5fd,
                    label: 'uL22 tail',
                    point_representation:true
                    // showLabels: true
                });
            } catch (error) {
                console.error('Error creating residue clusters:', error);
            }

            ctx.tunnel_geometry(rcsb_id,1);
            ctx.toggleSpin();

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
  <div className="h-full">
            <MolstarNode ref={molstarNodeRef} />
  </div>
    );
};
