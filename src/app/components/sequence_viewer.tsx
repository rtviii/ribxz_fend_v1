import React, {useState, useCallback, useEffect, useRef, createContext, useContext, useMemo} from 'react';
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
const ResidueComponent = React.memo<{
    residue: ResidueData;
    absoluteIndex: number;
    isSelected: boolean;
    showMarker: boolean;
}>(
    ({residue, absoluteIndex, isSelected, showMarker}) => (
        <div className="residue-wrapper" data-index={absoluteIndex}>
            <span className={cn('residue', isSelected && 'selected')}>{residue[0]}</span>
            {showMarker && <span className="residue-marker">{residue[1]}</span>}
        </div>
    ),
    (prev, next) =>
        prev.isSelected === next.isSelected &&
        prev.residue[0] === next.residue[0] &&
        prev.residue[1] === next.residue[1]
);
ResidueComponent.displayName = 'ResidueComponent';

const ResidueBlock = React.memo<{
    blockResidues: ResidueData[];
    blockStart: number;
    isSelected: (index: number) => boolean;
}>(({blockResidues, blockStart, isSelected}) => (
    <div className="residue-block">
        {blockResidues.map((residue, localIndex) => {
            const absoluteIndex = blockStart + localIndex;
            const showMarker = (absoluteIndex + 1) % 10 === 0;

            return (
                <ResidueComponent
                    key={`${absoluteIndex}-${residue[0]}-${residue[1]}`}
                    residue={residue}
                    absoluteIndex={absoluteIndex}
                    isSelected={isSelected(absoluteIndex)}
                    showMarker={showMarker}
                />
            );
        })}
    </div>
));
ResidueBlock.displayName = 'ResidueBlock';

