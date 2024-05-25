import { Input } from "@/components/ui/input"
import { CollapsibleTrigger, CollapsibleContent, Collapsible } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import Select, { components, GroupProps } from 'react-select';
import { TreeSelect } from 'antd'
import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { SelectValue, SelectTrigger, SelectContent } from "@/components/ui/select"
import {
  ribxz_api,
  useRoutersRouterStructListSourceTaxaQuery,
  useRoutersRouterStructPolymerClassesNomenclatureQuery,
} from "@/store/ribxz_api/ribxz_api"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"


import { groupedOptions, PolymerClassOption } from './protein_class_options';
import { useAppDispatch, useAppSelector } from "@/store/store";
import { pagination_next_page, pagination_prev_page, set_filter } from "@/store/slices/ui_state";

const groupStyles = {
  borderRadius: '5px',
  background: '#f2fcff',
};

const Group = (props: GroupProps<PolymerClassOption, false>) => (
  <div style={groupStyles}>
    <components.Group {...props} />
  </div>
);

function CircleIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}


export enum FilterType {
  PolymerClass = "PolymerClass",
  SourceOrganism = "SourceOrganism",
  HostOrganism = "HostOrganism",
  DepositionDate = "DepositionDate",
  Resolution = "Resolution",
  Search = "Search",
  Sort = "Sort"
}


