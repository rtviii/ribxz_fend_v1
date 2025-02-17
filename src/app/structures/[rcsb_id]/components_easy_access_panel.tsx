import React, {useEffect, useState} from 'react';
import {ScrollArea} from '@/components/ui/scroll-area';
import {TooltipProvider, Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip';
import {DownloadIcon, Eye, EyeIcon, ScanSearch} from 'lucide-react';
import {cn} from '@/components/utils';
import {useAppSelector} from '@/store/store';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog';
import {Search} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {
    RibosomeStructure,
    useRoutersRouterLigEntityQuery,
    useRoutersRouterLigInStructureQuery,
    useRoutersRouterLociGetHelicesQuery,
    useRoutersRouterLociStructurePtcQuery
} from '@/store/ribxz_api/ribxz_api';
import {useMolstarInstance} from '@/components/mstar/mstar_service';
import {sort_by_polymer_class} from '@/my_utils';
import PolymerComponentRow from './polymer_component';
import SequenceMolstarSync from '@/app/components/sequence_molstar_sync';
import {HelixLandmarks} from '../landmarks/helix_row';
import {selectComponentById} from '@/store/molstar/slice_refs';
import {Button} from '@/components/ui/button';
import LigandRow from './ligand_component';

interface LandmarkItemProps {
    onFocus?: () => void;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onDownload?: () => void;
    isActive?: boolean;
    className?: string;
}

const DownloadButton = ({onDownload}) => {
    const [open, setOpen] = useState(false);
    const [filename, setFilename] = useState('');

    const handleDownload = () => {
        // Process the filename: trim whitespace and remove .cif if present
        let processedName = filename.trim();
        if (processedName.toLowerCase().endsWith('.cif')) {
            processedName = processedName.slice(0, -4);
        }
        onDownload(`${processedName}.cif`);
        setOpen(false);
        setFilename('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button className=" p-0 h-4" variant="ghost" size="sm">
                                Download Selection
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Download Selection</p>
                </TooltipContent>
            </Tooltip>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Download Selection</DialogTitle>
                </DialogHeader>
                <div className="flex items-center space-x-2 py-4">
                    <div className="grid flex-1 gap-2">
                        <Input
                            placeholder="Enter filename"
                            value={filename}
                            onChange={e => setFilename(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && filename.trim()) {
                                    handleDownload();
                                }
                            }}
                        />
                    </div>
                </div>
                <DialogFooter className="flex space-x-2 justify-end">
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleDownload} disabled={!filename.trim()}>
                        Download
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const PTCLandmark = ({
    onFocus,
    onClick,
    onDownload,
    onMouseEnter,
    onMouseLeave,
    isActive = false,
    className
}: LandmarkItemProps) => {
    return (
        <div
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            className={cn(
                'flex items-center justify-between p-2 rounded-md',
                isActive ? 'bg-blue-50' : 'hover:bg-gray-50',
                'border border-gray-100',
                'cursor-pointer',
                className
            )}>
            <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">PTC</span>
                <span className="text-xs text-gray-500">(Peptidyl Transferase Center)</span>
            </div>

            <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onFocus}>
                    <ScanSearch size={14} />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onDownload}>
                    <DownloadIcon className="h-4 w-4 text-gray-600" />
                </Button>
            </div>
        </div>
    );
};

const ConstrictionSiteLandmark = ({
    onFocus,
    onDownload,
    onClick,
    onMouseEnter,
    onMouseLeave,
    isActive = false,
    className
}: LandmarkItemProps) => {
    return (
        <div
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            className={cn(
                'flex items-center justify-between p-2 rounded-md',
                isActive ? 'bg-blue-50' : 'hover:bg-gray-50',
                'border border-gray-100',
                'cursor-pointer',
                className
            )}>
            <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">CS</span>
                <span className="text-xs text-gray-500">(Constriction Site)</span>
            </div>

            <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onFocus}>
                    <ScanSearch size={14} />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onDownload}>
                    <DownloadIcon className="h-4 w-4 text-gray-600" />
                </Button>
            </div>
        </div>
    );
};

const PolymerSearch = ({polymers, onFilterChange}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = e => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        const filtered = polymers.filter(polymer => {
            return (
                polymer.auth_asym_id.toLowerCase().includes(query) ||
                polymer.nomenclature.some(name => name.toLowerCase().includes(query)) ||
                polymer.entity_poly_polymer_type.toLowerCase().includes(query)
            );
        });

        onFilterChange(filtered);
    };

    return (
        <div className="px-2 mb-2 mt-1">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search polymers..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full text-sm py-1 pl-7 pr-2 bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
                />
                <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
        </div>
    );
};

