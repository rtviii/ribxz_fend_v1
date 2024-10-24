"use client"
import DiceIcon from '../../public/dice.svg'
import Image from 'next/image';
import { ribxz_api, useRoutersRouterStructAllRcsbIdsQuery, useRoutersRouterStructListLigandsQuery, useRoutersRouterStructPolymerClassesNomenclatureQuery, useRoutersRouterStructPolymerClassesStatsQuery, useRoutersRouterStructRandomProfileQuery, useRoutersRouterStructStructureCompositionStatsQuery } from '@/store/ribxz_api/ribxz_api';
import Link from "next/link"
import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button"
import { SidebarMenu } from '@/components/ribxz/sidebar_menu';
import { Separator } from '@/components/ui/separator';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { HoverCard, HoverCardContent, HoverCardTrigger, } from "@/components/ui/hover-card"
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import * as React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { StructureCard } from '@/components/ribxz/structure_card';
import { useAppSelector } from '@/store/store';
import { MolstarNode, MySpec } from '@/components/mstar/lib';
import { MolstarRibxz, MyViewportControls } from '@/components/mstar/molstar_wrapper_class';
import { DefaultPluginUISpec, PluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { PluginConfig } from 'molstar/lib/mol-plugin/config';
import { PluginSpec } from 'molstar/lib/mol-plugin/spec';
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms';
import { BoxifyVolumeStreaming, CreateVolumeStreamingBehavior, InitVolumeStreaming } from 'molstar/lib/mol-plugin/behavior/dynamic/volume-streaming/transformers';
import { StateActions } from 'molstar/lib/mol-plugin-state/actions';


export const TunnelDemo = () => {
    const [ctx, setCtx] = useState<MolstarRibxz | null>(null);
    const rcsb_id = '4UG0'
    const molstarNodeRef = useRef<HTMLDivElement>(null);
    // !Autoload structure
    useEffect(() => {
        (async () => {
            const x = new MolstarRibxz
            const custom_spec: PluginUISpec = {
                ...DefaultPluginUISpec(),
  actions: [],
                config: [
                ],
                components: {
                    disableDragOverlay: true,
                    hideTaskOverlay: true,
                    viewport: {
                        controls: MyViewportControls
                    },
                    controls: {
                        right : "none",
                        bottom: 'none',
                        left  : 'none',
                        top   : "none"
                    },
                    remoteState: 'none',
                },
                layout:{
                    initial:{
                        // controlsDisplay:'landscape',
                        showControls: false,
                        regionState:{
                            bottom: 'hidden',
                            left:'hidden',
                            right:'hidden',
                            top:'hidden'
                        },
                        isExpanded:false
                    }
                }

            }
            await x.init(molstarNodeRef.current!, custom_spec)
            setCtx(x)
        })()
    }, [])

    useEffect(() => {
        ctx?.tunnel_geoemetry('4UG0')
    }, [ctx, rcsb_id])


    return (
        <div className="grid grid-cols-2 gap-8 w-full py-8">
            <Card className="p-6 space-y-4 h-80">
                <MolstarNode ref={molstarNodeRef} />
            </Card>
        </div>
    );
}