function useDebounce(value: Partial<Filters>, delay: number): Partial<Filters> {
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

export function FilterSidebar({ disable }: { disable?: { [key in FilterType]?: boolean } }) {

  const { data: tax_dict, isLoading: tax_dict_is_loading } = useRoutersRouterStructListSourceTaxaQuery({ sourceOrHost: "source" });
  const { data: nomenclature_classes, isLoading: nomenclature_classes_is_loading } = useRoutersRouterStructPolymerClassesNomenclatureQuery();
  const [polymerClassOptions, setPolymerClassOptions] = useState<PolymerClassOption[]>([]);


  const [triggerRefetch, { data, error }] = ribxz_api.endpoints.routersRouterStructFilterList.useLazyQuery()
  const filter_state = useAppSelector((state) => state.ui.filters)
  const debounced_filters = useDebounce(filter_state, 250)
  useEffect(() => {
    //? This garbage is needed to send a all filter params as one url string. If typed, rtk autogen infers the types as body args, which forces the query to be a POST, which is, mildly, a pain in the
    triggerRefetch({
      year: filter_state.year.map(x => x === null || x === 0 ? null : x.toString()).join(','),
      resolution: filter_state.resolution.map(x => x === null || x === 0 ? null : x.toString()).join(','),
      hostTaxa: filter_state.host_taxa.length == 0 ? '' : filter_state.host_taxa.map(x => x === null ? null : x.toString()).join(','),
      sourceTaxa: filter_state.source_taxa.length == 0 ? '' : filter_state.source_taxa.map(x => x === null ? null : x.toString()).join(','),
      polymerClasses: filter_state.polymer_classes.length == 0 ? '' : filter_state.polymer_classes.join(','),
      search: filter_state.search === null ? '' : filter_state.search
    }).unwrap()
  }, [debounced_filters]);


  const struct_state = useAppSelector((state) => state.ui.data)

  useEffect(() => {
    if (!nomenclature_classes_is_loading) {
      setPolymerClassOptions(groupedOptions(nomenclature_classes))
    }
  }, [nomenclature_classes, nomenclature_classes_is_loading]);



  const dispatch = useAppDispatch();
  const filters = useAppSelector(state => state.ui.filters)!
  return (
    <Collapsible className="bg-white p-4 shadow-sm border rounded-sm " defaultChecked={true} defaultOpen={true}>
      <div className="flex items-center justify-between  mb-2 ">
        <CollapsibleTrigger asChild className="hover:rounded-md cursor-pointer flex ">
          <div className=" min-w-full font-semibold flex flex-row justify-between">
            <span>Structure Filters  </span>
            <span className="font-semibold"> [{struct_state.total_count} structures]</span>
          </div>
          {/* <span className=" min-w-full font-semibold"> {struct_state.total_count}</span> */}
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="space-y-2">
          {disable?.Search ? null :
            <Input placeholder="Search"
              value={filters.search}
              onChange={(e) => {
                dispatch(set_filter({
                  filter_type: "search",
                  value: e.target.value
                }))
              }} />}

          {disable?.DepositionDate ? null :
            <div className="flex items-center justify-between space-x-2">
              <label className="text-sm font-medium" htmlFor="startYear">
                Deposition year
              </label>
              <div className="flex items-center space-x-2">
                <Input className="w-20" id="startYear" placeholder="Start Year" type="number" value={filters.year[0]} min={2000} max={2024} step={1} onChange={(e) => { dispatch(set_filter({ filter_type: 'year', value: [Number(e.target.value), filters.year[1]] })) }} />
                <Input className="w-20" id="endYear" placeholder="End Year" type="number" value={filters.year[1]} min={2000} max={2024} step={1} onChange={(e) => { dispatch(set_filter({ filter_type: 'year', value: [filters.year[0], Number(e.target.value)] })) }} />
              </div>
            </div>
          }

          {disable?.Resolution ? null :
            <div className="flex items-center justify-between space-x-2">
              <label className="text-sm font-medium" htmlFor="minResolution">
                Resolution
              </label>
              <div className="flex items-center space-x-2">
                <Input className="w-20" id="minResolution" placeholder="Min" type="number" step={0.1} min={0} max={7.5} value={filters.resolution[0]} onChange={(e) => { dispatch(set_filter({ filter_type: 'resolution', value: [Number(e.target.value), filters.resolution[1]] })) }} />
                <Input className="w-20" id="maxResolution" placeholder="Max" type="number" step={0.1} min={0} max={7.5} value={filters.resolution[1]} onChange={(e) => { dispatch(set_filter({ filter_type: 'resolution', value: [filters.resolution[0], Number(e.target.value)] })) }} />
              </div>
            </div>
          }
          {disable?.PolymerClass ? null :
            <div className="space-y-2">
              <label className="text-sm font-medium my-4" htmlFor="proteinsPresent">
                Polymer Classes

<TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild >
                <abbr
                  className="ml-1 text-lg font-semibold text-red-500 hover:text-red-700 hover:cursor-pointer"
                  style={{
                    textDecoration: "none",
                  }}
                >
                  *
                </abbr>
        </TooltipTrigger>
        <TooltipContent>
          <p>This is an experimental feature so you might get a small number of false positives.</p>
          <p>Find out more how the chains are classified.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
              </label>
              <Select<PolymerClassOption>
                defaultValue={[]}
                onChange={(value) => { dispatch(set_filter({ filter_type: "polymer_classes", value: value.map((v: PolymerClassOption) => v.value) })) }}
                instanceId={"polymer_class"}
                options={polymerClassOptions}
                components={{ Group }}
                isMulti={true}
              />
            </div>
          }

          {disable?.SourceOrganism ? null :
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="SourceOrganism">
                Source Organism
              </label>
              <div className="text-sm font-medium" >
                <TreeSelect
                  showSearch={true}
                  style={{ width: '100%' }}
                  value={filters.source_taxa}
                  dropdownStyle={{ maxHeight: 600, maxWidth: 600, overflow: 'auto' }}
                  treeNodeFilterProp='title'
                  placeholder="Search.."
                  allowClear={false}
                  multiple={true}
                  variant="outlined"
                  onChange={(v) => { dispatch(set_filter({ filter_type: "source_taxa", value: v })) }}
                  treeData={tax_dict}
                />
              </div>
            </div>
          }

          {disable?.HostOrganism ? null :
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="multiProteinsPresent">
                Host Organism
              </label>
              <div className="text-sm font-medium" >
                <TreeSelect
                  showSearch={true}
                  style={{ width: '100%' }}
                  value={filters.host_taxa}
                  dropdownStyle={{ maxHeight: 400, maxWidth: 400, overflow: 'auto' }}
                  // treeNodeLabelProp={(node)=>node.value}
                  treeNodeFilterProp='title'
                  // title={(node)=>node.value}
                  placeholder="Search.."
                  allowClear={false}
                  multiple={true}
                  variant="outlined"
                  // treeDefaultExpandAll
                  onChange={(v) => { dispatch(set_filter({ filter_type: "host_taxa", value: v })) }}
                  treeData={tax_dict}
                />
              </div>
            </div>
          }
          {disable?.Sort ? null :
            <Collapsible className="mt-4">
              <CollapsibleTrigger className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Sort by:</h3>
                <ChevronDownIcon className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
                <Button className="justify-start" variant="ghost">
                  Resolution
                </Button>
                <Button className="justify-start" variant="ghost">
                  Year
                </Button>
                <Button className="justify-start" variant="ghost">
                  Number of Proteins
                </Button>
                <Button className="justify-start" variant="ghost">
                  PDB Codename
                </Button>
              </CollapsibleContent>
            </Collapsible>
          }
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function ChevronDownIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}


export function StructuresPagination() {

  const dispatch = useAppDispatch();
  const ui_state = useAppSelector(state => state.ui.pagination)!

  return (
    <Pagination >
      <PaginationContent>
        <PaginationItem className="hover:cursor-pointer hover:bg-slate-200" onClick={() => {
          dispatch(pagination_prev_page())
        }}>
          <PaginationPrevious />
        </PaginationItem>

        <PaginationItem>
          <PaginationLink onClick={() => { }}>1</PaginationLink>
        </PaginationItem>

        <PaginationItem>
          <PaginationLink onClick={() => { }} isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink onClick={() => {
            console.log("update post",);

          }}>3</PaginationLink>
        </PaginationItem>

        <PaginationItem>
        </PaginationItem>

        <PaginationItem className="hover:cursor-pointer hover:bg-slate-200" onClick={() => {
          dispatch(pagination_next_page())


        }}>
          <PaginationNext />
        </PaginationItem>

      </PaginationContent>
    </Pagination>
  )
}
