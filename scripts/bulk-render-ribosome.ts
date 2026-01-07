import gl from 'gl';
import pngjs from 'pngjs';
import jpegjs from 'jpeg-js';
import { HeadlessPluginContext } from 'molstar/lib/mol-plugin/headless-plugin-context';
import { DefaultPluginSpec } from 'molstar/lib/mol-plugin/spec';
import * as fs from 'fs';
import * as path from 'path';
import { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects';
import { structureLayingTransform, changeCameraRotation } from 'molstar/lib/mol-plugin-state/manager/focus-camera/orient-axes';
import { Color } from 'molstar/lib/mol-util/color';
import { SplitPolymerPreset } from '@/components/mstar/providers/polymer_preset';

/**
 * Postprocessing configuration for stylized lighting
 * Use this for both frontend canvas settings and headless rendering
 */
export const STYLIZED_POSTPROCESSING = {
    outline: {
        name: 'on' as const,
        params: {
            scale: 1,
            color: Color(0x000000),
            threshold: 0.33,
            includeTransparent: true
        }
    },
    occlusion: {
        name: 'on' as const,
        params: {
            multiScale: { name: 'off' as const, params: {} },
            radius: 5,
            bias: 0.8,
            blurKernelSize: 15,
            blurDepthBias: 0.5,
            samples: 32,
            resolutionScale: 1,
            color: Color(0x000000)
        }
    },
    shadow: {
        name: 'off' as const,
        params: {}
    }
};

// ============================================================
// CONFIGURATION - Adjust these as needed
// ============================================================

const CONFIG = {
    // Image dimensions
    IMAGE_WIDTH: 1920,
    IMAGE_HEIGHT: 1080,

    // Rendering settings
    TRANSPARENT_BACKGROUND: true,
    MULTISAMPLE_LEVEL: 4,  // Anti-aliasing quality (2, 4, or 8)

    // Performance
    DEFAULT_CONCURRENCY: 4,

    // Output
    DEFAULT_OUTPUT_DIR: './public/thumbnails',
    IMAGE_FORMAT: 'png' as const,  // 'png' or 'jpeg'
    JPEG_QUALITY: 90,  // Only used if format is 'jpeg'

    // Backend
    BACKEND_URL: 'http://127.0.0.1:8000',
} as const;

// ============================================================

interface RenderResult {
    pdbId: string;
    success: boolean;
    error?: string;
    duration: number;
}

async function createPlugin(): Promise<HeadlessPluginContext> {
    const externalModules = { gl, pngjs, 'jpeg-js': jpegjs };
    const spec = DefaultPluginSpec();

    const plugin = new HeadlessPluginContext(
        externalModules,
        spec,
        {
            width: CONFIG.IMAGE_WIDTH,
            height: CONFIG.IMAGE_HEIGHT
        },
        {
            // Configure transparent background and quality settings
            imagePass: {
                transparentBackground: CONFIG.TRANSPARENT_BACKGROUND,
                cameraHelper: {
                    axes: { name: 'off', params: {} },
                },
                multiSample: {
                    mode: 'on',
                    sampleLevel: CONFIG.MULTISAMPLE_LEVEL,
                }
            }
        }
    );

    await plugin.init();
    plugin.builders.structure.representation.registerPreset(SplitPolymerPreset);

    return plugin;
}

async function renderStructure(
    plugin: HeadlessPluginContext,
    pdbId: string,
    outputPath: string
): Promise<RenderResult> {
    const startTime = Date.now();

    try {
        // Fetch ribosome structure profile from Django backend
        console.log(`[Backend] Fetching profile for ${pdbId}...`);
        const backendUrl = `${CONFIG.BACKEND_URL}/structures/profile?rcsb_id=${pdbId}`;

        const response = await fetch(backendUrl);
        if (!response.ok) {
            throw new Error(`Backend fetch failed: ${response.status} ${response.statusText}`);
        }

        // Find this section in the script (around line 150-160):
        const profileData = await response.json();

        // Replace the nomenclature map extraction with:
        let nomenclatureMap: Record<string, string[]> = {};

        // Extract from proteins
        if (profileData.proteins && Array.isArray(profileData.proteins)) {
            for (const protein of profileData.proteins) {
                if (protein.auth_asym_id && protein.nomenclature) {
                    nomenclatureMap[protein.auth_asym_id] = protein.nomenclature;
                }
            }
        }

        // Extract from RNAs
        if (profileData.rnas && Array.isArray(profileData.rnas)) {
            for (const rna of profileData.rnas) {
                if (rna.auth_asym_id && rna.nomenclature) {
                    nomenclatureMap[rna.auth_asym_id] = rna.nomenclature;
                }
            }
        }

        if (Object.keys(nomenclatureMap).length === 0) {
            console.warn(`  ⚠️  ${pdbId}: No nomenclature found in profile`);
        } else {
            console.log(`  ✓ Extracted nomenclature for ${Object.keys(nomenclatureMap).length} chains`);
        }
        // Download and parse structure
        const data = await plugin.builders.data.download({
            url: `https://files.rcsb.org/download/${pdbId}.cif`,
            isBinary: false
        });

        const trajectory = await plugin.builders.structure.parseTrajectory(data, 'mmcif');
        const model = await plugin.builders.structure.createModel(trajectory);
        const structure = await plugin.builders.structure.createStructure(model);

        // Apply ribosome preset with nomenclature map
        await plugin.builders.structure.representation.applyPreset(
            structure,
            'polymers-ligand-ribxz-theme',
            {
                structureId: pdbId,
                nomenclature_map: nomenclatureMap
            }
        );

        // Set ignoreLight on all representations
        const update = plugin.state.data.build();
        const representations = plugin.state.data.selectQ(q =>
            q.ofType(PluginStateObject.Molecule.Structure.Representation3D)
        );

        for (const repr of representations) {
            update.to(repr).update(old => {
                if (old.type?.params) {
                    old.type.params.ignoreLight = true;
                }
            });
        }

        await update.commit();

        // Set ignoreLight on manager
        plugin.managers.structure.component.setOptions({
            ...plugin.managers.structure.component.state.options,
            ignoreLight: true
        });

        // Optimize camera orientation
        const structCells = plugin.state.data.selectQ(q =>
            q.ofType(PluginStateObject.Molecule.Structure)
        );
        const structures = structCells
            .filter(cell => cell.obj && !cell.obj.data.parent)
            .map(cell => cell.obj!.data);

        if (structures.length > 0 && plugin.canvas3d) {
            const { rotation } = structureLayingTransform(structures);
            const currentSnapshot = plugin.canvas3d.camera.getSnapshot();
            const newSnapshot = changeCameraRotation(currentSnapshot, rotation);
            plugin.canvas3d.camera.setState(newSnapshot);
        }

        // Ensure output directory exists
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });

        // Render and save with configured settings
        await plugin.saveImage(
            outputPath,
            {
                width: CONFIG.IMAGE_WIDTH,
                height: CONFIG.IMAGE_HEIGHT
            },
            STYLIZED_POSTPROCESSING,
            CONFIG.IMAGE_FORMAT,
            CONFIG.JPEG_QUALITY
        );

        // Clear for next structure
        await plugin.clear();

        const duration = Date.now() - startTime;
        return { pdbId, success: true, duration };

    } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { pdbId, success: false, error: errorMessage, duration };
    }
}

