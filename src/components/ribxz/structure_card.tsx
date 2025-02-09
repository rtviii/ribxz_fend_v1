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
  structures,
  currentIndex = 0,
  onNavigate
}) {
  const isStackMode = Array.isArray(structures);
  const structure = isStackMode ? structures[currentIndex] : structures;
 
  const taxid_dict = useAppSelector(state => state.homepage.taxid_dict); 
  const [hoveredDirection, setHoveredDirection] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleNavigate = useCallback((e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onNavigate) return;
    
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % structures.length
      : (currentIndex - 1 + structures.length) % structures.length;
    
    onNavigate(newIndex);
  }, [currentIndex, structures, onNavigate]);

  return (
    <Link href={`/structures/${structure.rcsb_id}`}>
      <Card
        className="w-64 h-72 bg-white shadow-sm rounded-lg overflow-hidden relative transition hover:shadow-xl duration-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setHoveredDirection(null);
        }}
      >
        {/* Image Section */}
        <div className="relative h-[50%] transition-all duration-300 hover:h-[100%] border-b-2">
          <StructureMedia 
            structureId={structure.rcsb_id}
            className="w-full h-full"
          />
          
          {/* Overlay Elements */}
          <div className="absolute top-4 left-4 transform bg-muted border rounded-sm px-3 py-1 text-xs">
            {structure.rcsb_id}
          </div>

          <ExpMethodBadge
            expMethod={structure.expMethod}
            resolution={structure.resolution.toFixed(2)}
            className="absolute bottom-4 left-4"
          />

          {/* Year Badge */}
          {(structure.citation_year || structure.deposition_date) && (
            <div className="absolute bottom-4 right-4 bg-muted border rounded-sm px-3 py-1 text-xs">
              {structure.citation_year || parseDateString(structure.deposition_date).year}
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="px-4 pb-0 relative h-[50%]">
          {/* Stack Navigation - Now with full-height gradients */}
          {isStackMode && structures.length > 1 && (
            <>
              {/* Left Navigation Area */}
              <div
                className="absolute left-0 inset-y-0 w-8 cursor-pointer flex items-center justify-start"
                onMouseEnter={() => setHoveredDirection('left')}
                onMouseLeave={() => setHoveredDirection(null)}
                onClick={(e) => handleNavigate(e, 'prev')}
              >
                <div className={`
                  absolute inset-y-0 left-0 w-24
                  transition-opacity duration-200
                  ${hoveredDirection === 'left' ? 'opacity-10' : 'opacity-0'}
                  bg-gradient-to-r from-black to-transparent
                `} />
                <ChevronLeft 
                  className={`
                    h-6 w-6 text-gray-400 z-10 transition-all duration-200
                    ${hoveredDirection === 'left' ? 'scale-110' : 'scale-100'}
                  `}
                />
              </div>

              {/* Right Navigation Area */}
              <div
                className="absolute right-0 inset-y-0 w-8 cursor-pointer flex items-center justify-end"
                onMouseEnter={() => setHoveredDirection('right')}
                onMouseLeave={() => setHoveredDirection(null)}
                onClick={(e) => handleNavigate(e, 'next')}
              >
                <div className={`
                  absolute inset-y-0 right-0 w-24
                  transition-opacity duration-200
                  ${hoveredDirection === 'right' ? 'opacity-10' : 'opacity-0'}
                  bg-gradient-to-l from-black to-transparent
                `} />
                <ChevronRight 
                  className={`
                    h-6 w-6 text-gray-400 z-10 transition-all duration-200
                    ${hoveredDirection === 'right' ? 'scale-110' : 'scale-100'}
                  `}
                />
              </div>

              {/* Stack Counter */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-full text-xs border shadow-sm">
                {currentIndex + 1} / {structures.length}
              </div>
            </>
          )}

          {/* Card Content */}
          <div className="text-gray-700 flex flex-col space-y-2 py-3">
            {/* Source Organism */}
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-gray-500">Source Organism:</span>
              <span className="text-[11px] font-medium">
                {structure.src_organism_ids.map(taxid => 
                  contract_taxname(taxid_dict[taxid])
                )}
              </span>
            </div>

            {/* Authors */}
            {structure.citation_rcsb_authors && (
              <div className="flex justify-between items-center">
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
              <div className="text-[11px] text-gray-500 break-words line-clamp-3">
                {structure.citation_title}
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
