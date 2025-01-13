import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import Link from 'next/link';
import Image from 'next/image';
import {useAppDispatch, useAppSelector} from '@/store/store';
import {useMolstarInstance} from '@/components/mstar/mstar_service';
import {
    ResidueSummary,
    RibosomeStructure,
    ribxz_api,
    useRoutersRouterStructStructureProfileQuery
} from '@/store/ribxz_api/ribxz_api';
import {useEffect, useState} from 'react';
import {
    BsiteComponent,
    mapAssetModelComponentsAdd,
    selectBsiteForLigand,
    selectComponentById
} from '@/store/molstar/slice_refs';
import {useSelector} from 'react-redux';
import ResidueGrid from './residue_grid';
import {Button} from '@/components/ui/button';
import {LigandEntity} from './entity_ligand';
import {StructureEntity} from './entity_structure';
import {BindingSiteEntity} from './entity_bsite';

/** This returns the link to the chemical structure image that rcsb stores. */
const chemical_structure_link = (ligand_id: string | undefined) => {
    if (ligand_id === undefined) {
        return '';
    }
    return `https://cdn.rcsb.org/images/ccd/labeled/${ligand_id.toUpperCase()[0]}/${ligand_id.toUpperCase()}.svg`;
};
const useSurroundingResidues = (
    currentLigand,
    msc,
    rootRef, // New parameter to maintain dependency
    bsiteRadius
) => {
    const [surroundingResidues, setSurroundingResidues] = useState<ResidueSummary[]>([]);

    useEffect(() => {
        if (!currentLigand || !msc || !rootRef) return;

        const fetchSurroundingResidues = async () => {
            const residues = await msc.ligands.get_ligand_surroundings(
                rootRef,
                currentLigand.ligand.chemicalId,
                bsiteRadius
            );

            if (residues) {
                setSurroundingResidues(residues);
            }
        };

        fetchSurroundingResidues();
    }, [currentLigand, msc, rootRef, bsiteRadius]);

    return surroundingResidues;
};
const useStructureSetup = (currentLigand, msc, ctx, bsiteRadius, dispatch, data) => {
    const [rootRef, setRootRef] = useState(null);
    const [nomenclatureMap, setNomenclatureMap] = useState({});

    useEffect(() => {
        if (!currentLigand || !data || !msc) return;

        const setupStructure = async () => {
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
            msc.clear();
            const {root_ref} = await msc.loadStructure(currentLigand.parent_structure.rcsb_id, newNomenclatureMap);
            setRootRef(root_ref);

            // Create ligand component
            const ligandComponent = await ctx?.ligands.create_ligand(
                currentLigand.parent_structure.rcsb_id,
                currentLigand.ligand.chemicalId
            );

            // Create binding site
            const refs = await ctx?.ligands.create_ligand_surroundings(
                currentLigand.parent_structure.rcsb_id,
                currentLigand.ligand.chemicalId,
                bsiteRadius,
                newNomenclatureMap
            );

            if (refs) {
                const bsiteId = `${currentLigand.ligand.chemicalId}_bsite`;
                const bsiteRef = refs[bsiteId];

                if (bsiteRef && bsiteRef.ref && bsiteRef.repr_ref && bsiteRef.sel_ref) {
                    dispatch(
                        mapAssetModelComponentsAdd({
                            instanceId: 'main',
                            rcsbId: currentLigand.parent_structure.rcsb_id,
                            components: {
                                [currentLigand.ligand.chemicalId]: ligandComponent,
                                [bsiteId]: {
                                    type: 'bsite',
                                    rcsb_id: currentLigand.parent_structure.rcsb_id,
                                    chemicalId: currentLigand.ligand.chemicalId,
                                    ref: bsiteRef.ref,
                                    repr_ref: bsiteRef.repr_ref,
                                    sel_ref: bsiteRef.sel_ref
                                }
                            }
                        })
                    );
                }
            }
        };

        setupStructure();
    }, [currentLigand, data, msc, ctx, bsiteRadius, dispatch]);

    return {rootRef, nomenclatureMap};
};

