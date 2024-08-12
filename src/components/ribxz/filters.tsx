'use client'
import { Input } from "@/components/ui/input"
import { CollapsibleTrigger, CollapsibleContent, Collapsible } from "@/components/ui/collapsible"
import Select, { components, GroupProps } from 'react-select';
import { TreeSelect } from 'antd'
import { useEffect, useRef, useState } from "react"
import {
  ribxz_api,
  useRoutersRouterStructListSourceTaxaQuery,
  useRoutersRouterStructPolymerClassesNomenclatureQuery,
} from "@/store/ribxz_api/ribxz_api"

import { groupedOptions, PolymerClassOption } from './filters_protein_class_options';
import { useAppDispatch, useAppSelector } from "@/store/store";
import { FiltersState, pagination_next_page, pagination_prev_page, pagination_set_page, set_filter } from "@/store/slices/ui_state";

const groupStyles = {
  borderRadius: '5px',
  background  : '#f2fcff',
};

export const Group = (props: GroupProps<PolymerClassOption, false>) => (
  <div style={groupStyles}>
    <components.Group {...props} />
  </div>
);

export enum FilterType {
  PolymerClass   = "PolymerClass",
  SourceOrganism = "SourceOrganism",
  HostOrganism   = "HostOrganism",
  DepositionDate = "DepositionDate",
  Resolution     = "Resolution",
  Search         = "Search",
  Sort           = "Sort"
}

