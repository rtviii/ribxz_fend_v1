import { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects';
import { StateSelection } from 'molstar/lib/mol-state';
import { Structure } from 'molstar/lib/mol-model/structure';
import { PluginContext } from 'molstar/lib/mol-plugin/context';
import { to_mmCIF } from 'molstar/lib/mol-model/structure/export/mmcif';

export class DownloadHelper {
    // Create a blob from string or binary data
    static createBlob(data: string | Uint8Array): Blob {
        return new Blob([data], { type: 'chemical/x-mmcif' });
    }

    // Download the blob with a given filename
    static downloadBlob(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Get the current structure and its selection
    static getCurrentStructureAndSelection(plugin: PluginContext): { structure: Structure, selectionStructure: Structure } | undefined {
        const state = plugin.state.data;
        const structures = state.select(StateSelection.Generators.rootsOfType(PluginStateObject.Molecule.Structure));
        
        if (structures.length === 0 || !structures[0].obj) return undefined;
        const structure = structures[0].obj.data;
        
        const selection = plugin.managers.structure.selection.getStructure(structure);
        if (!selection) return undefined;
        
        return {
            structure,
            selectionStructure: selection
        };
    }
}

// Add these methods to your ribxzMstarv2 class

