'use client'
import { LandmarkItem } from "./structural_component";

const availableLandmarks = {
    PTC: {
        title: 'PTC',
        description: 'Peptidyl Transferase Center',
        longDescription: 'The PTC is the active site of the ribosome where peptide bond formation occurs.'
    },
    NPET: {
        title: 'NPET',
        description: 'Nascent Peptide Exit Tunnel',
        longDescription: 'The NPET is a channel through which newly synthesized proteins exit the ribosome.'
    }
};

export const TunnelLandmarkComponent: React.FC<{
    rcsb_id: string;
    ctx: ribxzMstarv2;
}> = ({rcsb_id, ctx}) => {
    const tunnel_loci = useAppSelector(state => state.structure_page.tunnel.loci);
    const dispatch = useAppDispatch();
    const defaultTunnelActions: LandmarkActions = {
        download: (rcsb_id: string) => {
            downloadPlyFile(
                `${process.env.NEXT_PUBLIC_DJANGO_URL}/structures/tunnel_geometry?rcsb_id=${rcsb_id}&is_ascii=true`,
                `${rcsb_id}_tunnel_geometry.ply`
            );
        },
        render: async (rcsb_id: string, ctx) => {
            const tunnel_loci = await ctx?.tunnel_geoemetry(rcsb_id);
            console.log('Returned loci:', tunnel_loci);
            dispatch(set_tunnel_shape_loci(tunnel_loci));
        },
        on_click: () => {
            console.log(tunnel_loci);
            // ctx.ctx.managers.structure.selection.fromLoci('add', tunnel_loci[0]);
            // ctx.ctx.managers.camera.focusLoci(tunnel_loci);
        }
    };
    return <LandmarkItem {...availableLandmarks['NPET']} rcsb_id={rcsb_id} landmark_actions={defaultTunnelActions} />;
};