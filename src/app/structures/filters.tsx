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
import { useState } from "react"


export default function FilterSidebar() {

  const [value, setValue] = useState<string>();

    const onChange = (newValue: string) => {
        console.log(newValue);
        setValue(newValue);
      };

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' }
]
const phylo_tree = [
  {
    value: '2',
    title: 'Bacteria',
    children: [
      {
        value: '66',
        title: 'parent 1-0',
        children: [
          {
            value: '44',
            title: 'my leaf',
          },
          {
            value: '22',
            title: 'your leaf',
          },
        ],
      },
    ],
  },{
    value: '4',
    title: 'Eukarya',
  },{
    value: '6',
    title: 'Prokaroyta',
  }
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
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              placeholder="Phylogeny"
              allowClear={false}
              multiple={true}
              variant="outlined"
            //   treeDefaultExpandAll
              onChange={onChange}
              treeData={phylo_tree}
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