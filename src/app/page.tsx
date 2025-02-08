'use client';
import * as React from 'react';
import {StructureCarousel} from './homepage/structures_carousel';
import {Hero} from './homepage/hero';
import {TunnelDemo} from './homepage/demo_tunnel_human';
import '@/components/mstar/mstar.css';
import {BsiteDemo} from './homepage/demo_bsite';
import {Check, ChevronRight, Copy} from 'lucide-react';
import {TunnelDemoBacterial} from './homepage/demo_tunnel_bacterial_ligand';
import {TunnelDemoMito} from './homepage/demo_tunnel_mito';
import {cn} from '@/components/utils';
import {Terminal} from 'lucide-react';
import {useState} from 'react';
import {useAppSelector} from '@/store/store';
import BottomSection from './home_footer';
import {DemoFooter, ProteinPill, SectionHeader} from './home_components';

const acknowledgements = [
    {
        name: 'University of British Columbia',
        description: '',
        icon: '/logo_ubc.png',
        link: 'https://www.math.ubc.ca/'
    },

    {
        name: 'Mol* Project',
        description: '',
        icon: '/logo_molstar.png',
        link: 'https://molstar.org/'
    },
    {
        name: 'Protein Data Bank',
        description: '',
        icon: '/logo_rcsb.png',
        link: 'https://www.rcsb.org/'
    },
    {
        name: 'Neo4j Graph Database',
        description: '',
        icon: '/logo_neo4j.png',
        link: 'Example Tool'
    },
    {
        name: 'HMMER Suite',
        description: '',
        icon: '/logo_hmmer.png',
        link: 'http://hmmer.org/'
    },
    {
        name: 'ChimeraX',
        description: '',
        icon: '/logo_chimerax.svg',
        link: 'https://www.cgl.ucsf.edu/chimerax/'
    },
    {
        name: 'Ribovision 2 & The Willaims Lab',
        description: '',
        icon: '/logo_ribovision.jpg',
        link: 'https://ribovision2.chemistry.gatech.edu/'
    }
];

