import { MolstarRibxz } from "@/components/mstar/molstar_wrapper_class";
import { extend } from "lodash";
import { Loci } from "molstar/lib/mol-model/loci";

export interface LandmarkActions{
  download?: (rcsb_id: string) => void;
  render  ?: (rcsb_id: string, ctx: MolstarRibxz) => void;
  on_click?: () => void;
  seldesel?: (_:boolean) => void;
}
export interface Landmark {
  landmark_actions : LandmarkActions;
  title            : string;
  description      : string;
  longDescription  : string;
  imageUrl        ?: string;
  rcsb_id          : string;
}





// export function createTunnelLandmark(
// data: LandmarkData,
// ctx : MolstarRibxz,
// )   : Landmark {
//   return {
//     ...data,
//     download: (rcsb_id: string) => (defaultTunnelActions.download)(rcsb_id),
//     render  : (rcsb_id: string) => (defaultTunnelActions.render)(rcsb_id, ctx)
//   };
// }



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