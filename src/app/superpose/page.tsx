'use client';
import {CardTitle, CardHeader, CardContent, CardFooter, Card, CardDescription} from '@/components/ui/card';
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from '@/components/ui/resizable';
// import { MolstarNode } from "@/store/molstar/lib"
import {createContext, createRef, useEffect, useRef, useState} from 'react';
import {
    ChainsByStruct,
    Polymer,
    PolymerByStruct,
    RibosomeStructure,
    useRoutersRouterStructStructureProfileQuery
} from '@/store/ribxz_api/ribxz_api';
// import { initiatePluginUIContext, download_struct, superimpose_pop_chain, superimpose_select_pivot_chain } from "@/store/slices/molstar_state"
import {useAppDispatch, useAppSelector} from '@/store/store';
import {useParams} from 'next/navigation';
import {StructureFiltersComponent} from '@/components/filters/structure_filters_component';
import {Separator} from '@/components/ui/separator';
import {Button} from '@/components/ui/button';
import {useRoutersRouterStructChainsByStructQuery} from '@/store/ribxz_api/ribxz_api';
import {Label} from '@/components/ui/label';
// import { dynamicSuperimpose } from "@/store/molstar/dynamic_superposition";
import {SidebarMenu} from '@/components/ribxz/sidebar_menu';
import {MolstarNode} from '@/components/mstar/spec';
import {MolstarRibxz} from '@/components/mstar/__molstar_ribxz';
import {MolstarContext} from '@/components/mstar/__molstar_context';
// import {
//   superimpose_pop_chain,
//   superimpose_select_pivot_chain,
// } from "@/store/slices/molstar_state";

function PlusIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    );
}

function XIcon({props}: {props: any}) {
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
            strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}

const SumperimposeCandidateChainRow = ({polymer, rcsb_id}: {polymer: PolymerByStruct; rcsb_id: string}) => {
    const dispatch = useAppDispatch();
    // const current_pivot = useAppSelector(
    //   (state) => state.molstar.superimpose.pivot
    // )!;
    // const is_self_current_pivot = () => {
    //   if (
    //     current_pivot?.polymer.auth_asym_id === polymer.auth_asym_id &&
    //     current_pivot?.rcsb_id === rcsb_id
    //   ) {
    //     return true;
    //   } else {
    //     return false;
    //   }
    // };
    return (
        <div className="flex items-center p-2 bg-white shadow-sm hover:shadow-md transition-shadow">
            <span className="flex-grow">
                {rcsb_id}.{polymer.auth_asym_id}
            </span>
            <div
                className="flex items-center px-4 py-1 border rounded hover:cursor-pointer hover:bg-slate-200 mx-4"
                onClick={() => {
                    // dispatch(superimpose_select_pivot_chain({ polymer, rcsb_id }));
                }}>
                <div
                // className={`w-4 h-4  ${
                //   is_self_current_pivot() ? "bg-green-400" : "bg-gray-400"
                // } rounded-full`}
                />
                <span className="ml-2 text-sm">Pivot</span>
            </div>
            <div
                className="hover:cursor-pointer border rounded hover:bg-slate-200"
                onClick={() => {
                    // dispatch(superimpose_pop_chain({ polymer, rcsb_id }));
                }}>
                <XIcon props={{className: 'w-6 h-6 p-1'}} />
            </div>
        </div>
    );
};

export default function Superimpose() {
    const {rcsb_id} = useParams<{rcsb_id: string}>();
    const dispatch = useAppDispatch();
    // const active_superimpose_chains = useAppSelector(
    //   (state) => state.molstar.superimpose.active_chains
    // )!;
    // const pivot = useAppSelector((state) => state.molstar.superimpose.pivot)!;

    const molstarNodeRef = useRef<HTMLDivElement>(null);
    const [ctx, setCtx] = useState<MolstarRibxz | null>(null);
    useEffect(() => {
        (async () => {
            const x = new MolstarRibxz();
            await x.init(molstarNodeRef.current!);
            setCtx(x);
        })();
    }, []);

    const {
        data,
        error,
        isLoading: isLoading_struct_data
    } = useRoutersRouterStructStructureProfileQuery({rcsbId: rcsb_id});
    const [test_active, test_active_set] = useState<boolean>(false);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <SidebarMenu />
            <ResizablePanelGroup
                direction="horizontal"
                className={'rounded-lg border ' + (test_active ? 'bg-black' : 'bg-white')}>
                <ResizablePanel defaultSize={25}>
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>{data?.rcsb_id}</CardTitle>
                            <p className="text-gray-500 text-sm">{data?.citation_title}</p>
                        </CardHeader>

                        <CardContent className="flex-grow overflow-auto space-y-8 items-center">
                            <div className="flex flex-col gap-4">{/* <StructureFiltersComponent /> */}</div>

                            <Separator className="my-4" />
                            <p className="text-gray-500 p-1">
                                Please select chains to superimpose from the {'+'} menu.
                            </p>
                            {/* <MolstarContext.Provider value={ctx}>
                <Button className=" min-w-full bg-black text-white hover:bg-gray-700  font-medium rounded-md text-sm p-2.5 text-center inline-flex items-center justify-center w-10 h-10">
                  <PlusIcon />
                </Button>
                </StructureSelection>
              </MolstarContext.Provider> */}

                            {/* <div className="flex flex-col gap-2">
                {active_superimpose_chains.map((p) => (
                  <SumperimposeCandidateChainRow
                    key={p.rcsb_id + p.polymer.auth_asym_id}
                    polymer={p.polymer}
                    rcsb_id={p.rcsb_id}
                  />
                ))}
              </div> */}
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button
                                onClick={() => {
                                    ctx!.dynamicSuperimpose('e');
                                }}
                                className="min-w-full  gap-2 text-white flex-col flex hover:bg-gray-800 focus:outline-none  font-medium rounded-md text-sm  text-center  items-center justify-center w-10 h-24">
                                <p className="font-bold">Superimpose</p>
                            </Button>
                        </CardFooter>
                    </Card>
                </ResizablePanel>
                <ResizableHandle />

                <ResizablePanel defaultSize={75}>
                    <div className="flex flex-col gap-4">
                        <MolstarNode ref={molstarNodeRef} />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