export default function CurrentBindingSiteInfoPanel() {
    const current_ligand = useAppSelector(state => state.ligands_page.current_ligand);
    const lig_state = useAppSelector(state => state.ligands_page);
    const bsite_radius = useAppSelector(state => state.ligands_page.radius);
    const slice_refs = useAppSelector(state => state.mstar_refs);
    const dispatch = useAppDispatch();
    const ligand_component = useSelector(state =>
        selectComponentById(state, {
            instanceId: 'main',
            rcsbId: current_ligand?.parent_structure.rcsb_id,
            componentId: current_ligand?.ligand.chemicalId
        })
    );

    const mainMolstarService = useMolstarInstance('main');
    const ctx = mainMolstarService?.viewer;
    const msc = mainMolstarService?.controller;

    const {data} = useRoutersRouterStructStructureProfileQuery(
        {rcsbId: current_ligand?.parent_structure.rcsb_id},
        {skip: !current_ligand}
    );
    const {rootRef, nomenclatureMap} = useStructureSetup(current_ligand, msc, ctx, bsite_radius, dispatch, data);
    const surroundingResidues        = useSurroundingResidues(current_ligand, msc, rootRef, bsite_radius);

    const [structureVisibility, setStructureVisibility] = useState<boolean>(true);
    const [bsiteVisibility, setBsiteVisibility]         = useState<boolean>(true);

    useEffect(() => {
        setStructureVisibility(true);
    },[rootRef])

    return (
        <div>
            <Accordion type="single" collapsible defaultValue="none" disabled={current_ligand === null}>
                <StructureEntity
                    rcsb_id={current_ligand?.parent_structure.rcsb_id}
                    visible={structureVisibility}
                    onToggleVisibility={() => {
                        msc?.polymers.togglePolymersVisibility(
                            current_ligand.parent_structure.rcsb_id,
                            !structureVisibility
                        );
                        setStructureVisibility(!structureVisibility);
                    }}
                />

                {current_ligand && (
                    <LigandEntity
                        chemicalId={current_ligand?.ligand.chemicalId}
                        drugbank_id={current_ligand?.ligand.drugbank_id}
                        drugbank_description={current_ligand?.ligand.drugbank_description}
                        formula_weight={current_ligand?.ligand.formula_weight}
                        pdbx_description={current_ligand?.ligand.pdbx_description}
                        onFocus={() => {
                            ctx?.interactions.focus(ligand_component?.sel_ref);
                        }}
                    />
                )}
                <BindingSiteEntity
                    chemicalId={current_ligand?.ligand.chemicalId}
                    residueCount={surroundingResidues.length}
                    visible={bsiteVisibility}
                    onFocus={() => {
                        msc?.bindingSites.focusBindingSite(
                            current_ligand?.parent_structure.rcsb_id,
                            current_ligand?.ligand.chemicalId
                        );
                    }}
                    onToggleVisibility={() => {
                        (async () => {
                            const bsite = msc?.bindingSites.retrieveBSiteComponent(
                                current_ligand?.parent_structure.rcsb_id,
                                current_ligand?.ligand.chemicalId
                            );

                            bsite &&
                                (await ctx?.ctx.dataTransaction(async () => {
                                    ctx.interactions.setSubtreeVisibility(bsite.ref, !bsiteVisibility);
                                }));
                        })();
                        setBsiteVisibility(!bsiteVisibility);
                    }}
                    nomenclature_map={nomenclatureMap}
                    onDownload={() => {
                        alert('Download not implemented');
                    }}
                    residues={surroundingResidues}
                    onResidueClick={residue => {
                        ctx?.residues.selectResidue(residue.rcsb_id, residue.auth_asym_id, residue.auth_seq_id, true);
                    }}
                    onResidueHover={residue => {
                        ctx?.residues.highlightResidue(residue.rcsb_id, residue.auth_asym_id, residue.auth_seq_id);
                    }}
                />

                <Button
                    onClick={() => {
                        console.log(slice_refs);
                    }}>
                    Log State
                </Button>
            </Accordion>
        </div>
    );
}
