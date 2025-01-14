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
import {Button} from '@/components/ui/button';
import ResidueGrid from './residue_grid';
import {GlobalStructureSelection} from '@/components/ribxz/ribxz_structure_selection';
import {Spinner} from '@/components/ui/spinner';
import {StructureEntity} from './entity_structure';
import {BindingSiteEntity} from './entity_bsite';

export default function BindingSitePredictionPanel({}) {
    const dispatch = useAppDispatch();
    const current_ligand = useAppSelector(state => state.ligands_page.current_ligand);
    const selected_target_structure = useAppSelector(state => state.ligands_page.selected_target_structure);
    const bsite_radius = useAppSelector(state => state.ligands_page.radius);
    const is_prediction_pending = useAppSelector(state => state.ligands_page.prediction_pending);
    const prediction_residues: ResidueSummary[] = useAppSelector(state =>
        state.ligands_page.prediction_data?.purported_binding_site.chains.reduce((acc, next) => {
            return [...acc, ...next.bound_residues];
        }, [])
    );

    const [rootRef, setRootRef] = useState<null | string>(null);
    const [nomenclatureMap, setNomenclatureMap] = useState<null | Record<string, string>>(null);

    const auxiliaryService = useMolstarInstance('auxiliary');
    const ctx_secondary = auxiliaryService?.viewer;
    const msc_secondary = auxiliaryService?.controller;

    const {data} = useRoutersRouterStructStructureProfileQuery(
        {rcsbId: selected_target_structure},
        {skip: !selected_target_structure}
    );

    // First effect handles structure initialization
    useEffect(() => {
        if (!selected_target_structure || !data) return;
        let isActive = true;

        const initializeStructure = async () => {
            try {
                const nomenclatureMap = [...data.proteins, ...data.rnas, ...data.other_polymers].reduce(
                    (prev, current) => {
                        prev[current.auth_asym_id] = current.nomenclature.length > 0 ? current.nomenclature[0] : '';
                        return prev;
                    },
                    {}
                );
                setNomenclatureMap(nomenclatureMap);

                msc_secondary?.clear();
                const {root_ref} = await msc_secondary?.loadStructure(selected_target_structure, nomenclatureMap)!;
                setRootRef(root_ref);

                if (!isActive) return;

                if (current_ligand?.ligand.chemicalId && current_ligand?.parent_structure.rcsb_id && bsite_radius) {
                    const predictionResult = await dispatch(
                        fetchPredictionData({
                            chemid: current_ligand.ligand.chemicalId,
                            src: current_ligand.parent_structure.rcsb_id,
                            tgt: selected_target_structure,
                            radius: bsite_radius
                        })
                    ).unwrap();

                    console.log('received prediction result:', predictionResult);
                    if (!isActive) return;
                    console.log('2received prediction result:', predictionResult);

                    if (predictionResult) {
                        // assuming this is your prediction data
                        const prediction_residues = predictionResult.purported_binding_site.chains.reduce(
                            (acc, next) => {
                                return [...acc, ...next.bound_residues];
                            },
                            []
                        );

                        const refs = await ctx_secondary?.ligands.create_from_prediction_data(
                            selected_target_structure,
                            root_ref,
                            prediction_residues,
                            current_ligand.ligand.chemicalId,
                            nomenclatureMap
                        );
                        console.log('Received refs');

                        if (refs && isActive) {
                            console.log('Fired dispatch for mapadd');

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
                }
            } catch (error) {
                console.error('Error in structure initialization:', error);
            }
        };

        initializeStructure();

        return () => {
            isActive = false;
        };
    }, [selected_target_structure, data, msc_secondary, current_ligand, bsite_radius]);

    const [structureVisibility, setStructureVisibility] = useState<boolean>(true);

    return (
        <div className="space-y-4">
            <StructureEntity
                rcsb_id={selected_target_structure}
                visible={structureVisibility}
                onToggleVisibility={() => {
                    msc_secondary?.polymers.togglePolymersVisibility(selected_target_structure, !structureVisibility);
                    setStructureVisibility(!structureVisibility);
                }}
                className="min-w-0"
            />
            {prediction_residues && (
                <BindingSiteEntity
                    chemicalId={current_ligand?.ligand.chemicalId}
                    residueCount={prediction_residues.length}
                    visible={true}
                    onFocus={() => {
                        msc_secondary?.bindingSites.focusBindingSite(
                            selected_target_structure,
                            current_ligand?.ligand.chemicalId
                        );
                    }}
                    onToggleVisibility={() => {}}
                    nomenclature_map={nomenclatureMap}
                    onDownload={() => {
                        alert('Download not implemented');
                    }}
                    residues={prediction_residues}
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
                    className="min-w-0"
                />
            )}
        </div>
    );
}
