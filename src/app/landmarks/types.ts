import { MolstarRibxz } from "@/components/mstar/molstar_wrapper_class";
export interface BaseLandmark {
    title          : string;
    description    : string;
    longDescription: string;
    imageUrl?      : string;
}
export interface LandmarkActions {
    download: (rcsb_id: string) => void;
    render  : (rcsb_id: string, ctx: MolstarRibxz) => void;
}

export type Landmark<T extends LandmarkActions> = BaseLandmark & T;

export interface TunnelActions extends LandmarkActions {
    download: (rcsb_id: string) => void;
    render: (rcsb_id: string, ctx: MolstarRibxz) => void;
}
export type TunnelLandmark = Landmark<TunnelActions>;

const defaultTunnelActions: LandmarkActions = {
    download: (rcsb_id: string) => { /* default download logic */ },
    render  : (rcsb_id: string, ctx) => { ctx?.renderPLY(rcsb_id); }
};


export function createTunnelLandmark(
    data: BaseLandmark,
    ctx: MolstarRibxz,
): TunnelLandmark {
    return {
        ...data,
        download: defaultTunnelActions.download,
        render  : (rcsb_id: string) => (defaultTunnelActions.render)(rcsb_id, ctx)
    };
}


export interface LandmarkItemProps<T extends LandmarkActions> {
    data   : Landmark<T>;
    rcsb_id: string;
}
