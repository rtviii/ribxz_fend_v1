import React, {useState, useCallback, useEffect, useRef, createContext, useContext} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {addSelection, removeSelection, clearSelections} from '@/store/molstar/slice_seq_viewer';
import {RootState, useAppSelector} from '@/store/store';
import {cn} from '@/components/utils';
import './sequence_viewer.css';
import {DraggableWindow} from './draggable_window';
import {BrickWall, Dna, Shapes} from 'lucide-react';
import {molstarServiceInstance} from '@/components/mstar/mstar_service';
export type ResidueData = [string, number];

interface SequenceViewerProps {
    sequence: ResidueData[];
    auth_asym_id: string;
    metadata?: {
        chain_title?: string;
        structure_id?: string;
        length?: number;
        type?: 'Polypeptide' | 'Polynucleotide';
        struct_ref?: string;
        polymer_ref?: string;
    };
    onSelectionChange?: (selection: {indices: number[]; residues: ResidueData[]}) => void;
}

const CHUNK_SIZE = 200;

const SequenceViewer: React.FC<SequenceViewerProps> = ({sequence, auth_asym_id, metadata, onSelectionChange}) => {
    const dispatch = useDispatch();
    const selectedResidues = useAppSelector(state => state.sequenceViewer.selections[auth_asym_id] || []);
    const [isDragDeselecting, setIsDragDeselecting] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const [visibleRange, setVisibleRange] = useState({start: 0, end: CHUNK_SIZE});
    const [dragStart, setDragStart] = useState<number | null>(null);
    const [dragEnd, setDragEnd] = useState<number | null>(null);
    const [isCtrlPressed, setIsCtrlPressed] = useState(false);
    const [temporarySelection, setTemporarySelection] = useState<ResidueData[]>([]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Control') setIsCtrlPressed(true);
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Control') setIsCtrlPressed(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            // Only process if we were actually dragging
            if (dragStart !== null && dragEnd !== null && !isCtrlPressed) {
                if (isDragDeselecting) {
                    dispatch(removeSelection({auth_asym_id, residues: temporarySelection}));
                } else {
                    dispatch(addSelection({auth_asym_id, residues: temporarySelection}));
                }

                if (onSelectionChange) {
                    const indices = temporarySelection.map(residue =>
                        sequence.findIndex(seq => seq[0] === residue[0] && seq[1] === residue[1])
                    );
                    onSelectionChange({indices, residues: temporarySelection});
                }
            }

            // Reset all drag-related state
            setDragStart(null);
            setDragEnd(null);
            setTemporarySelection([]);
            setIsDragDeselecting(false);
        };

        // Add global mouseup listener
        document.addEventListener('mouseup', handleGlobalMouseUp);

        return () => {
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [
        auth_asym_id,
        dragStart,
        dragEnd,
        isDragDeselecting,
        isCtrlPressed,
        onSelectionChange,
        sequence,
        temporarySelection,
        dispatch
    ]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;

                    // @ts-ignore
                    if (entry.target.dataset.type === 'bottom' && visibleRange.end < sequence.length) {
                        setVisibleRange(prev => ({
                            start: prev.start,
                            end: Math.min(sequence.length, prev.end + CHUNK_SIZE)
                        }));

                    // @ts-ignore
                    } else if (entry.target.dataset.type === 'top' && visibleRange.start > 0) {
                        setVisibleRange(prev => ({
                            start: Math.max(0, prev.start - CHUNK_SIZE),
                            end: prev.end
                        }));
                    }
                });
            },
            {threshold: 0.1, root: container}
        );

        const topSentinel = container.querySelector('[data-type="top"]');
        const bottomSentinel = container.querySelector('[data-type="bottom"]');

        if (topSentinel) observer.observe(topSentinel);
        if (bottomSentinel) observer.observe(bottomSentinel);

        return () => observer.disconnect();
    }, [visibleRange, sequence.length]);

    const isSelected = useCallback(
        (index: number) => {
            const residue = sequence[index];
            const isPermanentlySelected = selectedResidues.some(sel => sel[0] === residue[0] && sel[1] === residue[1]);

            if (isDragDeselecting) {
                return (
                    isPermanentlySelected &&
                    !temporarySelection.some(sel => sel[0] === residue[0] && sel[1] === residue[1])
                );
            } else {
                return (
                    isPermanentlySelected ||
                    temporarySelection.some(sel => sel[0] === residue[0] && sel[1] === residue[1])
                );
            }
        },
        [sequence, selectedResidues, temporarySelection, isDragDeselecting]
    );

    const handleMouseDown = (index: number) => {
        setDragStart(index);
        setDragEnd(index);

        const residue = sequence[index];
        const isStartingOnSelected = isSelected(index);

        if (!isCtrlPressed) {
            if (isStartingOnSelected) {
                setTemporarySelection([]);
                setIsDragDeselecting(true);
            } else {
                setTemporarySelection([residue]);
                setIsDragDeselecting(false);
            }
        } else {
            if (isSelected(index)) {
                dispatch(removeSelection({auth_asym_id, residues: [residue]}));
            } else {
                dispatch(addSelection({auth_asym_id, residues: [residue]}));
            }
        }
    };

    const handleMouseMove = (index: number) => {
        if (dragStart !== null) {
            // Only update if we're actually on a different index
            if (dragEnd !== index) {
                setDragEnd(index);

                const start = Math.min(dragStart, index);
                const end = Math.max(dragStart, index);

                // Important change: Calculate indices within the same block
                const blockStartIndex = Math.floor(start / 10) * 10;
                const blockEndIndex = Math.floor(end / 10) * 10;

                // If crossing blocks, be more precise about selection
                let affectedResidues;
                if (blockStartIndex === blockEndIndex) {
                    // Within same block - simple slice
                    affectedResidues = sequence.slice(start, end + 1);
                } else {
                    // Crossing blocks - only include actual residues
                    affectedResidues = sequence.slice(start, end + 1).filter((_, idx) => {
                        const absoluteIdx = start + idx;
                        return (
                            absoluteIdx === index ||
                            absoluteIdx === dragStart ||
                            (absoluteIdx >= Math.min(index, dragStart) && absoluteIdx <= Math.max(index, dragStart))
                        );
                    });
                }

                if (isDragDeselecting) {
                    setTemporarySelection(
                        selectedResidues.filter(sel =>
                            affectedResidues.some(res => res[0] === sel[0] && res[1] === sel[1])
                        )
                    );
                } else {
                    setTemporarySelection(affectedResidues);
                }
            }
        }
    };
    // const handleMouseUp = () => {
    //     if (dragStart !== null && dragEnd !== null && !isCtrlPressed) {
    //         if (isDragDeselecting) {
    //             dispatch(removeSelection({auth_asym_id, residues: temporarySelection}));
    //         } else {
    //             dispatch(addSelection({auth_asym_id, residues: temporarySelection}));
    //         }

    //         if (onSelectionChange) {
    //             const indices = temporarySelection.map(residue =>
    //                 sequence.findIndex(seq => seq[0] === residue[0] && seq[1] === residue[1])
    //             );
    //             onSelectionChange({indices, residues: temporarySelection});
    //         }
    //     }

    //     setDragStart(null);
    //     setDragEnd(null);
    //     setTemporarySelection([]);
    //     setIsDragDeselecting(false);
    // };

    const visibleSequence = sequence.slice(visibleRange.start, visibleRange.end);

    const renderResidueBlocks = () => {
        const blocks = [];
        for (let i = 0; i < visibleSequence.length; i += 10) {
            const blockResidues = visibleSequence.slice(i, i + 10);
            const blockStart = i + visibleRange.start;

            blocks.push(
                <div key={`block-${blockStart}`} className="residue-block">
                    {blockResidues.map((residue, localIndex) => {
                        const absoluteIndex = blockStart + localIndex;
                        const showMarker = (absoluteIndex + 1) % 10 === 0;

                        return (
                            <div
                                key={`residue-${absoluteIndex}-${residue[0]}-${residue[1]}`}
                                className="residue-wrapper">
                                <span
                                    className={cn('residue', isSelected(absoluteIndex) && 'selected')}
                                    onMouseDown={e => {
                                        e.stopPropagation();
                                        handleMouseDown(absoluteIndex);
                                    }}
                                    onMouseMove={e => {
                                        e.stopPropagation();
                                        handleMouseMove(absoluteIndex);
                                    }}>
                                    {residue[0]}
                                </span>
                                {showMarker && <span className="residue-marker">{residue[1]}</span>}
                            </div>
                        );
                    })}
                </div>
            );
        }
        return blocks;
    };

    return (
        <div className="sequence-viewer">
            {/* <div className="sequence-header">
                <span>
                    {metadata?.chain_title || 'Chain'} ({sequence.length} residues)
                    {sequence.length > CHUNK_SIZE && ` - Showing ${visibleRange.start + 1}-${visibleRange.end}`}
                </span>
                <button onClick={() => dispatch(clearSelections(auth_asym_id))} className="clear-button">
                    Clear
                </button>
            </div> */}
            <div className="sequence-content">
                {visibleRange.start > 0 && <div data-type="top" data-index={visibleRange.start} className="h-4" />}

                {renderResidueBlocks()}

                {visibleRange.end < sequence.length && (
                    <div data-type="bottom" data-index={visibleRange.end} className="h-4" />
                )}
            </div>
        </div>
    );
};

