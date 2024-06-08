import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { GearIcon } from "@radix-ui/react-icons"
import Link from "next/link"


export function SidebarMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="fixed bottom-16 left-16">
          <Button  className="rounded-lg text-lg p-6 bg-transparent hover:bg-black  text-blackk  shadow-none transition-all hover:shadow-lg border border-gray-500 hover:text-white"    >
            Menu <GearIcon className="ml-4 w-5 h-5"/>
          </Button>
        </div>
      </SheetTrigger>

      <SheetContent side={"left"} className="flex-col flex">
        <SheetHeader>
          <SheetTitle>

            <Link className="flex items-center space-x-2 text-gray-800 hover:text-gray-600 hover:bg-slate-200 rounded-sm" href="/">
              <HomeIcon className="h-5 w-5" />
              <span>Home</span>
            </Link>
          </SheetTitle>



          <SheetDescription>
            Structures and component chains, nomenclature for polymer classes.
          </SheetDescription>
        </SheetHeader>

        <div className="grid-flow-col   bg-white  ">

          <h2 className="text-xs font-semibold uppercase text-gray-400">Available Data</h2>

          <Link className="block py-2 px-2 font-semibold text-sm text-gray-700 hover:bg-slate-200 rounded-sm" href="/structures">
            Structures
          </Link>

          <Link className="block py-2  px-2  font-semibold text-sm text-gray-700 hover:bg-slate-200 rounded-sm" href="/polymers">
            <div className="flex justify-between items-center space-x-2 text-gray-800 hover:text-gray-600   " >
              <span>{"Polymers (Proteins & RNA)"} </span>
              <DnaIcon className="h-5 w-5" />
            </div>
          </Link>

          {/* <Link className="block py-2  px-2 font-semibold text-sm text-gray-700 hover:bg-slate-200 rounded-sm" href="rna">
            <div className="flex justify-between items-center space-x-2 text-gray-800 hover:text-gray-600" >
              <span>RNA</span>
              <DnaIcon className="h-5 w-5" />
            </div>
          </Link> */}

          <Link className="block py-2 px-2 font-semibold  text-sm text-gray-700  hover:bg-slate-200 rounded-sm" href="/ligands">
            <div className="flex justify-between items-center space-x-2 text-gray-800 hover:text-gray-600" >
              <span> Ligands/Binding Sites </span>
            </div>
          </Link>


          <Link className="block py-2 px-2 font-semibold  text-sm text-gray-700  hover:bg-slate-200 rounded-sm" href="/nomenclature">
            <div className="flex justify-between items-center space-x-2 text-gray-800 hover:text-gray-600" >
              <span>Nomenclature</span>
              <NotebookIcon className="h-5 w-5" />
            </div>
          </Link>
          {/* </div> */}
          <hr className="border-t my-4 border-gray-200" />

          {/* <div className="space-y-2 pt-2"> */}
          <h2 className="text-xs font-semibold uppercase text-gray-400">Tools</h2>

          <Link className="block py-2 px-2 font-semibold  text-sm text-gray-700  hover:bg-slate-200 rounded-sm" href="/superpose">
            <span>3D Superposition</span>
          </Link>


        </div>
        <div className="flex-col  h-full   align-bottom justify-end justify-items-end content-end  ">
          <h2 className="text-xs font-semibold uppercase text-gray-400">Info</h2>
          <Link className="block py-2 text-sm text-gray-700" href="#"> About </Link>
          <Link className="block py-2 text-sm text-gray-700" href="#"> How To </Link>
          <Link className="block py-2 text-sm text-gray-700" href="#"> Contact </Link>
        </div>

        <SheetFooter>
          <SheetClose asChild>
            {/* <Button type="submit">Save changes</Button> */}
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function DnaIcon(props:any) {
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
      <path d="M2 15c6.667-6 13.333 0 20-6" />
      <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
      <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
      <path d="m17 6-2.5-2.5" />
      <path d="m14 8-1-1" />
      <path d="m7 18 2.5 2.5" />
      <path d="m3.5 14.5.5.5" />
      <path d="m20 9 .5.5" />
      <path d="m6.5 12.5 1 1" />
      <path d="m16.5 10.5 1 1" />
      <path d="m10 16 1.5 1.5" />
    </svg>
  )
}


function GaugeIcon(props:any) {
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
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </svg>
  )
}


function HomeIcon(props:any) {
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
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}


function InfoIcon(props:any) {
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
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}


function LigatureIcon(props:any) {
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
      <path d="M8 20V8c0-2.2 1.8-4 4-4 1.5 0 2.8.8 3.5 2" />
      <path d="M6 12h4" />
      <path d="M14 12h2v8" />
      <path d="M6 20h4" />
      <path d="M14 20h4" />
    </svg>
  )
}


function NotebookIcon(props:any) {
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
      <path d="M2 6h4" />
      <path d="M2 10h4" />
      <path d="M2 14h4" />
      <path d="M2 18h4" />
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <path d="M16 2v20" />
    </svg>
  )
}


function Rotate3dIcon(props:any) {
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
      <path d="M16.466 7.5C15.643 4.237 13.952 2 12 2 9.239 2 7 6.477 7 12s2.239 10 5 10c.342 0 .677-.069 1-.2" />
      <path d="m15.194 13.707 3.814 1.86-1.86 3.814" />
      <path d="M19 15.57c-1.804.885-4.274 1.43-7 1.43-5.523 0-10-2.239-10-5s4.477-5 10-5c4.838 0 8.873 1.718 9.8 4" />
    </svg>
  )
}


function ViewIcon(props:any) {
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
      <path d="M5 12s2.545-5 7-5c4.454 0 7 5 7 5s-2.546 5-7 5c-4.455 0-7-5-7-5z" />
      <path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
      <path d="M21 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2" />
      <path d="M21 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2" />
    </svg>
  )
}