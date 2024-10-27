'use client'

export function TaxonomyDot(props:any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      // strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}


export const taxdot = (kingdom:"Archaea" |"Eukaryota" |"Bacteria"):React.ReactNode =>{
  return <TaxonomyDot className={kingdom === "Archaea" ? "fill-red-500" : kingdom === "Eukaryota" ? "fill-green-500" : "fill-blue-500"} />
}