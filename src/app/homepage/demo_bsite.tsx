"use client"
import '@/components/mstar/mstar.css'
import { useEffect, useRef, useState } from 'react';
import * as React from "react"
import { Card } from '@/components/ui/card';
import { MolstarNode, MySpec } from '@/components/mstar/lib';
import { MolstarRibxz, MyViewportControls } from '@/components/mstar/molstar_ribxz';
import { DefaultPluginUISpec, PluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { Quat, Vec3 } from 'molstar/lib/mol-math/linear-algebra';
import { MolstarDemoBsites } from '@/components/mstar/demo_bsites/molstar_demo_bsites';

export const BsiteDemo = () => {

    const [ctx, setCtx] = useState<MolstarDemoBsites | null>(null);
    const rcsb_id = '1HNZ'
    const molstarNodeRef = useRef<HTMLDivElement>(null);

    // !Autoload structure
    useEffect(() => {
        (async () => {
            const x = new MolstarDemoBsites
            const custom_spec: PluginUISpec = {
                ...DefaultPluginUISpec(),
                // actions: [],
                // config: [
                // ],
                // components: {
                // disableDragOverlay: true,
                // hideTaskOverlay: true,
                // viewport: {
                //     controls: MyViewportControls
                // },
                // controls: {
                //     right: "none",
                //     bottom: 'none',
                //     left: 'none',
                //     top: "none"
                // },
                // remoteState: 'none',
                // },
                // layout: {
                //     initial: {
                //         showControls: false,
                //         regionState: {
                //             bottom: 'hidden',
                //             left: 'hidden',
                //             right: 'hidden',
                //             top: 'hidden'
                //         },
                //         isExpanded: false
                //     }
                // }
            }
            await x.init(molstarNodeRef.current!, custom_spec)
            setCtx(x)
        })()
    }, [])

    useEffect(() => {
        (async () => {
            const bsite = {
                'A': {
                    20:0.5,
                    40:1,
                    50:1,
                    25:0.5
                },
            }

            await ctx?.upload_mmcif_structure(rcsb_id)
            // await ctx?.bsite_repr()
            await ctx?.applyBsiteColors(bsite)

        })()

    }, [ctx, rcsb_id])


    return (
        <Card className="flex-1 h-80 rounded-md p-2 shadow-inner">
            <MolstarNode ref={molstarNodeRef} />
        </Card>
    );
}