import React from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Building2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { EntityCard, IconButton, EntityContent, EntityField } from './entity_base';
import { useRoutersRouterStructStructureProfileQuery } from '@/store/ribxz_api/ribxz_api';

interface StructureEntityProps {
    rcsb_id: string;
    visible: boolean;
    onToggleVisibility: () => void;
    className?: string;
}

export const StructureEntity: React.FC<StructureEntityProps> = ({
    rcsb_id,
    visible,
    onToggleVisibility,
    className
}) => {
    const {data, isLoading} = useRoutersRouterStructStructureProfileQuery(
        {rcsbId: rcsb_id},
        {skip: !rcsb_id}
    );

    if (isLoading || !data) {
        return (
            <EntityCard
                className={className}
                icon={<Building2 size={16} />}
                title="Loading structure information..."
                controls={
                    <IconButton
                        icon={visible ? <Eye size={16} /> : <EyeOff size={16} />}
                        onClick={onToggleVisibility}
                        title={`${visible ? 'Hide' : 'Show'} structure`}
                        active={visible}
                    />
                }
            >
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
            className={className}
            icon={<Building2 size={16} />}
            title={
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 min-w-0 max-w-full">
                                <span className="truncate">{title}</span>
                                <Link
                                    href={`https://www.rcsb.org/structure/${rcsb_id}`}
                                    className="text-xs text-blue-500 hover:underline hover:text-blue-600 flex-shrink-0"
                                    target="_blank">
                                    {rcsb_id}
                                </Link>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            {title}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            }
            controls={
                <IconButton
                    icon={visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    onClick={onToggleVisibility}
                    title={`${visible ? 'Hide' : 'Show'} structure`}
                    active={visible}
                />
            }
        >
            <EntityContent>
                <EntityField
                    label="Organism"
                    value={mainOrganism}
                />
                {data.resolution && (
                    <EntityField
                        label="Resolution"
                        value={`${data.resolution.toFixed(1)}Å`}
                    />
                )}
                {year && (
                    <EntityField
                        label="Year"
                        value={year}
                    />
                )}
                {data.expMethod && (
                    <EntityField
                        label="Method"
                        value={data.expMethod}
                    />
                )}
            </EntityContent>
        </EntityCard>
    );
};
