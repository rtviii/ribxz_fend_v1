export default function Home() {
  return (
    <div className="max-w-5xl mx-auto my-10 p-8 ml-10">
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center space-x-4">
          <img alt="Logo" className="h-20 w-20" height="100" src="/placeholder.svg" style={{ aspectRatio: "100/100", objectFit: "cover", }} width="100" />
          <h1 className="text-4xl font-bold">RIBOXYZ</h1>
        </div>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <a className="block text-sm px-4 py-2 hover:bg-gray-100" href="#">
                Home
              </a>
            </li>
            <li>
              <a className="block text-sm px-4 py-2 hover:bg-gray-100" href="#">
                About
              </a>
            </li>
            <li>
              <a className="block text-sm px-4 py-2 hover:bg-gray-100" href="#">
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">WELCOME TO RIBOXYZ</h2>
          <p className="mb-4">
            RiboXYZ is a database application that provides organized access to ribosome structures, with several tools
            for visualisation and study.
          </p>
          <p className="mb-4">
            The database is up-to-date with the worldwide Protein Data Bank (PDB), with a standardized nomenclature that
            allows for search and comparison of subcomponents across all the available structures.
          </p>
          <p>
            In addition to structured access to this data, the application has several tools to facilitate comparison
            and further analysis, e.g., visualization, comparison and export facilities.
          </p>
        </section>
        <section className="grid grid-cols-3 gap-8 mb-8">
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-2">1136 Ribosome Structures</h3>
            <p className="mb-4">Sub 4 Å Resolution</p>
            <DnaIcon className="h-6 w-6" />
          </div>
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-2">64932 Protein Chains</h3>
            <p className="mb-4">Eukaryotic, Bacterial and Universal</p>
            <DnaIcon className="h-6 w-6" />
          </div>
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-2">5285 RNA Chains</h3>
            <p className="mb-4">rRNA, tRNA & mRNA</p>
            <DnaIcon className="h-6 w-6" />
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-4">ACKNOWLEDGEMENTS</h2>
          <div className="grid grid-cols-5 gap-4 items-center">
            <img alt="RCSB PDB" className="h-10 w-10" height="40" src="/placeholder.svg" style={{ aspectRatio: "40/40", objectFit: "cover", }} width="40" />
            <img alt="Biopython" className="h-10 w-10" height="40" src="/placeholder.svg" style={{ aspectRatio: "40/40", objectFit: "cover", }} width="40" /> 
            <img alt="PFAM" className="h-10 w-10" height="40" src="/placeholder.svg" style={{ aspectRatio: "40/40", objectFit: "cover", }} width="40" /> 
            <img alt="UBC" className="h-10 w-10" height="40" src="/placeholder.svg" style={{ aspectRatio: "40/40", objectFit: "cover", }} width="40" />
            <img alt="Georgia Institute of Technology" className="h-10 w-10" height="40" src="/placeholder.svg" style={{ aspectRatio: "40/40", objectFit: "cover", }} width="40" />
          </div>
        </section>
      </main>
    </div>
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
