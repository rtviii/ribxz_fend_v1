import React, {useState, useCallback} from 'react';
import {Card, CardContent} from '@/components/ui/card';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {HoverCard, HoverCardContent, HoverCardTrigger} from '@/components/ui/hover-card';
import {ExpMethodBadge} from './text_aides/exp_method_badge';
import Link from 'next/link';
import {contract_taxname, parseDateString} from '@/my_utils';
import {StructureMedia} from './structure_card_media';
import {useAppSelector} from '@/store/store';

export function StructureCard({
    structures, // Array of structures (for stack mode) or single structure
    currentIndex = 0, // Only used in stack mode
    onNavigate = null // Only used in stack mode
}) {
    const isStackMode = Array.isArray(structures);
    const structure = isStackMode ? structures[currentIndex] : structures;

    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    const taxid_dict = useAppSelector(state => state.homepage.taxid_dict);
    const navigateStack = direction => {
        if (!isStackMode || !onNavigate) return;
        const newIndex =
            direction === 'next'
                ? (currentIndex + 1) % structures.length
                : (currentIndex - 1 + structures.length) % structures.length;
        onNavigate(newIndex);
    };

    return (
        <Link href={`/structures/${structure.rcsb_id}`}>
            <Card
                className="w-64 h-72 bg-white shadow-sm rounded-lg overflow-hidden relative transition hover:shadow-xl duration-100"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}>
                {/* Image Section */}
                <div className="relative h-[50%] transition-all duration-300 hover:h-[100%] border-b-2">
                    <StructureMedia structureId={structure.rcsb_id} className="w-full h-full" />

                    {/* Top-left ID */}
                    <div className="absolute top-4 left-4 transform bg-muted border rounded-sm px-3 py-1 text-xs">
                        {structure.rcsb_id}
                    </div>

                    {/* Top-right Subunit Info */}
                    <div className="absolute top-4 right-4 transform flex flex-row gap-1 rounded-sm py-1 text-xs">
                        <div className="border bg-muted rounded-sm px-1">
                            {structure.subunit_presence?.includes('lsu')
                                ? structure.subunit_presence?.includes('ssu')
                                    ? 'SSU+LSU'
                                    : 'LSU'
                                : 'SSU'}
                        </div>
                        {structure.mitochondrial && (
                            <div className="border bg-muted rounded-sm px-1 text-orange-500">Mitochondrion</div>
                        )}
                    </div>

                    {/* Bottom Method Badge */}
                    <ExpMethodBadge
                        expMethod={structure.expMethod}
                        resolution={structure.resolution.toFixed(2)}
                        className="absolute bottom-4 left-4"
                    />

                    {/* Bottom-right Year */}
                    {(structure.citation_year || structure.deposition_date) && (
                        <div className="absolute bottom-4 right-4 bg-muted border rounded-sm px-3 py-1 text-xs">
                            {structure.citation_year || parseDateString(structure.deposition_date).year}
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <CardContent className="pt-3 px-4 relative">
                    {/* Stack Navigation Controls */}
                    {isStackMode && (
                        <>
                            {/* Navigation Arrows */}
                            <div className="absolute -top-4 left-0 right-0 flex justify-between px-2">
                                <button
                                    onClick={e => {
                                        e.preventDefault();
                                        navigateStack('prev');
                                    }}
                                    className="p-1 rounded-full bg-white/80 shadow hover:bg-white transition-colors">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={e => {
                                        e.preventDefault();
                                        navigateStack('next');
                                    }}
                                    className="p-1 rounded-full bg-white/80 shadow hover:bg-white transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    )}

                    <div className="text-gray-700 flex flex-col min-h-0">
                        {/* Source Organism */}
                        <div className="flex justify-between items-center h-5">
                            <span className="text-[11px] text-gray-500">Source Organism:</span>
                            <span className="text-[11px] font-medium">
                                {structure.src_organism_ids.map(taxid => contract_taxname(taxid_dict[taxid]))}
                            </span>
                        </div>

                        {/* Authors */}
                        {structure.citation_rcsb_authors && (
                            <div className="flex justify-between items-center h-5">
                                <span className="text-[11px] text-gray-500">Authors:</span>
                                <HoverCard>
                                    <HoverCardTrigger asChild>
                                        <span className="flex items-center group-hover:bg-gray-100 dark:group-hover:bg-gray-800 rounded-md px-1 transition-colors z-10">
                                            <span className="text-[11px] italic">
                                                {structure.citation_rcsb_authors[0]}
                                            </span>
                                            <ChevronRight className="h-3 w-3 ml-0.5 text-gray-400" />
                                        </span>
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-80 grid grid-cols-2 gap-2 z-50">
                                        {structure.citation_rcsb_authors.map(author => (
                                            <div key={author} className="flex items-center gap-2">
                                                <div>
                                                    <div className="font-medium text-xs">{author}</div>
                                                    <div className="text-xs text-gray-500">Co-Author</div>
                                                </div>
                                            </div>
                                        ))}
                                    </HoverCardContent>
                                </HoverCard>
                            </div>
                        )}

                        {/* Citation Title */}
                        {structure.citation_title && (
                            <div className="text-[11px] text-gray-500 mt-1 break-words line-clamp-2">
                                {structure.citation_title}
                            </div>
                        )}

                        {/* Stack Counter */}
                        {isStackMode && (
                            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                                {currentIndex + 1} / {structures.length}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
export const groupStructuresByDOI = structures => {
    return structures.reduce((groups, structure) => {
        const doi = structure.citation_pdbx_doi;
        if (!doi) {
            // If no DOI, treat as single structure
            return [...groups, [structure]];
        }

        const existingGroup = groups.find(group => group[0].citation_pdbx_doi === doi);

        if (existingGroup) {
            existingGroup.push(structure);
        } else {
            groups.push([structure]);
        }

        return groups;
    }, []);
};
