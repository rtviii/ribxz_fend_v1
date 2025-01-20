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
            // const LP_residues = range(120, 144);
            // const LP          = await ctx?.components.upload_mmcif_chain('4UG0', 'LP')
            // const LP_data = LP?.obj?.data
            // const LP_expr = ctx?.residues.residue_cluster_expression( LP_residues.map(r => ({auth_asym_id: 'LP', auth_seq_id: r})), );

            const LC_residues = range(57, 103);
            const LC = await ctx?.components.upload_mmcif_chain('4ug0', 'LC');
            const LC_data = LC?.obj?.data;
            const LC_expr = ctx?.residues.residue_cluster_expression(
                LC_residues.map(r => ({auth_asym_id: 'LC', auth_seq_id: r}))
            )!;
            const LC_sel = Script.getStructureSelection(LC_expr, LC_data!);

            const LC_loci = ctx?.loci_from_expr(LC_expr, LC_data!);

            const update = ctx?.ctx.build()!;

            // Create bsite group
            const bsiteGroup = update
                .to(LC?.cell!)
                .group(StateTransforms.Misc.CreateGroup, {label: `LC tail`}, {ref: `res`});

            const chainGroup = bsiteGroup.apply(
                StateTransforms.Model.StructureSelectionFromExpression,
                {
                    label: `some`,
                    expression: LC_expr
                },
                {ref: `some_ref`}
            );

            chainGroup.apply(
                StateTransforms.Representation.StructureRepresentation3D,
                createStructureRepresentationParams(ctx?.ctx!, LC?.obj?.data, {
                    type: 'ball-and-stick',
                    color: 'uniform',
                    colorParams: {
                        value: Color(0x00ff00)
                    },
                    typeParams: {
                        ignoreLight: true,
                        emissive: 0.1
                    }
                }),
                {ref: `some_repr`}
            );
            await PluginCommands.State.Update(ctx.ctx, {
                state: ctx.ctx.state.data,
                tree: update
            });



            // let loci = StructureSelection.toLociWithSourceUnits(sel);
            // this.ctx.managers.structure.selection.clear();
            // this.ctx.managers.structure.selection.fromLoci('add', loci);
            // this.ctx.managers.camera.focusLoci(loci);

            // for (var i of range(57, 103)) {
            //     LC_residues.push(i)
            // }
            // console.log(LC_residues);
            // ctx?.select_multiple_residues([['LC', LC_residues]], LC?.data)
            // ctx?.create_ball_and_stick_representation(LC!, 'some')
        })();



        // 120-144

        // let LP_residues = []
        // for (var j in range(120,144)) {
        //     LP_residues.push( Number.parseInt(j) )
        // }

        ctx?.tunnel_geometry('4UG0');
        if (ctx?.ctx) {
            const snapshot = ctx?.ctx.canvas3d?.camera.getSnapshot();
            const newSnapshot = {...snapshot, up: Vec3.create(-1, 0, 0)};
            ctx?.ctx.canvas3d?.camera.setState(newSnapshot, 500);
        }
        ctx?.toggleSpin();
    }, [ctx, rcsb_id]);

    return (
        <Card className="flex-1 h-80 rounded-md p-2 shadow-inner">
            <MolstarNode ref={molstarNodeRef} />
        </Card>
    );
};