const SequenceViewer: React.FC<SequenceViewerProps> = ({sequence, auth_asym_id, metadata, onSelectionChange}) => {
    const dispatch = useDispatch();
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
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;

                    const target = entry.target as HTMLElement;
                    const type = target.dataset.type;

                    if (type === 'bottom' && visibleRange.end < sequence.length) {
                        setVisibleRange(prev => ({
                            start: prev.start,
                            end: Math.min(sequence.length, prev.end + CHUNK_SIZE)
                        }));
                    } else if (type === 'top' && visibleRange.start > 0) {
                        setVisibleRange(prev => ({
                            start: Math.max(0, prev.start - CHUNK_SIZE),
                            end: prev.end
                        }));
                    }
                });
            },
            {
                root: container,
                threshold: 0.1,
                rootMargin: '20px' // Give some margin to start loading earlier
            }
        );

        // Add the sentinel elements
        const topSentinel = container.querySelector('[data-type="top"]');
        const bottomSentinel = container.querySelector('[data-type="bottom"]');

        if (topSentinel) observer.observe(topSentinel);
        if (bottomSentinel) observer.observe(bottomSentinel);

        return () => observer.disconnect();
    }, [visibleRange, sequence.length]);

    // Control key handling
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

    // Mouse up handler
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (dragStart !== null && dragEnd !== null && !isCtrlPressed) {
                const temporarySelectionArray = Object.values(temporarySelection);

                if (isDragDeselecting) {
                    dispatch(removeSelection({auth_asym_id, residues: temporarySelectionArray}));
                } else {
                    dispatch(addSelection({auth_asym_id, residues: temporarySelectionArray}));
                }

                if (onSelectionChange) {
                    const indices = temporarySelectionArray.map(residue =>
                        sequence.findIndex(seq => seq[0] === residue[0] && seq[1] === residue[1])
                    );
                    onSelectionChange({indices, residues: temporarySelectionArray});
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

    // Handle starting the drag
    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            const element = e.target as HTMLElement;
            const residueEl = element.closest('.residue-wrapper');
            if (!residueEl) return;

            const index = parseInt(residueEl.getAttribute('data-index') || '0', 10);
            const residue = sequence[index];
            const isStartingOnSelected = isSelected(index);

            setDragStart(index);
            setDragEnd(index);

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
        },
        [sequence, isSelected, isCtrlPressed, auth_asym_id, dispatch]
    );

    // Handle continuing the drag
    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (dragStart === null) return;

            const element = e.target as HTMLElement;
            const residueEl = element.closest('.residue-wrapper');
            if (!residueEl) return;

            const index = parseInt(residueEl.getAttribute('data-index') || '0', 10);
            if (dragEnd === index) return;

            setDragEnd(index);

            const start = Math.min(dragStart, index);
            const end = Math.max(dragStart, index);

            let affectedResidues = sequence.slice(start, end + 1);

            if (isDragDeselecting) {
                const newTempSelection = affectedResidues.reduce((acc, residue) => {
                    const key = getResidueKey(residue);
                    if (key in selectedMap) {
                        acc[key] = residue;
                    }
                    return acc;
                }, {} as Record<string, ResidueData>);
                setTemporarySelection(newTempSelection);
            } else {
                const newTempSelection = affectedResidues.reduce((acc, residue) => {
                    const key = getResidueKey(residue);
                    acc[key] = residue;
                    return acc;
                }, {} as Record<string, ResidueData>);
                setTemporarySelection(newTempSelection);
            }
        },
        [dragStart, dragEnd, isDragDeselecting, sequence, selectedMap]
    );

    // Memoize the visible sequence
    const visibleSequence = useMemo(
        () => sequence.slice(visibleRange.start, visibleRange.end),
        [sequence, visibleRange.start, visibleRange.end]
    );

    // Memoize block rendering
    const blocks = useMemo(() => {
        const result = [];
        for (let i = 0; i < visibleSequence.length; i += 10) {
            const blockResidues = visibleSequence.slice(i, i + 10);
            const blockStart = i + visibleRange.start;

            result.push(
                <ResidueBlock
                    key={`block-${blockStart}`}
                    blockResidues={blockResidues}
                    blockStart={blockStart}
                    isSelected={isSelected}
                />
            );
        }
        return result;
    }, [visibleSequence, visibleRange.start, isSelected]);

    return (
        <div className="sequence-viewer" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}>
            <div className="sequence-content relative overflow-auto h-96" ref={containerRef}>
                {visibleRange.start > 0 && (
                    <div data-type="top" data-index={visibleRange.start} className="h-4 absolute top-0 w-full" />
                )}
                {blocks}
                {visibleRange.end < sequence.length && (
                    <div data-type="bottom" data-index={visibleRange.end} className="h-4 absolute bottom-0 w-full" />
                )}
            </div>
        </div>
    );
};

export default React.memo(SequenceViewer);

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

    // Check if there are any selections for this auth_asym_id
    const hasSelections = useAppSelector(state => {
        const selections = state.sequenceViewer.selections[auth_asym_id];
        return selections && Object.keys(selections.selectedMap).length > 0;
    });

    const handleClick = e => {
        e.stopPropagation();
        openViewer({
            sequence,
            auth_asym_id,
            metadata,
            onSelectionChange
        });
    };

    const isNucleotide = metadata?.type === 'Polynucleotide';

    return (
        <button
            onClick={handleClick}
            className={cn(
                'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full transition-all',
                'hover:bg-gray-200 hover:text-gray-800',
                hasSelections ? 'bg-green-100 text-green-700 ring-2 ring-green-500/50' : 'bg-gray-100 text-gray-600'
            )}>
            {isNucleotide ? (
                <Dna
                    size={12}
                    className={cn('transition-colors', hasSelections ? 'text-green-500' : 'text-gray-500')}
                />
            ) : (
                <Shapes
                    size={12}
                    className={cn('transition-colors', hasSelections ? 'text-green-500' : 'text-gray-500')}
                />
            )}
            <span>
                {sequence.length} {isNucleotide ? 'NTs' : 'AAs'}
            </span>
        </button>
    );
};
