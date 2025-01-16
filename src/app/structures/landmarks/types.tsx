// Base types for all landmarks
export interface BaseLandmark {
    id: string;
    name: string;
    type: 'location' | 'residues' | 'region' | 'surface';
    description?: string;
}

// Specific landmark types
export interface LocationLandmark extends BaseLandmark {
    type: 'location';
    coordinates: [number, number, number];  // x, y, z
    radius?: number;  // For visualization sphere
}

export interface ResidueLandmark extends BaseLandmark {
    type: 'residues';
    chain_id: string;
    residues: Array<{
        residue_number: number;
        residue_name: string;
    }>;
}

export interface RegionLandmark extends BaseLandmark {
    type: 'region';
    chain_id: string;
    start_residue: number;
    end_residue: number;
}

export interface SurfaceLandmark extends BaseLandmark {
    type: 'surface';
    vertices: Array<[number, number, number]>;
    faces: Array<[number, number, number]>;
}

export type Landmark = LocationLandmark | ResidueLandmark | RegionLandmark | SurfaceLandmark;

// Landmark handlers interface
export interface LandmarkHandlers {
    onToggleVisibility: (id: string) => void;
    onHighlight: (id: string) => void;
    onFocus: (id: string) => void;
    onExport: (id: string) => void;
}

export interface HelixData {
    [chainId: string]: {
        polymer_class: string;
        helices: {
            [helixName: string]: [number, number]; // start, end residues
        };
    };
}

export interface HelixLandmark extends RegionLandmark {
    polymer_class: string;
}

export function transformHelicesToLandmarks(helixData: HelixData): HelixLandmark[] {
    const landmarks: HelixLandmark[] = [];
    
    Object.entries(helixData).forEach(([chainId, chainData]) => {
        const { polymer_class, helices } = chainData;
        
        Object.entries(helices).forEach(([helixName, [start, end]]) => {
            landmarks.push({
                id: `${chainId}_${helixName}`,
                name: helixName,
                type: 'region',
                chain_id: chainId,
                start_residue: start,
                end_residue: end,
                polymer_class,
                description: `${polymer_class} helix ${helixName} (residues ${start}-${end})`
            });
        });
    });
    
    // Sort by chain ID and helix name
    return landmarks.sort((a, b) => {
        if (a.chain_id === b.chain_id) {
            return a.name.localeCompare(b.name);
        }
        return a.chain_id.localeCompare(b.chain_id);
    });
}
