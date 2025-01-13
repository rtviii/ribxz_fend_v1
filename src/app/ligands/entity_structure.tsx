import React, { useState } from 'react';
import Link from 'next/link';
import {Eye, EyeOff, Building2, ChevronDown, ChevronRight} from 'lucide-react';
import {cn} from '@/components/utils';
import {useRoutersRouterStructStructureProfileQuery} from '@/store/ribxz_api/ribxz_api';
import { EntityCard, IconButton } from './entity';

interface StructureEntityProps {
    rcsb_id: string;
    visible: boolean;
    onToggleVisibility: () => void;
}

export const StructureEntity: React.FC<StructureEntityProps> = ({rcsb_id, visible, onToggleVisibility}) => {
    const {data, isLoading} = useRoutersRouterStructStructureProfileQuery({rcsbId: rcsb_id}, {skip: !rcsb_id});

    if (isLoading || !data) {
        return (
            <EntityCard
                icon={<Building2 size={16} />}
                title="Loading structure information..."
                controls={
                    <IconButton
                        icon={visible ? <Eye size={16} /> : <EyeOff size={16} />}
                        onClick={onToggleVisibility}
                        title={`${visible ? 'Hide' : 'Show'} structure`}
                        active={visible}
                    />
                }>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </EntityCard>
        );
    }

    const mainOrganism = data.src_organism_names[0] || 'Unknown organism';
    const year = data.citation_year || (data.deposition_date ? new Date(data.deposition_date).getFullYear() : null);
    const title = data.citation_title || data.pdbx_keywords || 'Structure information';

    return (
        <EntityCard
            icon={<Building2 size={16} />}
            title={
                <div className="flex items-center gap-2">
                    <span className="truncate">{title}</span>
                    <Link
                        href={`https://www.rcsb.org/structure/${rcsb_id}`}
                        className="text-xs text-blue-500 hover:underline hover:text-blue-600 shrink-0"
                        target="_blank">
                        {rcsb_id}
                    </Link>
                </div>
            }
            controls={
                <IconButton
                    icon={visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    onClick={onToggleVisibility}
                    title={`${visible ? 'Hide' : 'Show'} structure`}
                    active={visible}
                />
            }>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                    <span className="text-gray-500">Organism:</span>
                    <span className="text-gray-900">{mainOrganism}</span>
                </div>
                {data.resolution && (
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">Resolution:</span>
                        <span className="text-gray-900">{data.resolution.toFixed(1)}Å</span>
                    </div>
                )}
                {year && (
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">Year:</span>
                        <span className="text-gray-900">{year}</span>
                    </div>
                )}
                {data.expMethod && (
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">Method:</span>
                        <span className="text-gray-900">{data.expMethod}</span>
                    </div>
                )}
            </div>
        </EntityCard>
    );
};
