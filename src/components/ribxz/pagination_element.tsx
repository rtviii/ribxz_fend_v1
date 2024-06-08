'use client'
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
import { useDebouncePagination } from "@/my_utils";


interface PaginationProps {
  slice_type: "structures" | "polymers"
}

export function PaginationElement(props: PaginationProps) {

  const dispatch = useAppDispatch();
  const current_page = useAppSelector(state => {
    if (props.slice_type === 'polymers') { return state.ui.pagination.current_polymers_page }
    else if (props.slice_type === 'structures') { return state.ui.pagination.current_structures_page }
  })!
  const total_pages = useAppSelector(state => {
    if (props.slice_type === 'polymers') { return state.ui.pagination.total_polymers_pages }
    else if (props.slice_type === 'structures') { return state.ui.pagination.total_structures_pages }
  })!


  return (
    <Pagination >
      <div className="flex flex-col">
      <p>{props.slice_type}</p>
      <p>{current_page}</p>
      <p>{total_pages}</p>
      </div>
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

        <div className=" flex flex-row max-w-xs  no-scrollbar  overflow-x-scroll scroll-mx-4">
          {
            props.slice_type === 'polymers' ?

              Array.from({ length: total_pages }, (_, i) => i + 1)
                .slice(current_page - 6 < 0 ? 0 : current_page - 6, current_page + 6 <= total_pages ? current_page + 6 : total_pages)
                .map(
                  (v) =>
                    <PaginationItem key={v} className="hover:bg-slate-200 hover:cursor-pointer rounded-md" onClick={() => {
                      dispatch(pagination_set_page({ set_to_page: v, slice_name: props.slice_type }))
                    }}>
                      <PaginationLink isActive={v == current_page} >
                        {v}
                      </PaginationLink>
                    </PaginationItem>
                )

              :

              Array.from({ length: total_pages }, (_, i) => i + 1)
                .slice(current_page - 6 < 0 ? 0 : current_page - 6, current_page + 6 <= total_pages ? current_page + 6 : total_pages)
                .map(
                  (v) =>
                    <PaginationItem key={v} className="hover:bg-slate-200 hover:cursor-pointer rounded-md" onClick={() => {
                      dispatch(pagination_set_page({ set_to_page: v, slice_name: props.slice_type }))
                    }}>
                      <PaginationLink isActive={v == current_page} >
                        {v}
                      </PaginationLink>
                    </PaginationItem>
                )
          }
        </div>
        <div>
          <PaginationItem className="hover:cursor-pointer hover:bg-slate-200 rounded-md" onClick={() => {
            dispatch(pagination_next_page({ slice_name: props.slice_type }))
          }}>
            <PaginationNext />
          </PaginationItem>
        </div>
      </PaginationContent>
    </Pagination>
  )
}