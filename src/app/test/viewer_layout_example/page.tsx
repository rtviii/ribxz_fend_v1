'use client'
import { apply_style, load_from_server, select_multiple, stream_volume } from '@/molstar_lib/functions'
import { DocumentDuplicateIcon, FolderIcon, HomeIcon, UsersIcon, } from '@heroicons/react/24/outline'
import { SequenceView } from 'molstar/lib/mol-plugin-ui/sequence'
import { RefObject, createContext, useContext, useEffect, useRef, useState } from 'react'
import { createPluginUI } from 'molstar/lib/mol-plugin-ui'
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context'
import { PluginContextContainer } from 'molstar/lib/mol-plugin-ui/plugin';
import { MolstarNode } from '@/molstar_lib/molstar_plugin'
import { useDispatch, useSelector } from 'react-redux'
import {StructState, setStructureData,setStructureError,setStructureLoading, useGetStructureProfileQuery } from '@/state/structure/structure'

const navigation = [
  { name: 'Structures'               , href: '#', icon: HomeIcon             , current: true  },
  { name: 'Polynucleotides (Protein)', href: '#', icon: FolderIcon           , current: false },
  { name: 'Polypeptides (RNA)'       , href: '#', icon: FolderIcon           , current: false },
  { name: 'Ligands'                  , href: '#', icon: FolderIcon           , current: false },
  { name: 'Classification'           , href: '#', icon: DocumentDuplicateIcon, current: false },
  { name: 'Landmarks'                , href: '#', icon: DocumentDuplicateIcon, current: false },
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



export default function StructurePage({params: page_params }:{params:{rcsb_id:string}}) {

  console.log("This is the page for ", page_params.rcsb_id)

  const dispatch     = useDispatch();
  const structState  = useSelector((state: { struct: StructState }) => state.struct);

  const { data, error, isLoading } = useGetStructureProfileQuery('3j7z')

  useEffect(()=>{
    console.log(data);
    console.log(error);
    console.log(isLoading);
  },[data,error,isLoading])

  ribxz_plugin: PluginUIContext;

  const molstarNodeRef      = useRef<HTMLDivElement>(null);
  const [plugin, setPlugin] = useState<PluginUIContext | undefined>(undefined);




  return (
    <div className="flex h-screen">
      {/* Column 1 */}
      <div className="w-1/5 flex flex-col">

        <div className="h-1/5 bg-gray-200">
          <button onClick={()=>console.log(data)}>Struct State</button>

        </div>
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
              {/* <button onClick={() => select_multiple()} type="button" className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50" > try chain </button> */}
            </li>
            <li>
              <button onClick={() => stream_volume()} type="button" className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50" > stream volume</button>
            </li>
            <li>
              <button onClick={() => {}} type="button" className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50" > add struct</button>
            </li>
            <li>
              <button onClick={() => apply_style()} type="button" className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50" > apply style</button>
            </li>
          </ul>
        </div>
      </div>

      {/* Column 2 */}
      <div className="w-3/5 flex flex-col">
        <div className="h-1/5 bg-gray-400">
          {/* {plugin ? <PluginContextContainer plugin={plugin}><SequenceView/></PluginContextContainer> : null} */}
          {/* <MolstarStateContext.Provider value={molstarState}>
          </MolstarStateContext.Provider > */}
        </div>
        <div className="h-3/5 bg-gray-500">
          <MolstarNode ref={molstarNodeRef} />
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