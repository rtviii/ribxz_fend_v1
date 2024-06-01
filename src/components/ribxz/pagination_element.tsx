import { useEffect, useRef, useState } from "react"
import { PaginationState, pagination_next_page, pagination_prev_page, pagination_set_page } from '@/store/slices/ui_state'
import {
  ribxz_api,
} from "@/store/ribxz_api/ribxz_api"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useAppDispatch, useAppSelector } from "@/store/store";

function useDebouncePagination(value: PaginationState, delay: number): PaginationState {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);    

  return debouncedValue;
}


interface PaginationProps {
  slice_type: "structures" | "polymers"
}

export function PaginationElement(props: PaginationProps) {

  const dispatch             = useAppDispatch();
  const page_state           = useAppSelector(state => state.ui.pagination)!
  const debounced_page_state = useDebouncePagination(page_state, 250)

  const [triggerRefetch, { data, error }] = ribxz_api.endpoints.routersRouterStructFilterList.useLazyQuery()
  const filter_state = useAppSelector((state) => state.ui.filters)

  useEffect(() => {

    triggerRefetch({
      page: page_state.current_structures_page,
      year: filter_state.year.map(x => x === null || x === 0 ? null : x.toString()).join(','),
      resolution: filter_state.resolution.map(x => x === null || x === 0 ? null : x.toString()).join(','),
      hostTaxa: filter_state.host_taxa.length == 0 ? '' : filter_state.host_taxa.map(x => x === null ? null : x.toString()).join(','),
      sourceTaxa: filter_state.source_taxa.length == 0 ? '' : filter_state.source_taxa.map(x => x === null ? null : x.toString()).join(','),
      polymerClasses: filter_state.polymer_classes.length == 0 ? '' : filter_state.polymer_classes.join(','),
      search: filter_state.search === null ? '' : filter_state.search
    }).unwrap()


  }, [debounced_page_state.current_structures_page])


  const YscrolltoX = (event: any) => {
    event.preventDefault();
    event.target.scrollBy({
      left: event.deltaY < 0 ? -30 : 30,
    });
  }



  const innerRef = useRef(null);

  useEffect(() => {
    const div = innerRef.current;
    // subscribe event
    div.addEventListener("wheel", YscrolltoX);

    return () => {
      // unsubscribe event
      div.removeEventListener("wheel", YscrolltoX);
    };

  }, [innerRef])

  return (
    <Pagination >
      <PaginationContent className="flex flex-row overflow-auto" >
        <div>
          <PaginationItem className="hover:cursor-pointer hover:bg-slate-200 rounded-md" onClick={() => {
            dispatch(pagination_prev_page({
              slice_name: props.slice_type
            }))
          }}>
            <PaginationPrevious />
          </PaginationItem>
        </div>

        <div className=" flex flex-row max-w-xs  no-scrollbar  overflow-x-scroll scroll-mx-4" ref={innerRef}>
          {
            Array.from({ length: page_state.total_structures_pages! }, (_, i) => i + 1)
              .slice(page_state.current_structures_page - 6 < 0 ? 0 : page_state.current_structures_page - 6, page_state.current_structures_page + 6 <= page_state.total_structures_pages! ? page_state.current_structures_page + 6 : page_state.total_structures_pages!)
              .map(
                (v) =>
                  <PaginationItem key={v} className="hover:bg-slate-200 hover:cursor-pointer rounded-md" onClick={() => {
                    dispatch(pagination_set_page({ set_to_page: v, slice_name: props.slice_type }))
                  }}>
                    {
                      props.slice_type === 'polymers' ?
                        <PaginationLink isActive={v == page_state.current_polymers_page} >
                          {v}
                        </PaginationLink> :

                        <PaginationLink isActive={v == page_state.current_structures_page} >
                          {v}
                        </PaginationLink>
                    }
                  </PaginationItem>
              )
          }
        </div>
        <div>
          <PaginationItem className="hover:cursor-pointer hover:bg-slate-200 rounded-md" onClick={() => {
            dispatch(pagination_next_page({
              slice_name: props.slice_type
            }))
          }}>
            <PaginationNext />
          </PaginationItem>
        </div>
      </PaginationContent>
    </Pagination>
  )
}