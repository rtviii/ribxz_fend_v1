import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import Link from "next/link"




export function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="fixed bottom-16 left-16">
          <Button className="rounded-lg text-lg p-6 bg-gray-900 text-gray-50 shadow-none transition-all hover:shadow-lg dark:bg-gray-50 dark:text-gray-900"  >
            Menu
          </Button>
        </div>
      </SheetTrigger>

      <SheetContent side={"left"} className="flex-col flex">
        <SheetHeader>
          <SheetTitle>

            <a className="flex items-center space-x-2 text-gray-800 hover:text-gray-600" href="#">
              <HomeIcon className="h-5 w-5" />
              <span>Home</span>
            </a>
          </SheetTitle>



          <SheetDescription>
            {/* Make changes to your profile here. Click save when you're done. */}
          </SheetDescription>
        </SheetHeader>

        <div className="grid-flow-col   bg-white  p-4  hover:bg-slate-200  border ">

          {/* <div className="space-y-2"> */}
          <h2 className="text-xs font-semibold uppercase text-gray-400">Available Data</h2>
          <Link className="block py-2 text-sm text-gray-700" href="#">
            Structures
          </Link>
          <Link className="block py-2 text-sm text-gray-700" href="#">
            <div className="flex justify-between items-center space-x-2 text-gray-800 hover:text-gray-600" href="#">
              <span>Proteins</span>
              <DnaIcon className="h-5 w-5" />
            </div>
          </Link>
          <Link className="block py-2 text-sm text-gray-700" href="#">
            <div className="flex justify-between items-center space-x-2 text-gray-800 hover:text-gray-600" href="#">
              <span>RNA</span>
              <DnaIcon className="h-5 w-5" />
            </div>
          </Link>

          <Link className="block py-2 text-sm text-gray-700" href="#">
            <div className="flex justify-between items-center space-x-2 text-gray-800 hover:text-gray-600" href="#">
              <span>Nomenclature</span>
              <NotebookIcon className="h-5 w-5" />
            </div>
          </Link>
          {/* </div> */}

          {/* <hr className="border-t border-gray-200" /> */}

          {/* <div className="space-y-2 pt-2"> */}
          <h2 className="text-xs font-semibold uppercase text-gray-400">Tools</h2>
          <Link className="block py-2 text-sm text-gray-700" href="#">
            Visualization
          </Link>
          <Link className="block py-2 text-sm text-gray-700" href="#">
            3D Superposition
          </Link>

          <Link className="block py-2 text-sm text-gray-700" href="#">
            Ligands/Binding Sites
          </Link>

        </div>
        <div className="flex-col  h-full  p-4  align-bottom justify-end justify-items-end content-end  border ">
          <h2 className="text-xs font-semibold uppercase text-gray-400">Info</h2>
          <Link className="block py-2 text-sm text-gray-700" href="#">
            About
          </Link>
          <Link className="block py-2 text-sm text-gray-700" href="#">
            How To
          </Link>
          <Link className="block py-2 text-sm text-gray-700" href="#">
            Contact
          </Link>
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

export default function Sidebar() {
  return (
    <>
      <div className="fixed bottom-0 left-0 p-4">
        <Button className="rounded-full p-3 bg-gray-200 shadow-lg hover:bg-gray-300 focus:outline-none focus:ring">
          <GaugeIcon className="h-6 w-6 text-gray-800" />
        </Button>
      </div>
      <aside className="fixed top-0 left-0 h-full w-64 bg-white shadow-md overflow-y-auto">
        <nav className="flex flex-col p-4 space-y-6">
          <a className="flex items-center space-x-2 text-gray-800 hover:text-gray-600" href="#">
            <HomeIcon className="h-5 w-5" />
            <span>Home</span>
          </a>
          <div>
            <h2 className="text-xs uppercase text-gray-500">Available Data</h2>
            <div className="mt-2 space-y-2">
              <a className="flex items-center space-x-2 text-gray-800 hover:text-gray-600" href="#">
                <DnaIcon className="h-5 w-5" />
                <span>Structures</span>
              </a>
              <a className="flex items-center space-x-2 text-gray-800 hover:text-gray-600" href="#">
                <DnaIcon className="h-5 w-5" />
                <span>Proteins</span>
              </a>
              <a className="flex items-center space-x-2 text-gray-800 hover:text-gray-600" href="#">
                <DnaIcon className="h-5 w-5" />
                <span>RNA</span>
              </a>
              <a className="flex items-center space-x-2 text-gray-800 hover:text-gray-600" href="#">
                <NotebookIcon className="h-5 w-5" />
                <span>Nomenclature</span>
              </a>
            </div>
          </div>
          <div>
            <h2 className="text-xs uppercase text-gray-500">Tools</h2>
            <div className="mt-2 space-y-2">
              <a className="flex items-center space-x-2 text-gray-800 hover:text-gray-600" href="#">
                <ViewIcon className="h-5 w-5" />
                <span>Visualization</span>
              </a>
              <a className="flex items-center space-x-2 text-gray-800 hover:text-gray-600" href="#">
                <Rotate3dIcon className="h-5 w-5" />
                <span>3D Superimposition</span>
              </a>
              <a className="flex items-center space-x-2 text-gray-800 hover:text-gray-600" href="#">
                <LigatureIcon className="h-5 w-5" />
                <span>Ligands/Binding Sites</span>
              </a>
              <a className="flex items-center space-x-2 text-gray-800 hover:text-gray-600" href="#">
                <InfoIcon className="h-5 w-5" />
                <span>How To</span>
              </a>
            </div>
          </div>
        </nav>
      </aside>
    </>
  )
}

function DnaIcon(props) {
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


function GaugeIcon(props) {
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


function HomeIcon(props) {
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


function InfoIcon(props) {
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


function LigatureIcon(props) {
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


function NotebookIcon(props) {
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


function Rotate3dIcon(props) {
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


function ViewIcon(props) {
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