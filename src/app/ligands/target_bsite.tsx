import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { useMolstarInstance } from '@/components/mstar/mstar_service';
import { mapAssetModelComponentsAdd } from '@/store/molstar/slice_refs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Building2 } from 'lucide-react';
import { useRoutersRouterStructStructureProfileQuery } from '@/store/ribxz_api/ribxz_api';
import { fetchPredictionData } from '@/store/slices/slice_ligands';
import { LigandPanel, BindingSitePanel, LoadingState } from './source_bsite';

// Structure setup hook specific to target context
const useTargetStructureSetup = (
    selected_target_structure,
    data,
    msc_secondary,
    ctx_secondary,
    current_ligand,
    bsite_radius,
    dispatch
) => {
    const [rootRef, setRootRef] = useState(null);
    const [nomenclatureMap, setNomenclatureMap] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [predictionResidues, setPredictionResidues] = useState(null);
    const [predictionError, setPredictionError] = useState(null);

    useEffect(() => {
        if (!selected_target_structure || !data || !msc_secondary) return;
        let isActive = true;

        const initializeStructure = async () => {
            setIsLoading(true);
            setError(null);
            setPredictionError(null);
            setPredictionResidues(null);

            try {
                // Create nomenclature map
                const newNomenclatureMap = [...data.proteins, ...data.rnas, ...data.other_polymers].reduce(
                    (prev, current) => {
                        prev[current.auth_asym_id] = current.nomenclature.length > 0 ? current.nomenclature[0] : '';
                        return prev;
                    },
                    {}
                );
                setNomenclatureMap(newNomenclatureMap);

                // Clear and load structure
                msc_secondary.clear();
                const { root_ref } = await msc_secondary.loadStructure(selected_target_structure, newNomenclatureMap);
                if (!isActive) return;
                setRootRef(root_ref);

                // Handle prediction if we have all required data
                if (current_ligand?.ligand.chemicalId && current_ligand?.parent_structure.rcsb_id && bsite_radius) {
                    try {
                        const predictionResult = await dispatch(
                            fetchPredictionData({
                                chemid: current_ligand.ligand.chemicalId,
                                src: current_ligand.parent_structure.rcsb_id,
                                tgt: selected_target_structure,
                                radius: bsite_radius
                            })
                        ).unwrap();

                        if (!isActive) return;

                        if (predictionResult) {
                            const prediction_residues = predictionResult.purported_binding_site.chains.reduce(
                                (acc, next) => [...acc, ...next.bound_residues],
                                []
                            );
                            setPredictionResidues(prediction_residues);

                            // Create visualization for predicted binding site
                            const refs = await ctx_secondary?.ligands.create_from_prediction_data(
                                selected_target_structure,
                                root_ref,
                                prediction_residues,
                                current_ligand.ligand.chemicalId,
                                newNomenclatureMap
                            );

                            if (refs && isActive) {
                                const bsiteId = `${current_ligand.ligand.chemicalId}_predicted_bsite`;
                                dispatch(
                                    mapAssetModelComponentsAdd({
                                        instanceId: 'auxiliary',
                                        rcsbId: selected_target_structure,
                                        components: {
                                            [bsiteId]: refs
                                        }
                                    })
                                );
                            }
                        }
                    } catch (err) {
                        if (isActive) {
                            setPredictionError(err);
                        }
                    }
                }
            } catch (err) {
                if (isActive) {
                    setError(err);
                    setRootRef(null);
                    setNomenclatureMap({});
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        initializeStructure();
        return () => { isActive = false; };
    }, [selected_target_structure, data, msc_secondary, ctx_secondary, current_ligand, bsite_radius, dispatch]);

    return { rootRef, nomenclatureMap, isLoading, error, predictionResidues, predictionError };
};

export default function TargetBindingSitePanel() {
    const dispatch = useAppDispatch();
    const current_ligand = useAppSelector(state => state.ligands_page.current_ligand);
    const selected_target_structure = useAppSelector(state => state.ligands_page.selected_target_structure);
    const bsite_radius = useAppSelector(state => state.ligands_page.radius);
    const isPredictionPending = useAppSelector(state => state.ligands_page.prediction_pending);

    // Use auxiliary service instead of main
    const auxiliaryService = useMolstarInstance('auxiliary');
    const ctx = auxiliaryService?.viewer;
    const msc = auxiliaryService?.controller;

    // Structure profile query
    const { data: structureData, isLoading: isLoadingProfile } = useRoutersRouterStructStructureProfileQuery(
        { rcsbId: selected_target_structure },
        { skip: !selected_target_structure }
    );

    // Structure setup with prediction handling
    const {
        rootRef,
        nomenclatureMap,
        isLoading: isLoadingSetup,
        error: setupError,
        predictionResidues,
        predictionError
    } = useTargetStructureSetup(
        selected_target_structure,
        structureData,
        msc,
        ctx,
        current_ligand,
        bsite_radius,
        dispatch
    );

    const [structureVisibility, setStructureVisibility] = useState(true);
    const [bsiteVisibility, setBsiteVisibility] = useState(true);

    // Handle download functions for the predicted binding site
    const handleDownloadJSON = async () => {
        if (!predictionResidues) return;

        try {
            const bindingSiteData = {
                purported_binding_site: {
                    chains: predictionResidues.reduce((acc, residue) => {
                        const chainIndex = acc.findIndex(c => c.chain_id === residue.auth_asym_id);
                        if (chainIndex === -1) {
                            acc.push({
                                chain_id: residue.auth_asym_id,
                                bound_residues: [residue]
                            });
                        } else {
                            acc[chainIndex].bound_residues.push(residue);
                        }
                        return acc;
                    }, [])
                },
                metadata: {
                    rcsb_id: selected_target_structure,
                    chemical_id: current_ligand.ligand.chemicalId,
                    radius: bsite_radius
                }
            };

            const blob = new Blob([JSON.stringify(bindingSiteData, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${selected_target_structure}_${current_ligand.ligand.chemicalId}_predicted_bsite.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const handleDownloadCIF = async () => {
        if (!ctx) return;

        const bsite = msc?.bindingSites.retrieveBSiteComponent(
            selected_target_structure,
            current_ligand.ligand.chemicalId
        );

        if (!bsite) return;

        const loci = ctx.loci_from_ref(bsite.sel_ref);
        if (!loci) return;

        ctx.ctx.managers.structure.selection.clear();
        ctx.ctx.managers.structure.selection.fromLoci('add', loci);
        await ctx.downloads.downloadSelection(
            `${selected_target_structure}_${current_ligand.ligand.chemicalId}_predicted_bsite.cif`
        );
        ctx.ctx.managers.structure.selection.clear();
    };

    if (!selected_target_structure) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Target Structure</AlertTitle>
                <AlertDescription>
                    Please select a target structure to view binding site predictions.
                </AlertDescription>
            </Alert>
        );
    }

    if (setupError || predictionError) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {setupError?.message || predictionError?.message || 'Failed to set up structure visualization'}
                </AlertDescription>
            </Alert>
        );
    }

    if (isLoadingProfile || isLoadingSetup || isPredictionPending) {
        return <LoadingState />;
    }

    // Add hover handlers
    const handleBSiteHover = (isEntering: boolean) => {
        if (!ctx || !msc) return;

        const bsite = msc.bindingSites.retrieveBSiteComponent(
            selected_target_structure,
            current_ligand.ligand.chemicalId
        );

        if (!bsite?.sel_ref) return;
        if (isEntering) {
            let loci = ctx.loci_from_ref(bsite.sel_ref);
            ctx.ctx.managers.interactivity.lociHighlights.highlight({ loci })
        } else {
            ctx.ctx.managers.interactivity.lociHighlights.clearHighlights()
        }
    };

    // Add check for empty prediction results
    if (predictionResidues && predictionResidues.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Matching Residues Found</AlertTitle>
                <AlertDescription>
                    No matching residues were found in the target structure. This might indicate that the evolutionary relationship between the source and target structures is too distant.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-4">
            <BindingSitePanel
                onMouseEnter={() => handleBSiteHover(true)}
                onMouseLeave={() => handleBSiteHover(false)}
                chemicalId={current_ligand.ligand.chemicalId}
                residueCount={predictionResidues?.length ?? 0}
                visible={bsiteVisibility}
                onToggleVisibility={() => {
                    const toggleVisibility = async () => {
                        const bsite = msc?.bindingSites.retrieveBSiteComponent(
                            selected_target_structure,
                            current_ligand.ligand.chemicalId
                        );

                        if (bsite && ctx) {
                            await ctx.ctx.dataTransaction(async () => {
                                ctx.interactions.setSubtreeVisibility(bsite.ref, !bsiteVisibility);
                            });
                        }
                    };
                    toggleVisibility();
                    setBsiteVisibility(!bsiteVisibility);
                }}
                onFocus={() => {
                    msc?.bindingSites.focusBindingSite(
                        selected_target_structure,
                        current_ligand.ligand.chemicalId
                    );
                }}
                onDownloadJSON={handleDownloadJSON}
                onDownloadCIF={handleDownloadCIF}
                residues={predictionResidues ?? []}
                nomenclature_map={nomenclatureMap}
                onResidueClick={residue => {
                    ctx?.residues.selectResidue(
                        residue.rcsb_id,
                        residue.auth_asym_id,
                        residue.auth_seq_id,
                        true
                    );
                }}
                onResidueHover={residue => {
                    ctx?.residues.highlightResidue(
                        residue.rcsb_id,
                        residue.auth_asym_id,
                        residue.auth_seq_id
                    );
                }}
            />
        </div>
    );
}
