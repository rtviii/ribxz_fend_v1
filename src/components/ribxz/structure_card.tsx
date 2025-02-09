'use client';
import { ChevronLeft } from 'lucide-react';
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

export const StructureStack = ({ structures }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentStructure = structures[currentIndex];

  const nextStructure = () => {
    setCurrentIndex((prev) => (prev + 1) % structures.length);
  };

  const prevStructure = () => {
    setCurrentIndex((prev) => (prev - 1 + structures.length) % structures.length);
  };

  return (
    <Card className="w-72 h-80 bg-white shadow-sm rounded-lg overflow-hidden relative transition hover:shadow-xl duration-100">
      {/* Navigation Pills */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-center gap-1 p-1 bg-black/10">
        {structures.map((_, index) => (
          <button
            key={index}
            className={`h-1 rounded-full transition-all ${
              index === currentIndex 
                ? 'w-4 bg-blue-500' 
                : 'w-1 bg-gray-300'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>

      {/* Main Structure Card */}
      <div className="h-full">
        <StructureCard _={currentStructure} />
      </div>

      {/* Navigation Arrows */}
      {structures.length > 1 && (
        <>
          <button
            onClick={prevStructure}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 shadow-md hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextStructure}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 shadow-md hover:bg-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Structure Counter */}
      <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded-full text-xs">
        {currentIndex + 1} / {structures.length}
      </div>
    </Card>
  );
};

// Helper function to group structures by DOI
export const groupStructuresByDOI = (structures) => {
  return structures.reduce((groups, structure) => {
    const doi = structure.citation_pdbx_doi;
    if (!doi) {
      // If no DOI, treat as single structure
      return [...groups, [structure]];
    }
    
    const existingGroup = groups.find(group => 
      group[0].citation_pdbx_doi === doi
    );
    
    if (existingGroup) {
      existingGroup.push(structure);
    } else {
      groups.push([structure]);
    }
    
    return groups;
  }, []);
};
