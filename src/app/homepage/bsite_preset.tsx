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
