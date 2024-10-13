"use client"
import { Input } from "@/components/ui/input"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CardContent, Card } from "@/components/ui/card"
import { StructureCard, StructureStack } from "../../components/ribxz/structure_card"
import { useCallback, useEffect, useState } from "react"
import { Filters, useDebounceFilters } from "@/components/ribxz/filters"
import { PaginationElement } from '@/components/ribxz/pagination_element'
import { SidebarMenu } from "@/components/ribxz/sidebar_menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store/store';
import { useAppSelector } from "@/store/store"
import { RibosomeStructure, ribxz_api, useRoutersRouterStructFilterListQuery } from "@/store/ribxz_api/ribxz_api"
import { FiltersState, pagination_set_page } from "@/store/slices/ui_state"
import { useDebouncePagination } from "@/my_utils"
import { log } from "node:console"
import { ApiProvider } from '@reduxjs/toolkit/query/react'
import { structuresApi, useGetStructuresMutation } from '@/store/ribxz_api/structures_api'
import { debounce } from "lodash"


export default function StructureCatalogue() {

  const [groupByDeposition, setGroupByDeposition] = useState(false);
  const filter_state                              = useAppSelector((state) => state.ui.filters)
  const debounced_filters                         = useDebounceFilters(filter_state, 250)
  const [cursor, setCursor] = useState(null)
  const [structures, setStructures] = useState<RibosomeStructure[]>([])
  const [getStructures, { isLoading:structs_isLoading, isError:structs_isErorr, error:structs_error }] = useGetStructuresMutation()
  const [isLoading, setIsLoading] = useState(false);


 const fetchStructures = useCallback(async (newCursor: string | null = null) => {
    setIsLoading(true);
    const payload = {
      cursor          : newCursor,
      limit           : 20,
      year            : debounced_filters.year[0] === null && debounced_filters.year[1] === null ? null            : debounced_filters.year,
      search          : debounced_filters.search || null,
      resolution      : debounced_filters.resolution[0] === null && debounced_filters.resolution[1] === null ? null: debounced_filters.resolution,
      polymer_classes : debounced_filters.polymer_classes.length === 0 ? null                                      : debounced_filters.polymer_classes,
      source_taxa     : debounced_filters.source_taxa.length === 0 ? null                                          : debounced_filters.source_taxa,
      host_taxa       : debounced_filters.host_taxa.length === 0 ? null                                            : debounced_filters.host_taxa,
      subunit_presence: debounced_filters.subunit_presence || null,
    };
    
    try {
      const result = await getStructures(payload).unwrap();
      console.log("Got result:", result);
      if (newCursor === null) {
        setStructures(result.structures);
      } else {
        setStructures(prev => [...prev, ...result.structures]);
      }
      setCursor(result.next_cursor);

    } catch (err) {
      console.error('Error fetching structures:', err);
    } finally {
      setIsLoading(false);
    }
  }, [debounced_filters, getStructures]);

  const debouncedFetch = useCallback(
    debounce(() => fetchStructures(null), 300),
    [fetchStructures]
  );

  useEffect(() => {
    debouncedFetch();
    return () => {
      debouncedFetch.cancel();
    };
  }, [filter_state, debouncedFetch]);

  const handleLoadMore = () => {
    if (cursor && !isLoading) {
      fetchStructures(cursor);
    }
  };


  // TODO: this logic should be in the corresponding structure component (keep filters/pagination general)
  return (
    <div className="max-w-screen max-h-screen min-h-screen p-4 flex flex-col flex-grow  outline ">
      {/* <HoverMenu /> */}
      <h1 className="text-2xl font-bold mb-6">Ribosome Structures</h1>
      <div className="grow"  >
        <div className="grid grid-cols-12 gap-4 min-h-[90vh]    ">
          <div className="col-span-3  flex flex-col min-h-full pr-4">
            <Filters />
            <SidebarMenu />
            {/* <div className="p-1 my-4 rounded-md border w-full">
              <PaginationElement slice_type={"structures"} />
            </div> */}
          </div>
          <div className="col-span-9 scrollbar-hidden">
            <Button onClick={() => { setGroupByDeposition(!groupByDeposition) }}>Group by deposition? {`${groupByDeposition}`}</Button>

            <ScrollArea className=" max-h-[90vh] overflow-y-scroll scrollbar-hidden" scrollHideDelay={1} >
              <div className=" gap-4 flex  flex-wrap   scrollbar-hidden"  >
                {structures.map((struct) => (<StructureCard _={struct} key={struct.rcsb_id} />))}
              </div>
              <div>
                {/* {cursor && (
                  <button onClick={loadMore} disabled={isLoading}>
                    {isLoading ? 'Loading more...' : 'Load More'}
                  </button>
                )} */}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}



