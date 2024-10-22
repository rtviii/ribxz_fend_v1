import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Select from 'react-select';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { groupedOptions } from './filters_protein_class_options';
import { CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum, useRoutersRouterStructPolymerClassesNomenclatureQuery } from '@/store/ribxz_api/ribxz_api';
import { Group } from './structure_filters_component';
import { useAppSelector } from '@/store/store';
import { PolymersFilters, set_polymer_filter } from '@/store/slices/slice_polymers';

import { Button } from '@/components/ui/button'; // Make sure to import the Button component
import { X } from 'lucide-react'; // Import the X icon from lucide-react

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

  const clearFilter = (filterType:keyof PolymersFilters) => {
    dispatch(set_polymer_filter({ filter_type: filterType, value: null }));
  };


  

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
            <label className={`text-sm font-medium my-4`} htmlFor="polymerClass">
              Polymer Class
            </label>
            <div className="flex items-center">
              <Select
                value={polymers_filters.current_polymer_class ? { value: polymers_filters.current_polymer_class, label: polymers_filters.current_polymer_class } : null}
                onChange={(value) => {
                  dispatch(set_polymer_filter({ filter_type: "current_polymer_class", value: value ? value.value as CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum : null }))
                }}
                placeholder="Present Chains"
                instanceId="polymer_class"
                options={polymerClassOptions}
                components={{ Group }}
                isSearchable={true}
                isClearable={true}
                className="flex-grow"
              />
            </div>
          </div>

          <div>
            <label className={`text-sm font-medium`} htmlFor="uniprotId">
              Uniprot ID
            </label>
            <div className="flex items-center">
              <Input
                id="uniprotId"
                placeholder="Enter Uniprot ID"
                className="bg-white flex-grow"
                value={polymers_filters.uniprot_id || ''}
                onChange={(e) => {
                  dispatch(set_polymer_filter({ filter_type: "uniprot_id", value: e.target.value }))
                }}
              />
              {polymers_filters.uniprot_id && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  onClick={() => clearFilter("uniprot_id")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div>
            <label className={`text-sm font-medium`} htmlFor="hasMotif">
              Has motif
            </label>
            <div className="flex items-center">
              <Input
                id="hasMotif"
                placeholder="Enter motif"
                className="bg-white font-mono flex-grow"
                style={{ fontFamily: 'monospace' }}
                value={polymers_filters.has_motif || ''}
                onChange={(e) => {
                  dispatch(set_polymer_filter({ filter_type: "has_motif", value: e.target.value }))
                }}
              />
              {polymers_filters.has_motif && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  onClick={() => clearFilter("has_motif")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default PolymerFiltersComponent;