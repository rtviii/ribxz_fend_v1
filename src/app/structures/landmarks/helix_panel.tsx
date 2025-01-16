import {useState} from 'react';
import HelixLandmarksList from './landmark_row';
import {HelixData, transformHelicesToLandmarks} from './types';

export const LandmarksPanel: React.FC<{helicesData: HelixData | undefined}> = ({helicesData}) => {
    const [visibleHelices, setVisibleHelices] = useState<Set<string>>(new Set());
    const [highlightedHelix, setHighlightedHelix] = useState<string | null>(null);

    if (!helicesData) {
        return null;
    }
    const helixLandmarks = transformHelicesToLandmarks(helicesData);

    const handleToggleVisibility = (id: string) => {
        const newVisible = new Set(visibleHelices);
        if (newVisible.has(id)) {
            newVisible.delete(id);
        } else {
            newVisible.add(id);
        }
        setVisibleHelices(newVisible);
        // Add your visibility logic here
    };

    return (
        <HelixLandmarksList
            helices={helixLandmarks}
            visibleHelices={visibleHelices}
            highlightedHelix={highlightedHelix}
            onToggleVisibility={handleToggleVisibility}
            onHighlight={setHighlightedHelix}
            onFocus={id => {
                // Add your focus logic here
            }}
        />
    );
};
