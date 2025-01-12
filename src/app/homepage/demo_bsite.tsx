'use client';
import '@/components/mstar/mstar.css';
import {useEffect, useRef, useState} from 'react';
import * as React from 'react';
import {Card} from '@/components/ui/card';
import {MolstarNode, ribxzSpec} from '@/components/mstar/spec';
import {MolstarRibxz, MyViewportControls} from '@/components/mstar/__molstar_ribxz';
import {DefaultPluginUISpec, PluginUISpec} from 'molstar/lib/mol-plugin-ui/spec';
import {Quat, Vec3} from 'molstar/lib/mol-math/linear-algebra';
import {MolstarDemoBsites, ScoredBsite} from '@/components/mstar/demos/molstar_demo_bsites';
import {ribxz_api} from '@/store/ribxz_api/ribxz_api';
import {useAppDispatch} from '@/store/store';

export const BsiteDemo = () => {
    const [ctx, setCtx] = useState<MolstarDemoBsites | null>(null);
    const rcsb_id = '7K00';
    const molstarNodeRef = useRef<HTMLDivElement>(null);

    // !Autoload structure
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
                        controls: MyViewportControls
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

    const dispatch = useAppDispatch();
    useEffect(() => {
        (async () => {
            const composite_bsite = await dispatch(ribxz_api.endpoints.routersRouterLigBsiteComposite.initiate());
            await ctx?.upload_mmcif_structure(rcsb_id, {});
            await ctx?.applyBsiteColors(composite_bsite.data as ScoredBsite);
            await ctx?.toggleSpin();
        })();
    }, [ctx, rcsb_id]);

    return (
        <Card className="flex-1 h-80 rounded-md p-2 shadow-inner">
            <MolstarNode ref={molstarNodeRef} />
        </Card>
    );
};