interface SequenceViewerState {
    isOpen: boolean;
    sequence: ResidueData[] | null;
    auth_asym_id: string | null;
    metadata?: {
        chain_title?: string;
        structure_id?: string;
        length?: number;
        type?: 'Polypeptide' | 'Polynucleotide';
        struct_ref?: string;
        polymer_ref?: string;
    };
    onSelectionChange?: (selection: {indices: number[]; residues: ResidueData[]}) => void;
}

export const FloatingSequenceViewerWindow: React.FC = () => {
    const {isOpen, sequence, auth_asym_id, metadata, onSelectionChange, closeViewer} = useSequenceViewer();

    if (!isOpen || !sequence || !auth_asym_id) return null;

    return (
        <DraggableWindow isOpen={isOpen} onClose={closeViewer} title={`${metadata?.chain_title || 'Chain'}`}>
            <SequenceViewer sequence={sequence} auth_asym_id={auth_asym_id} onSelectionChange={onSelectionChange} />
        </DraggableWindow>
    );
};

interface SequenceViewerContextType extends SequenceViewerState {
    openViewer: (config: Omit<SequenceViewerState, 'isOpen'>) => void;
    closeViewer: () => void;
}
const SequenceViewerContext = createContext<SequenceViewerContextType | null>(null);

export const SequenceViewerProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [viewerState, setViewerState] = useState<SequenceViewerState>({
        isOpen: false,
        sequence: null,
        auth_asym_id: null
    });

    const openViewer = useCallback((config: Omit<SequenceViewerState, 'isOpen'>) => {
        setViewerState({
            ...config,
            isOpen: true
        });
    }, []);

    const closeViewer = useCallback(() => {
        setViewerState(prev => ({
            ...prev,
            isOpen: false
        }));
    }, []);

    return (
        <SequenceViewerContext.Provider
            value={{
                ...viewerState,
                openViewer,
                closeViewer
            }}>
            {children}
            <FloatingSequenceViewerWindow />
        </SequenceViewerContext.Provider>
    );
};

