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

/** This returns the link to the chemical structure image that rcsb stores. */
const chemical_structure_link = (ligand_id: string | undefined) => {
    if (ligand_id === undefined) {
        return '';
    }
    return `https://cdn.rcsb.org/images/ccd/labeled/${ligand_id.toUpperCase()[0]}/${ligand_id.toUpperCase()}.svg`;
};
export default function CurrentBindingSiteInfoPanel() {
    const current_ligand = useAppSelector(state => state.ligands_page.current_ligand);
    const lig_state = useAppSelector(state => state.ligands_page);
    const bsite_radius = useAppSelector(state => state.ligands_page.radius);
    const slice_refs = useAppSelector(state => state.mstar_refs);
    const [refetchParentStruct] = ribxz_api.endpoints.routersRouterStructStructureProfile.useLazyQuery();

    const dispatch = useAppDispatch();
    const [surroundingResidues, setSurroundingResidues] = useState<ResidueSummary[]>([]);
    const [parentStructProfile, setParentStructProfile] = useState<RibosomeStructure>({} as RibosomeStructure);

    const mainMolstarService = useMolstarInstance('main');
    const ctx = mainMolstarService?.viewer;
    const msc = mainMolstarService?.controller;

    useEffect(() => {
        if (current_ligand?.parent_structure.rcsb_id === undefined) {
            return;
        }
        const fetchData = async () => {
            try {
                const result = await refetchParentStruct({
                    rcsbId: current_ligand?.parent_structure.rcsb_id
                }).unwrap();
                setParentStructProfile(result);
            } catch (error) {
                console.error('Error fetching parent struct:', error);
            }
        };
        fetchData();
    }, [current_ligand]);

    const {data} = useRoutersRouterStructStructureProfileQuery(
        {rcsbId: current_ligand?.parent_structure.rcsb_id},
        {skip: !current_ligand}
    );

    useEffect(() => {
        if (!current_ligand || !data) return;

        const nomenclatureMap = [...data.proteins, ...data.rnas, ...data.other_polymers].reduce((prev, current) => {
            prev[current.auth_asym_id] = current.nomenclature.length > 0 ? current.nomenclature[0] : '';
            return prev;
        }, {});

        msc?.clear();
        (async () => {
            // Load structure first and store ALL components
            const {root_ref} = await msc?.loadStructure(current_ligand.parent_structure.rcsb_id, nomenclatureMap)!;

            const ligandComponent = await ctx?.ligands.create_ligand(
                current_ligand.parent_structure.rcsb_id,
                current_ligand.ligand.chemicalId
            )!;

            // Then create and add ligand + binding site
            const refs = await ctx?.ligands.create_ligand_surroundings(
                current_ligand.parent_structure.rcsb_id,
                current_ligand.ligand.chemicalId,
                bsite_radius,
                nomenclatureMap
            );

            console.log('Received refs:', refs); // Debug log

            if (refs) {
                const bsiteId = `${current_ligand.ligand.chemicalId}_bsite`;
                const bsiteRef = refs[bsiteId];

                console.log('Looking for bsite with ID:', bsiteId); // Debug log
                console.log('Found bsite ref:', bsiteRef); // Debug log

                if (bsiteRef && bsiteRef.ref && bsiteRef.repr_ref && bsiteRef.sel_ref) {
                    dispatch(
                        mapAssetModelComponentsAdd({
                            instanceId: 'main',
                            rcsbId: current_ligand.parent_structure.rcsb_id,
                            components: {
                                [current_ligand.ligand.chemicalId]: ligandComponent,
                                [bsiteId]: {
                                    type: 'bsite',
                                    rcsb_id: current_ligand.parent_structure.rcsb_id,
                                    chemicalId: current_ligand.ligand.chemicalId,
                                    ref: bsiteRef.ref,
                                    repr_ref: bsiteRef.repr_ref,
                                    sel_ref: bsiteRef.sel_ref
                                } as BsiteComponent
                            }
                        })
                    );
                } else {
                    console.error('Binding site refs are incomplete:', bsiteRef);
                }
            }

            const residues = await msc?.ligands.get_ligand_surroundings(
                root_ref,
                current_ligand.ligand.chemicalId,
                bsite_radius
            );
            if (residues !== undefined) {
                setSurroundingResidues(residues);
            }
        })();
    }, [current_ligand, data, msc, ctx, bsite_radius]);

    const bsite = useSelector(state =>
        selectBsiteForLigand(state, {
            instanceId: 'main',
            rcsbId: current_ligand?.parent_structure.rcsb_id,
            chemicalId: current_ligand?.ligand.chemicalId
        })
    );

    const ligand = useSelector(state =>
        selectComponentById(state, {
            instanceId: 'main',
            rcsbId: current_ligand?.parent_structure.rcsb_id,
            componentId: current_ligand?.ligand.chemicalId
        })
    );

    const [structureVisibility, setStructureVisibility] = useState<boolean>(true);
    const [bsiteVisibility, setBsiteVisibility] = useState<boolean>(true);
    return (
        <div>
            <Accordion type="single" collapsible defaultValue="none" disabled={current_ligand === null}>
                <AccordionItem value="item">
                    <AccordionTrigger className="text-xs rounded-sm hover:cursor-pointer hover:bg-muted border p-1">
                        {lig_state.current_ligand?.ligand.chemicalId} Chemical Structure
                    </AccordionTrigger>
                    {current_ligand ? (
                        <AccordionContent className="hover:cursor-pointer  border hover:shadow-inner shadow-lg">
                            <Image
                                src={chemical_structure_link(lig_state.current_ligand?.ligand.chemicalId)}
                                alt="ligand_chemical_structure.png"
                                width={400}
                                height={400}
                                onMouseEnter={() => {
                                    // ctx?.select_focus_ligand(
                                    //     current_ligand?.ligand.chemicalId,
                                    //     ['highlight']
                                    // );
                                }}
                                onMouseLeave={() => {
                                    // ctx?.removeHighlight();
                                }}
                                onClick={() => {
                                    // ctx?.select_focus_ligand(
                                    //     current_ligand?.ligand.chemicalId,
                                    //     ['select', 'focus']
                                    // );
                                }}
                            />
                        </AccordionContent>
                    ) : null}
                </AccordionItem>
            </Accordion>

            <Accordion type="single" collapsible defaultValue="none" disabled={current_ligand === undefined}>
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-xs rounded-sm flex flex-roww justify-between  hover:cursor-pointer hover:bg-muted border p-1">
                        <span className="text-xs text-gray-800">Drugbank Info</span>
                        <div>
                            {lig_state.current_ligand?.ligand.drugbank_id ? (
                                <Link
                                    className=""
                                    href={`https://go.drugbank.com/drugs/${lig_state.current_ligand?.ligand.drugbank_id}`}>
                                    <p className="text-sm   hover:underline ribxz-link">
                                        {lig_state.current_ligand?.ligand.drugbank_id}
                                    </p>
                                </Link>
                            ) : null}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <p className="text-xs">{lig_state.current_ligand?.ligand.drugbank_description}</p>
                    </AccordionContent>

                    <ResidueGrid
                        residues={surroundingResidues}
                        ligandId={current_ligand?.ligand.chemicalId ?? ''}
                        onResidueClick={residue => {
                            ctx?.residues.selectResidue(
                                residue.rcsb_id,
                                residue.auth_asym_id,
                                residue.auth_seq_id,
                                true
                            );
                        }}
                        onResidueHover={residue => {
                            ctx?.residues.highlightResidue(residue.rcsb_id, residue.auth_asym_id, residue.auth_seq_id);
                        }}
                    />

                    <Button
                        onClick={() => {
                            console.log(slice_refs);
                        }}>
                        {' '}
                        log ref state
                    </Button>

                    <Button
                        onClick={() => {
                            msc?.polymers.togglePolymersVisibility(
                                current_ligand?.parent_structure.rcsb_id,
                                !structureVisibility
                            );
                            setStructureVisibility(!structureVisibility);
                        }}>
                        Toggle Polymers
                    </Button>
                    <Button
                        onClick={() => {
                            msc?.bindingSites.focusBindingSite(
                                current_ligand?.parent_structure.rcsb_id,
                                current_ligand?.ligand.chemicalId
                            );
                        }}>
                        Focus Surroundings
                    </Button>

                    <Button
                        onClick={() => {
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
                        }}>
                        Toggle Surroundings
                    </Button>
                    <Button
                        onClick={() => {
                            ctx?.interactions.focus(ligand?.sel_ref);
                        }}>
                        Focus Ligand
                    </Button>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
