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
import {useState, useEffect} from 'react';
import {useMolstarInstance} from '@/components/mstar/mstar_service';
import {mapAssetModelComponentsAdd, selectComponentById, selectRCSBIdsForInstance} from '@/store/molstar/slice_refs';
import {useAppSelector, useAppDispatch} from '@/store/store';
import ResidueGrid from '@/app/ligands/residue_grid';

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

// Download Menu Component for Binding Site
const BsiteDownloadMenu = ({onDownloadJSON, onDownloadCIF}) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadOptions = [
        {
            extension: 'json',
            label: 'Download JSON',
            onClick: async () => {
                if (isDownloading) return;
                setIsDownloading(true);
                try {
                    await onDownloadJSON();
                } finally {
                    setIsDownloading(false);
                }
            }
        },
        {
            extension: 'cif',
            label: 'Download CIF',
            onClick: onDownloadCIF
        }
    ];

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Download className="h-4 w-4 text-gray-600" />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end" className="p-0 min-w-[140px] bg-gray-50/95 border border-gray-200">
                <div className="flex flex-col py-1">
                    {downloadOptions.map((option) => (
                        <button
                            key={option.extension}
                            disabled={isDownloading}
                            onClick={(e) => {
                                e.stopPropagation();
                                option.onClick();
                            }}
                            className={cn(
                                "px-3 py-1.5 text-sm text-gray-600 text-left hover:bg-slate-100 transition-colors whitespace-nowrap flex items-center justify-between group",
                                isDownloading && "opacity-50 cursor-not-allowed"
                            )}>
                            <span className="group-hover:text-gray-900">{option.label}</span>
                            <code className="ml-2 text-xs font-mono bg-slate-200/80 px-1.5 py-0.5 rounded text-gray-500 group-hover:text-blue-600 group-hover:bg-blue-50">
                                .{option.extension}
                            </code>
                        </button>
                    ))}
                </div>
            </TooltipContent>
        </Tooltip>
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
    const [bsiteVisible, setBsiteVisible] = useState(true);
    const [surroundingResidues, setSurroundingResidues] = useState([]);
    const [isLoadingResidues, setIsLoadingResidues] = useState(false);
    const [nomenclatureMap, setNomenclatureMap] = useState({});

    const dispatch = useAppDispatch();
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

    // Get binding site component
    const bsiteComponent = useAppSelector(state =>
        selectComponentById(state, {
            componentId: `${ligand.chemicalId}_bsite`,
            instanceId: 'main'
        })
    );

    // Fetch surrounding residues when ligand is expanded
    useEffect(() => {
        if (isExpanded && viewer && rcsbId && ligand.chemicalId) {
            const fetchSurroundingResidues = async () => {
                setIsLoadingResidues(true);
                try {
                    // Use a default radius of 5Å or get it from your state
                    const radius = 5; // Ideally get from state.ligands_page.radius
                    
                    // First, make sure we have a ligand component
                    let currentLigandComponent = ligandComponent;
                    if (!ligandComponent?.ref) {
                        currentLigandComponent = await viewer.ligands.create_ligand(rcsbId, ligand.chemicalId);
                    }
                    
                    // Get the root reference from the state
                    let rootRef;
                    if (controller) {
                        rootRef = Object.values(
                            controller.getState().mstar_refs.instances.main.rcsb_id_root_ref_map
                        )[0];
                    }
                    
                    if (!rootRef && viewer?.ctx) {
                        // Fallback if we can't get the root ref from the controller
                        const structures = viewer.ctx.managers.structure.hierarchy.current.structures;
                        if (structures.length > 0) {
                            rootRef = structures[0].cell.transform.ref;
                        }
                    }
                    
                    if (rootRef) {
                        // If we don't have a binding site component, create one
                        if (!bsiteComponent?.ref) {
                            // Try to get nomenclature map from state if available
                            const nomenclatureMap = {};
                            
                            // Create binding site - using the appropriate path (viewer)
                            const refs = await viewer.ligands.create_ligand_surroundings(
                                rcsbId,
                                ligand.chemicalId,
                                radius,
                                nomenclatureMap
                            );
                            
                            // Add to state if needed via dispatch
                            if (controller && refs) {
                                const bsiteId = `${ligand.chemicalId}_bsite`;
                                if (refs[bsiteId]) {
                                    dispatch(
                                        mapAssetModelComponentsAdd({
                                            instanceId: 'main',
                                            rcsbId,
                                            components: {
                                                [bsiteId]: {
                                                    type: 'bsite',
                                                    rcsb_id: rcsbId,
                                                    chemicalId: ligand.chemicalId,
                                                    ref: refs[bsiteId].ref,
                                                    repr_ref: refs[bsiteId].repr_ref,
                                                    sel_ref: refs[bsiteId].sel_ref
                                                }
                                            }
                                        })
                                    );
                                }
                            }
                        }
                        
                        // Then get surrounding residues
                        const residues = await viewer.get_selection_constituents(
                            rootRef,
                            ligand.chemicalId,
                            radius
                        );
                        
                        if (residues && residues.length > 0) {
                            setSurroundingResidues(residues);
                            
                            // Get nomenclature map from state if available
                            if (controller) {
                                const state = controller.getState();
                                const polymerComponents = Object.values(state.mstar_refs.instances.main.components)
                                    .filter(comp => comp.type === 'polymer');
                                
                                const newNomenclatureMap = {};
                                polymerComponents.forEach(polymer => {
                                    if (polymer.type === 'polymer' && polymer.auth_asym_id) {
                                        newNomenclatureMap[polymer.auth_asym_id] = '';
                                    }
                                });
                                
                                setNomenclatureMap(newNomenclatureMap);
                            }
                        }
                    }
                } catch (err) {
                    console.error('Error fetching surrounding residues:', err);
                } finally {
                    setIsLoadingResidues(false);
                }
            };
            
            fetchSurroundingResidues();
        }
    }, [isExpanded, viewer, controller, rcsbId, ligand.chemicalId, bsiteComponent, ligandComponent, dispatch]);

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

    const handleFocusBindingSite = () => {
        if (controller?.bindingSites) {
            controller.bindingSites.focusBindingSite(rcsbId, ligand.chemicalId);
        }
    };

    const handleToggleVisibility = e => {
        e.stopPropagation();
        if (ligandComponent?.ref && viewer) {
            viewer.interactions.setSubtreeVisibility(ligandComponent.ref, !localIsVisible);
            setLocalIsVisible(!localIsVisible);
            onToggleVisibility && onToggleVisibility();
        }
    };

    const handleToggleBindingSiteVisibility = e => {
        e.stopPropagation();
        if (controller?.bindingSites) {
            controller.bindingSites.setBindingSiteVisibility(rcsbId, ligand.chemicalId, !bsiteVisible);
            setBsiteVisible(!bsiteVisible);
        }
    };

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
        if (controller?.ligands && ligandComponent?.ref) {
            viewer?.interactions.highlight(ligandComponent.ref);
        }
    };

    const handleBindingSiteMouseEnter = () => {
        if (controller?.bindingSites) {
            controller.bindingSites.highlightBindingSite(rcsbId, ligand.chemicalId);
        }
    };

    const handleMouseLeave = () => {
        if (viewer) {
            viewer.ctx.managers.interactivity.lociHighlights.clearHighlights();
        }
    };

    const handleDownloadBindingSiteJSON = async () => {
        try {
            const bindingSiteData = {
                purported_binding_site: {
                    chains: surroundingResidues.reduce((acc, residue) => {
                        const chainIndex = acc.findIndex(c => c.chain_id === residue.auth_asym_id);
                        if (chainIndex === -1) {
                            acc.push({
                                chain_id: residue.auth_asym_id,
                                bound_residues: [residue]
                            });
                        } else {
                            acc[chainIndex].bound_residues.push(residue);
                        }
                        return acc;
                    }, [])
                },
                metadata: {
                    rcsb_id: rcsbId,
                    chemical_id: ligand.chemicalId,
                    radius: 5 // Use the same radius as when fetching
                }
            };

            const blob = new Blob([JSON.stringify(bindingSiteData, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${rcsbId}_${ligand.chemicalId}_binding_site.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const handleDownloadBindingSiteCIF = () => {
        if (controller?.bindingSites && bsiteComponent?.sel_ref) {
            const bsite = controller.bindingSites.retrieveBSiteComponent(
                rcsbId,
                ligand.chemicalId
            );
            
            if (bsite?.sel_ref && viewer) {
                const loci = viewer.loci_from_ref(bsite.sel_ref);
                if (!loci) return;
    
                viewer.ctx.managers.structure.selection.clear();
                viewer.ctx.managers.structure.selection.fromLoci('add', loci);
                viewer.downloads.downloadSelection(`${rcsbId}_${ligand.chemicalId}_binding_site.cif`);
                viewer.ctx.managers.structure.selection.clear();
            }
        }
    };

    const handleResidueClick = (residue) => {
        if (viewer) {
            viewer.residues.selectResidue(
                rcsbId,
                residue.auth_asym_id,
                residue.auth_seq_id,
                true // Add to existing selection
            );
        }
    };

    const handleResidueHover = (residue) => {
        if (viewer) {
            viewer.residues.highlightResidue(
                rcsbId,
                residue.auth_asym_id,
                residue.auth_seq_id
            );
        }
    };
const [bsiteSelected, setBsiteSelected] = useState(false);
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

                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0" 
                            onClick={handleToggleVisibility}>
                            {localIsVisible ? (
                                <Eye className="h-4 w-4 text-blue-600" />
                            ) : (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                            )}
                        </Button>

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
                    <div className="px-4 py-3 bg-gray-50 space-y-4">
                        {/* Ligand Details */}
                        <div className="space-y-3">
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

                        {/* Binding Site Section */}
                        <div className="mt-4 border-t border-gray-200 pt-4">
                            <div 
                                className="flex items-center justify-between mb-3"
                                onMouseEnter={handleBindingSiteMouseEnter}
                                onMouseLeave={handleMouseLeave}>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-medium text-gray-800">Binding Site</h3>
                                    <span className="text-xs text-gray-500">
                                        ({surroundingResidues.length} residues)
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 w-8 p-0"
                                                    onClick={handleFocusBindingSite}>
                                                    <ScanSearch className="h-4 w-4 text-gray-600" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Focus on binding site</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 w-8 p-0"
                                                    onClick={handleToggleBindingSiteVisibility}>
                                                    {bsiteVisible ? (
                                                        <Eye className="h-4 w-4 text-blue-600" />
                                                    ) : (
                                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{bsiteVisible ? 'Hide' : 'Show'} binding site</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <BsiteDownloadMenu
                                        onDownloadJSON={handleDownloadBindingSiteJSON}
                                        onDownloadCIF={handleDownloadBindingSiteCIF}
                                    />

<Button 
  variant="ghost" 
  size="sm" 
  className="h-8 w-8 p-0"
  onClick={(e) => {
    e.stopPropagation();
    // Get the binding site component
    const bsite = controller?.bindingSites.retrieveBSiteComponent(
      rcsbId,
      ligand.chemicalId
    );
    
    // Toggle selection
    if (bsite?.sel_ref && viewer) {
      const loci = viewer.loci_from_ref(bsite.sel_ref);
      if (loci) {
        viewer.ctx.managers.structure.selection.fromLoci(
          bsiteSelected ? 'remove' : 'add', 
          loci
        );
        setBsiteSelected(!bsiteSelected);
      }
    }
  }}>
{bsiteSelected ? (
  <CheckSquare className="h-4 w-4 text-blue-600" />
) : (
  <Square className="h-4 w-4 text-gray-600" />
)}
</Button>

                                </div>
                            </div>

                            {isLoadingResidues ? (
                                <div className="h-24 flex items-center justify-center">
                                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                                    <span className="ml-2 text-sm text-gray-600">Loading residues...</span>
                                </div>
                            ) : surroundingResidues.length > 0 ? (
                                <div className="bg-white p-3 rounded border border-gray-200">
                                    <ResidueGrid
                                        residues={surroundingResidues}
                                        nomenclature_map={nomenclatureMap}
                                        onResidueClick={handleResidueClick}
                                        onResidueHover={handleResidueHover}
                                        groupByChain={true}
                                    />
                                </div>
                            ) : (
                                <div className="h-16 flex items-center justify-center text-sm text-gray-500 bg-white rounded border border-gray-200">
                                    No binding site residues found
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
