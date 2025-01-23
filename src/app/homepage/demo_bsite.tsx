'use client';
import '@/components/mstar/mstar.css';
import {useEffect, useRef, useState} from 'react';
import * as React from 'react';
import {Card} from '@/components/ui/card';
import {MolstarNode, ribxzSpec} from '@/components/mstar/spec';
import {MolScriptBuilder, MolScriptBuilder as MS} from 'molstar/lib/mol-script/language/builder';
// import {MolstarRibxz, MyViewportControls} from '@/components/mstar/__molstar_ribxz';
import {DefaultPluginUISpec, PluginUISpec} from 'molstar/lib/mol-plugin-ui/spec';
import {Quat, Vec3} from 'molstar/lib/mol-math/linear-algebra';
import {MolstarDemoBsites, ScoredBsite} from '@/components/mstar/demos/molstar_demo_bsites';
import {
    ribxz_api,
    useRoutersRouterLigDemo7K00Query,
    useRoutersRouterStructStructureProfileQuery
} from '@/store/ribxz_api/ribxz_api';
import {AppDispatch, useAppDispatch} from '@/store/store';
import {EmptyViewportControls} from './demo_tunnel';
import {MolstarStateController} from '@/components/mstar/mstar_controller';
import {ribxzMstarv2} from '@/components/mstar/mstar_v2';
import {Expression} from 'molstar/lib/mol-script/language/expression';
import {StateTransforms} from 'molstar/lib/mol-plugin-state/transforms';
import {createStructureRepresentationParams} from 'molstar/lib/mol-plugin-state/helpers/structure-representation-params';
import {Color} from 'molstar/lib/mol-util/color/color';
import {PluginCommands} from 'molstar/lib/mol-plugin/commands';
import {setBindingSiteRef} from './demo_bsite_slice';

const createBindingSite = async (
    viewer: ribxzMstarv2,
    dispatch: AppDispatch,
    chemicalId: string,
    residues: {auth_asym_id: string; auth_seq_id: number}[]
) => {
    const update = viewer.ctx.build();
    const structRef = viewer.ctx.managers.structure.hierarchy.current.structures[0]?.cell.transform.ref;
    if (!structRef) return;
    const groups: Expression[] = residues.map(({auth_asym_id, auth_seq_id}) =>
        MS.struct.generator.atomGroups({
            'chain-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_asym_id(), auth_asym_id]),
            'residue-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_seq_id(), auth_seq_id])
        })
    );

    const expression = MS.struct.combinator.merge(groups);

    const bindingSiteRef = `bsite_${chemicalId}`;
    const group = update
        .to(structRef)
        .group(StateTransforms.Misc.CreateGroup, {label: `Binding Site ${chemicalId}`}, {ref: bindingSiteRef});

    const selection = group.apply(
        StateTransforms.Model.StructureSelectionFromExpression,
        {expression},
        {ref: `${bindingSiteRef}_sel`}
    );

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

    await PluginCommands.State.Update(viewer.ctx, {
        state: viewer.ctx.state.data,
        tree: update
    });

    dispatch(
        setBindingSiteRef({
            chemicalId,
            ref: bindingSiteRef
        })
    );

    return bindingSiteRef;
};

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

    const dispatch = useAppDispatch();
    const {data: ligands_data} = useRoutersRouterLigDemo7K00Query();

    const {
        data: structure_data,
        isLoading: isLoadingProfile,
        error: profileError
    } = useRoutersRouterStructStructureProfileQuery({rcsbId: '7K00'});

    console.log(ligands_data);

    useEffect(() => {
        if (!ctx || !structure_data) return;
        const newNomenclatureMap = [
            ...structure_data.proteins,
            ...structure_data.rnas,
            ...structure_data.other_polymers
        ].reduce((prev, current) => {
            prev[current.auth_asym_id] = current.nomenclature.length > 0 ? current.nomenclature[0] : '';
            return prev;
        }, {});

        (async () => {
            if (!ligands_data || !ctx) return;
            const sos = await ctx?.upload_mmcif_structure(rcsb_id, newNomenclatureMap);

            const reduced6no = Object.entries(ligands_data['6NO']).flatMap(([auth_asym_id, residues]) =>
                residues.map((res: [number, string]) => ({
                    auth_asym_id,
                    auth_seq_id: res[0]
                }))
            );
            const bsite = await createBindingSite(ctx, dispatch, '6NO', reduced6no);

            await ctx?.toggleSpin(0.5);
            await ctx?.ctx.canvas3d?.requestCameraReset();
        })();
    }, [ctx, structure_data, ligands_data]);

    return (
        <Card className="flex-1 h-[32rem] rounded-md p-2 shadow-inner">
            <div className="w-full h-full">
                <MolstarNode ref={molstarNodeRef} />
            </div>
        </Card>
    );
};
