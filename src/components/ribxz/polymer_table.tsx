import React, {useState, useMemo} from 'react';
import {Checkbox} from '@/components/ui/checkbox';
import {Badge} from '@/components/ui/badge';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {ScrollArea, ScrollBar} from '@/components/ui/scroll-area';
import {Button} from '@/components/ui/button';
import {ChevronDown, ChevronUp, Download} from 'lucide-react';
import {Polymer} from '@/store/ribxz_api/ribxz_api';
import {useAppSelector} from '@/store/store';
import {map_ncbi_tax_id_to_name} from '@/my_utils';

interface PolymerTableRowProps {
    polymer: Polymer;
    isSelected: boolean;
    onSelect: (id: string) => void;
    showSequence: boolean;
    visibleColumns: (keyof Polymer)[];
    taxdict: Record<number, string>;
}

const PolymerTableRow: React.FC<PolymerTableRowProps> = ({
    polymer,
    isSelected,
    onSelect,
    showSequence,
    visibleColumns,
    taxdict
}) => {
    const id = `${polymer.parent_rcsb_id}-${polymer.auth_asym_id}`;

    const renderCellContent = (column: keyof Polymer) => {
        switch (column) {
            case 'nomenclature':
                if (!polymer.nomenclature || polymer.nomenclature.length === 0) {
                    return <span>-</span>;
                }
                return (
                    <span className="text-xs font-mono font-semibold">{polymer.nomenclature.join(', ')}</span>
                );
            case 'auth_asym_id':
            case 'parent_rcsb_id':
                return <span className="text-xs truncate">{String(polymer[column] || '')}</span>;
            case 'rcsb_pdbx_description':
                if (!polymer[column]) {
                    return <span>-</span>;
                }
                return <span className="text-xs">{polymer[column]}</span>;
            case 'src_organism_ids':
                if (!polymer.src_organism_ids || polymer.src_organism_ids.length === 0) {
                    return <span>-</span>;
                }
                return (
                    <>
                        {polymer.src_organism_ids.map(taxid => {
                            const name = map_ncbi_tax_id_to_name(taxid, taxdict);
                            return (
                                <TooltipProvider key={taxid}>
                                    <Tooltip>
                                        <TooltipTrigger className="text-xs truncate">
                                            <span>{name}</span>
                                        </TooltipTrigger>
                                        <TooltipContent>NCBI Taxonomic ID: {taxid}</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            );
                        })}
                    </>
                );
            default:
                return <span className="text-xs truncate">{String(polymer[column] || '-')}</span>;
        }
    };
    if (showSequence) {
        return (
            <tr className="h-6 hover:bg-muted/50 border-b border-gray-200">
                <td className="w-6 text-center p-0">
                    <div className="checkbox-wrapper">
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onSelect(id)}
                            className="h-3 w-3 checkbox"
                            id={`checkbox-${id}`}
                        />
                    </div>
                </td>
                <td className="font-mono text-xs truncate px-2" colSpan={visibleColumns.length}>
                    {polymer.entity_poly_seq_one_letter_code_can || '-'}
                </td>
            </tr>
        );
    }

    return (
        <tr className="h-6 hover:bg-muted/50 border-b border-gray-200">
            <td className="w-6 text-center p-0">
                <div className="checkbox-wrapper">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onSelect(id)}
                        className="h-3 w-3 checkbox"
                        id={`checkbox-${id}`}
                    />
                </div>
            </td>
            {visibleColumns.map(column => (
                <td
                    key={column}
                    className={`text-center align-middle px-2 ${
                        column === 'rcsb_pdbx_description' ? 'whitespace-normal' : 'truncate'
                    }`}>
                    {renderCellContent(column)}
                </td>
            ))}
        </tr>
    );
};
interface PolymersTableProps {
    polymers: Polymer[];
    visibleColumns?: (keyof Polymer)[];
}

