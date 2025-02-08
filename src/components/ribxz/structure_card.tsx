'use client';
import {CardContent, CardFooter, Card} from '@/components/ui/card';
import {RibosomeStructure} from '@/store/ribxz_api/ribxz_api';
import {HoverCardTrigger, HoverCardContent, HoverCard} from '@/components/ui/hover-card';
import Link from 'next/link';
import Image from 'next/image';
import {useAppSelector} from '@/store/store';
import {contract_taxname, parseDateString} from '@/my_utils';
import {ExpMethodBadge} from './text_aides/exp_method_badge';
import {useCallback, useState} from 'react';
import {ChevronRight} from 'lucide-react';
import { StructureMedia } from './structure_card_media';
export function StructureCard({_}: {_: RibosomeStructure}) {

    const [isHovered, setIsHovered]     = useState(false);
    const [isGifLoaded, setIsGifLoaded] = useState(false);

    const taxid_dict = useAppSelector(state => state.homepage.taxid_dict);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        setIsGifLoaded(false);
    }, []);

    return (
        <Link href={`/structures/${_.rcsb_id}`}>
            <Card
                className="w-64 max-h-full h-72 bg-white shadow-sm rounded-lg overflow-hidden relative transition hover:shadow-xl duration-100"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}>
                <div className="relative h-[50%] transition-all duration-300 hover:h-[100%] border-b-2">
                    {/* Static Image (Always visible) */}
    <StructureMedia 
                        structureId={_.rcsb_id}
                        className="w-full h-full"
                    />
                    {/* Overlay Elements */}
                    <div className="absolute top-4 left-4 transform bg-muted border rounded-sm px-3 py-1 text-xs">
                        {_.rcsb_id}
                    </div>

                    <ExpMethodBadge
                        expMethod={_.expMethod}
                        resolution={_.resolution.toFixed(2)}
                        className="absolute bottom-4 left-4"
                    />

                    {(_.citation_year || _.deposition_date) && (
                        <div className="absolute bottom-4 right-4 bg-muted border rounded-sm px-3 py-1 text-xs">
                            {_.citation_year || parseDateString(_.deposition_date).year}
                        </div>
                    )}

                    <div className="absolute top-4 right-4 transform flex flex-row gap-1 rounded-sm py-1 text-xs">
                        <div className="border bg-muted rounded-sm px-1">
                            {_.subunit_presence?.includes('lsu')
                                ? _.subunit_presence?.includes('ssu')
                                    ? 'SSU+LSU'
                                    : 'LSU'
                                : 'SSU'}
                        </div>
                        {_.mitochondrial && (
                            <div className="border bg-muted rounded-sm px-1 text-orange-500">Mitochondrion</div>
                        )}
                    </div>
                </div>

                <CardContent className="group-hover:hidden pt-3 px-4">
                    <div className="text-gray-700 flex flex-col min-h-0">
                        {/* Source Organism */}
                        <div className="flex justify-between items-center h-5">
                            <span className="text-[11px] text-gray-500">Source Organism:</span>
                            <span className="text-[11px] font-medium">
                                {_.src_organism_ids.map(taxid => contract_taxname(taxid_dict[taxid]))}
                            </span>
                        </div>

                        {/* Authors */}
                        {_.citation_rcsb_authors && (
                            <div className="flex justify-between items-center h-5">
                                <span className="text-[11px] text-gray-500">Authors:</span>
                                <HoverCard>
                                    <HoverCardTrigger asChild>
                                        <span className="flex items-center group-hover:bg-gray-100 dark:group-hover:bg-gray-800 rounded-md px-1 transition-colors z-10">
                                            <span className="text-[11px] italic">{_.citation_rcsb_authors[0]}</span>
                                            <ChevronRight className="h-3 w-3 ml-0.5 text-gray-400" />
                                        </span>
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-80 grid grid-cols-2 gap-2 z-50">
                                        {_.citation_rcsb_authors.map(author => (
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
                        {_.citation_title && (
                            <div className="text-[11px] text-gray-500 mt-1 break-words line-clamp-3">
                                {_.citation_title}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

export const StructureStack = ({structures}: {structures: RibosomeStructure[]}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentStructure = structures[currentIndex];

    return (
        <Card className="w-80 max-h-full h-full bg-white shadow-sm rounded-lg overflow-hidden relative transition hover:shadow-xl duration-100">
            <div className="relative">
                <div
                    className="flex overflow-x-auto scrollbar-hide"
                    style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                    {structures.map((structure, index) => (
                        <div
                            key={structure.rcsb_id}
                            className={`flex-shrink-0 px-1 py-0.5 cursor-pointer text-[0.6rem] leading-tight ${
                                index === currentIndex ? 'bg-blue-500 text-white' : 'bg-gray-200'
                            }`}
                            onClick={() => setCurrentIndex(index)}>
                            {structure.rcsb_id}
                        </div>
                    ))}
                </div>
                <StructureCard _={currentStructure} />
            </div>
            <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded-full text-xs">
                {currentIndex + 1} / {structures.length}
            </div>
        </Card>
    );
};