async function processQueue(
    pdbIds: string[],
    concurrency: number,
    outputDir: string
): Promise<RenderResult[]> {
    const results: RenderResult[] = [];
    const total = pdbIds.length;
    let completed = 0;

    // Create a queue of tasks
    const queue = [...pdbIds];

    // Worker function
    const worker = async (workerId: number): Promise<void> => {
        // Each worker gets its own plugin instance
        const plugin = await createPlugin();

        try {
            while (queue.length > 0) {
                const pdbId = queue.shift();
                if (!pdbId) break;

                const outputPath = path.join(outputDir, `${pdbId}.${CONFIG.IMAGE_FORMAT}`);

                console.log(`[Worker ${workerId}] Processing ${pdbId} (${completed + 1}/${total})...`);

                const result = await renderStructure(plugin, pdbId, outputPath);
                results.push(result);
                completed++;

                if (result.success) {
                    console.log(`[Worker ${workerId}] ✅ ${pdbId} (${(result.duration / 1000).toFixed(1)}s)`);
                } else {
                    console.error(`[Worker ${workerId}] ❌ ${pdbId}: ${result.error}`);
                }
            }
        } finally {
            // Clean up plugin
            plugin.dispose();
        }
    };

    // Start workers
    const workers = Array.from({ length: concurrency }, (_, i) => worker(i + 1));
    await Promise.all(workers);

    return results;
}

