import { extend } from "lodash";
import { Loci } from "molstar/lib/mol-model/loci";

export interface LandmarkActions {
  download?: (rcsb_id: string) => void;
  render?: (rcsb_id: string, ctx: any) => void;
  on_click?: () => void;
  seldesel?: (_: boolean) => void;
}
export interface Landmark {
  landmark_actions: LandmarkActions;
  title: string;
  description: string;
  longDescription: string;
  imageUrl?: string;
  rcsb_id: string;
}




export async function downloadPlyFile(apiUrl: string, fileName: string): Promise<void> {
  try {
    // Fetch the file from the API
    const response = await fetch(apiUrl);

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the file content as a Blob
    const blob = await response.blob();

    // Create a URL for the Blob
    const url = window.URL.createObjectURL(blob);

    // Create a temporary anchor element
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;

    // Set the file name
    a.download = fileName.endsWith('.ply') ? fileName : `${fileName}.ply`;

    // Append the anchor to the body
    document.body.appendChild(a);

    // Trigger the download
    a.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
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