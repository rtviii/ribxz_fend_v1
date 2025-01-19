export interface HelixData {
    [chainId: string]: {
        polymer_class: string;
        helices: {
            [helixName: string]: [number, number];
        };
    };
}

export interface HelixLandmark {
    id: string;
    name: string;
    chain_id: string;
    start_residue: number;
    end_residue: number;
    polymer_class: string;
}

export interface HelixLandmarksProps {
    helicesData: HelixData | undefined;
    onMouseEnter: (helix: HelixLandmark) => void;
    onMouseLeave: () => void;
    onSelect: (helix: HelixLandmark) => void;
    onFocus: (helix: HelixLandmark) => void;
}

export function transformHelicesToLandmarks(helixData: HelixData): HelixLandmark[] {
    const landmarks: HelixLandmark[] = [];

    Object.entries(helixData).forEach(([chainId, chainData]) => {
        const {polymer_class, helices} = chainData;

        Object.entries(helices).forEach(([helixName, [start, end]]) => {
            landmarks.push({
                id: `${chainId}_${helixName}`,
                name: helixName,
                chain_id: chainId,
                start_residue: start,
                end_residue: end,
                polymer_class
            });
        });
    });

    return landmarks.sort((a, b) => {
        if (a.chain_id === b.chain_id) {
            return a.name.localeCompare(b.name);
        }
        return a.chain_id.localeCompare(b.chain_id);
    });
}
