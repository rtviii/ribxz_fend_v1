'use client';
import {Button} from '@/components/ui/button';
import {HoverCardTrigger, HoverCardContent, HoverCard} from '@/components/ui/hover-card';
import {useAppSelector} from '@/store/store';
import {Input} from '@/components/ui/input';
import {Select, Space, Tag, Typography} from 'antd';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';
import {ChainsByStruct, PolymerByStruct, RibosomeStructure} from '@/store/ribxz_api/ribxz_api';
import {Separator} from '@radix-ui/react-select';
import {useContext, useEffect, useState} from 'react';
import {StructureOverview} from '@/store/slices/slice_structs_overview';

const {Text} = Typography;
import type {SelectProps} from 'antd';

type LabelRender = SelectProps['labelRender'];
const labelRender: LabelRender = props => {
    const {label, value} = props;
    if (label) {
        return value;
    }
    return <span>No option match</span>;
};

interface GlobalStructureSelectionProps extends Omit<SelectProps, 'options' | 'onChange'> {
    value?: string;
    onChange?: (value: string | null, structure: StructureOverview | null) => void;
    filterStructures?: (structure: StructureOverview) => boolean;
}

export const GlobalStructureSelection = ({
    value,
    onChange,
    filterStructures,
    ...props
}: GlobalStructureSelectionProps) => {
    const structs_overview = useAppSelector(state => state.homepage_overview.structures);

    const filteredStructures = filterStructures 
        ? structs_overview.filter(filterStructures)
        : structs_overview;

    const filterOption = (input: string, option: any) => {
        const {S} = option;
        return (
            S.rcsb_id.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
            S.tax_name.toLowerCase().indexOf(input.toLowerCase()) >= 0
        );
    };

    return (
        <Select
            {...props}
            labelRender={labelRender}
            showSearch={true}
            placeholder="Select a structure"
            onChange={(val, option) => {
                if (!onChange) return;
                if (!val) {
                    onChange(null, null);
                    return;
                }
                onChange(val, option.S);
            }}
            value={value}
            style={{width: '100%'}}
            filterOption={filterOption}
            options={filteredStructures.map(struct_overview => ({
                value: struct_overview.rcsb_id,
                label: (
                    <Space direction="vertical" style={{width: '100%'}}>
                        <Space
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%',
                                alignItems: 'center'
                            }}>
                            <Text strong>{struct_overview.rcsb_id}</Text>
                            <Space>
                                {struct_overview.mitochondrial && (
                                    <Text
                                        strong
                                        style={{
                                            color: 'orange',
                                            fontSize: '1em',
                                            marginRight: '4px'
                                        }}>
                                        mt
                                    </Text>
                                )}
                                <Text>{struct_overview.tax_name}</Text>
                            </Space>
                        </Space>
                        <Text style={{fontSize: '0.9em', color: '#666'}}>{struct_overview.title}</Text>
                    </Space>
                ),
                S: struct_overview
            }))}
        />
    );
};
