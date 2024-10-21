"use client"
import { Input } from "@/components/ui/input"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CardContent, Card } from "@/components/ui/card"
import { StructureCard, StructureStack } from "../../components/ribxz/structure_card"
import { useCallback, useEffect, useState } from "react"
import { StructureFiltersComponent, useDebounceFilters } from "@/components/ribxz/structure_filters"
import { PaginationElement } from '@/components/ribxz/pagination_element'
import { SidebarMenu } from "@/components/ribxz/sidebar_menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store/store';
import { useAppSelector } from "@/store/store"
import { RibosomeStructure, ribxz_api } from "@/store/ribxz_api/ribxz_api"
import { useDebouncePagination } from "@/my_utils"
import { log } from "node:console"
import { ApiProvider } from '@reduxjs/toolkit/query/react'
import { structuresApi, useGetStructuresMutation } from '@/store/ribxz_api/structures_api'
import { debounce } from "lodash"
import { set_current_structures, set_total_structures_count } from "@/store/slices/slice_structures"



export default function StructureCatalogue() {

  const dispatch                                                                                          = useAppDispatch();
  const filter_state                                                                                      = useAppSelector((state) => state.structures_page.filters)
  const debounced_filters                                                                                 = useDebounceFilters(filter_state, 250)
  const [hasMore, setHasMore]                                                                             = useState(true);
  const [groupByDeposition, setGroupByDeposition]                                                         = useState(false);
  const [cursor, setCursor]                                                                               = useState(null)
  const [getStructures, { isLoading: structs_isLoading, isError: structs_isErorr, error: structs_error }] = useGetStructuresMutation()
  const [isLoading, setIsLoading]                                                                         = useState(false);
  const current_structures                                                                                = useAppSelector(state => state.structures_page.current_structures);
  const total_structures_count                                                                            = useAppSelector(state => state.structures_page.total_structures_count);

  const fetchStructures = async (newCursor: string | null = null) => {
    setIsLoading(true);
    const payload = {
      cursor          : newCursor,
      limit           : 20,
      year            : filter_state.year[0] === null && filter_state.year[1] === null ? null            : filter_state.year,
      search          : filter_state.search || null,
      resolution      : filter_state.resolution[0] === null && filter_state.resolution[1] === null ? null: filter_state.resolution,
      polymer_classes : filter_state.polymer_classes.length === 0 ? null                                 : filter_state.polymer_classes,
      source_taxa     : filter_state.source_taxa.length === 0 ? null                                     : filter_state.source_taxa,
      host_taxa       : filter_state.host_taxa.length === 0 ? null                                       : filter_state.host_taxa,
      subunit_presence: filter_state.subunit_presence || null,
    };

    try {
      const result = await getStructures(payload).unwrap();
      const { structures: new_structures, next_cursor, total_count } = result;

      if (newCursor === null) {
        dispatch(set_current_structures(new_structures));
      } else {
        dispatch(set_current_structures([...current_structures, ...new_structures]));
      }

      dispatch(set_total_structures_count(total_count));

      setCursor(next_cursor);
      setHasMore(next_cursor !== null);
    } catch (err) {
      console.error('Error fetching structures:', err);
    } finally {
      setIsLoading(false);
    }
  }



  useEffect(() => {
    dispatch(set_current_structures([]));
    setCursor(null);
    setHasMore(true);
    fetchStructures();
  }, [debounced_filters]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchStructures(cursor);
    }
  };


  return (
    <div className="max-w-screen max-h-screen min-h-screen p-4 flex flex-col flex-grow  outline ">
      {/* <HoverMenu /> */}
      <h1 className="text-2xl font-bold mb-6">Ribosome Structures</h1>
      <div className="grow"  >
        <div className="grid grid-cols-12 gap-4 min-h-[90vh]    ">
          <div className="col-span-3  flex flex-col min-h-full pr-4">
            <StructureFiltersComponent />
            <SidebarMenu />
          </div>
          <div className="col-span-9 scrollbar-hidden">

            <ScrollArea className="flex-grow max-h-[90vh] overflow-y-auto border border-gray-200 rounded-md shadow-inner bg-slate-100 p-2" scrollHideDelay={1} >

              <div className=" gap-4 flex  flex-wrap   scrollbar-hidden"  >
                {current_structures.map(structure => (
                  <StructureCard key={structure.rcsb_id} _={structure} />
                ))}
                {isLoading && <p>Loading...</p>}
              </div>

              <Button
                onClick={loadMore}
                disabled={isLoading || !hasMore}
                className=" m-3 py-0 text-sm font-semibold  transition-colors duration-200 ease-in-out"
              >
                {isLoading ? 'Loading...' : hasMore ? 'Load More' : 'All structures loaded'}
                <span className="m-2 text-sm font-normal">
                  (Showing {current_structures.length} of {total_structures_count} structures)
                </span>
              </Button>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}