export function useDebounceFilters(value: Partial<FiltersState>, delay: number): Partial<FiltersState> {
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

interface FiltersProps {
  disabled_whole?: boolean,
  // disabled_filters?: FilterType[]
}

export function Filters(props: FiltersProps) {


  const { data: tax_dict, isLoading: tax_dict_is_loading } = useRoutersRouterStructListSourceTaxaQuery({ sourceOrHost: "source" });
  const { data: nomenclature_classes, isLoading: nomenclature_classes_is_loading } = useRoutersRouterStructPolymerClassesNomenclatureQuery();


  const [polymerClassOptions, setPolymerClassOptions] = useState<any>([]);

  const [triggerStructuresRefetch] = ribxz_api.endpoints.routersRouterStructFilterList.useLazyQuery()

  const struct_state = useAppSelector((state) => state.ui.data)
  const filters = useAppSelector(state => state.ui.filters)!

  const debounced_filters = useDebounceFilters(filters, 250)
  const dispatch = useAppDispatch();


  // TODO: this logic should be in the corresponding structure component (keep filters/pagination general)
  useEffect(() => {
    //? This garbage is needed to send a all filter params as one url string.
    //? If typed, rtk autogen infers the types as body args, which forces the django-ninja query to be a POST, which is, mildly, a pain in the a
    console.log("Sendign subunit_presence ", filters.subunit_presence);

    triggerStructuresRefetch({
      page: 1,
      year: filters.year.map(x => x === null || x === 0 ? null : x.toString()).join(','),
      resolution: filters.resolution.map(x => x === null || x === 0 ? null : x.toString()).join(','),
      hostTaxa: filters.host_taxa.length == 0 ? '' : filters.host_taxa.map(x => x === null ? null : x.toString()).join(','),
      sourceTaxa: filters.source_taxa.length == 0 ? '' : filters.source_taxa.map(x => x === null ? null : x.toString()).join(','),
      polymerClasses: filters.polymer_classes.length == 0 ? '' : filters.polymer_classes.join(','),
      search: filters.search === null ? '' : filters.search,
      subunitPresence: filters.subunit_presence === null ? '' : filters.subunit_presence,
    }).unwrap()

    dispatch(pagination_set_page({
      set_to_page: 1,
      slice_name: 'structures'
    }))

    dispatch(pagination_set_page({
      set_to_page: 1,
      slice_name: 'polymers'
    }))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced_filters]);


  useEffect(() => {
    if (nomenclature_classes !== undefined) {
      setPolymerClassOptions(groupedOptions(nomenclature_classes))
    }
  }, [nomenclature_classes, nomenclature_classes_is_loading]);


  return (
    <Collapsible className="bg-white p-4 shadow-sm border rounded-sm " defaultChecked={true} defaultOpen={true} disabled={true}>
      <div className="flex items-center justify-between  mb-2 ">
        <CollapsibleTrigger asChild className="hover:rounded-md cursor-pointer flex ">
          <div className={` min-w-full font-semibold flex flex-row justify-between ${props.disabled_whole ? "disabled-text" : ""}`}>
            <span>Structure Filters</span>
            <span className="font-semibold"> [{struct_state.total_structures_count} structures]</span>
          </div>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent >
        <div className="space-y-2">
          <Input placeholder="Search"
            disabled={props.disabled_whole}
            value={filters.search == null ? '' : filters.search}
            onChange={(e) => {
              dispatch(set_filter({
                filter_type: "search",
                value: e.target.value
              }))
            }} />

          <div className="flex items-center justify-between space-x-2">
            <label className={`text-sm font-medium ${props.disabled_whole ? "disabled-text" : ""}`} htmlFor="startYear" >
              Deposition year
            </label>
            <div className="flex items-center space-x-2">
              <Input disabled={props.disabled_whole} className="w-20" id="startYear" placeholder="Start Year" type="number" value={filters.year[0] === null ? '' : filters.year[0]} min={2000} max={2024} step={1} onChange={(e) => { dispatch(set_filter({ filter_type: 'year', value: [Number(e.target.value), filters.year[1]] })) }} />
              <Input disabled={props.disabled_whole} className="w-20" id="endYear" placeholder="End Year" type="number" value={filters.year[1] === null ? '' : filters.year[1]} min={2000} max={2024} step={1} onChange={(e) => { dispatch(set_filter({ filter_type: 'year', value: [filters.year[0], Number(e.target.value)] })) }} />
            </div>
          </div>

          <div className="flex items-center justify-between space-x-2">
            <label className={`text-sm font-medium ${props.disabled_whole ? "disabled-text" : ""}`} htmlFor="minResolution">
              Resolution
            </label>
            <div className="flex items-center space-x-2">
              <Input disabled={props.disabled_whole} className="w-20" id="minResolution" placeholder="Min" type="number" step={0.1} min={0} max={7.5} value={filters.resolution[0] === null ? '' : filters.resolution[0]} onChange={(e) => { dispatch(set_filter({ filter_type: 'resolution', value: [Number(e.target.value), filters.resolution[1]] })) }} />
              <Input disabled={props.disabled_whole} className="w-20" id="maxResolution" placeholder="Max" type="number" step={0.1} min={0} max={7.5} value={filters.resolution[1] === null ? '' : filters.resolution[1]} onChange={(e) => { dispatch(set_filter({ filter_type: 'resolution', value: [filters.resolution[0], Number(e.target.value)] })) }} />
            </div>
          </div>

          <div className="flex flex-row space-x-2">

            <div className="w-full h-full">
              <label className={`text-sm font-medium ${props.disabled_whole ? "disabled-text" : ""}`} htmlFor="Subunit">
                Subunit
              </label>
              <Select
                defaultValue={[]}
                // @ts-ignore
                placeholder="Subunit"
                onChange={(option) => {
                  dispatch(set_filter(
                    {
                      filter_type: "subunit_presence",
                      value: option ? option.value : null
                    }
                  ))
                }}

                isClearable={true}
                instanceId={"polymer_class"}
                options={[{ value: "SSU+LSU", id: "SSU+LSU", label: "SSU+LSU", color: 'red' }, { value: "SSU", id: "SSU", label: "SSU", color: 'red' }, { value: "LSU", id: "LSU", label: "LSU", color: 'red' }]}
                // components={{ Group }}
                // @ts-ignore
                // isMulti={true}
                isDisabled={props.disabled_whole}
              // isSearchable={true}
              />
            </div>

            <div className="w-full h-full">
              <label className={`text-sm font-medium my-4  ${props.disabled_whole ? "disabled-text" : ""}`} htmlFor="proteinsPresent">
                Polymer Classes
              </label>
              <Select
                defaultValue={[]}
                // @ts-ignore
                onChange={(value) => { dispatch(set_filter({ filter_type: "polymer_classes", value: (value === null ? [] : value).map((v: PolymerClassOption) => v.value) })) }}
                placeholder="Present Chains"
                instanceId={"polymer_class"}
                options={polymerClassOptions}
                components={{ Group }}
                // @ts-ignore
                isMulti={true}
                isDisabled={props.disabled_whole}
                isSearchable={true}
              />
            </div>

          </div>
          <div className="space-y-2">
            <label className={`text-sm font-medium ${props.disabled_whole ? "disabled-text" : ""}`} htmlFor="SourceOrganism">
              Source Organism
            </label>
            <div className="text-sm font-medium" >
              <TreeSelect
                style={{ width: '100%' }}
                value={filters.source_taxa}
                dropdownStyle={{ maxHeight: 600, maxWidth: 600, overflow: 'auto' }}
                showSearch={true}
                treeNodeFilterProp='title'
                placeholder="Search.."
                allowClear={false}
                multiple={true}
                variant="outlined"
                onChange={(v) => { dispatch(set_filter({ filter_type: "source_taxa", value: v })) }}
                treeData={tax_dict}
                disabled={props.disabled_whole}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium ${props.disabled_whole ? "disabled-text" : ""}`} htmlFor="multiProteinsPresent">
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
                disabled={props.disabled_whole}
              />
            </div>
          </div>
          {/* <Collapsible className="mt-4">
            <CollapsibleTrigger className="flex items-center justify-between " disabled={props.disabled_whole}>
              <h3 className={`text-sm font-medium ${props.disabled_whole ? "disabled-text" : ""} `}>Sort by:</h3>
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
          </Collapsible> */}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function ChevronDownIcon(props: any) {
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
