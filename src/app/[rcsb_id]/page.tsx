'use client'
import { MolStarWrapper, MolstarNode } from '@/molstar/mstar_wrapper'
import { download_another_struct, load_from_server, select_multiple, stream_volume } from '@/molstar/functions'
import { DocumentDuplicateIcon, FolderIcon, HomeIcon, UsersIcon, } from '@heroicons/react/24/outline'
import { SequenceView } from 'molstar/lib/mol-plugin-ui/sequence'
import { useEffect, useRef } from 'react'
import { createPluginUI } from 'molstar/lib/mol-plugin-ui'
const navigation = [
  { name: 'Structures', href: '#', icon: HomeIcon, current: true },
  { name: 'Polynucleotides (Protein)', href: '#', icon: FolderIcon, current: false },
  { name: 'Polypeptides (RNA)', href: '#', icon: FolderIcon, current: false },
  { name: 'Ligands', href: '#', icon: FolderIcon, current: false },
  { name: 'Classification', href: '#', icon: DocumentDuplicateIcon, current: false },
  { name: 'Landmarks', href: '#', icon: DocumentDuplicateIcon, current: false },
  // { name: 'Tools'        , href: '#', icon: FolderIcon           , current: false },
]
const tools = [
  { id: 1, name: '3D Align', href: '#', initial: 'A', current: false },
  { id: 2, name: 'Binding Interface Prediction', href: '#', initial: 'I', current: false },
  { id: 3, name: 'Model-to-Density Fit', href: '#', initial: 'D', current: false },
  { id: 3, name: '[WIP] Viewer State', href: '#', initial: 'S', current: false },
  { id: 3, name: '[WIP] Load Density', href: '#', initial: 'S', current: false },
]

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}


export default function StructurePage() {

  const molstarNodeRef = useRef(null);

  useEffect(() => {
    async function init() {
      window.molstar = await createPluginUI(molstarNodeRef.current as HTMLDivElement, MySpec);
      const data       = await window.molstar.builders.data.download({ url: "https://files.rcsb.org/download/3j7z.pdb" }, { state: { isGhost: true } });
      const trajectory = await window.molstar.builders.structure.parseTrajectory(data, "pdb");
      await window.molstar.builders.structure.hierarchy.applyPreset(trajectory, "default");
    }

    if ( molstarNodeRef.current ) {
    init();
    }


    return () => {
      window.molstar?.dispose();
      window.molstar = undefined;
    };
  }, []);


  return (
    <div className="flex h-screen">
      {/* Column 1 */}
      <div className="w-1/5 flex flex-col">

        <div className="h-1/5 bg-gray-200">
          Row 1</div>
        <div className="h-3/5 bg-gray-300">
          <nav className="flex mx-20 my-10 flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={classNames(
                          item.current
                            ? 'bg-gray-300 text-indigo-600'
                            : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
                        <item.icon
                          className={classNames(
                            item.current ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                            'h-6 w-6 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>

              <li>
                <div className="text-xs font-semibold leading-6 text-gray-400">Structure Tools</div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {tools.map((team) => (
                    <li
                      onClick={() => { console.log() }}

                      key={team.name}>
                      <a
                        href={team.href}
                        className={classNames(
                          team.current
                            ? 'bg-gray-50 text-indigo-600'
                            : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
                        <span className={classNames(team.current ? 'text-indigo-600 border-indigo-600' : 'text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600', 'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white')} >
                          {team.initial}
                        </span>
                        <span className="truncate">{team.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
        <div className="h-1/5 bg-gray-200">
          <ul className='mx-20 my-10'>
            <li>
              <button onClick={() => load_from_server()} type="button" className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50" > custom model</button>
            </li>
            <li>
              <button onClick={() => select_multiple()} type="button" className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50" > try chain </button>
            </li>
            <li>
              <button onClick={() => stream_volume()} type="button" className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50" > stream volume</button>
            </li>
            <li>
              <button onClick={() => download_another_struct()} type="button" className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50" > add struct</button>
            </li>
          </ul>
        </div>
      </div>

      {/* Column 2 */}
      <div className="w-3/5 flex flex-col">
        <div className="h-1/5 bg-gray-400"> 
                        {/* <SequenceView /> */}
        </div>
        <div className="h-3/5 bg-gray-500">
          <MolstarNode ref={molstarNodeRef} />
          {/* <MolStarWrapper /> */}
        </div>
        <div className="h-1/5 bg-gray-400">Row 3</div>
      </div>

      {/* Column 3 */}
      <div className="w-1/5 flex flex-col">
        <div className="h-1/5 bg-gray-200">Row 1</div>
        <div className="h-3/5 bg-gray-300">Row 2</div>
        <div className="h-1/5 bg-gray-200">Row 3</div>
      </div>
    </div>
  );
}