const ComponentsEasyAccessPanel = ({data, isLoading}: {data: RibosomeStructure; isLoading: boolean}) => {
    const [activeView, setActiveView] = useState('polymers');
    const service = useMolstarInstance('main');
    const rcsb_id = useAppSelector(s => 
        Object.keys(s.mstar_refs.instances.main.rcsb_id_components_map)[0]
    );
    // const state = useAppSelector(state => state);
    // const rcsb_id = Object.keys(state.mstar_refs.instances.main.rcsb_id_components_map)[0];

    const {data: helices_data} = useRoutersRouterLociGetHelicesQuery({rcsbId: data?.rcsb_id});
    const {data: ligands_data} = useRoutersRouterLigInStructureQuery({rcsbId: data?.rcsb_id});

    const mstar = useMolstarInstance('main');
    const controller = mstar?.controller;
    const ctx = mstar?.viewer;

    const [filteredPolymers, setFilteredPolymers] = useState([]);

    // Combine all polymers
    const allPolymers = [...data.rnas, ...data.proteins, ...data.other_polymers]
        .filter(r => r.assembly_id === 0)
        .toSorted(sort_by_polymer_class);

    useEffect(() => {
        setFilteredPolymers(allPolymers);
    }, [data]);

    const [PTCref, setPTCref] = useState('');
    const [PTCxyz, setPTCxyz] = useState([0, 0, 0]);
    const [ConstrictionRef, setConstrictionRef] = useState('');
    const [ConstrictionXyz, setConstrictionXyz] = useState([0, 0, 0]);
    if (isLoading) return <div className="text-xs">Loading components...</div>;

    if (!service?.viewer || !service?.controller) {
        return <div className="text-xs">Initializing viewer...</div>;
    }

    const {controller: msc} = service;
    const tabs = [
        {id: 'polymers', label: 'Polymers'},
        {id: 'landmarks', label: 'Landmarks'},
        {id: 'ligands', label: 'Ligands'}
    ];

    return (
        <TooltipProvider delayDuration={0}>
            <div className="flex flex-col h-full">
                <div className="h-8 flex items-center justify-between bg-gray-50 border-b">
                    {/* Tabs moved to the right of the icons */}
                    <div className="flex items-center flex-grow justify-start">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveView(tab.id)}
                                className={cn(
                                    'px-3 py-1 text-xs transition-colors',
                                    activeView === tab.id
                                        ? 'bg-white text-blue-600 font-medium'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                )}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={() => {
                                        ctx?.downloads.downloadSelection('some.cif');
                                    }}
                                    className="h-8 w-8 p-0"
                                    variant="ghost"
                                    size="sm">
                                    <DownloadIcon className="h-4 w-4 text-gray-600" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <DownloadButton onDownload={f => ctx?.downloads.downloadSelection(f)} />
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={() => msc.polymers.restoreAllVisibility(rcsb_id)}
                                    className="h-8 w-8 p-0"
                                    variant="ghost"
                                    size="sm">
                                    <Eye className="h-4 w-4 text-gray-600" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Show All Components</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                <div className="flex-grow min-h-0 relative overflow-hidden mt-4">
                    <div
                        className={cn('flex w-[300%] h-full sliding-panels-container', {
                            'transform transition-transform duration-300': true,
                            'translate-x-0': activeView === 'polymers',
                            '-translate-x-1/3': activeView === 'landmarks',
                            '-translate-x-2/3': activeView === 'ligands'
                        })}>
                        <div className="w-1/3 h-full flex-shrink-0 sliding-panel">
                            <ScrollArea className="h-full relative">
                                <div className="space-y-1">
                                    <SequenceMolstarSync />

                                    <PolymerSearch polymers={allPolymers} onFilterChange={setFilteredPolymers} />
                                    {filteredPolymers.map(component => (
                                        <PolymerComponentRow polymer={component} key={component.auth_asym_id} />
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        <div className="w-1/3 h-full flex-shrink-0">
                            <ScrollArea className="h-full">
                                <div>
                                    <div className="text-sm text-gray-500">
                                        <PTCLandmark
                                            onMouseEnter={() => {
                                                controller?.landmarks.highlightSphere(
                                                    PTCxyz[0],
                                                    PTCxyz[1],
                                                    PTCxyz[2],
                                                    2,
                                                    'PTC (Peptidyl Transferase Center)'
                                                );
                                            }}
                                            onMouseLeave={() => {
                                                ctx!.ctx.managers.interactivity.lociHighlights.clearHighlights();
                                            }}
                                            onFocus={() => ctx?.focusPosition(PTCxyz[0], PTCxyz[1], PTCxyz[2])}
                                            onClick={async () => {
                                                if (PTCref === '') {
                                                    const [ptcref, xyz] = await controller?.landmarks.ptc(rcsb_id);
                                                    setPTCref(ptcref);
                                                    setPTCxyz(xyz);
                                                } else {
                                                    controller?.landmarks.selectSphere(
                                                        PTCxyz[0],
                                                        PTCxyz[1],
                                                        PTCxyz[2],
                                                        2,
                                                        'PTC (Peptidyl Transferase Center)'
                                                    );
                                                }
                                            }}
                                        />
                                        <ConstrictionSiteLandmark
                                            onFocus={() =>
                                                ctx?.focusPosition(
                                                    ConstrictionXyz[0],
                                                    ConstrictionXyz[1],
                                                    ConstrictionXyz[2]
                                                )
                                            }
                                            onMouseEnter={() => {
                                                controller?.landmarks.highlightSphere(
                                                    ConstrictionXyz[0],
                                                    ConstrictionXyz[1],
                                                    ConstrictionXyz[2],
                                                    2,
                                                    'CS (uL22/uL4 Constriction Site)'
                                                );
                                            }}
                                            onMouseLeave={() => {
                                                ctx!.ctx.managers.interactivity.lociHighlights.clearHighlights();
                                            }}
                                            onClick={async () => {
                                                if (ConstrictionRef === '') {
                                                    const [constriction_ref, xyz] =
                                                        await controller?.landmarks.constriction_site(rcsb_id);
                                                    setConstrictionRef(constriction_ref);
                                                    setConstrictionXyz(xyz);
                                                } else {
                                                    controller?.landmarks.selectSphere(
                                                        ConstrictionXyz[0],
                                                        ConstrictionXyz[1],
                                                        ConstrictionXyz[2],
                                                        2,
                                                        'CS (uL22/uL4 Constriction Site)'
                                                    );
                                                }
                                            }}
                                        />
                                        <HelixLandmarks
                                            helicesData={helices_data}
                                            onSelect={helix => {
                                                const residues = [];
                                                for (let i = helix.start_residue; i <= helix.end_residue; i++) {
                                                    residues.push({
                                                        auth_asym_id: helix.chain_id,
                                                        auth_seq_id: i
                                                    });
                                                }
                                                const expr = ctx?.residues.residue_cluster_expression(residues);
                                                const polymer_component = selectComponentById(state, {
                                                    componentId: helix.chain_id,
                                                    instanceId: 'main'
                                                });
                                                const data = ctx?.cell_from_ref(polymer_component.ref);
                                                const loci = ctx?.loci_from_expr(expr, data?.obj?.data);
                                                ctx?.ctx.managers.structure.selection.fromLoci('add', loci);
                                            }}
                                            onMouseEnter={helix => {
                                                {
                                                    const residues = [];
                                                    for (let i = helix.start_residue; i <= helix.end_residue; i++) {
                                                        residues.push({
                                                            auth_asym_id: helix.chain_id,
                                                            auth_seq_id: i
                                                        });
                                                    }
                                                    const expr = ctx?.residues.residue_cluster_expression(residues);
                                                    const polymer_component = selectComponentById(state, {
                                                        componentId: helix.chain_id,
                                                        instanceId: 'main'
                                                    });
                                                    const data = ctx?.cell_from_ref(polymer_component.ref);
                                                    const loci = ctx?.loci_from_expr(expr, data?.obj?.data);

                                                    ctx?.ctx.managers.interactivity.lociHighlights.highlight({loci});
                                                }
                                            }}
                                            onMouseLeave={() => {
                                                ctx?.ctx.managers.interactivity.lociHighlights.clearHighlights();
                                            }}
                                            onFocus={helix => {
                                                const residues = [];
                                                for (let i = helix.start_residue; i <= helix.end_residue; i++) {
                                                    residues.push({
                                                        auth_asym_id: helix.chain_id,
                                                        auth_seq_id: i
                                                    });
                                                }
                                                const expr = ctx?.residues.residue_cluster_expression(residues);
                                                const polymer_component = selectComponentById(state, {
                                                    componentId: helix.chain_id,
                                                    instanceId: 'main'
                                                });
                                                const data = ctx?.cell_from_ref(polymer_component.ref);
                                                const loci = ctx?.loci_from_expr(expr, data?.obj?.data);

                                                ctx?.ctx.managers.camera.focusLoci(loci);

                                                // Your focus logic
                                            }}
                                        />
                                    </div>
                                </div>
                            </ScrollArea>
                        </div>

                        <div className="w-1/3 h-full flex-shrink-0">
                            <ScrollArea className="h-full">
                                <div>
                                    <div className="text-sm text-gray-500">
                                        {ligands_data &&
                                            ligands_data.map(ligand => (
                                                <LigandRow
                                                    key={ligand.chemicalId}
                                                    ligand={ligand}
                                                    onToggleVisibility={() => {}}
                                                    onToggleSelection={() => {}}
                                                    onIsolate={() => {}}
                                                    onDownload={() => {}}
                                                    isVisible={true}
                                                    isSelected={false}
                                                />
                                            ))}
                                    </div>
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
};

export default ComponentsEasyAccessPanel;
