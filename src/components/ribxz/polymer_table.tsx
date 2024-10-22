import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Polymer } from '@/store/ribxz_api/ribxz_api';
import { useAppSelector } from '@/store/store';
import { map_ncbi_tax_id_to_name } from '@/my_utils';

interface PolymerTableRowProps {
    polymer: Polymer;
    isSelected: boolean;
    onSelect: (id: string) => void;
    showSequence: boolean;
    visibleColumns: (keyof Polymer)[];
}

interface PolymerTableRowProps {
    polymer: Polymer;
    isSelected: boolean;
    onSelect: (id: string) => void;
    showSequence: boolean;
    visibleColumns: (keyof Polymer)[];
    taxdict: Record<number, string>;
}

const PolymerTableRow: React.FC<PolymerTableRowProps> = ({ polymer, isSelected, onSelect, showSequence, visibleColumns, taxdict }) => {
    const id = `${polymer.parent_rcsb_id}-${polymer.auth_asym_id}`;

    const renderCheckbox = () => (
        <TableCell className="py-1 px-2 h-8">
            <div className="flex items-center justify-center h-full">
                <Checkbox checked={isSelected} onCheckedChange={() => onSelect(id)} />
            </div>
        </TableCell>
    );

    const renderCellContent = (column: keyof Polymer) => {
        switch (column) {
            case 'nomenclature':
                return (
                    <Badge variant="outline" className="text-xs">
                        {polymer.nomenclature.join(', ')}
                    </Badge>
                );
            case 'rcsb_pdbx_description':
                return (
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
                );
            case 'src_organism_ids':
                return (
                    <div>
                        {polymer.src_organism_ids.map((taxid) => {
                            const name = map_ncbi_tax_id_to_name(taxid, taxdict);
                            return (
                                <TooltipProvider key={taxid}>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <p>{name} </p>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            NCBI Taxonowhitespace-nowrapmic ID: {taxid}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            );
                        })}
                    </div>
                );
            default:
                return String(polymer[column]);
        }
    };

    if (showSequence) {
        return (
 <TableRow>
        {renderCheckbox()}
        <TableCell className="py-1 px-2 font-mono text-xs h-8 whitespace-nowrap" colSpan={visibleColumns.length}>
          {polymer.entity_poly_seq_one_letter_code_can}
        </TableCell>
      </TableRow>
        );
    }

    return (
        <TableRow>
            {renderCheckbox()}
            {visibleColumns.map((column) => (
                <TableCell key={column} className="py-1 px-2 text-xs h-8">
                    {renderCellContent(column)}
                </TableCell>
            ))}
        </TableRow>
    );
};

interface PolymersTableProps {
    polymers       : Polymer[];
    visibleColumns?: (keyof Polymer)[];
}

const PolymersTable: React.FC<PolymersTableProps> = ({ polymers, visibleColumns = ['auth_asym_id', 'nomenclature', 'parent_rcsb_id', 'src_organism_ids', 'rcsb_pdbx_description'] }) => {
  const primary_polymers =  polymers.filter(p=>p.assembly_id ===0)
    const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set());
    const [showSequence, setShowSequence] = useState(false);
    const taxdict                         = useAppSelector((state) => state.ui.taxid_dict);

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

 return (
<div className="space-y-2 w-full" style={{ minWidth: '1000px' }}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">
          {selectedIds.size} of {primary_polymers.length} selected
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
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-100 sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-[30px] py-2 px-2 font-medium text-xs">Select</TableHead>
                {visibleColumns.map((column) => (
                  <TableHead key={column} className="py-2 px-2 font-medium text-xs whitespace-nowrap">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
          </Table>
        </div>
        <ScrollArea className="h-[70vh]  whitespace-nowrap">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-x-auto">
              <Table>
                <TableBody>
                  {primary_polymers.map((polymer) => (
                    <PolymerTableRow
                      key={`${polymer.parent_rcsb_id}-${polymer.auth_asym_id}`}
                      polymer={polymer}
                      isSelected={selectedIds.has(`${polymer.parent_rcsb_id}-${polymer.auth_asym_id}`)}
                      onSelect={toggleSelected}
                      showSequence={showSequence}
                      visibleColumns={visibleColumns}
                      taxdict={taxdict}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

      <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default PolymersTable;