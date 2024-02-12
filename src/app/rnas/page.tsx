import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Component() {
  return (
    <div key="1" className="min-h-screen bg-white p-8">
      <h1 className="text-xl font-bold mb-6">RNA</h1>
      <div className="grid grid-cols-5 gap-4 mb-6 items-start">
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Search</label>
          <Input className="mb-4" placeholder="Search" />
          <label className="block text-sm font-medium mb-1">Resolution</label>
          <Input className="mb-4" type="range" />
          <label className="block text-sm font-medium mb-1">Deposition Date</label>
          <Input className="mb-4" type="range" />
          <div className="flex gap-2">
            <Button className="text-xs" variant="outline">
              XRAY
            </Button>
            <Button className="text-xs" variant="outline">
              EM
            </Button>
          </div>
        </div>
        <div className="col-span-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button className="text-xs" variant="ghost">
                Ribosomal RNA
              </Button>
              <Button className="text-xs" variant="ghost">
                Non-ribosomal RNA
              </Button>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-xs">PAGE:</span>
              <Button className="text-xs" variant="ghost">
                1
              </Button>
              <Button className="text-xs" variant="ghost">
                2
              </Button>
              <Button className="text-xs" variant="ghost">
                3
              </Button>
              <Button className="text-xs" variant="ghost">
                4
              </Button>
              <Button className="text-xs" variant="ghost">
                5
              </Button>
              <Button className="text-xs" variant="ghost">
                6
              </Button>
              <Button className="text-xs" variant="ghost">
                7
              </Button>
              <span className="text-xs">SORT BY:</span>
              <Select className="text-xs">
                <SelectTrigger id="sort">
                  <SelectValue placeholder="RESOLUTION" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="resolution">RESOLUTION</SelectItem>
                  <SelectItem value="sequence-length">SEQUENCE LENGTH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-4">
              <div className="border p-4">
                <h2 className="text-sm font-bold mb-2">25SrRNA</h2>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-xs">Sequence (3937 nt)</span>
                  <Button className="text-xs" variant="outline">
                    Download Structure (.cif)
                  </Button>
                  <Button className="text-xs" variant="outline">
                    Download Sequence (fasta)
                  </Button>
                </div>
              </div>
              <div className="border p-4">
                <h2 className="text-sm font-bold mb-2">18SrRNA</h2>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-xs">Sequence (2500 nt)</span>
                  <Button className="text-xs" variant="outline">
                    Download Structure (.cif)
                  </Button>
                  <Button className="text-xs" variant="outline">
                    Download Sequence (fasta)
                  </Button>
                </div>
              </div>
              <div className="border p-4">
                <h2 className="text-sm font-bold mb-2">5.8SrRNA</h2>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-xs">Sequence (1800 nt)</span>
                  <Button className="text-xs" variant="outline">
                    Download Structure (.cif)
                  </Button>
                  <Button className="text-xs" variant="outline">
                    Download Sequence (fasta)
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
      <div className="fixed bottom-4 left-4">
        <SettingsIcon className="text-black h-8 w-8" />
      </div>
    </div>
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
