import { Polymer, useRoutersRouterStructStructureProfileQuery } from "@/store/ribxz_api/ribxz_api";
import { useMemo } from "react";

export function useRibosomeStructureWithNomenclature(rcsb_id: string | undefined) {
    const {data, isLoading, error} = useRoutersRouterStructStructureProfileQuery({rcsbId: rcsb_id!}, {skip: !rcsb_id});

    const nomenclatureMap = useMemo(() => {
        if (!data) return null;

        return [...data.proteins, ...data.rnas, ...data.other_polymers].reduce(
            (prev: Record<string, string>, current: Polymer) => {
                prev[current.auth_asym_id] = current.nomenclature.length > 0 ? current.nomenclature[0] : '';
                return prev;
            },
            {}
        );
    }, [data]);

    return {
        data,
        nomenclatureMap,
        isLoading,
        error
    };
}