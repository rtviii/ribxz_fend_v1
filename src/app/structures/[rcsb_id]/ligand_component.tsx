import React from 'react';
import { Eye, EyeOff, Square, CheckSquare, Download, ScanSearch, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState } from 'react';

const LigandRow = ({ 
    ligand,
    onToggleVisibility,
    onToggleSelection,
    onIsolate,
    onDownload,
    isVisible = true,
    isSelected = false,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="border-b border-gray-200 last:border-b-0">
            <div className="flex flex-col">
                {/* Main Row */}
                <div className="flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:cursor-pointer hover:bg-slate-200">
                    {/* Left side - Basic Info */}
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        
                        <div className="flex flex-col">
                            <div className="flex items-center space-x-2">
                                <span className="font-mono text-sm font-medium text-gray-900">
                                    {ligand.chemicalName}
                                </span>
                                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                    {ligand.chemicalId}
                                </span>
                            </div>
                            <span className="text-xs text-gray-500">
                                MW: {ligand.formula_weight} Da
                            </span>
                        </div>
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex items-center space-x-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 w-8 p-0"
                                        onClick={onIsolate}
                                    >
                                        <ScanSearch className="h-4 w-4 text-gray-600" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Isolate view</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 w-8 p-0"
                                        onClick={onToggleVisibility}
                                    >
                                        {isVisible ? (
                                            <Eye className="h-4 w-4 text-blue-600" />
                                        ) : (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Toggle visibility</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 w-8 p-0"
                                        onClick={onToggleSelection}
                                    >
                                        {isSelected ? (
                                            <CheckSquare className="h-4 w-4 text-blue-600" />
                                        ) : (
                                            <Square className="h-4 w-4 text-gray-600" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Toggle selection</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 w-8 p-0"
                                        onClick={onDownload}
                                    >
                                        <Download className="h-4 w-4 text-gray-600" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Download structure</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="px-8 py-3 bg-gray-50">
                        <div className="space-y-2">
                            {ligand.drugbank_description && (
                                <div>
                                    <p className="text-sm text-gray-700">{ligand.drugbank_description}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500">SMILES</label>
                                    <p className="text-xs font-mono break-all text-gray-700">{ligand.SMILES}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500">InChI</label>
                                    <p className="text-xs font-mono break-all text-gray-700">{ligand.InChI}</p>
                                </div>
                            </div>
                            {ligand.drugbank_id && (
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs font-medium text-gray-500">DrugBank ID:</span>
                                    <span className="text-xs font-mono text-gray-700">{ligand.drugbank_id}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LigandRow;