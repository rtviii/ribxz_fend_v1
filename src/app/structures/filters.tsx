/**
 * v0 by Vercel.
 * @see https://v0.dev/t/QQsFIe7ZT94
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Input } from "@/components/ui/input"
import { CollapsibleTrigger, CollapsibleContent, Collapsible } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import Select from 'react-select'


export default function FilterSidebar() {

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' }
]

  return (
    <div className="border rounded-md">
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-semibold">Ribosome Structures</h2>
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
            Proteins Present
          </label>
          <Select options={options} isMulti={true}/>
          {/* <Select>
            <SelectTrigger id="proteinsPresent">
              <SelectValue placeholder="Select proteins" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
              <SelectItem value="option3">Option 3</SelectItem>
              <SelectItem value="option4">Option 4</SelectItem>
            </SelectContent>
          </Select> */}
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="multiProteinsPresent">
            RNA Present
          </label>
          <Select options={options} isMulti={true}/>
          {/* <Select multiple>
            <SelectTrigger id="multiProteinsPresent">
              <SelectValue placeholder="Select proteins" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
              <SelectItem value="option3">Option 3</SelectItem>
              <SelectItem value="option4">Option 4</SelectItem>
            </SelectContent>
          </Select> */}
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