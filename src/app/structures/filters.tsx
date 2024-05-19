import { Input } from "@/components/ui/input"
import { CollapsibleTrigger, CollapsibleContent, Collapsible } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import Select, { components, GroupProps } from 'react-select';
import { TreeSelect } from 'antd'
import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { SelectValue, SelectTrigger, SelectContent } from "@/components/ui/select"
import {
  useRoutersRouterStructListSourceTaxaQuery,
  useRoutersRouterStructPolymerClassesNomenclatureQuery
} from "@/store/ribxz_api/ribxz_api"

import { groupedOptions, PolymerClassOption } from './protein_class_options';

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



export default function FilterSidebar({ disable }: { disable?: { [key in FilterType]?: boolean } }) {

  const { data: tax_dict, isLoading: tax_dict_is_loading } = useRoutersRouterStructListSourceTaxaQuery({ sourceOrHost: "source" });
  const { data: nomenclature_classes, isLoading: nomenclature_classes_is_loading } = useRoutersRouterStructPolymerClassesNomenclatureQuery();
  const [polymerClassOptions, setPolymerClassOptions] = useState<PolymerClassOption[]>([]);

  useEffect(() => {
    if (!nomenclature_classes_is_loading) {
      setPolymerClassOptions(groupedOptions(nomenclature_classes))
    }
  }, [nomenclature_classes, nomenclature_classes_is_loading]);

  useEffect(() => {
    console.log("Tax dict", tax_dict, tax_dict_is_loading);
  }, [tax_dict, tax_dict_is_loading])

  const [value, setValue] = useState<string>();
  const onChange = (newValue: string) => {
    console.log(newValue);
    setValue(newValue);
  };

  useEffect(() => { console.log(disable) }, [])

  return (

 <Collapsible className="bg-white p-4 shadow-sm border rounded-sm " defaultChecked={true} defaultOpen={true}>
        <div className="flex items-center justify-between  mb-2 ">
          <CollapsibleTrigger asChild className="hover:bg-blue-50  hover:rounded-md cursor-pointer ">
          <span className=" min-w-full font-semibold"> Structure Filters</span>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>


     {/* <div className="flex flex-col space-y-4 bg-white border rounded-sm"> */}
       {/* <div className="flex items-center space-y-4 text-gray-400 ">
         <CircleIcon className="w-4 h-2  text-gray-900" />
         Structure Filters
       </div> */}
       <div className="space-y-2">
         {disable?.Search ? null : <Input placeholder="Search" />}
         {disable?.DepositionDate ? null :
           <div className="flex items-center justify-between space-x-2">
             <label className="text-sm font-medium" htmlFor="startYear">
               Deposition date
             </label>
             <div className="flex items-center space-x-2">
               <Input className="w-20" id="startYear" placeholder="Start Year" type="number" min={2000} max={2024} step={1} />
               <Input className="w-20" id="endYear" placeholder="End Year" type="number" min={2000} max={2024} step={1} />
             </div>
           </div>
         }
         {disable?.Resolution ? null :
           <div className="flex items-center justify-between space-x-2">
             <label className="text-sm font-medium" htmlFor="minResolution">
               Resolution
             </label>
             <div className="flex items-center space-x-2">
               <Input className="w-20" id="minResolution" placeholder="Min" type="number" step={0.1} min={0} max={7.5} />
               <Input className="w-20" id="maxResolution" placeholder="Max" type="number" step={0.1} min={0} max={7.5} />
             </div>
           </div>
         }
         {disable?.PolymerClass ? null :
           <div>
             <label className="text-sm font-medium" htmlFor="proteinsPresent">
               Polymer Classes
             </label>
             <Select<PolymerClassOption>
               defaultValue={[]}
               instanceId={"polymer_class"}
               options={polymerClassOptions}
               components={{ Group }}
               isMulti={true}
             />
           </div>

        }
        {disable?.SourceOrganism ? null :
          <div>
            <label className="text-sm font-medium" htmlFor="SourceOrganism">
              Source Organism
            </label>
            <div className="text-sm font-medium" >
              <TreeSelect
                showSearch={true}
                style={{ width: '100%' }}
                value={value}
                dropdownStyle={{ maxHeight: 400, maxWidth: 400, overflow: 'auto' }}
                treeNodeFilterProp='title'
                placeholder="Search.."
                allowClear={false}
                multiple={true}
                variant="outlined"
                treeDefaultExpandAll
                onChange={onChange}
                treeData={tax_dict}
              />
            </div>
          </div>
        }


        {disable?.HostOrganism ? null :
          <div>
            <label className="text-sm font-medium" htmlFor="multiProteinsPresent">
              Host Organism
            </label>
            <div className="text-sm font-medium" >
              <TreeSelect
                showSearch={true}
                style={{ width: '100%' }}
                value={value}
                dropdownStyle={{ maxHeight: 400, maxWidth: 400, overflow: 'auto' }}
                // treeNodeLabelProp={(node)=>node.value}
                treeNodeFilterProp='title'
                // title={(node)=>node.value}
                placeholder="Search.."
                allowClear={false}
                multiple={true}
                variant="outlined"
                treeDefaultExpandAll
                onChange={onChange}
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