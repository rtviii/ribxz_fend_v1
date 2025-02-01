import {StructureRepresentationPresetProvider} from 'molstar/lib/mol-plugin-state/builder/structure/representation-preset';
import {ResidueIndex, Structure, StructureProperties, Unit} from 'molstar/lib/mol-model/structure';
import {MolScriptBuilder as MS} from 'molstar/lib/mol-script/language/builder';
import {StateObjectRef, StateObjectSelector} from 'molstar/lib/mol-state';
import {PluginStateObject} from 'molstar/lib/mol-plugin-state/objects';
import {ParamDefinition as PD} from 'molstar/lib/mol-util/param-definition';
import {Color} from 'molstar/lib/mol-util/color';
import {ResidueData} from '@/app/components/sequence_viewer';

export const bindingSitesPreset = StructureRepresentationPresetProvider({
    id: 'binding-sites-preset',
    display: {
        name: 'Binding Sites',
        group: 'ribxz',
        description: 'Creates components for each binding site'
    },
    params: () => ({
        ...StructureRepresentationPresetProvider.CommonParams,
        bindingSites: PD.Value<
            Array<{
                chemicalId: string;
                purported_7K00_binding_site: Array<[string, number]>;
            }>
        >([])
    }),
    async apply(ref, params, plugin) {
        const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        if (!structureCell) return {};
        const structure = structureCell.obj!.data;

        console.log('Running preset');

        const {update, builder} = StructureRepresentationPresetProvider.reprBuilder(plugin, params, structure);

        const components: {[k: string]: StateObjectSelector | undefined} = {};
        const representations: {[k: string]: StateObjectSelector | undefined} = {};

        // Create components for each binding site
        for (const site of params.bindingSites) {
            console.log('Running site', site);
            if (!site.purported_7K00_binding_site) {
                console.log('Skipping site', site);

                continue;
            }

            const {chemicalId, purported_7K00_binding_site} = site;

            // Create selection expression for this binding site
            const groups = purported_7K00_binding_site.map(([chain, residue]) =>
                MS.struct.generator.atomGroups({
                    'chain-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_asym_id(), chain]),
                    'residue-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_seq_id(), residue])
                })
            );

            const bindingSiteSelection = MS.struct.combinator.merge(groups);

            // Create component
            const component = await plugin.builders.structure.tryCreateComponentFromExpression(
                ref,
                bindingSiteSelection,
                `bsite_${chemicalId}`,
                {
                    label: `Binding Site ${chemicalId}`,
                    tags: [`bsite_${chemicalId}`]
                }
            );

            if (component) {
                // Add representation
                const representation = await plugin.builders.structure.representation.addRepresentation(component, {
                    type: 'ball-and-stick',
                    color: 'uniform',
                    colorParams: {
                        value: Color(0xe24e1b)
                    }
                });

                components[chemicalId] = component;
                representations[chemicalId] = representation;
            }
        }

        await update.commit({revertOnError: true});

        return {
            components,
            representations
        };
    }
});

// const categoryColors = {
//     'Aminocyclitols': Color(0xe24e1b),
//     'Lincosamides': Color(0x4287f5),
//     'Ketolides': Color(0x42f554),
//     'Macrolides': Color(0xf542f2),
//     'Oxazolidinones': Color(0xf5d742),
//     'Phenicols': Color(0x42f5f2),
//     'Streptogramins': Color(0xf54242)
// };

const categoryColors = {
    // Aminosugar-based (warm oranges)
    Aminoglycosides: Color(0xe8916b), // Muted coral orange
    Aminocyclitols: Color(0xd4775e), // Faded terracotta
    Fluoroquinolones: Color(0x5c6bc0), // Bright indigo (kept as is)
    Macrolides: Color(0x00bcd4), // Bright cyan
    Ketolides: Color(0x00acc1), // Deeper cyan
    Lincosamides: Color(0x0288d1), // Bright blue (kept as is)
    Streptogramins: Color(0xff8a65), // Soft coral
    Pleuromutilins: Color(0x2e7d32), // Forest green
    Oxazolidinones: Color(0xffb74d), // Muted gold
    Tetracyclines: Color(0x2e7d32) // Forest green
};

// Type for our processed data
interface CategoryData {
    items: Array<{
        chemicalId: string;
        chemicalName: string;
        purported_7K00_binding_site: Array<[string, number]>;
    }>;
    composite_bsite: Array<[string, number]>;
}

interface ProcessedData {
    [category: string]: CategoryData;
}

export const compositeBSitesPreset = StructureRepresentationPresetProvider({
    id: 'composite-bsites-preset',
    display: {
        name: 'Composite Binding Sites',
        group: 'ribxz',
        description: 'Creates components for composite binding sites from each category'
    },
    params: () => ({
        ...StructureRepresentationPresetProvider.CommonParams,
        processedData: PD.Value<ProcessedData>({})
    }),
    async apply(ref, params, plugin) {
        const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        if (!structureCell) return {};
        const structure = structureCell.obj!.data;

        console.log('Running composite binding sites preset');

        const {update, builder} = StructureRepresentationPresetProvider.reprBuilder(plugin, params, structure);

        const components: {[k: string]: StateObjectSelector | undefined} = {};
        const representations: {[k: string]: StateObjectSelector | undefined} = {};

        // Process each category
        for (const [category, data] of Object.entries(params.processedData)) {
            // Skip aminoglycosides and "other" categories
            if (category === 'Aminoglycosides' || category === 'Other') continue;

            if (!data.composite_bsite || data.composite_bsite.length === 0) {
                console.log(`Skipping ${category} - no composite binding site`);
                continue;
            }

            // Create selection expression for this category's composite binding site
            const groups = data.composite_bsite.map(([chain, residue]) =>
                MS.struct.generator.atomGroups({
                    'chain-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_asym_id(), chain]),
                    'residue-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_seq_id(), residue])
                })
            );

            const bindingSiteSelection = MS.struct.combinator.merge(groups);

            // Create component
            const component = await plugin.builders.structure.tryCreateComponentFromExpression(
                ref,
                bindingSiteSelection,
                `composite_${category}`,
                {
                    label: `${category} Composite Site`,
                    tags: [`composite_${category}`]
                }
            );

            if (component) {
                const representation = await plugin.builders.structure.representation.addRepresentation(component, {

                    type       : 'ball-and-stick',
                    color      : 'uniform',
                    colorParams: {
                        value: categoryColors[category] || Color(0x808080) // Default gray if category not found
                    },
                    typeParams:{
                        emissive: 0.15
                    }
                });

                components[category] = component;
                representations[category] = representation;
            }
        }

        await update.commit({revertOnError: true});

        return {
            components,
            representations
        };
    }
});
