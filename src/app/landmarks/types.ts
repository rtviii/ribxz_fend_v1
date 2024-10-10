import { MolstarRibxz } from "@/components/mstar/molstar_wrapper_class";
export interface BaseLandmark {
    title          : string;
    description    : string;
    longDescription: string;
    imageUrl?      : string;
}
export interface LandmarkActions {
    download: (rcsb_id: string) => void;
    render  : (rcsb_id: string, ctx: MolstarRibxz) => void;
}

export type Landmark<T extends LandmarkActions> = BaseLandmark & T;

export interface TunnelActions extends LandmarkActions {
    download: (rcsb_id: string) => void;
    render: (rcsb_id: string, ctx: MolstarRibxz) => void;
}
export type TunnelLandmark = Landmark<TunnelActions>;

const defaultTunnelActions: LandmarkActions = {
    download: (rcsb_id: string)      => {downloadPlyFile(`${process.env.NEXT_PUBLIC_DJANGO_URL}/structures/tunnel_geometry?rcsb_id=${rcsb_id}&is_ascii=true`, `${rcsb_id}_tunnel_geometry.ply`)},
    render  : (rcsb_id: string, ctx) => { ctx?.renderPLY(rcsb_id); }
};


export function createTunnelLandmark(
    data: BaseLandmark,
    ctx: MolstarRibxz,
): TunnelLandmark {
    return {
        ...data,
        download: (rcsb_id: string) => (defaultTunnelActions.download)(rcsb_id),
        render  : (rcsb_id: string) => (defaultTunnelActions.render)(rcsb_id, ctx)
    };
}


export interface LandmarkItemProps<T extends LandmarkActions> {
    data   : Landmark<T>;
    rcsb_id: string;
}

async function downloadPlyFile(apiUrl: string, fileName: string): Promise<void> {
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