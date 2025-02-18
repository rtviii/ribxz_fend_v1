import React from 'react';
import {cn} from '@/components/utils';
import {
    Eye,
    EyeOff,
    Square,
    CheckSquare,
    Download,
    ScanSearch,
    ChevronDown,
    ChevronUp,
    Copy,
    Check
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {useState} from 'react';
import {useMolstarInstance, useMolstarService} from '@/components/mstar/mstar_service';
import {selectComponentById, selectRCSBIdsForInstance, selectRefsForRCSB} from '@/store/molstar/slice_refs';
import {useAppSelector} from '@/store/store';

const CopyButton = ({text}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-gray-600" />}
        </Button>
    );
};

const LigandRow = ({
    ligand,
    onToggleVisibility,
    onToggleSelection,
    onIsolate,
    onDownload,
    isVisible = true,
    isSelected = false
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [localIsVisible, setLocalIsVisible] = useState(isVisible);
    const [localIsSelected, setLocalIsSelected] = useState(isSelected);

    const service = useMolstarInstance('main');
    const controller = service?.controller;
    const viewer = service?.viewer;
    const rcsbId = useAppSelector(state => selectRCSBIdsForInstance(state, 'main'))[0];

    // Get the ligand component reference from Redux state
    const ligandComponent = useAppSelector(state =>
        selectComponentById(state, {
            componentId: ligand.chemicalId,
            instanceId: 'main'
        })
    );

    const handleFocus = () => {
        // If not already loaded, create the ligand
        if (!ligandComponent?.ref) {
            viewer?.ligands.create_ligand(rcsbId, ligand.chemicalId).then(created => {
                // Focus on the newly created ligand
                if (created?.ref) {
                    viewer?.interactions.focus(created.ref);
                }
            });
        } else {
            // Focus on existing ligand
            viewer?.interactions.focus(ligandComponent.ref);
        }
    };

    const handleToggleVisibility = e => {};

    // Toggle selection handler
    const handleToggleSelection = e => {
        e.stopPropagation();
        if (ligandComponent?.ref && viewer) {
            viewer.interactions.selection(ligandComponent.ref, localIsSelected ? 'remove' : 'add');
            setLocalIsSelected(!localIsSelected);
            onToggleSelection && onToggleSelection();
        }
    };

    // Mouse interaction handlers
    const handleMouseEnter = () => {
        if (controller?.ligands) {
            viewer?.interactions.highlight(ligandComponent?.ref);
        }
    };

    const handleMouseLeave = () => {
        if (viewer) {
            viewer.ctx.managers.interactivity.lociHighlights.clearHighlights();
        }
    };

    const handleActionClick = (e, action) => {
        e.stopPropagation();
        action && action();
    };

    return (
        <div
            className="border-b border-gray-200 last:border-b-0"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}>
            <div className="flex flex-col">
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:cursor-pointer hover:bg-slate-200">
                    <div className="flex items-center space-x-3">
                        <div className="text-gray-500">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center space-x-2">
                                <span className="font-mono text-sm font-medium text-gray-900">
                                    {ligand.chemicalName}
                                </span>
                                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                    {ligand.chemicalId}
                                </span>
                            </div>
                            <span className="text-xs text-gray-500">MW: {ligand.formula_weight} Da</span>
                        </div>
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleFocus}>
                            <ScanSearch className="h-4 w-4 text-gray-600" />
                        </Button>

                        {/* <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={handleToggleVisibility}>
                                        {localIsVisible ? (
                                            <Eye className="h-4 w-4 text-blue-600" />
                                        ) : (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        )}
                                    </Button> */}

                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleToggleSelection}>
                            {localIsSelected ? (
                                <CheckSquare className="h-4 w-4 text-blue-600" />
                            ) : (
                                <Square className="h-4 w-4 text-gray-600" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="px-8 py-3 bg-gray-50 space-y-3">
                        {ligand.drugbank_description && (
                            <div>
                                <p className="text-sm text-gray-700">{ligand.drugbank_description}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-gray-500">SMILES</label>
                                    <CopyButton text={ligand.SMILES} />
                                </div>
                                <p className="text-xs font-mono break-all text-gray-700 bg-white rounded p-2 border border-gray-200">
                                    {ligand.SMILES}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-gray-500">InChI</label>
                                    <CopyButton text={ligand.InChI} />
                                </div>
                                <p className="text-xs font-mono break-all text-gray-700 bg-white rounded p-2 border border-gray-200">
                                    {ligand.InChI}
                                </p>
                            </div>
                        </div>

                        {ligand.drugbank_id && (
                            <div className="flex items-center space-x-2 pt-1">
                                <span className="text-xs font-medium text-gray-500">DrugBank ID:</span>
                                <span className="text-xs font-mono text-gray-700">{ligand.drugbank_id}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LigandRow;
