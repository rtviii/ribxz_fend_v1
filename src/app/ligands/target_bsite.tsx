import {ScrollArea} from '@/components/ui/scroll-area';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import {usePanelContext} from './panels_context';
import {useAppDispatch, useAppSelector} from '@/store/store';
import {useEffect, useState} from 'react';
import {useMolstarInstance} from '@/components/mstar/mstar_service';
import {useRoutersRouterStructStructureProfileQuery} from '@/store/ribxz_api/ribxz_api';
import {fetchPredictionData, set_selected_target_structure} from '@/store/slices/slice_ligands';
import {mapAssetModelComponentsAdd} from '@/store/molstar/slice_refs';
import {Button} from '@/components/ui/button';
import ResidueGrid from './residue_grid';
import {GlobalStructureSelection} from '@/components/ribxz/ribxz_structure_selection';
import {Spinner} from '@/components/ui/spinner';

export default function BindingSitePredictionPanel({}) {
    const dispatch = useAppDispatch();
    const {isPredictionPanelOpen, togglePredictionPanel} = usePanelContext();
    const current_ligand = useAppSelector(state => state.ligands_page.current_ligand);
    const selected_target_structure = useAppSelector(state => state.ligands_page.selected_target_structure);
    const bsite_radius = useAppSelector(state => state.ligands_page.radius);
    const is_prediction_pending = useAppSelector(state => state.ligands_page.prediction_pending);
    const prediction_residues = useAppSelector(state =>
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
        <ScrollArea className="h-[90vh] overflow-scroll  no-scrollbar space-y-4 mt-16">
            <div className="flex items-center space-x-2 p-2 rounded-md border ">
                <Switch
                    id="show-lower-panel"
                    checked={isPredictionPanelOpen}
                    onCheckedChange={togglePredictionPanel}
                    disabled={current_ligand === null}
                />
                <Label htmlFor="show-lower-panel" className="w-full cursor-pointer">
                    <div className="flex flex-row justify-between">
                        Binding Pocket Prediction
                        {current_ligand !== null ? (
                            <span className="font-light text-xs italic">
                                Using{' '}
                                <span className="font-semibold">
                                    {current_ligand.parent_structure.rcsb_id}/{current_ligand.ligand.chemicalId}
                                </span>{' '}
                                as source.
                            </span>
                        ) : null}
                    </div>
                </Label>
            </div>

            <div className="flex flex-row justify-between  pr-4 w-full text-center content-center align-middle">
                <span className="text-center">Prediction Target</span>
            </div>

            <Button
                variant={'outline'}
                onClick={() => {
                    if (selected_target_structure === null || current_ligand === null) {
                        return;
                    }
                }}>
                {' '}
                {is_prediction_pending ? (
                    <>
                        <Spinner /> <span className="mx-2">Calculating</span>
                    </>
                ) : (
                    'Render Prediction'
                )}
            </Button>

            <ResidueGrid
                residues={prediction_residues as ResidueData[]}
                ligandId={current_ligand?.ligand.chemicalId}
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

            <Button
                onClick={() => {
                    msc_secondary?.polymers.togglePolymersVisibility(selected_target_structure, !structureVisibility);
                    setStructureVisibility(!structureVisibility);
                }}>
                Toggle Polymers
            </Button>
            <Button
                onClick={() => {
                    msc_secondary?.bindingSites.focusBindingSite(
                        selected_target_structure,
                        current_ligand?.ligand.chemicalId
                    );
                }}>
                Focus Surroundings
            </Button>

            <Button
                variant={'outline'}
                onClick={() => {
                    if (!bsiteRef) return;
                    const ref = bsiteRef.repr_ref;
                    ctx_secondary?.interactions.focus(ref);
                    ctx_secondary?.interactions.selection(ref, 'add');
                }}>
                {' '}
                Display Prediction
            </Button>

            <GlobalStructureSelection
                onChange={rcsb_id => {
                    dispatch(set_selected_target_structure(rcsb_id));
                }}
            />
        </ScrollArea>
    );
}
