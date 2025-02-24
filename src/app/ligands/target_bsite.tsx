import {ScrollArea} from '@/components/ui/scroll-area';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import {usePanelContext} from './panels_context';
import {useAppDispatch, useAppSelector} from '@/store/store';
import {useEffect, useState} from 'react';
import {useMolstarInstance} from '@/components/mstar/mstar_service';
import {ResidueSummary, useRoutersRouterStructStructureProfileQuery} from '@/store/ribxz_api/ribxz_api';
import {fetchPredictionData, set_selected_target_structure} from '@/store/slices/slice_ligands';
import {mapAssetModelComponentsAdd} from '@/store/molstar/slice_refs';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {AlertCircle, Building2, Inbox} from 'lucide-react';
import {Button} from '@/components/ui/button';
import ResidueGrid from './residue_grid';
import {GlobalStructureSelection} from '@/components/ribxz/ribxz_structure_selection';
import {Spinner} from '@/components/ui/spinner';
import {EnhancedStructureEntity, EnhancedBindingSiteEntity} from './entity_wrapper';
import React  from 'react';
import { cn } from '@/components/utils';
import { Ellipsis } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';



const useStructureSetup = (
    selected_target_structure,
    data,
    msc_secondary,
    ctx_secondary,
    current_ligand,
    bsite_radius,
    dispatch
) => {
    const [rootRef, setRootRef] = useState(null);
    const [nomenclatureMap, setNomenclatureMap] = useState(null);
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
                const {root_ref} = await msc_secondary.loadStructure(selected_target_structure, newNomenclatureMap);
                if (!isActive) return;
                setRootRef(root_ref);

                // Only proceed with prediction if we have all required data
                if (current_ligand?.ligand.chemicalId && current_ligand?.parent_structure.rcsb_id && bsite_radius) {
                    try {
                        // Redux will automatically set prediction_pending to true via matcher
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
                            console.error('Error in prediction:', err);
                        }
                    }
                }
            } catch (err) {
                if (isActive) {
                    setError(err);
                    setRootRef(null);
                    setNomenclatureMap(null);
                    console.error('Error in structure setup:', err);
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        initializeStructure();

        return () => {
            isActive = false;
        };
    }, [selected_target_structure, data, msc_secondary, ctx_secondary, current_ligand, bsite_radius, dispatch]);

    return {
        rootRef,
        nomenclatureMap,
        isLoading,
        error,
        predictionResidues,
        predictionError
    };
};

export default function BindingSitePredictionPanel() {
    const dispatch = useAppDispatch();
    const current_ligand = useAppSelector(state => state.ligands_page.current_ligand);
    const selected_target_structure = useAppSelector(state => state.ligands_page.selected_target_structure);
    const bsite_radius = useAppSelector(state => state.ligands_page.radius);
    const isPredictionPending = useAppSelector(state => state.ligands_page.prediction_pending);
    const auxiliaryService = useMolstarInstance('auxiliary');
    const ctx_secondary = auxiliaryService?.viewer;
    const msc_secondary = auxiliaryService?.controller;

    // Structure profile query with loading state
    const {
        data,
        isLoading: isLoadingProfile,
        error: profileError
    } = useRoutersRouterStructStructureProfileQuery(
        {rcsbId: selected_target_structure},
        {skip: !selected_target_structure}
    );

    // Structure setup and prediction with loading states
    const {
        rootRef,
        nomenclatureMap,
        isLoading: isLoadingSetup,
        error: setupError,
        predictionResidues,
        predictionError
    } = useStructureSetup(
        selected_target_structure,
        data,
        msc_secondary,
        ctx_secondary,
        current_ligand,
        bsite_radius,
        dispatch
    );

    const [structureVisibility, setStructureVisibility] = useState(true);
    const [bsiteVisibility, setBsiteVisibility] = useState(true);

    if (!selected_target_structure) {
        return (
            <div className="space-y-4">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Target Structure</AlertTitle>
                    <AlertDescription>
                        Please select a target structure to view binding site predictions.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const isLoadingStructure = isLoadingProfile || isLoadingSetup;
    const structureError = profileError || setupError;

    return (
        <div className="space-y-4">
            <EnhancedStructureEntity
                isLoading={isLoadingStructure}
                error={structureError}
                icon={<Building2 size={16} />}
                loadingTitle="Loading structure information..."
                errorTitle="Error loading structure"
                className="min-w-0"
                rcsb_id={selected_target_structure}
                visible={structureVisibility}
                onToggleVisibility={() => {
                    msc_secondary?.polymers.togglePolymersVisibility(selected_target_structure, !structureVisibility);
                    setStructureVisibility(!structureVisibility);
                }}
            />

            <EnhancedBindingSiteEntity
                isLoading={isPredictionPending}
                error={predictionError}
                icon={<Inbox size={16} />}
                loadingTitle="Predicting binding site..."
                errorTitle="Error predicting binding site"
                
                rcsb_id={current_ligand?.parent_structure.rcsb_id}
                ctx_secondary={ctx_secondary}
                bsiteVisibility={bsiteVisibility}


                className="min-w-0"
                chemicalId={current_ligand?.ligand.chemicalId}
                residueCount={predictionResidues?.length ?? 0}
                visible={bsiteVisibility}
                onFocus={() => {
                    msc_secondary?.bindingSites.focusBindingSite(
                        selected_target_structure,
                        current_ligand?.ligand.chemicalId
                    );
                }}
                onToggleVisibility={() => {
                    (async () => {
                        const bsite = msc_secondary?.bindingSites.retrieveBSiteComponent(
                            selected_target_structure,
                            current_ligand.ligand.chemicalId
                        );

                        bsite &&
                            (await ctx_secondary?.ctx.dataTransaction(async () => {
                                ctx_secondary.interactions.setSubtreeVisibility(bsite.ref, !bsiteVisibility);
                            }));
                    })();
                    setBsiteVisibility(!bsiteVisibility);
                }}
                nomenclature_map={nomenclatureMap}
                onDownload={() => {
                    alert('Download not implemented');
                }}
                residues={predictionResidues ?? []}
                onResidueClick={residue => {
                    ctx_secondary?.residues.selectResidue(
                        residue.rcsb_id,
                        residue.auth_asym_id,
                        residue.auth_seq_id,
                        true
                    );
                }}
                onResidueHover={residue => {
                    ctx_secondary?.residues.highlightResidue(
                        residue.rcsb_id,
                        residue.auth_asym_id,
                        residue.auth_seq_id
                    );
                }}
            />
        </div>
    );
}
