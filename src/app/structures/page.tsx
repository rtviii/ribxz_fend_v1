'use client'
 import { useState } from 'react'
import { Switch } from '@headlessui/react'
import { ChevronRightIcon } from '@heroicons/react/20/solid'

const statuses = {
  offline: 'text-gray-500 bg-gray-100/10',
  online: 'text-green-400 bg-green-400/10',
  error: 'text-rose-400 bg-rose-400/10',
}
const environments = {
  Preview: 'text-gray-400 bg-gray-400/10 ring-gray-400/20',
  Production: 'text-indigo-400 bg-indigo-400/10 ring-indigo-400/30',
}
const properties = [
  {
    teamName: 'Deposition Authors',
    environment: 'Amunts A. +',
  },
  {

    teamName: 'Combined Resolution',
    environment: '4.3 A',
  },
  {

    teamName: 'Species',
    environment: 'E. Coli',
  },
  {
    teamName: 'Method',
    environment: 'EM',
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}


const ribxz_template = {
  "rcsb_id": "",
  "expMethod": "",
  "resolution": "",
  "pdbx_keywords": "",
  "pdbx_keywords_text": "",
  "rcsb_external_ref_id": "",
  "rcsb_external_ref_type": "",
  "rcsb_external_ref_link": "",
  "citation_year": "",
  "citation_rcsb_authors": "",
  "citation_title": "",
  "citation_pdbx_doi": "",
  "src_organism_ids": "",
  "src_organism_names": "",
  "host_organism_ids": "",
  "host_organism_names": "",
  "assembly_map": "",
  "proteins": "",
  "rnas": "",
  "nonpolymeric_ligands": "",
  "polymeric_factors": "",
  "other_polymers": "",
}

// mitoribosome?
// full subunit? lsu? ssu?

export default function StructureCard() {
  return <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
    <a href="#">
      <img className="rounded-t-lg" src='/src/3j7z.mesh.png' alt="" />
    </a>
    <div className="p-5">
      <a href="#">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">3J7Z</h5>
      </a>
      <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
      {/* <a href="#" className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">

      </a> */}
      <ul role="list" className="">
        {properties.map((deployment) => (
          <li key={deployment.id} className=" flex  space-x-10 py-1">
            <div className="min-w-0 flex-auto">
              <div className="flex items-center gap-x-2">
                {/* <div lassName={classNames(statuses[deployment.status], 'flex-none rounded-full p-0')}>
                  <div className="h-2 w-2 rounded-full bg-current" />
                </div> */}

                <h3 className="min-w-0 text-xs font-semibold leading-6 text-white">
                  <a href={deployment.href} className="flex gap-x-2">
                    <span className="truncate">{deployment.teamName}</span>
                  </a>
                </h3>
              </div>
            </div>
            <div
              className={classNames(environments[deployment.environment], 'rounded-full flex-none py-1 px-2 text-xs font-medium ring-1 ring-inset')} >
              {deployment.environment}
            </div>
            {/* <ChevronRightIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" /> */}
          </li>
        ))}

        <li className='flex space-x-10 py-1 '>

          <div className="min-w-0 flex-auto">
            <div className="flex items-center gap-x-2">
              <h3 className="min-w-0 text-xs font-semibold leading-6 text-white flex">
                <a className="flex gap-x-2">
                  <span className="truncate">RNA</span>
                </a>
              </h3>
            </div>
          </div>

          <div
            className={classNames('rounded-full flex-none py-1 px-2 text-xs font-medium ring-1 ring-inset')} >
            7
          </div>


          <div className="min-w-0 flex-auto">
            <div className="flex items-center gap-x-2">
              <h3 className="min-w-0 text-xs font-semibold leading-6 text-white flex">
                <a className="flex gap-x-2">
                  <span className="truncate">Protein</span>
                </a>
              </h3>
            </div>
          </div>

          <div
            className={classNames('rounded-full flex-none py-1 px-2 text-xs font-medium ring-1 ring-inset')} >
            63
          </div>


          <div className="min-w-0 flex-auto">
            <div className="flex items-center gap-x-2">
              <h3 className="min-w-0 text-xs font-semibold leading-6 text-white flex">
                <a className="flex gap-x-2">
                  <span className="truncate">Ligands</span>
                </a>
              </h3>
            </div>
          </div>

          <div
            className={classNames('rounded-full flex-none py-1 px-2 text-xs font-medium ring-1 ring-inset')} >
            4
          </div>
        </li>
      </ul>





      {/* <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
        </svg> */}
    </div>
  </div>

}



const tax_descendants = [
  { name: 'Bacteria', href: '2', current: false },
  { name: 'Enterobacterales', href: '19800', current: true },
  { name: 'E. Coli', href: '83333', current: true },
]

const tax_descendants1 = [
  { name: '2', href: '2', current: false },
  { name: '19800', href: '19800', current: true },
  { name: '83333', href: '83333', current: true },
]



export function TaxonomyBreadcrumbs() {

const [isToggleOn, setIsToggleOn] = useState(true);
  const handleClick = () => {
    setIsToggleOn(!isToggleOn);
  };
  return (
    <nav className="flex space-x-2 space-between rounded-md bg-white px-4" aria-label="Breadcrumb">
 <span className="inline-flex items-center rounded-md bg-gray-50 px-2  py-2 my-2 text-xs  text-gray-600 ring-1 ring-inset ring-gray-500/10" onClick={()=>handleClick()}>
        TaxID  
      </span>

      <ol role="list" className="flex text-sm space-x-5">
        {(isToggleOn ? tax_descendants : tax_descendants1).map((page) => (
          <li key={page.name} className="flex">
            <div className="flex items-center">
              <a
                href={page.href}
                className="ml-2   text-gray-500 hover:text-gray-700"
                aria-current={page.current ? 'page' : undefined}
              >
                {page.name}
              </a>
          <span className='mx-2'>/</span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}



function Togglet() {
  const [enabled, setEnabled] = useState(false)

  return (
    <Switch

      checked={enabled}
      onChange={setEnabled}
      className={classNames(
        enabled ? 'bg-gray-600' : 'bg-gray-200',
        'relative inline-flex h-2 w-4 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2'
      )}
    >
      <span className="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        className={classNames(
          enabled ? 'translate-x-5' : 'translate-x-0',
          'pointer-events-none inline-block h-2 w-2 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
        )}
      />
    </Switch>
  )
}
