"use client"
import { Button } from "@/components/ui/button"
import { HoverCardTrigger, HoverCardContent, HoverCard } from "@/components/ui/hover-card"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { Input } from "@/components/ui/input"
import { Select, Space, Tag, Typography } from 'antd';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { ChainsByStruct, PolymerByStruct, RibosomeStructure } from "@/store/ribxz_api/ribxz_api"
import { Separator } from "@radix-ui/react-select"
import { useContext, useEffect, useState } from "react"
import { MolstarContext } from "@/components/ribxz/molstar_context"
import { StructureOverview, select_structure } from "@/store/slices/slice_structs_overview"


// const StructureComponentsSelection = ({ structure }: { structure: RibosomeStructure }) => {

//     const dispatch = useAppDispatch();
//     const search_val = useAppSelector(state => state.molstar.superimpose.chain_search)!
//     const polymers = [...structure.proteins, ...structure.rnas, ...structure.other_polymers]
//     const ctx = useContext(MolstarContext)

//     return <div className="border rounded-lg p-1 max-h-64 overflow-y-auto scrollbar-hide flex items-center justify-between hover:bg-slate-200">
//         <HoverCard openDelay={0} closeDelay={0}>
//             <HoverCardTrigger asChild>
//                 <span className="min-w-full cursor-pointer px-1 text-sm">{structure.rcsb_id}</span>
//             </HoverCardTrigger>

//             <HoverCardContent side="right">
//                 <div className="chain-picker grid gap-1 max-h-64 overflow-y-auto">

//                     <div className="text-xs items-center gap-2">
//                         <Input placeholder="Search" value={search_val} onChange={(e) => { dispatch(superimpose_set_chain_search(e.target.value)) }} />
//                     </div>
//                     <Separator />
//                     {polymers
//                         .toSorted((a: PolymerByStruct, b: PolymerByStruct) => {
//                             if (a.nomenclature.length < 1 || b.nomenclature.length < 1) return 0
//                             else if (a.nomenclature[0] < b.nomenclature[0]) return -1
//                             else return 1
//                         })
//                         .filter(p => {
//                             if (p.nomenclature.length < 1) return p.auth_asym_id.toLowerCase().includes(search_val.toLowerCase())
//                             else return p.nomenclature[0].toLowerCase().includes(search_val.toLowerCase()) || p.auth_asym_id.toLowerCase().includes(search_val.toLowerCase())
//                         })
//                         .map(p =>
//                             <div key={p.auth_asym_id}
//                                 onClick={() => {
//                                     // dispatch(superimpose_add_chain({ polymer: p, rcsb_id: structure.rcsb_id }))
//                                     ctx?.load_mmcif_chain({
//                                         auth_asym_id: p.auth_asym_id,
//                                         rcsb_id: structure.rcsb_id
//                                     })
//                                 }}
//                                 className="border rounded-sm p-0.5 px-2 text-sm flex justify-between hover:cursor-pointer hover:bg-slate-200">
//                                 <span>{p.auth_asym_id}</span>
//                                 <span>{p.nomenclature[0]}</span>
//                             </div>)}
//                 </div>
//             </HoverCardContent>
//         </HoverCard>
//     </div>
// }



// export default function StructurePicker({ children }: { children?: React.ReactNode }) {

//     const dispatch = useAppDispatch();
//     const search_val = useAppSelector(state => state.molstar.superimpose.struct_search)!
//     const current_structures = useAppSelector(state => state.structures_page.current_structures)
//     const filters = useAppSelector(state => state.structures_page.filters)

//     return (
//         <HoverCard openDelay={0} closeDelay={0}>
//             <HoverCardTrigger asChild >
//                 {children}
//             </HoverCardTrigger>
//             <HoverCardContent className="w-80 p-4" side="right">
//                 <div className="chain-picker grid gap-2">
//                     <div className="flex items-center gap-2">
//                         <Input placeholder="Search" value={filters.search!} onChange={(e) => { dispatch(set_filter({ filter_type: "search", value: e.target.value })) }} />
//                     </div>
//                     {current_structures.map(S => <StructureComponentsSelection structure={S} key={S.rcsb_id} />)}
//                     <Pagination>
//                         <PaginationContent>
//                             <PaginationItem>
//                                 <PaginationPrevious href="#" />
//                             </PaginationItem>
//                             <PaginationItem>
//                                 <PaginationNext href="#" />
//                             </PaginationItem>
//                         </PaginationContent>
//                     </Pagination>
//                 </div>
//             </HoverCardContent>
//         </HoverCard>
//     )
// }


//! Do "Coordinate" double dropdown for chains
// It's an input field with its own state 
// and that can be parametrized by filters but isn't by default
const { Text } = Typography;


import type { SelectProps } from 'antd';
type LabelRender = SelectProps['labelRender'];
const labelRender: LabelRender = (props) => {
  const { label, value } = props;

  if (label) {
    return value;
  }
  return <span>No option match</span>;
};
export const GlobalStructureSelection = ({ ...props }: Partial<React.ComponentProps<typeof Select>> = {}) => {

    const structs_overview = useAppSelector(state => state.homepage_overview.structures)
    const selected         = useAppSelector(state => state.homepage_overview.selected)
    const dispatch         = useAppDispatch();

    const filterOption = (input: string, option: any) => {

        const { S } = option;
        return (S.rcsb_id.toLowerCase().indexOf(input.toLowerCase()) >= 0 || S.tax_name.toLowerCase().indexOf(input.toLowerCase()) >= 0);
    };

    return <Select
        {...props}
        labelRender={labelRender}
        showSearch   = {true}
        placeholder  = "Select a structure"
        // @ts-ignore
        onChange     = {(val, struct) => { dispatch(select_structure(struct.S as StructureOverview)) }}
        value        = {selected?.rcsb_id}
        style        = {{ width: '100%' }}
        filterOption = {filterOption}
        options      = {structs_overview.map(struct_overview => ({
            value: struct_overview.rcsb_id,
            label: (
                <Space direction = "vertical" style = {{ width: '100%' }}>
                <Space style     = {{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <Text strong>{struct_overview.rcsb_id}</Text>
                        <Space>
                            {struct_overview.mitochondrial && (
                                <Text strong style={{ color: 'orange', fontSize: '1em', marginRight: '4px' }}>
                                    mt
                                </Text>
                            )}
                            <Text>{struct_overview.tax_name}</Text>
                        </Space>
                    </Space>
                    <Text style={{ fontSize: '0.9em', color: '#666' }}>
                        {struct_overview.title}
                    </Text>
                </Space>
            ),
            S: struct_overview
        }))
        }
    />
}