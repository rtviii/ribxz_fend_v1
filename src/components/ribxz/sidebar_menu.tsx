'use client'
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
import { useRoutersRouterStructTaxDictQuery } from "@/store/ribxz_api/ribxz_api"
import { set_tax_dict } from "@/store/slices/ui_state"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { GearIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from 'next/image'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"




export function SidebarMenu() {


  const dispatch = useAppDispatch()
  const { data: taxdict_data, isLoading, isError } = useRoutersRouterStructTaxDictQuery()
  useEffect(() => {
    console.log("Got taxdict data", taxdict_data);

    if (taxdict_data !== undefined) { dispatch(set_tax_dict(taxdict_data as any)) }
  }, [taxdict_data])

  const current_polymers = useAppSelector((state) => state.ui.data.current_polymers)
  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="fixed bottom-16 left-16">
          <Button className="rounded-lg text-lg p-6 bg-transparent hover:bg-black  text-blackk  shadow-none transition-all hover:shadow-lg border border-gray-500 hover:text-white"    >
            Menu <GearIcon className="ml-4 w-5 h-5" />
          </Button>
        </div>
      </SheetTrigger>

      <SheetContent side={"left"} className="flex-col flex">
        <SheetHeader>
          <SheetTitle>

            <Link className="flex items-center space-x-2 text-gray-800 hover:text-gray-600 hover:bg-muted rounded-sm" href="/">
              <HomeIcon className="h-5 w-5" />
              <span>Home</span>
            </Link>
          </SheetTitle>

          {/* <SheetDescription>
            Structures and component chains, nomenclature for polymer classes.
          </SheetDescription> */}
        </SheetHeader>

        <div className="grid-flow-col   bg-white  ">

          <h2 className="text-sm  uppercase text-gray-400 ">Available Data</h2>

          <Link className="block py-2 px-2 font-semibold text-sm text-gray-700 hover:bg-muted rounded-sm" href="/structures">
            Structures
          </Link>

          <Link className="block py-2  px-2  font-semibold text-sm text-gray-700 hover:bg-muted rounded-sm" href="/polymers">
            <div className="flex justify-between items-center space-x-2 text-gray-800 hover:text-gray-600   " >
              <span>{"Polymers (Proteins & RNA)"} </span>
              <DnaIcon className="h-5 w-5" />
            </div>
          </Link>

          <Link className="block py-2  px-2  font-semibold text-sm text-gray-700 hover:bg-muted rounded-sm" href="/ligands">
            <div className="flex justify-between items-center space-x-2 text-gray-800 hover:text-gray-600   " >
              <span>{" Ligands & Small Molecules"} </span>
              {/* <DnaIcon className="h-5 w-5" /> */}
              <Image src={"/ligand_icon.svg"}  width={20} height={20}  alt="ligands"/> 
            </div>
          </Link>


          <hr className="border-t my-4 border-gray-200" />
          {/* <div className="space-y-2 pt-2"> */}
          <h2 className="text-sm  uppercase text-gray-400 ">Tools</h2>
          <Link className="block py-2 px-2 font-semibold  text-sm text-gray-700  hover:bg-muted rounded-sm" href="/vis">
            <span>Visualization</span>
          </Link>

          <Link className="block py-2 px-2 font-semibold  text-sm text-gray-700  hover:bg-muted rounded-sm" href="/superpose">
            <span>Polymer Superposition (3D)</span>
          </Link>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="w-full">
              <AccordionTrigger className="p-0 m-0">
                <span className="block py-2 px-2 font-semibold  text-sm text-gray-700  hover:bg-muted rounded-sm">Landmarks</span>
              </AccordionTrigger>

              <AccordionContent>
                <Link href="/landmarks?type=ptc" className="w-full">
                  <span className="w-full py-2 px-8   text-sm   hover:bg-muted rounded-md">PTC</span>
                </Link>

              </AccordionContent>
              <AccordionContent>
                <Link href="/landmarks?type=exit_tunnel" className="w-full ">
                  <span className="w-full py-2 px-8   text-sm   hover:bg-muted rounded-md">Exit Tunnel</span>
                </Link>
              </AccordionContent>
            </AccordionItem>
          </Accordion>



        </div>
        <div className="flex-col  h-full   align-bottom justify-end justify-items-end content-end  ">
          <h2 className="text-sm  uppercase text-gray-400 ">Info</h2>
          <Link className="block py-2 text-sm " href="#"> About (WIP) </Link>
          <Link className="block py-2 text-sm " href="#"> How To (WIP) </Link>
          <Link className="block py-2 text-sm " href="mailto:rtkushner@gmail.com; kdd@math.ubc.ca"> Contact </Link>
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

function DnaIcon(props: any) {
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


function GaugeIcon(props: any) {
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


function HomeIcon(props: any) {
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


function InfoIcon(props: any) {
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


function LigatureIcon(props: any) {
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


function NotebookIcon(props: any) {
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


function Rotate3dIcon(props: any) {
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


function ViewIcon(props: any) {
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