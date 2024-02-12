import { CardContent, CardFooter, Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function StructHero() {
  return (
    <Card className="w-full max-w-sm bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="relative group">
        <img
          alt="Molecular Structure"
          className="w-full h-32 object-cover group-hover:h-80 transition-all duration-300 ease-in-out"
          height="300"
          src="/placeholder.svg"
          style={{
            aspectRatio: "312/300",
            objectFit: "cover",
          }}
          width="312"
        />
        <div className="absolute inset-0 bg-black bg-opacity-25 group-hover:bg-opacity-0 transition-all duration-300 ease-in-out" />
      </div>
      <CardContent className="group-hover:hidden">
        <div className="px-4 py-4">
          <div className="font-bold text-xl mb-2">7UNV</div>
          <div className="text-gray-700 text-sm">
            <div className="flex justify-between">
              <span>2.7 Å</span>
              <span>2022</span>
            </div>
            <p className="text-gray-900 leading-none mt-3">
              Compact IF2 allows initiator tRNA accommodation into the P site and ga...
            </p>
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <span>Organism:</span>
                <div className="flex items-center">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#ff0000]" />
                  <span className="ml-2 text-xs" title="Full taxonomic lineage">
                    Pseudomonas aeruginosa
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span>Method:</span>
                <span title="Full method description">ELECTRON MICROSCOPY</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span>Proteins:</span>
                <span title="List of proteins">52</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span>RNA:</span>
                <span title="List of RNA">5</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span>Ligands:</span>
                <span title="List of ligands">4</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span>Author:</span>
                <span title="Full list of authors">Basu, R.S. et al.</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-around items-center p-4 bg-gray-100">
        <Button className="text-xs">PDB</Button>
        <Button className="text-xs">DOI</Button>
        <Button className="text-xs">EMDB</Button>
        <ShareIcon className="text-gray-500" />
        <SettingsIcon className="text-gray-500" />
        <DownloadIcon className="text-gray-500" />
        <ExpandIcon className="text-gray-500" />
      </CardFooter>
    </Card>
  )
}

function DownloadIcon(props) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )
}


function ExpandIcon(props) {
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
      <path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8" />
      <path d="M3 16.2V21m0 0h4.8M3 21l6-6" />
      <path d="M21 7.8V3m0 0h-4.8M21 3l-6 6" />
      <path d="M3 7.8V3m0 0h4.8M3 3l6 6" />
    </svg>
  )
}


function SettingsIcon(props) {
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}


function ShareIcon(props) {
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
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  )
}