export const useSequenceViewer = () => {
    const context = useContext(SequenceViewerContext);
    if (!context) {
        throw new Error('useSequenceViewer must be used within a SequenceViewerProvider');
    }
    return context;
};

export const SequenceViewerTrigger: React.FC<{
    sequence: ResidueData[];
    auth_asym_id: string;
    metadata?: {
        chain_title?: string;
        structure_id?: string;
        length?: number;
        type?: 'Polypeptide' | 'Polynucleotide';
        struct_ref?: string;
        polymer_ref?: string;
    };
    onSelectionChange?: (selection: {indices: number[]; residues: ResidueData[]}) => void;
}> = ({sequence, auth_asym_id, metadata, onSelectionChange}) => {
    const {openViewer} = useSequenceViewer();

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        openViewer({
            sequence,
            auth_asym_id,
            metadata,
            onSelectionChange
        });
    };

    // Determine if sequence is nucleotides or amino acids based on first residue
    const isNucleotide = metadata?.type === 'Polynucleotide';

    return (
        <button
            onClick={handleClick}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 hover:text-gray-800 transition-colors">
            {isNucleotide ? (
                <Dna size={12} className="text-gray-500" />
            ) : (
                <Shapes size={12} className="text-gray-500" />
            )}
            <span>
                {sequence.length} {isNucleotide ? 'NTs' : 'AAs'}
            </span>
        </button>
    );
};

export default SequenceViewer;

export const SequenceMolstarSync: React.FC = () => {
    const selections = useSelector((state: RootState) => state.sequenceViewer.selections);
    const prevSelectionsRef = React.useRef<typeof selections>({});
    const {viewer, controller} = molstarServiceInstance!;

    useEffect(() => {
        if (!molstarServiceInstance?.viewer) return;
        if (selections === prevSelectionsRef.current) return;

        // Process changes per chain
        Object.entries(selections).forEach(([auth_asym_id, residues]) => {
            const prevResidues = prevSelectionsRef.current[auth_asym_id] || [];

            // Find newly added residues
            const addedResidues = residues.filter(
                current => !prevResidues.some(prev => prev[0] === current[0] && prev[1] === current[1])
            );

            // Find removed residues
            const removedResidues = prevResidues.filter(
                prev => !residues.some(current => current[0] === prev[0] && current[1] === prev[1])
            );
            const parent_ref = controller.retrievePolymerRef(auth_asym_id) as string;

            if (addedResidues.length > 0) {
                molstarServiceInstance!.viewer.interactions.select_residues(parent_ref, addedResidues, 'add');
            }

            if (removedResidues.length > 0) {
                molstarServiceInstance!.viewer.interactions.select_residues(parent_ref, removedResidues, 'remove');
            }
        });

        // Handle completely deselected chains
        Object.keys(prevSelectionsRef.current).forEach(auth_asym_id => {
            if (!selections[auth_asym_id]) {
                // Chain was completely deselected
                molstarServiceInstance!.viewer.interactions.select_residues(
                    auth_asym_id,
                    prevSelectionsRef.current[auth_asym_id],
                    'remove'
                );
            }
        });

        prevSelectionsRef.current = selections;
    }, [selections]);

    return null;
};
