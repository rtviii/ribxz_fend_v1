"use client"
import { PopoverTrigger, PopoverContent, Popover } from "@/components/ui/popover"
import { CardContent, CardFooter, Card } from "@/components/ui/card"
import { RibosomeStructure } from "@/store/ribxz_api/ribxz_api"
import { HoverCardTrigger, HoverCardContent, HoverCard } from "@/components/ui/hover-card"
import Link from "next/link"
import Image from 'next/image'
// import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"

export default function StructureCard({ _ }: { _: RibosomeStructure }) {
  const RCSB_IDs = ["1FJG.png", "4WZD.png", "5OQL.png", "6MKN.png", "6PPK.png", "7BTB.png", "7PJV.png", "7V08.png", "8FKS.png",
    "1NWY.png", "5AFI.png", "5UYP.png", "6NU2.png", "6QIK.png", "7MD7.png", "7QIZ.png", "8C01.png", "8G7R.png",
    "3G6E.png", "5DGF.png", "5VPP.png", "6O7K.png", "6R7Q.png", "7MQ9.png", "7QWR.png", "8C90.png", "8G7S.png",
    "3JBP.png", "5E7K.png", "6BUW.png", "6OF6.png", "6V39.png", "7NAC.png", "7R7A.png", "8CEH.png", "8INK.png",
    "3JCN.png", "5IB8.png", "6BZ7.png", "6OFX.png", "6W7M.png", "7ODR.png", "7RQA.png", "8D8K.png", "8OM4.png",
    "4B3S.png", "5KPW.png", "6HRM.png", "6P4G.png", "6ZQF.png", "7OE0.png", "7U2H.png", "8ETJ.png", "8SCB.png",
    "4WRA.png", "5MMM.png", "6LQR.png", "6P5N.png", "7A1G.png", "7OYC.png", "7UVX.png", "8EUG.png", "8T8C.png"]
  const utf8Encode = new TextEncoder();
  const byteval = utf8Encode.encode(_.rcsb_id).reduce((acc, byte) => acc + byte, 0);
  const pic = RCSB_IDs[byteval % RCSB_IDs.length]
  const method = (() => {
    if (_.expMethod.toLowerCase().includes("electron")) {
      return "EM"
    } else if (_.expMethod.toLowerCase().includes("ray")) {
      return "XRAY"
    } else if (_.expMethod.toLowerCase().includes("nmr")) {
      return "NMR"
    }
  })()

  const method_color = (() => {
    switch (method) {
      case "EM":
        return "text-cyan-500"
      case "XRAY":
        return "text-orange-500"
      case "NMR":
        return "text-green-500"
    }
  })()


  return (
    <Link href={`/structures/${_.rcsb_id}`}>
      <Card className="w-80  max-h-full h-full  bg-white shadow-sm rounded-lg overflow-hidden relative transition   hover:shadow-xl  duration-100">
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative h-[40%] transition-all duration-150 hover:h-[100%] border-2">
              <Image alt="Card Image" className="w-full h-full object-cover" height={160} width={400} src={`/ribxz_pics/${pic}`} style={{ aspectRatio: "400/160", objectFit: "revert-layer", }} />

              <div className="absolute top-4 left-4 transform  bg-muted border rounded-sm px-3 py-1 text-xs "> {_.rcsb_id} </div>
              <div className="absolute bottom-4 left-4         bg-muted border rounded-sm px-3 py-1 text-xs " >{_.resolution} Å</div>

              <div className={`absolute top-4 right-4 bg-muted border rounded-sm  px-3 py-1 text-xs  ${method_color}`} >

                {
                  method

                }
              </div>
              {
                _.citation_year ?
                  <div className="absolute bottom-4 right-4        bg-muted border rounded-sm px-3 py-1 text-xs ">{_.citation_year}  </div> :
                  null
              }

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
                <span className="ml-2 text-xs" title="Full taxonomic lineage">
                  {_.src_organism_names}
                  {_.src_organism_ids.join(",")}
                </span>
              </div>
            </div>
            {/* <div className="flex justify-between items-center mt-1 group relative">
              <span>Method:</span>
              <span title="Full method description">{_.expMethod}</span>
            </div> */}
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
                <span title="List of ligands">{ _.nonpolymeric_ligands.filter(ligand => !ligand.chemicalName.toLowerCase().includes("ion")) .length}</span>
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
                          cursor: "pointer",
                          display: 'inline-block',
                          width: '15px',
                          height: '15px',
                          borderRadius: '50%',
                          backgroundColor: '#cccccc',
                          textAlign: 'center',
                          lineHeight: '15px',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          color: 'white'
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



