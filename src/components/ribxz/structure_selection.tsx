"use client"
import { useAppSelector } from "@/store/store"
import React from 'react';
import { Select } from 'antd';
import { useRoutersRouterStructOverviewQuery } from "@/store/ribxz_api/ribxz_api";


export default function StructureSelection() {

    // TODO: Reset filters when you get here.
    const current_structures  = useAppSelector(state => state.ui.data.current_structures)
    const { data, isLoading, isError } = useRoutersRouterStructOverviewQuery()



    return <Select
        showSearch
        placeholder="Select a person"
        filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        options={data && data.map((d:any)=>( {
            
            value:d['rcsb_id'],
            label:d['rcsb_id'],
        } ))}
    />
}



