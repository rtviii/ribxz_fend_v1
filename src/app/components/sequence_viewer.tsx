import React, {useState, useCallback, useEffect, useRef, createContext, useContext} from 'react';
import {useDispatch} from 'react-redux';
import {addSelection, removeSelection, clearSelections} from '@/store/molstar/sequence_viewer';
import {useAppSelector} from '@/store/store';
import {cn} from '@/components/utils';
import './sequence_viewer.css';
import {DraggableWindow} from './draggable_window';

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
            setDragEnd(index);

            const start = Math.min(dragStart, index);
            const end = Math.max(dragStart, index);
            const affectedResidues = sequence.slice(start, end + 1);

            if (isDragDeselecting) {
                setTemporarySelection(
                    selectedResidues.filter(sel => affectedResidues.some(res => res[0] === sel[0] && res[1] === sel[1]))
                );
            } else {
                setTemporarySelection(affectedResidues);
            }
        }
    };

    const handleMouseUp = () => {
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

        setDragStart(null);
        setDragEnd(null);
        setTemporarySelection([]);
        setIsDragDeselecting(false);
    };

    const visibleSequence = sequence.slice(visibleRange.start, visibleRange.end);

    return (
        <div className="sequence-viewer" ref={containerRef}>
            <div className="sequence-header">
                <span>
                    {metadata?.chain_title || 'Chain'} ({sequence.length} residues)
                    {sequence.length > CHUNK_SIZE && ` - Showing ${visibleRange.start + 1}-${visibleRange.end}`}
                </span>
                <button onClick={() => dispatch(clearSelections(auth_asym_id))} className="clear-button">
                    Clear
                </button>
            </div>
            <div className="sequence-content" onMouseLeave={handleMouseUp}>
                {visibleRange.start > 0 && <div data-type="top" data-index={visibleRange.start} className="h-4" />}

                {visibleSequence.map((residue, index) => {
                    const absoluteIndex = index + visibleRange.start;
                    const showMarker = (absoluteIndex + 1) % 10 === 0;

                    return (
                        <div key={`${residue[0]}-${residue[1]}`} className="residue-wrapper">
                            <span
                                className={cn('residue', isSelected(absoluteIndex) && 'selected')}
                                onMouseDown={() => handleMouseDown(absoluteIndex)}
                                onMouseMove={() => handleMouseMove(absoluteIndex)}
                                onMouseUp={handleMouseUp}>
                                {residue[0]}
                            </span>
                            {showMarker && <span className="residue-marker">{residue[1]}</span>}
                        </div>
                    );
                })}

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
        <DraggableWindow
            isOpen={isOpen}
            onClose={closeViewer}
            title={`Sequence Viewer - ${metadata?.chain_title || 'Chain'}`}>
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
// Simplified trigger button component
export const SequenceViewerTrigger: React.FC<{
    sequence: ResidueData[];
    auth_asym_id: string;
    metadata?: SequenceViewerState['metadata'];
    onSelectionChange?: SequenceViewerState['onSelectionChange'];
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

    return (
        <button onClick={handleClick} className="font-mono text-xs px-2 py-0.5 rounded hover:bg-gray-100">
            seq
        </button>
    );
};

export default SequenceViewer;
