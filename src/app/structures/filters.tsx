/**
 * v0 by Vercel.
 * @see https://v0.dev/t/QQsFIe7ZT94
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Input } from "@/components/ui/input"
import { CollapsibleTrigger, CollapsibleContent, Collapsible } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import Select from 'react-select'
import {TreeSelect} from 'antd'
import { useEffect, useState } from "react"
import { useRoutersRouterStructListSourceTaxaQuery } from "@/store/ribxz_api/ribxz_api"


export default function FilterSidebar() {

  const {data:tax_dict, isLoading:tax_dict_is_loading} =  useRoutersRouterStructListSourceTaxaQuery({sourceOrHost:"source"});

  useEffect(() => {
    console.log("Tax dict", tax_dict, tax_dict_is_loading);
  },[tax_dict, tax_dict_is_loading])
 
  const [value, setValue] = useState<string>();
  const onChange          = (newValue: string) => {
      console.log(newValue);
      setValue(newValue);
    };

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' }
]


  return (
    <div className="border rounded-md">
      <div className="p-4 space-y-4">
        <Input placeholder="Search" />
        <div className="flex items-center justify-between space-x-2">
          <label className="text-sm font-medium" htmlFor="startYear">
            Deposition date
          </label>
          <div className="flex items-center space-x-2">
            <Input className="w-20" id="startYear" placeholder="Start Year" type="number" />
            <Input className="w-20" id="endYear" placeholder="End Year" type="number" />
          </div>
        </div>
        <div className="flex items-center justify-between space-x-2">
          <label className="text-sm font-medium" htmlFor="minResolution">
            Resolution
          </label>
          <div className="flex items-center space-x-2">
            <Input className="w-20" id="minResolution" placeholder="Min" type="number" />
            <Input className="w-20" id="maxResolution" placeholder="Max" type="number" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="proteinsPresent">
            Proteins
          </label>
          <Select options={options} isMulti={true}/>
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="multiProteinsPresent">
            RNA 
          </label>
          <Select options={options} isMulti={true}/>
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="multiProteinsPresent">
            Phylogeny
          </label>
          <div className="text-sm font-medium" >
          <TreeSelect
             showSearch={true}
              style={{ width: '100%' }}
              value={value}
              dropdownStyle={{ maxHeight: 400, maxWidth:400, overflow: 'auto' }}
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
      </div>
    </div>
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