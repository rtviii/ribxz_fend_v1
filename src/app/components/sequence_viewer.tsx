import React, {useState, useCallback, useEffect, useRef, createContext, useContext} from 'react';
import {useDispatch} from 'react-redux';
import {addSelection, removeSelection, clearSelections, getResiduesArray} from '@/store/molstar/slice_seq_viewer';
import {RootState, useAppSelector} from '@/store/store';
import {cn} from '@/components/utils';
import {DraggableWindow} from './draggable_window';
import {Dna, Shapes} from 'lucide-react';
import './sequence_viewer.css';

export type ResidueData = [string, number];

const getResidueKey = (residue: ResidueData): string => `${residue[0]}_${residue[1]}`;

interface SequenceViewerProps {
    sequence: ResidueData[];
    auth_asym_id: string;
    metadata?: {
        chain_title ?: string;
        structure_id?: string;
        length      ?: number;
        type        ?: 'Polypeptide' | 'Polynucleotide';
        struct_ref  ?: string;
        polymer_ref ?: string;
    };
    onSelectionChange?: (selection: {indices: number[]; residues: ResidueData[]}) => void;
}

const CHUNK_SIZE = 200;

const SequenceViewer: React.FC<SequenceViewerProps> = ({sequence, auth_asym_id, metadata, onSelectionChange}) => {
   const renderCount = useRef(0);
    
    useEffect(() => {
        console.log('Sequence viewer rendered:', renderCount.current++);
    });
    const dispatch = useDispatch();
    // Get the selection map instead of array
    const selectionState = useAppSelector(state => state.sequenceViewer.selections[auth_asym_id]);
    const selectedMap = selectionState?.selectedMap || {};

    const [isDragDeselecting, setIsDragDeselecting] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const [visibleRange, setVisibleRange] = useState({start: 0, end: CHUNK_SIZE});
    const [dragStart, setDragStart] = useState<number | null>(null);
    const [dragEnd, setDragEnd] = useState<number | null>(null);
    const [isCtrlPressed, setIsCtrlPressed] = useState(false);
    const [temporarySelection, setTemporarySelection] = useState<Record<string, ResidueData>>({});

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
   if (dragStart !== null && dragEnd !== null && !isCtrlPressed) {
        const temporarySelectionArray = Object.values(temporarySelection);
        
        console.time('selection-update');
        if (isDragDeselecting) {
            dispatch(removeSelection({auth_asym_id, residues: temporarySelectionArray}));
        } else {
            dispatch(addSelection({auth_asym_id, residues: temporarySelectionArray}));
        }
        console.timeEnd('selection-update');

        if (onSelectionChange) {
            console.time('selection-change-callback');
            const indices = temporarySelectionArray.map(residue =>
                sequence.findIndex(seq => seq[0] === residue[0] && seq[1] === residue[1])
            );
            onSelectionChange({indices, residues: temporarySelectionArray});
            console.timeEnd('selection-change-callback');
        }
    }

            setDragStart(null);
            setDragEnd(null);
            setTemporarySelection({});
            setIsDragDeselecting(false);
        };

        document.addEventListener('mouseup', handleGlobalMouseUp);
        return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
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

    // Intersection Observer effect remains the same
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;

                    if (entry.target.dataset.type === 'bottom' && visibleRange.end < sequence.length) {
                        setVisibleRange(prev => ({
                            start: prev.start,
                            end: Math.min(sequence.length, prev.end + CHUNK_SIZE)
                        }));
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
            const key = getResidueKey(residue);
            const isPermanentlySelected = key in selectedMap;
            const isTemporarilySelected = key in temporarySelection;

            if (isDragDeselecting) {
                return isPermanentlySelected && !isTemporarilySelected;
            } else {
                return isPermanentlySelected || isTemporarilySelected;
            }
        },
        [sequence, selectedMap, temporarySelection, isDragDeselecting]
    );

    const handleMouseDown = (index: number) => {
        setDragStart(index);
        setDragEnd(index);

        const residue = sequence[index];
        const isStartingOnSelected = isSelected(index);

        if (!isCtrlPressed) {
            if (isStartingOnSelected) {
                setTemporarySelection({});
                setIsDragDeselecting(true);
            } else {
                const key = getResidueKey(residue);
                setTemporarySelection({[key]: residue});
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
            if (dragEnd !== index) {
                setDragEnd(index);

                const start = Math.min(dragStart, index);
                const end = Math.max(dragStart, index);

                const blockStartIndex = Math.floor(start / 10) * 10;
                const blockEndIndex = Math.floor(end / 10) * 10;

                let affectedResidues;
                if (blockStartIndex === blockEndIndex) {
                    affectedResidues = sequence.slice(start, end + 1);
                } else {
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
                    // Create a map of residues to deselect
                    const newTempSelection = affectedResidues.reduce((acc, residue) => {
                        const key = getResidueKey(residue);
                        if (key in selectedMap) {
                            acc[key] = residue;
                        }
                        return acc;
                    }, {} as Record<string, ResidueData>);
                    setTemporarySelection(newTempSelection);
                } else {
                    // Create a map of residues to select
                    const newTempSelection = affectedResidues.reduce((acc, residue) => {
                        const key = getResidueKey(residue);
                        acc[key] = residue;
                        return acc;
                    }, {} as Record<string, ResidueData>);
                    setTemporarySelection(newTempSelection);
                }
            }
        }
    };

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

export default SequenceViewer;

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
