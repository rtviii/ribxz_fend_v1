import {
    BsiteComponent,
    LigandComponent,
    mapAssetModelComponentsAdd,
    mapAssetRootRefAdd,
    mapResetAll,
    mapResetInstance,
    MolstarInstanceId,
    PolymerComponent,
    selectComponentsByType,
    selectComponentsForRCSB
} from '@/store/molstar/slice_refs';
import {ribxzMstarv2} from './mstar_v2';
import {AppDispatch, RootState} from '@/store/store';
import {ConstrictionSite, PtcInfo} from '@/store/ribxz_api/ribxz_api';
import {
    initializePolymerStates,
    setBatchPolymerVisibility,
    setPolymerHovered,
    setPolymerSelected,
    setPolymerVisibility
} from '@/store/slices/slice_polymer_states';
import {InteractionManagerConfig, MolstarEventHandlers} from './mstar_interactions';
import {StructureElement, StructureProperties} from 'molstar/lib/mol-model/structure';
import {InteractivityManager} from 'molstar/lib/mol-plugin-state/manager/interactivity';

export class MolstarStateController {
    private viewer: ribxzMstarv2;
    private dispatch: AppDispatch;
    private getState: () => RootState;
    private instanceId: MolstarInstanceId;

    constructor(
        molstarViewer: ribxzMstarv2,
        dispatch: AppDispatch,
        getState: () => RootState,
        instanceId: MolstarInstanceId
    ) {
        this.viewer = molstarViewer;
        this.dispatch = dispatch;
        this.getState = getState;
        this.instanceId = instanceId;
    }

    private setupSelectionHandling() {
        this.viewer.ctx.behaviors.interaction.click.subscribe((e: InteractivityManager.HoverEvent) => {
            if (e.current && e.current.loci && e.current.loci.kind !== 'empty-loci') {
                const element = this.getLociDetails(e.current.loci);
                if (element?.auth_asym_id) {
                    const state = this.getState();
                    const rcsb_id = Object.keys(state.mstar_refs.instances[this.instanceId].rcsb_id_components_map)[0];

                    this.dispatch(
                        setPolymerSelected({
                            rcsb_id,
                            auth_asym_id: element.auth_asym_id,
                            selected: true
                        })
                    );
                }
            }
        });
    }

    private getElementDetails(location: StructureElement.Location) {
        return {
            entity_id: StructureProperties.chain.label_entity_id(location),
            label_asym_id: StructureProperties.chain.label_asym_id(location),
            auth_asym_id: StructureProperties.chain.auth_asym_id(location),
            seq_id: StructureProperties.residue.label_seq_id(location),
            auth_seq_id: StructureProperties.residue.auth_seq_id(location),
            comp_id: StructureProperties.atom.label_comp_id(location)
        };
    }

    private getLociDetails(loci: any) {
        if (loci.kind === 'element-loci') {
            const stats = StructureElement.Stats.ofLoci(loci);
            const {elementCount, residueCount, chainCount} = stats;

            if (elementCount === 1 && residueCount === 0 && chainCount === 0) {
                return this.getElementDetails(stats.firstElementLoc);
            } else if (elementCount === 0 && residueCount === 1 && chainCount === 0) {
                return this.getElementDetails(stats.firstResidueLoc);
            }
        }
        return null;
    }

    mute_polymers = async (rcsb_id: string) => {
        // Get only polymer components using the new selector
        const polymerComponents = selectComponentsForRCSB(this.getState(), {
            instanceId: this.instanceId,
            rcsbId: rcsb_id,
            componentType: 'polymer'
        });

        for (const component of polymerComponents) {
            this.viewer.interactions.setSubtreeVisibility(component.ref, false);
        }
    };

    clear = async () => {
        this.dispatch(mapResetInstance({instanceId: this.instanceId}));
        this.viewer.ctx.clear();
    };

