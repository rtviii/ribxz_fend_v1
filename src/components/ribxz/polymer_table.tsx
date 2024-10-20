import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export type Polymer = {
  assembly_id: number;
  asym_ids: string[];
  auth_asym_id: string;
  parent_rcsb_id: string;
  src_organism_names: string[];
  host_organism_names: string[];
  src_organism_ids: number[];
  host_organism_ids: number[];
  rcsb_pdbx_description?: string | null;
  entity_poly_strand_id: string;
  entity_poly_seq_one_letter_code: string;
  entity_poly_seq_one_letter_code_can: string;
  entity_poly_seq_length: number;
  entity_poly_polymer_type: string;
  entity_poly_entity_type: string;
  nomenclature: string[];
};

interface PolymerTableRowProps {
  polymer: Polymer;
  isSelected: boolean;
  onSelect: (id: string) => void;
  showSequence: boolean;
  visibleColumns: (keyof Polymer)[];
}

const PolymerTableRow: React.FC<PolymerTableRowProps> = ({ polymer, isSelected, onSelect, showSequence, visibleColumns }) => {
  const id = `${polymer.parent_rcsb_id}-${polymer.auth_asym_id}`;

  if (showSequence) {
    return (
      <TableRow>
        <TableCell className="py-1 px-2">
          <Checkbox checked={isSelected} onCheckedChange={() => onSelect(id)} />
        </TableCell>
        <TableCell className="py-1 px-2 font-mono text-xs" colSpan={visibleColumns.length}>
          {polymer.entity_poly_seq_one_letter_code_can}
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell className="py-1 px-2">
        <Checkbox checked={isSelected} onCheckedChange={() => onSelect(id)} />
      </TableCell>
      {visibleColumns.map((column) => (
        <TableCell key={column} className="py-1 px-2 text-xs">
          {column === 'nomenclature' ? (
            <Badge variant="outline" className="text-xs">
              {polymer.nomenclature.join(', ')}
            </Badge>
          ) : column === 'rcsb_pdbx_description' ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  {polymer[column]?.substring(0, 20)}...
                </TooltipTrigger>
                <TooltipContent>
                  <p>{polymer[column]}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            String(polymer[column])
          )}
        </TableCell>
      ))}
    </TableRow>
  );
};

interface PolymersTableProps {
  polymers: Polymer[];
  visibleColumns?: (keyof Polymer)[];
}

const PolymersTable: React.FC<PolymersTableProps> = ({ polymers, visibleColumns = ['auth_asym_id', 'nomenclature', 'parent_rcsb_id', 'src_organism_ids', 'rcsb_pdbx_description'] }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showSequence, setShowSequence] = useState(false);

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const sortedPolymers = useMemo(() => {
    return [...polymers].sort((a, b) => {
      const polyClassA = a.nomenclature[0] || '';
      const polyClassB = b.nomenclature[0] || '';
      return polyClassA.localeCompare(polyClassB);
    });
  }, [polymers]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">
          {selectedIds.size} of {polymers.length} selected
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowSequence(!showSequence)}
        >
          {showSequence ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
          {showSequence ? 'Hide Sequence' : 'Show Sequence'}
        </Button>
      </div>
      <ScrollArea className="h-[70vh] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30px]"></TableHead>
              {visibleColumns.map((column) => (
                <TableHead key={column} className="py-1 px-2 font-medium text-xs">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPolymers.map((polymer) => (
              <PolymerTableRow
                key={`${polymer.parent_rcsb_id}-${polymer.auth_asym_id}`}
                polymer={polymer}
                isSelected={selectedIds.has(`${polymer.parent_rcsb_id}-${polymer.auth_asym_id}`)}
                onSelect={toggleSelected}
                showSequence={showSequence}
                visibleColumns={visibleColumns}
              />
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default PolymersTable;