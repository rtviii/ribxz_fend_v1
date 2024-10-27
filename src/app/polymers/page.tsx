'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StructureFiltersComponent, Group, useDebounceFilters } from "@/components/ribxz/structure_filters_component"
import { SidebarMenu } from "@/components/ribxz/sidebar_menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Suspense, useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/store"
import React from 'react';
import { Select } from 'antd';
import { PolymerClassOption, groupedOptions } from "@/components/ribxz/filters_protein_class_options"
import { Protein, Rna, ribxz_api, useRoutersRouterStructPolymerClassesNomenclatureQuery, useRoutersRouterStructPolymersByPolymerClassQuery } from "@/store/ribxz_api/ribxz_api"
import PolymersTable from "@/components/ribxz/polymer_table"
import { useSearchParams } from "next/navigation"
import PolymerFiltersComponent from "@/components/ribxz/polymers_filters_component"
import { useGetPolymersMutation } from "@/store/ribxz_api/polymers_api"
import { set_current_polymers, set_total_parent_structures_count, set_total_polymers_count } from "@/store/slices/slice_polymers"
import { Button } from "@/components/ui/button"

export default function PolymersCatalogue() {
    //     TODO
    const searchParams = useSearchParams()
    const class_param = searchParams.get('class')
    //     TODO

    const dispatch = useAppDispatch();
    const total_polymers_count = useAppSelector((state) => state.polymers_page.total_polymers_count)
    const current_polymers = useAppSelector((state) => state.polymers_page.current_polymers)
    const filter_state = useAppSelector((state) => state.polymers_page.filters)
    const debounced_filters = useDebounceFilters(filter_state, 250)
    const [hasMore, setHasMore] = useState(true);
    const [cursor, setCursor] = useState(null)
    const [isLoading, setIsLoading] = useState(false);

    const [getPolymers, { isLoading: structs_isLoading, isError: structs_isErorr, error: structs_error }] = useGetPolymersMutation()

    const fetchPolymers = async (newCursor: [string, string] | null = null) => {
        setIsLoading(true);

        const payload = {
            cursor: newCursor ? newCursor : null,
            limit: 100,
            year: filter_state.year[0] === null && filter_state.year[1] === null ? null : filter_state.year,
            search: filter_state.search || null,
            resolution: filter_state.resolution[0] === null && filter_state.resolution[1] === null ? null : filter_state.resolution,
            polymer_classes: filter_state.polymer_classes.length === 0 ? null : filter_state.polymer_classes,
            source_taxa: filter_state.source_taxa.length === 0 ? null : filter_state.source_taxa,
            host_taxa: filter_state.host_taxa.length === 0 ? null : filter_state.host_taxa,
            subunit_presence: filter_state.subunit_presence || null,
            current_polymer_class: filter_state.current_polymer_class || null,
            has_motif: filter_state.has_motif || null,
            uniprot_id: filter_state.uniprot_id || null
        };

        console.log("Dispatching fetchpolymers with payload", payload);
        try {
            const result = await getPolymers(payload).unwrap();
            const { next_cursor, polymers: new_polymers, total_polymers_count, total_structures_count } = result;

            if (newCursor === null) {
                dispatch(set_current_polymers(new_polymers));
            } else {
                dispatch(set_current_polymers([...current_polymers, ...new_polymers]));
            }
            dispatch(set_total_polymers_count(total_polymers_count));
            dispatch(set_total_parent_structures_count(total_structures_count))

            setCursor(next_cursor);
            setHasMore(next_cursor !== null);
        } catch (err) {
            console.error('Error fetching polymers:', err);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        dispatch(set_current_polymers([]));
        setCursor(null);
        setHasMore(true);
        fetchPolymers();
    }, [debounced_filters]);

    const loadMore = () => {
        if (!isLoading && hasMore) {
            fetchPolymers(cursor);
        }
    };

    if (!current_polymers) {
        return <div>Loading polymers...</div>;
    } else {

        return (
            <Suspense fallback={<div>suspense</div>}>
                <div className="max-w-screen max-h-screen min-h-screen p-4 flex flex-col flex-grow  outline ">
                    <h1 className="text-2xl font-bold mb-6 ">Polymers</h1>
                    <div className="grow"  >
                        <div className="grid grid-cols-12 gap-4 min-h-[90vh]    ">
                            <div className="col-span-3  flex flex-col min-h-full pr-4 space-y-4">
                                <StructureFiltersComponent update_state="polymers" />
                                <PolymerFiltersComponent />
                                <SidebarMenu />
                            </div>
                            <div className="col-span-9 scrollbar-hidden">
                                <PolymersTable polymers={current_polymers} />

                                <Button
                                    onClick={loadMore}
                                    disabled={isLoading || !hasMore}
                                    className="w-full mt-4 py-2 text-sm font-semibold transition-colors duration-200 ease-in-out"
                                >
                                    {isLoading ? 'Loading...' : hasMore ? 'Load More' : 'All polymers loaded'}
                                    <span className="ml-2 text-sm font-normal">
                                        (Showing {current_polymers.length} of {total_polymers_count} polymers)
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Suspense>
        )

    }
}

export const dynamic = 'force-dynamic'