    landmarks = {
        ptc: async (rcsb_id: string) => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_URL}/structures/ptc?rcsb_id=${rcsb_id}`);
            const data: PtcInfo = await response.json();
            this.viewer.landmarks.ptc(data.location);
        },
        constriction_site: async (rcsb_id: string) => {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_DJANGO_URL}/structures/constriction_site?rcsb_id=${rcsb_id}`
            );
            const data: ConstrictionSite = await response.json();
            this.viewer.landmarks.constriction_site(data.location);
        }
    };

    async loadStructure(rcsb_id: string, nomenclature_map: Record<string, string>) {
        rcsb_id = rcsb_id.toUpperCase();
        const {root_ref, repr_ref, objects_polymer, objects_ligand} =
            await this.viewer.components.upload_mmcif_structure(rcsb_id, nomenclature_map);

        // Process polymer components
        const polymerComponents = Object.entries(objects_polymer).reduce((acc, [localId, component]) => {
            acc[localId] = {
                type: 'polymer' as const,
                rcsb_id,
                ref: component.ref,
                auth_asym_id: localId,
                sequence: component.sequence
            };
            return acc;
        }, {} as Record<string, PolymerComponent>);

        // Process ligand components
        const ligandComponents = Object.entries(objects_ligand).reduce((acc, [localId, component]) => {
            acc[localId] = {
                type: 'ligand' as const,
                rcsb_id,
                ref: component.ref,
                chemicalId: localId
            };
            return acc;
        }, {} as Record<string, LigandComponent>);

        // Combine all components
        const allComponents = {
            ...polymerComponents,
            ...ligandComponents
        };

        // Add root ref to store
        this.dispatch(
            mapAssetRootRefAdd({
                instanceId: this.instanceId,
                payload: [rcsb_id, root_ref]
            })
        );

        // Add components to store
        this.dispatch(
            mapAssetModelComponentsAdd({
                instanceId: this.instanceId,
                rcsbId: rcsb_id,
                components: allComponents
            })
        );

        // Initialize polymer states (if you still need this)
        const polymerStateComponents = Object.keys(objects_polymer).map(localId => ({
            auth_asym_id: localId,
            rcsb_id
        }));
        this.dispatch(initializePolymerStates(polymerStateComponents));

        return {root_ref, repr_ref, components: allComponents};
    }

    async addBindingSite(
        rcsb_id: string,
        chemicalId: string,
        siteData: {ref: string; repr_ref: string; sel_ref: string}
    ) {
        const bsiteComponent: BsiteComponent = {
            type: 'bsite',
            rcsb_id,
            chemicalId,
            ref: siteData.ref,
            repr_ref: siteData.repr_ref,
            sel_ref: siteData.sel_ref
        };

        // Create a unique ID for the binding site
        const bsiteId = `${chemicalId}_bsite`;

        this.dispatch(
            mapAssetModelComponentsAdd({
                instanceId: this.instanceId,
                rcsbId: rcsb_id,
                components: {[bsiteId]: bsiteComponent}
            })
        );

        return bsiteComponent;
    }

    retrievePolymerRef(localId: string): string | undefined {
        return this.getState().mstar_refs.instances[this.instanceId].components[localId]?.ref;
    }

    polymers = {
        focusPolymerComponent: async (rcsb_id: string, auth_asym_id: string) => {
            const ref = this.retrievePolymerRef(auth_asym_id);
            ref && this.viewer.interactions.focus(ref);
        },
        togglePolymersVisibility: async (rcsb_id: string, visible: boolean) => {
            // Get only polymer components using our type discriminator
            const polymerComponents = selectComponentsForRCSB(this.getState(), {
                instanceId   : this.instanceId,
                rcsbId       : rcsb_id,
                componentType: 'polymer'
            });

            await this.viewer.ctx.dataTransaction(async () => {
                // Update visibility for all polymer components
                for (const component of polymerComponents) {
                    this.viewer.interactions.setSubtreeVisibility(component.ref, visible);
                }

                // Batch update visibility states in Redux if you're tracking them
                const visibilityUpdates = polymerComponents.map(component => ({
                    rcsb_id,
                    auth_asym_id: component.auth_asym_id,
                    visible
                }));

                this.dispatch(setBatchPolymerVisibility(visibilityUpdates));
            });
        },

        highlightPolymerComponent: async (rcsb_id: string, auth_asym_id: string) => {
            const ref = this.retrievePolymerRef(auth_asym_id);
            ref && this.viewer.interactions.highlight(ref);
        },
        isolatePolymer: async (rcsb_id: string, target_auth_asym_id: string) => {
            await this.viewer.ctx.dataTransaction(async () => {
                const componentIds =
                    this.getState().mstar_refs.instances[this.instanceId].rcsb_id_components_map[rcsb_id] || [];

                const visibilityUpdates = componentIds.map(localId => ({
                    auth_asym_id: localId,
                    visible: localId === target_auth_asym_id
                }));

                visibilityUpdates.forEach(({auth_asym_id, visible}) => {
                    const component = this.getState().mstar_refs.instances[this.instanceId].components[auth_asym_id];
                    if (component?.ref) {
                        this.viewer.interactions.setSubtreeVisibility(component.ref, visible);
                    }
                });

                this.dispatch(setBatchPolymerVisibility(visibilityUpdates));

                const targetComponent =
                    this.getState().mstar_refs.instances[this.instanceId].components[target_auth_asym_id];
                if (targetComponent?.ref) {
                    this.viewer.interactions.focus(targetComponent.ref);
                }
            });
        },

        setPolymerVisibility: async (rcsb_id: string, auth_asym_id: string, is_visible: boolean) => {
            const ref = this.retrievePolymerRef(auth_asym_id);
            if (ref) {
                this.viewer.interactions.setSubtreeVisibility(ref, is_visible);
                this.dispatch(setPolymerVisibility({rcsb_id, auth_asym_id, visible: is_visible}));
            }
        },

        selectPolymerComponent: async (rcsb_id: string, auth_asym_id: string, selected: boolean) => {
            const ref = this.retrievePolymerRef(auth_asym_id);
            if (ref) {
                this.viewer.interactions.selection(ref, selected ? 'add' : 'remove');
                this.dispatch(setPolymerSelected({rcsb_id, auth_asym_id, selected}));
            }
        },

        restoreAllVisibility: async (rcsb_id: string) => {
            const componentIds =
                this.getState().mstar_refs.instances[this.instanceId].rcsb_id_components_map[rcsb_id] || [];

            const visibilityUpdates = componentIds.map(localId => ({
                rcsb_id,
                auth_asym_id: localId,
                visible: true
            }));

            // Batch update Molstar state
            visibilityUpdates.forEach(({auth_asym_id, visible}) => {
                const ref = this.retrievePolymerRef(auth_asym_id);
                if (ref) {
                    this.viewer.interactions.setSubtreeVisibility(ref, visible);
                }
            });

            // Batch update Redux state
            this.dispatch(setBatchPolymerVisibility(visibilityUpdates));
        },

        handleUIHover: async (rcsb_id: string, auth_asym_id: string, isHovered: boolean) => {
            if (isHovered) {
                const ref = this.retrievePolymerRef(auth_asym_id);
                ref && this.viewer.interactions.highlight(ref);

                this.dispatch(
                    setPolymerHovered({
                        rcsb_id,
                        auth_asym_id,
                        hovered: true
                    })
                );
            } else {
                const ref = this.retrievePolymerRef(auth_asym_id);
                if (ref) {
                    this.viewer.ctx.managers.interactivity.lociHighlights.clearHighlights();

                    this.dispatch(
                        setPolymerHovered({
                            rcsb_id,
                            auth_asym_id,
                            hovered: false
                        })
                    );
                }
            }
        },

        handleUISelect: async (rcsb_id: string, auth_asym_id: string, isSelected: boolean) => {
            const ref = this.retrievePolymerRef(auth_asym_id);
            if (ref) {
                this.viewer.interactions.selection(ref, isSelected ? 'add' : 'remove');
                this.dispatch(
                    setPolymerSelected({
                        rcsb_id,
                        auth_asym_id,
                        selected: isSelected
                    })
                );
            }
        }
    };
    bindingSites = {
        // Get the binding site component using our new type-safe selectors
        retrieveBSiteComponent: (rcsb_id: string, chemicalId: string): BsiteComponent | undefined => {
            return selectComponentsByType(this.getState(), {
                instanceId: this.instanceId,
                componentType: 'bsite'
            }).find(component => component.rcsb_id === rcsb_id && component.chemicalId === chemicalId);
        },

        // Focus on a binding site
        focusBindingSite: async (rcsb_id: string, chemicalId: string) => {
            const bsite = this.bindingSites.retrieveBSiteComponent(rcsb_id, chemicalId);
            console.log('returned bsite ', bsite);

            if (bsite) {
                // Could use either the main ref or sel_ref depending on your needs

                this.viewer.interactions.focus(bsite.sel_ref);
            }
        },

        // Highlight a binding site
        highlightBindingSite: async (rcsb_id: string, chemicalId: string) => {
            const bsite = this.bindingSites.retrieveBSiteComponent(rcsb_id, chemicalId);
            if (bsite) {
                this.viewer.interactions.highlight(bsite.sel_ref);
            }
        },

        // Toggle binding site visibility
        setBindingSiteVisibility: async (rcsb_id: string, chemicalId: string, isVisible: boolean) => {
            const bsite = this.bindingSites.retrieveBSiteComponent(rcsb_id, chemicalId);
            if (bsite) {
                // You might want to toggle both the representation and selection
                this.viewer.interactions.setSubtreeVisibility(bsite.repr_ref, isVisible);
                this.viewer.interactions.setSubtreeVisibility(bsite.sel_ref, isVisible);
            }
        },

        // Isolate a binding site (hide everything else)
        isolateBindingSite: async (rcsb_id: string, chemicalId: string) => {
            await this.viewer.ctx.dataTransaction(async () => {
                // First hide all components
                const allComponents = Object.values(this.getState().mstar_refs.instances[this.instanceId].components);

                for (const component of allComponents) {
                    this.viewer.interactions.setSubtreeVisibility(component.ref, false);
                }

                // Then show just the binding site
                const bsite = this.bindingSites.retrieveBSiteComponent(rcsb_id, chemicalId);
                if (bsite) {
                    this.viewer.interactions.setSubtreeVisibility(bsite.repr_ref, true);
                    this.viewer.interactions.setSubtreeVisibility(bsite.sel_ref, true);
                    this.viewer.interactions.focus(bsite.sel_ref);
                }
            });
        }
    };

    async applyStylizedLighting() {
        await this.viewer.representations.stylized_lighting();
    }

    ligands = {
        get_ligand_surroundings: async (struct_ref: string, chemicalId: string, radius: number) => {
            // Make sure any structs/components being accessed inside get_selection_constituents
            // are using the correct instance
            return await this.viewer.get_selection_constituents(struct_ref, chemicalId, radius);
        }
    };

    experimental = {
        cylinder_residues: async (nomenclature_map: Record<string, string> | null) => {
            if (!nomenclature_map) return;
            const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_URL}/structures/cylinder_residues`);
            const data = await response.json();
            const struct_ref = Object.values(
                this.getState().mstar_refs.instances[this.instanceId].rcsb_id_root_ref_map
            )[0];
            this.viewer.experimental.___cylinder_residues(struct_ref, data, nomenclature_map);
        },
        half_cylinder_residues: async (nomenclature_map: Record<string, string> | null) => {
            if (!nomenclature_map) return;
            const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_URL}/structures/half_cylinder_residues`);
            const data = await response.json();
            const struct_ref = Object.values(this.getState().mstar_refs.instances.main.rcsb_id_root_ref_map)[0];
            // this.viewer.experimental.cylinder_residues(struct_ref, data, nomenclature_map);
            this.viewer.experimental.___cylinder_residues(struct_ref, data, nomenclature_map);
        }
    };
}
