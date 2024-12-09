import React, {useState, useCallback, useEffect, useContext, useRef, createContext} from 'react';
import {useDispatch} from 'react-redux';
import {addSelection, removeSelection, clearSelections} from '@/store/molstar/sequence_viewer';
import {useAppSelector} from '@/store/store';
import {cn} from '@/components/utils';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import './sequence_viewer.css';

export type ResidueData = [string, number];

interface SequenceViewerProps {
    sequence: ResidueData[];
    auth_asym_id: string;
    metadata?: {
        chain_title: string;
        structure_id: string;
        length: number;
        type: 'Polypeptide' | 'Polynucleotide';
        struct_ref: string;
        polymer_ref: string;
    };
    onSelectionChange?: (selection: {indices: number[]; residues: ResidueData[]}) => void;
}

const CHUNK_SIZE = 200;
const BUFFER_SIZE = 50;

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

                    const elem = entry.target as HTMLElement;
                    const index = parseInt(elem.dataset.index || '0');

                    // Only load more content, don't reset the viewport
                    if (elem.dataset.type === 'bottom' && visibleRange.end < sequence.length) {
                        setVisibleRange(prev => ({
                            start: prev.start, // Keep the current start
                            end: Math.min(sequence.length, prev.end + CHUNK_SIZE)
                        }));
                    } else if (elem.dataset.type === 'top' && visibleRange.start > 0) {
                        setVisibleRange(prev => ({
                            start: Math.max(0, prev.start - CHUNK_SIZE),
                            end: prev.end // Keep the current end
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
                // If we're drag-deselecting, check if this residue is being deselected
                return (
                    isPermanentlySelected &&
                    !temporarySelection.some(sel => sel[0] === residue[0] && sel[1] === residue[1])
                );
            } else {
                // Normal selection behavior
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

        // Check if we're starting on a selected residue
        const residue = sequence[index];
        const isStartingOnSelected = isSelected(index);

        if (!isCtrlPressed) {
            // If starting on a selected residue, prepare for deselection
            if (isStartingOnSelected) {
                setTemporarySelection([]);
                setIsDragDeselecting(true);
            } else {
                setTemporarySelection([residue]);
                setIsDragDeselecting(false);
            }
        } else {
            // Ctrl+click behavior remains the same
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
                // When drag-deselecting, temporarySelection represents residues to remove
                setTemporarySelection(
                    selectedResidues.filter(sel => affectedResidues.some(res => res[0] === sel[0] && res[1] === sel[1]))
                );
            } else {
                // Normal selection behavior
                setTemporarySelection(affectedResidues);
            }
        }
    };

    const handleMouseUp = () => {
        if (dragStart !== null && dragEnd !== null && !isCtrlPressed) {
            if (isDragDeselecting) {
                // Remove the temporary selection
                dispatch(
                    removeSelection({
                        auth_asym_id,
                        residues: temporarySelection
                    })
                );
            } else {
                // Add the temporary selection
                dispatch(
                    addSelection({
                        auth_asym_id,
                        residues: temporarySelection
                    })
                );
            }

            if (onSelectionChange) {
                const indices = temporarySelection.map(residue =>
                    sequence.findIndex(seq => seq[0] === residue[0] && seq[1] === residue[1])
                );
                onSelectionChange({
                    indices,
                    residues: temporarySelection
                });
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

// Context and Trigger
interface PopoverContextType {
    activePopover: string | null;
    setActivePopover: (id: string | null) => void;
}

const PopoverContext = createContext<PopoverContextType>({
    activePopover: null,
    setActivePopover: () => {}
});

export const PopoverProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [activePopover, setActivePopover] = useState<string | null>(null);
    return <PopoverContext.Provider value={{activePopover, setActivePopover}}>{children}</PopoverContext.Provider>;
};

export const SequenceViewerTrigger: React.FC<SequenceViewerProps> = props => {
    const {activePopover, setActivePopover} = useContext(PopoverContext);
    const isOpen = activePopover === props.auth_asym_id;

    const handleMouseEnter = (e: React.MouseEvent) => {
        e.stopPropagation();
        setActivePopover(props.auth_asym_id);
    };

    const handleMouseLeave = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!e.relatedTarget || !(e.relatedTarget as Element).closest('.sequence-viewer-content')) {
            setActivePopover(null);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={() => {}}>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        'font-mono text-xs px-2 py-0.5 rounded hover:bg-gray-100',
                        isOpen ? 'bg-gray-100' : ''
                    )}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={e => e.stopPropagation()}>
                    seq
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[400px] p-0"
                side="right"
                align="start"
                onMouseEnter={e => {
                    e.stopPropagation();
                    setActivePopover(props.auth_asym_id);
                }}
                onMouseLeave={e => {
                    e.stopPropagation();
                    setActivePopover(null);
                }}>
                <div className="sequence-viewer-content p-2" onClick={e => e.stopPropagation()}>
                    <SequenceViewer {...props} />
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default SequenceViewer;
