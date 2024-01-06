import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Component() {
  return (
    <div className="flex flex-col lg:flex-row">
      <div className="lg:w-1/3">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>7UNW</CardTitle>
            <CardDescription>Pseudomonas aeruginosa PAO1</CardDescription>
          </CardHeader>
          <CardContent>
            <img
              alt="Biomolecule"
              className="mb-4"
              height="300"
              src="/placeholder.svg"
              style={{
                aspectRatio: "300/300",
                objectFit: "cover",
              }}
              width="300"
            />
            <div className="grid grid-cols-1 gap-4">
              <div>
                <strong>Species:</strong>
                <p>Pseudomonas aeruginosa PAO1</p>
              </div>
              <div>
                <strong>Resolution:</strong>
                <p>2.6 Å</p>
              </div>
              <div>
                <strong>Experimental Method:</strong>
                <p>ELECTRON MICROSCOPY</p>
              </div>
              <div>
                <strong>Title:</strong>
                <p>
                  Compact IF2 allows initiator tRNA accommodation into the P site and gates the ribosome to elongation
                </p>
              </div>
              <div>
                <strong>Authors:</strong>
                <Button variant="ghost">View</Button>
              </div>
              <div>
                <strong>Year:</strong>
                <p>2022</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">Visualize</Button>
                <Button>Download</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-2">
          <details className="group">
            <summary className="cursor-pointer text-lg font-semibold">PROTEINS</summary>
            <div className="mt-2 space-y-2">
              <p>50S ribosomal protein L20</p>
              <p>50S ribosomal protein L32</p>
              <p>50S ribosomal protein L25</p>
              <p>30S ribosomal protein S10</p>
              <p>50S ribosomal protein L33</p>
            </div>
          </details>
        </div>
      </div>
      <div className="lg:w-2/3 h-[500px]">
        <div className="w-full h-full bg-gray-200" />
      </div>
    </div>
  )
}

