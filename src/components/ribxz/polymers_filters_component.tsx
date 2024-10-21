import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Select from 'react-select';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { groupedOptions } from './filters_protein_class_options';
import { CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum, useRoutersRouterStructPolymerClassesNomenclatureQuery } from '@/store/ribxz_api/ribxz_api';
import { Group } from './structure_filters_component';
import { useAppSelector } from '@/store/store';
import { set_polymer_filter } from '@/store/slices/slice_polymers';

const PolymerFiltersComponent = () => {
  const dispatch = useDispatch();
  const [polymerClassOptions, setPolymerClassOptions] = useState([]);
  const { data: nomenclature_classes, isLoading: nomenclature_classes_is_loading } = useRoutersRouterStructPolymerClassesNomenclatureQuery();

  useEffect(() => {
    if (nomenclature_classes !== undefined) {
      setPolymerClassOptions(groupedOptions(nomenclature_classes))
    }
  }, [nomenclature_classes, nomenclature_classes_is_loading]);

  const total_count = useAppSelector(state=>state.polymers_page.total_polymers_count)

  const polymers_filters =useAppSelector(state=>state.polymers_page.filters)

  useEffect(() => {

    console.log(polymers_filters);
    
  }, [polymers_filters]);
  

  return (
    <Collapsible className="p-4 border rounded-sm bg-slate-100 shadow-inner" defaultChecked={true} defaultOpen={true} disabled={true}>
      <div className="flex items-center justify-between mb-2">
        <CollapsibleTrigger asChild className="hover:rounded-md cursor-pointer flex">
          <div className={` min-w-full font-semibold flex flex-row justify-between `}>
            <span>Polymer Filters</span>
            <span className="font-semibold"> [{total_count} polymers]</span>
          </div>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className="space-y-2">
          <div className="w-full h-full">
            <label className={`text-sm font-medium my-4 `} htmlFor="polymerClass">
              Polymer Class
            </label>
            <Select
              defaultValue={[]}
              onChange={(value) => {
                 dispatch(set_polymer_filter({ filter_type: "current_polymer_class", value: value === null ? null : value.value  as CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum}))
                }}
              placeholder="Present Chains"
              instanceId="polymer_class"
              options={polymerClassOptions}
              components={{ Group }}
              isSearchable={true}
            />
          </div>

          <div>
            <label className={`text-sm font-medium `} htmlFor="uniprotId">
              Uniprot ID
            </label>
            <Input
              id="uniprotId"
              placeholder="Enter Uniprot ID"
              className="bg-white"
              onChange={(e) => { 
                dispatch(set_polymer_filter({ filter_type: "uniprot_id", value: e.target.value }))
            
            }}
            />
          </div>

          <div>
            <label className={`text-sm font-medium `} htmlFor="hasMotif">
              Has motif
            </label>
            <Input
              id="hasMotif"
              placeholder="Enter motif"
              className="bg-white font-mono"
              style={{ fontFamily: 'monospace' }}
              onChange={(e) => { 
                dispatch(set_polymer_filter({ filter_type: "has_motif", value: e.target.value }))
            
            }}
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default PolymerFiltersComponent;