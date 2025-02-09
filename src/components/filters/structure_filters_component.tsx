'use client';
import {Input} from '@/components/ui/input';
import {CollapsibleTrigger, CollapsibleContent, Collapsible} from '@/components/ui/collapsible';
import Select, {components, GroupProps} from 'react-select';
import {TreeSelect} from 'antd';
import {useEffect, useRef, useState} from 'react';
import {
    ribxz_api,
    useRoutersRouterStructListSourceTaxaQuery,
    useRoutersRouterStructPolymerClassesNomenclatureQuery
} from '@/store/ribxz_api/ribxz_api';

import {groupedOptions, PolymerClassOption} from './polymer_class_options';
import {useAppDispatch, useAppSelector} from '@/store/store';
import {StructureFilters, set_structures_filter, update_grouped_by_deposition} from '@/store/slices/slice_structures';
import {set_polymer_filter as set_polymers_filter} from '@/store/slices/slice_polymers';
import {Button} from '../ui/button';
import {BringToFrontIcon, Layers} from 'lucide-react';

const groupStyles = {
    borderRadius: '5px',
    background: '#f2fcff'
};

export const Group = (props: GroupProps<PolymerClassOption, false>) => (
    <div style={groupStyles}>
        <components.Group {...props} />
    </div>
);

export enum FilterType {
    PolymerClass = 'PolymerClass',
    SourceOrganism = 'SourceOrganism',
    HostOrganism = 'HostOrganism',
    DepositionDate = 'DepositionDate',
    Resolution = 'Resolution',
    Search = 'Search',
    Sort = 'Sort'
}