const TunnelDemos = () => {
    return (
        <div>
            <div className="bg-slate-100 rounded-md shadow-inner p-4">
                <div className="flex gap-4 h-[40rem]">
                    <div className="w-1/3 flex flex-col">
                        <div className="h-20">
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Geometry of <em>human</em> ribosome exit tunnel with parts of
                                <ProteinPill text="uL22" color="#ea580c" />
                                <ProteinPill text="uL4" color="#93c5fd" />
                                <ProteinPill text="eL39" color="#cbc3e3" />
                                proteins displayed.
                            </p>
                        </div>
                        <div className="flex-1 bg-white rounded-md p-2 shadow-sm flex flex-col">
                            <div className="flex-1">
                                <TunnelDemo />
                            </div>
                            <DemoFooter pdbId={'4UG0'} species={<span>H. sapiens </span>} />
                        </div>
                    </div>

                    <div className="w-1/3 flex flex-col">
                        <div className="h-20">
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Geometry of <em>bacterial</em> ribosome tunnel with parts of
                                <ProteinPill text="uL4" color="#93c5fd" />
                                <ProteinPill text="uL22" color="#ea580c" />
                                <ProteinPill text="uL23" color="#fbbf24" />
                                proteins displayed. A molecule of
                                <ProteinPill text="erythromycin" color="#00ff00" />
                                is present.
                            </p>
                        </div>
                        <div className="flex-1 bg-white rounded-md p-2 shadow-sm flex flex-col">
                            <div className="flex-1">
                                <TunnelDemoBacterial />
                            </div>
                            <DemoFooter pdbId={'3J7Z'} species={<span>E. coli </span>} />
                        </div>
                    </div>

                    <div className="w-1/3 flex flex-col">
                        <div className="h-20">
                            <p className="text-sm text-gray-500 leading-relaxed">
                                The geometry of human <em>mitochondrial</em> ribosome exit tunnel with parts of
                                <ProteinPill text="uL4m" color="#93c5fd" />
                                <ProteinPill text="uL22m" color="#ea580c" />
                                <ProteinPill text="uL23m" color="#fbbf24" />
                                proteins displayed.
                                <ProteinPill text="Nascent chain" color="#4299e1" />
                                is traversing the tunnel.
                            </p>
                        </div>
                        <div className="flex-1 bg-white rounded-md p-2 shadow-sm flex flex-col">
                            <div className="flex-1">
                                <TunnelDemoMito />
                            </div>
                            <DemoFooter pdbId={'7A5G'} species={<span> Mitochondria (H. sapiens)</span>} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Homepage = () => {
    const last_pdb_sync = useAppSelector(state => state.structures_page.last_db_update);

    return (
        <>
            <div className="container mx-auto px-4 max-w-6xl min-h-screen space-y-8">
                <Hero />

                <section className="space-y-8">
                    <SectionHeader

                    navigationPath={'/structures'}
                        title="Atomic Models: Structures and Polymers"
                        description={
                            <span>
                                Latest structures deposited to the PDB {last_pdb_sync ? `(${last_pdb_sync})` : null}{' '}
                            </span>
                        }
                        documentation={[
                            {
                                text: 'Fetch ids of all structures in the database:',
                                code: `curl -X 'GET' \\ \n'https://api.ribosome.xyz/structures/all_rcsb_ids' \\ \n-H 'accept: application/json'`
                            },
                            {
                                text: 'Fetch complete metadata for a given structure:',
                                code: `curl -X 'GET' \\ \n'https://api.ribosome.xyz/structures/profile?rcsb_id=4UG0' \\ \n-H 'accept: application/json'`
                            },
                            {
                                text: `Find available atomic models based on structural features and metadata.\n Example: Get all structures that are whole (have both SSU and LSU present) and contain a tRNA chain deposited between 2015 and 2024. See api.ribosome.xyz for complete list of available parameters.`,
                                code: `curl -X 'POST' \\ \n'https://api.ribosome.xyz/structures/list_structures' \\ \n-H 'accept: application/json' \\ \n-H 'Content-Type: application/json' \\ 
-d '{
  "year": [
    2015,
    2024
  ],
  "polymer_classes": [
    "tRNA"
  ],
  "subunit_presence": "SSU+LSU"
}'
  `
                            }
                        ]}>
                        <StructureCarousel />
                    </SectionHeader>

                    <SectionHeader

                    navigationPath={'/ligands'}
                        title="Ligand Binding Sites & Predictions"
                        description={`Data for nonpolymer-ligand binding sites across deposited structures and predictions derived from it. `}
                        documentation={[
                            {
                                text: 'List all unique nonpolymeric ligands along with the structures they bind.',
                                code: `curl -X 'GET' \\ \n 'https://api.ribosome.xyz/ligands/list_ligands' \\ \n -H 'accept: application/json'
`
                            },
                            {
                                text: 'Get residues in the proximity of a given ligand in a structure. Ex. Get all residues within 5 Angstrom of Paromomcyin in E. coli 7K00:',
                                code: `curl -X 'GET' \\ \n 'https://api.ribosome.xyz/ligands/binding_pocket?source_structure=7K00&chemical_id=PAR&radius=5' \\ \n -H 'accept: application/json'
`
                            },
                            {
                                text: "Attempt to predict a given ligand's binding site in a target structure based on existing site in source structure. Ex. Predict the binding site of PAR(Paromomycin) in E. coli 5AFI using 7K00.PAR as template:",
                                code: `curl -X 'GET' \\ \n 'https://api.ribosome.xyz/ligands/transpose?source_structure=7K00&target_structure=5AFI&chemical_id=PAR&radius=10'  \\ \n  -H 'accept: application/json'

`
                            }
                        ]}>
                        <BsiteDemo />
                    </SectionHeader>

                    <SectionHeader
                        title="Loci, Functional Sites & Regions of Interest"
                        description={`Coordinates, primary sequence annotations and structural landmarks. Displayed are the Nascent Peptide Exit Tunnel (NPET) geometries produced via the PTC and constriction site landmarks. `}
                        documentation={[
                            {
                                text: 'Download a `.ply` file containing the geometry of the human ribosome exit tunnel in 4UG0',
                                code: `curl -X 'GET' 'https://api.ribosome.xyz/loci/tunnel_geometry?rcsb_id=4ug0&is_ascii=false' -H 'accept: */*'`
                            },
                            {
                                text: 'The coordinate of the constriction site formed by ribosomal proteins uL4 and uL22 in 8FC4',
                                code: `curl -X 'GET' 'https://api.ribosome.xyz/loci/constriction_site?rcsb_id=8fc4'  -H 'accept: application/json'
`
                            },
                            {
                                text: 'The coordinate of the peptidyl transferase center (PTC) in the human ribosome 3J7Z',
                                code: "curl -X GET https://api.ribosome.xyz/loci/ptc?rcsb_id=3j7z -H 'accept: application/json'"
                            }
                        ]}>
                        <TunnelDemos />
                    </SectionHeader>
                </section>
            </div>
            {/* <Acknowledgements items={acknowledgements} /> */}
            <BottomSection acknowledgements={acknowledgements} />
        </>
    );
};

export default Homepage;