const PolymersTable: React.FC<PolymersTableProps> = ({
    polymers,
    visibleColumns = ['auth_asym_id', 'nomenclature', 'parent_rcsb_id', 'src_organism_ids', 'rcsb_pdbx_description']
}) => {
    const primary_polymers = polymers.filter(p => p.assembly_id === 0);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showSequence, setShowSequence] = useState(false);
    const taxdict = useAppSelector(state => state.homepage.taxid_dict);

    const toggleSelected = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    // Function to convert polymer data to FASTA format
    const generateFastaData = () => {
        const selectedPolymers = primary_polymers.filter(polymer => 
            selectedIds.has(`${polymer.parent_rcsb_id}-${polymer.auth_asym_id}`)
        );
        
        return selectedPolymers.map(polymer => {
            const sequence = polymer.entity_poly_seq_one_letter_code_can || '';
            const header = `>${polymer.parent_rcsb_id}_${polymer.auth_asym_id} ${polymer.rcsb_pdbx_description || ''}`;
            
            // Format sequence in blocks of 80 characters
            const formattedSequence = sequence.match(/.{1,80}/g)?.join('\n') || '';
            
            return `${header}\n${formattedSequence}`;
        }).join('\n\n');
    };

    // Function to handle download
    const handleDownloadSelected = () => {
        if (selectedIds.size === 0) return;
        
        const fastaData = generateFastaData();
        const blob = new Blob([fastaData], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `selected_polymers_${new Date().toISOString().split('T')[0]}.fasta`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Calculate column widths with description taking remaining space
    const tableWidth = '100%';
    const selectColumnWidth = 30;

    // Column width allocations
    const columnWidths = useMemo(() => {
        const staticColumns = ['auth_asym_id', 'nomenclature', 'parent_rcsb_id', 'src_organism_ids'];
        const descriptionColumn = 'rcsb_pdbx_description';

        // Calculate fixed width allocation for static columns
        const staticWidths: Record<string, number> = {
            auth_asym_id: 120,
            nomenclature: 120,
            parent_rcsb_id: 120,
            src_organism_ids: 120
        };

        // Create final width map
        const widths: Record<string, string> = {
            select: `${selectColumnWidth}px`
        };

        // Add static column widths
        staticColumns.forEach(col => {
            widths[col] = `${staticWidths[col]}px`;
        });

        // Description gets remaining space
        widths[descriptionColumn] = 'auto';

        return widths;
    }, []);

    // Get column width based on column name
    const getColumnWidth = (column: string) => {
        if (column === 'select') return columnWidths['select'];
        return columnWidths[column] || 'auto';
    };

    const tableStyles = useMemo(
        () => ({
            tableLayout: 'fixed' as const,
            borderCollapse: 'collapse' as const,
            width: '100%'
        }),
        []
    );

    // Custom CSS to ensure consistent styling
    const customStyles = `
.polymer-table-container td, .polymer-table-container th {
    vertical-align: middle;
}
.polymer-table-container td:not(:last-child), .polymer-table-container th:not(:last-child) {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.polymer-table-container tr {
    min-height: 24px;
}
.checkbox-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 24px; /* Ensure consistent height */
}
.checkbox-wrapper .checkbox {
    margin: 0; /* Remove any default margin */
    padding: 0; /* Remove any default padding */
    transform: none !important; /* Prevent any transformations */
}
`;

    return (
        <div className="space-y-1 w-full polymer-table-container">
            <style>{customStyles}</style>
            <div className="flex justify-between items-center">
                <span className="text-xs font-medium">
                    {selectedIds.size} of {primary_polymers.length} selected
                </span>
                <div className="flex space-x-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDownloadSelected}
                        disabled={selectedIds.size === 0}
                        className="h-6 text-xs py-0"
                        title={selectedIds.size === 0 ? "Select polymers to download" : "Download selected polymers"}>
                        <Download className="h-3 w-3 mr-1" />
                        Download Selected
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowSequence(!showSequence)}
                        className="h-6 text-xs py-0">
                        {showSequence ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                        {showSequence ? 'Hide Sequence' : 'Show Sequence'}
                    </Button>
                </div>
            </div>
            <div className="rounded-md border overflow-hidden">
                {/* Header Table */}
                <div className="sticky top-0 z-10 bg-muted/50">
                    <table style={tableStyles} className="w-full">
                        <colgroup>
                            <col style={{width: getColumnWidth('select')}} />
                            {visibleColumns.map(column => (
                                <col key={`col-${column}`} style={{width: getColumnWidth(column)}} />
                            ))}
                        </colgroup>
                        <thead>
                            <tr className="h-6 bg-muted/70 border-b border-gray-200">
                                <th className="text-center text-xs font-medium py-1 px-1">
                                    <span className="sr-only">Select</span>
                                </th>
                                {visibleColumns.map(column => (
                                    <th key={column} className="text-center truncate text-xs font-medium py-1 px-2">
                                        {column === 'nomenclature' ? 'polymer class' : column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                    </table>
                </div>

                {/* Scrollable Body */}
                <ScrollArea className="h-[70vh]">
                    <table style={tableStyles} className="w-full">
                        <colgroup>
                            <col style={{width: getColumnWidth('select')}} />
                            {visibleColumns.map(column => (
                                <col key={`col-${column}`} style={{width: getColumnWidth(column)}} />
                            ))}
                        </colgroup>
                        <tbody>
                            {primary_polymers.map(polymer => (
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
                        </tbody>
                    </table>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </div>
    );
};

export default PolymersTable;