export function useDebounceFilters(value: Partial<StructureFilters>, delay: number): Partial<StructureFilters> {
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

export const StructureFiltersComponent = ({update_state}: {update_state: 'structures' | 'polymers'}) => {
    const {data: tax_dict, isLoading: tax_dict_is_loading} = useRoutersRouterStructListSourceTaxaQuery({
        sourceOrHost: 'source'
    });
    const {data: nomenclature_classes, isLoading: nomenclature_classes_is_loading} =
        useRoutersRouterStructPolymerClassesNomenclatureQuery();
    const dispatch = useAppDispatch();

    const total_count = useAppSelector(state => {
        return update_state === 'structures'
            ? state.structures_page.total_structures_count
            : state.polymers_page.total_paren_structures_count;
    });
    const filters = useAppSelector(state => {
        return update_state === 'structures' ? state.structures_page.filters : state.polymers_page.filters;
    });

    const update_filter_action = update_state === 'structures' ? set_structures_filter : set_polymers_filter;
    const grouped_by_deposition_huh = useAppSelector(state => state.structures_page.grouped_by_deposition);

    const [polymerClassOptions, setPolymerClassOptions] = useState<any>([]);
    useEffect(() => {
        if (nomenclature_classes !== undefined) {
            setPolymerClassOptions(groupedOptions(nomenclature_classes));
        }
    }, [nomenclature_classes, nomenclature_classes_is_loading]);

    return (
        <Collapsible
            className=" p-4  border rounded-sm bg-slate-100 shadow-inner "
            defaultChecked={true}
            defaultOpen={true}
            disabled={true}>
            <div className="flex items-center justify-between  mb-2 ">
                <CollapsibleTrigger asChild className="hover:rounded-md cursor-pointer flex ">
                    <div className={` min-w-full font-semibold flex flex-row justify-between `}>
                        <span>Structure Filters</span>
                        <span className="font-semibold"> [{total_count} structures]</span>
                    </div>
                </CollapsibleTrigger>
            </div>

            <CollapsibleContent>
                <div className="space-y-2">
                    <Input
                        placeholder="Search"
                        className="bg-white"
                        value={filters.search == null ? '' : filters.search}
                        onChange={e => {
                            dispatch(
                                update_filter_action({
                                    filter_type: 'search',
                                    value: e.target.value
                                })
                            );
                        }}
                    />

                    <div className="flex items-center justify-between space-x-2">
                        <label className={`text-sm font-medium `} htmlFor="startYear">
                            Deposition year
                        </label>
                        <div className="flex items-center space-x-2">
                            <Input
                                className="w-20 bg-white"
                                id="startYear"
                                placeholder="Start Year"
                                type="number"
                                value={filters.year[0] === null ? '' : filters.year[0]}
                                min={2000}
                                max={2024}
                                step={1}
                                onChange={e => {
                                    dispatch(
                                        update_filter_action({
                                            filter_type: 'year',
                                            value: [Number(e.target.value), filters.year[1]]
                                        })
                                    );
                                }}
                            />
                            <Input
                                className="w-20 bg-white"
                                id="endYear"
                                placeholder="End Year"
                                type="number"
                                value={filters.year[1] === null ? '' : filters.year[1]}
                                min={2000}
                                max={2024}
                                step={1}
                                onChange={e => {
                                    dispatch(
                                        update_filter_action({
                                            filter_type: 'year',
                                            value: [filters.year[0], Number(e.target.value)]
                                        })
                                    );
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <label className={`text-sm font-medium `} htmlFor="minResolution">
                            Resolution
                        </label>
                        <div className="flex items-center space-x-2">
                            <Input
                                className="w-20 bg-white"
                                id="minResolution"
                                placeholder="Min"
                                type="number"
                                step={0.1}
                                min={0}
                                max={7.5}
                                value={filters.resolution[0] === null ? '' : filters.resolution[0]}
                                onChange={e => {
                                    dispatch(
                                        update_filter_action({
                                            filter_type: 'resolution',
                                            value: [Number(e.target.value), filters.resolution[1]]
                                        })
                                    );
                                }}
                            />
                            <Input
                                className="w-20 bg-white"
                                id="maxResolution"
                                placeholder="Max"
                                type="number"
                                step={0.1}
                                min={0}
                                max={7.5}
                                value={filters.resolution[1] === null ? '' : filters.resolution[1]}
                                onChange={e => {
                                    dispatch(
                                        update_filter_action({
                                            filter_type: 'resolution',
                                            value: [filters.resolution[0], Number(e.target.value)]
                                        })
                                    );
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-row space-x-2">
                        <div className="w-full h-full">
                            <label className={`text-sm font-medium `} htmlFor="Subunit">
                                Subunit
                            </label>
                            <Select
                                defaultValue={[]}
                                // @ts-ignore
                                placeholder="Subunit"
                                onChange={option => {
                                    dispatch(
                                        update_filter_action({
                                            filter_type: 'subunit_presence',
                                            // @ts-ignore
                                            value: option ? option.value : null
                                        })
                                    );
                                }}
                                isClearable={true}
                                instanceId={'subunit_presence'}
                                // @ts-ignore
                                options={[
                                    {value: 'SSU+LSU', id: 'SSU+LSU', label: 'SSU+LSU', color: 'red'},
                                    {value: 'SSU', id: 'SSU', label: 'SSU', color: 'red'},
                                    {value: 'LSU', id: 'LSU', label: 'LSU', color: 'red'}
                                ]}
                                // components={{ Group }}
                                // @ts-ignore
                                // isMulti={true}
                                // isSearchable={true}
                            />
                        </div>

                        <div className="w-full h-full">
                            <label className={`text-sm font-medium my-4  `} htmlFor="proteinsPresent">
                                Polymer Classes
                            </label>
                            <Select
                                defaultValue={[]}
                                // @ts-ignore
                                onChange={value => {
                                    dispatch(
                                        update_filter_action({
                                            filter_type: 'polymer_classes',
                                            value: (value === null ? [] : value).map((v: PolymerClassOption) => v.value)
                                        })
                                    );
                                }}
                                placeholder="Present Chains"
                                instanceId={'polymer_class'}
                                options={polymerClassOptions}
                                components={{Group}}
                                // @ts-ignore
                                isMulti={true}
                                isSearchable={true}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className={`text-sm font-medium `} htmlFor="SourceOrganism">
                            Source Organism
                        </label>
                        <div className="text-sm font-medium">
                            <TreeSelect
                                style={{width: '100%'}}
                                value={filters.source_taxa}
                                dropdownStyle={{maxHeight: 600, maxWidth: 600, overflow: 'auto'}}
                                showSearch={true}
                                treeNodeFilterProp="title"
                                placeholder="Search.."
                                allowClear={false}
                                multiple={true}
                                variant="outlined"
                                onChange={v => {
                                    dispatch(update_filter_action({filter_type: 'source_taxa', value: v}));
                                }}
                                treeData={tax_dict}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className={`text-sm font-medium `} htmlFor="multiProteinsPresent">
                            Host Organism
                        </label>
                        <div className="text-sm font-medium">
                            <TreeSelect
                                showSearch={true}
                                style={{width: '100%'}}
                                value={filters.host_taxa}
                                dropdownStyle={{maxHeight: 400, maxWidth: 400, overflow: 'auto'}}
                                // treeNodeLabelProp={(node)=>node.value}
                                treeNodeFilterProp="title"
                                // title={(node)=>node.value}
                                placeholder="Search.."
                                allowClear={false}
                                multiple={true}
                                variant="outlined"
                                // treeDefaultExpandAll
                                onChange={v => {
                                    dispatch(update_filter_action({filter_type: 'host_taxa', value: v}));
                                }}
                                treeData={tax_dict}
                            />
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => dispatch(update_grouped_by_deposition(!grouped_by_deposition_huh))}
                        className="flex items-center gap-2">
                        {grouped_by_deposition_huh ? (
                            <>
                                <BringToFrontIcon className="h-4 w-4" />
                                <span>Show Individual</span>
                            </>
                        ) : (
                            <>
                                <Layers className="h-4 w-4" />
                                <span>Group by Deposition</span>
                            </>
                        )}
                    </Button>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
};
