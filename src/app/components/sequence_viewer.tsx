
// SequenceViewer.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addSelection, removeSelection, clearSelections } from '@/store/molstar/sequence_viewer'
import { useAppSelector } from '@/store/store';
import './sequence_viewer.css';

export type ResidueData = [string, number];

interface SequenceViewerProps {
    sequence: ResidueData[];
    auth_asym_id: string;
    metadata?: {
        chain_title : string;
        structure_id: string;
        length      : number;
        type        : 'Polypeptide' | 'Polynucleotide';
        struct_ref  : string;
        polymer_ref : string;
    };
    onSelectionChange?: (selection: {
        indices: number[];
        residues: ResidueData[];
    }) => void;
}

const SequenceViewer: React.FC<SequenceViewerProps> = ({
    sequence,
    auth_asym_id,
    metadata,
    onSelectionChange
}) => {
    const dispatch = useDispatch();
    const selectedResidues = useAppSelector(state => state.sequenceViewer.selections[auth_asym_id] || []);

    // Local state for drag selection
    const [dragStart, setDragStart]                   = useState<number | null>(null);
    const [dragEnd, setDragEnd]                       = useState<number | null>(null);
    const [isCtrlPressed, setIsCtrlPressed]           = useState(false);
    const [temporarySelection, setTemporarySelection] = useState<ResidueData[]>([]);

    // Handle keyboard events
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

    // Check if a residue is selected
    const isSelected = useCallback((index: number) => {
        const residue = sequence[index];
        return selectedResidues.some(
            sel => sel[0] === residue[0] && sel[1] === residue[1]
        ) || temporarySelection.some(
            sel => sel[0] === residue[0] && sel[1] === residue[1]
        );
    }, [sequence, selectedResidues, temporarySelection]);

    const handleMouseDown = (index: number) => {
        setDragStart(index);
        setDragEnd(index);

        if (!isCtrlPressed) {
            // Start new selection
            setTemporarySelection([sequence[index]]);
        } else {
            // Toggle selection in ctrl-click mode
            const residue = sequence[index];
            if (isSelected(index)) {
                dispatch(removeSelection({ 
                    auth_asym_id, 
                    residues: [residue] 
                }));
            } else {
                dispatch(addSelection({ 
                    auth_asym_id, 
                    residues: [residue] 
                }));
            }
        }
    };

    const handleMouseMove = (index: number) => {
        if (dragStart !== null) {
            setDragEnd(index);
            
            // Calculate selection range
            const start = Math.min(dragStart, index);
            const end = Math.max(dragStart, index);
            const newSelection = sequence.slice(start, end + 1);
            
            setTemporarySelection(newSelection);
        }
    };

    const handleMouseUp = () => {
        if (dragStart !== null && dragEnd !== null && !isCtrlPressed) {
            dispatch(addSelection({
                auth_asym_id,
                residues: temporarySelection
            }));

            if (onSelectionChange) {
                const indices = temporarySelection.map(residue => 
                    sequence.findIndex(seq => 
                        seq[0] === residue[0] && seq[1] === residue[1]
                    )
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
    };

    return (
        <div className="sequence-viewer">
            <div className="sequence-header">
                <span>{metadata?.chain_title || 'Chain'} ({sequence.length} residues)</span>
                <button 
                    onClick={() => dispatch(clearSelections(auth_asym_id))}
                    className="clear-button"
                >
                    Clear
                </button>
            </div>
            <div 
                className="sequence-content"
                onMouseLeave={handleMouseUp}
            >
                {sequence.map((residue, index) => (
                    <React.Fragment key={`${residue[0]}-${residue[1]}`}>
                        <span
                            className={`residue ${isSelected(index) ? 'selected' : ''}`}
                            onMouseDown={() => handleMouseDown(index)}
                            onMouseMove={() => handleMouseMove(index)}
                            onMouseUp={handleMouseUp}
                        >
                            {residue[0]}
                        </span>
                        {(index + 1) % 10 === 0 && (
                            <sup className="position-marker">
                                {residue[1]}
                            </sup>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default SequenceViewer;

// styles.css
