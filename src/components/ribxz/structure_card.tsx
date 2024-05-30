"use client"
import { PopoverTrigger, PopoverContent, Popover } from "@/components/ui/popover"
import { CardContent, CardFooter, Card } from "@/components/ui/card"
import { RibosomeStructure } from "@/store/ribxz_api/ribxz_api"
import { HoverCardTrigger, HoverCardContent, HoverCard } from "@/components/ui/hover-card"
import Link from "next/link"
// import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"

export default function StructureCard({ _ }: { _: RibosomeStructure }) {
  return (
    <Link href={_.rcsb_id}>
    <Card className="w-80  max-h-full h-full  bg-white shadow-sm rounded-lg overflow-hidden relative transition   hover:shadow-xl  duration-100">

      <Popover>
        <PopoverTrigger asChild>
          <div className="relative h-[40%] transition-all duration-150 hover:h-[100%] border-2">
            <img alt="Card Image" className="w-full h-full object-cover" height={160} src="/chroma_spin1.gif" style={{ aspectRatio: "400/160", objectFit: "cover", }} width={400} />
            <div className="absolute top-4 left-4 transform  bg-white rounded-md px-3 py-1 text-sm font-bold">
              {_.rcsb_id}
            </div>
            <div className="absolute bottom-4 left-4 bg-white rounded-md px-3 py-1 text-sm font-bold" >{_.resolution} Å</div>
            <div className="absolute bottom-4 right-4 bg-white rounded-md px-3 py-1 text-sm font-bold">{_.citation_year}  </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <p>
            {_.citation_title}
          </p>
        </PopoverContent>
      </Popover>

      <CardContent className="group-hover:hidden pt-4">
        <div className="text-gray-700 text-sm">

          <div className="flex justify-between group relative">
            <span>Organism:</span>
            <div className="flex items-center group-hover:bg-gray-100 dark:group-hover:bg-gray-800 rounded-md px-2 py-1 transition-colors">
              {/* TODO: VARY COLOR OF TOOLTIP BASED ON SPECIES .
              this can be done by looking up the given tax id in the redux store once the species are actually there(just backend hooks atm)
              */}
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#ffccaa]" />
              <span className="ml-2 text-xs" title="Full taxonomic lineage">
                {_.src_organism_names[0]}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center mt-1 group relative">
            <span>Method:</span>
            <span title="Full method description">{_.expMethod}</span>
          </div>
          <div className="flex justify-between items-center mt-1 group relative">
            <span>Proteins:</span>
            <div className="flex items-center group-hover:bg-gray-100 dark:group-hover:bg-gray-800 rounded-md px-2 py-1 transition-colors">
              <span title="List of proteins">{_.proteins.length}</span>
            </div>
          </div>
          <div className="flex justify-between items-center mt-1 group relative">
            <span>RNA:</span>
            <div className="flex items-center group-hover:bg-gray-100 dark:group-hover:bg-gray-800 rounded-md px-2 py-1 transition-colors">
              <span title="List of RNA">{_.rnas.length}</span>
            </div>
          </div>
          <div className="flex justify-between items-center mt-1 group relative">
            <span>Ligands:</span>
            <div className="flex items-center group-hover:bg-gray-100 dark:group-hover:bg-gray-800 rounded-md px-2 py-1 transition-colors">
              <span title="List of ligands">{_.nonpolymeric_ligands.length}</span>
            </div>
          </div>
          {
            _.citation_rcsb_authors ? 
          <div className="relative flex justify-between items-center mt-1">
            <span>Authors:</span>
            <HoverCard>
              <HoverCardTrigger asChild>

                <span className="group-hover:bg-gray-100 dark:group-hover:bg-gray-800 rounded-md px-2 py-1 transition-colors z-10" title="Full list of authors" >

                  <span style={{ fontStyle: "italic" }}>{_.citation_rcsb_authors[0]}</span> <span style={{
                    cursor         : "pointer",
                    display        : 'inline-block',
                    width          : '15px',
                    height         : '15px',
                    borderRadius   : '50%',
                    backgroundColor: '#cccccc',
                    textAlign      : 'center',
                    lineHeight     : '15px',
                    fontWeight     : 'bold',
                    fontSize       : '14px',
                    color          : 'white'
                  }}>+</span>



                </span>

              </HoverCardTrigger>
              <HoverCardContent className="w-80 grid grid-cols-2 gap-2 z-50">
                {
                  _.citation_rcsb_authors.map((author) => {
                    return <div key={author} className="flex items-center gap-2">
                      <div>
                        <div className="font-medium">{author}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Co-Author</div>
                      </div>
                    </div>
                  })}
              </HoverCardContent>
            </HoverCard>
          </div>
          : null

          }
        </div>
      </CardContent>
    </Card>
</Link>
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