async function main() {
    const args = process.argv.slice(2);

    // Parse arguments
    let pdbIds: string[] = [];
    let concurrency = CONFIG.DEFAULT_CONCURRENCY;
    let outputDir = CONFIG.DEFAULT_OUTPUT_DIR;
    let backendUrl = CONFIG.BACKEND_URL;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--list' && args[i + 1]) {
            const fileContent = fs.readFileSync(args[i + 1], 'utf-8');
            pdbIds = fileContent
                .split('\n')
                .map(id => id.trim().toUpperCase())
                .filter(id => id.length === 4);
            i++;
        } else if (args[i] === '--concurrency' && args[i + 1]) {
            concurrency = parseInt(args[i + 1], 10);
            i++;
        } else if (args[i] === '--output' && args[i + 1]) {
            outputDir = args[i + 1];
            i++;
        } else if (args[i] === '--backend' && args[i + 1]) {
            backendUrl = args[i + 1];
            i++;
        } else if (args[i].length === 4) {
            pdbIds.push(args[i].toUpperCase());
        }
    }

    if (pdbIds.length === 0) {
        console.error('Usage: npm run render:ribosome [options] <pdb_id1> [pdb_id2] ...');
        console.error('');
        console.error('Options:');
        console.error('  --list <file>         Read PDB IDs from file (one per line)');
        console.error('  --concurrency <n>     Number of parallel renders (default: 4)');
        console.error('  --output <dir>        Output directory (default: ./public/thumbnails)');
        console.error('  --backend <url>       Backend API URL (default: http://127.0.0.1:8000)');
        console.error('');
        console.error('Examples:');
        console.error('  npm run render:ribosome 5AFI 6WVR 4O2B');
        console.error('  npm run render:ribosome --list ribosome_structures.txt --concurrency 8');
        console.error('  npm run render:ribosome --list structures.txt --output ./images --concurrency 4');
        console.error('  npm run render:ribosome --backend http://localhost:8000 5AFI');
        console.error('');
        console.error('Current configuration:');
        console.error(`  Resolution: ${CONFIG.IMAGE_WIDTH}x${CONFIG.IMAGE_HEIGHT}`);
        console.error(`  Transparent background: ${CONFIG.TRANSPARENT_BACKGROUND}`);
        console.error(`  Multisample level: ${CONFIG.MULTISAMPLE_LEVEL}`);
        console.error(`  Format: ${CONFIG.IMAGE_FORMAT}`);
        console.error(`  Backend: ${backendUrl}`);
        process.exit(1);
    }

    console.log('\n' + '='.repeat(60));
    console.log(`🧬 Ribosome Bulk Renderer`);
    console.log(`   Structures: ${pdbIds.length}`);
    console.log(`   Concurrency: ${concurrency}`);
    console.log(`   Resolution: ${CONFIG.IMAGE_WIDTH}x${CONFIG.IMAGE_HEIGHT}`);
    console.log(`   Transparent: ${CONFIG.TRANSPARENT_BACKGROUND}`);
    console.log(`   Format: ${CONFIG.IMAGE_FORMAT}`);
    console.log(`   Output: ${outputDir}`);
    console.log(`   Backend: ${backendUrl}`);
    console.log('='.repeat(60) + '\n');

    const startTime = Date.now();

    // Process with parallelization
    const results = await processQueue(pdbIds, concurrency, outputDir);

    const totalTime = (Date.now() - startTime) / 1000;
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const avgTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length / 1000;

    console.log('\n' + '='.repeat(60));
    console.log(`✨ Complete!`);
    console.log(`   ✅ Successful: ${successful}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⏱️  Total time: ${totalTime.toFixed(1)}s`);
    console.log(`   📊 Avg per structure: ${avgTime.toFixed(1)}s`);
    console.log(`   📁 Output: ${path.resolve(outputDir)}`);
    console.log('='.repeat(60) + '\n');

    if (failed > 0) {
        console.log('Failed structures:');
        results.filter(r => !r.success).forEach(r => {
            console.log(`  - ${r.pdbId}: ${r.error}`);
        });
    }
}

main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
});
