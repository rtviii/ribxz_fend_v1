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

const ProteinPill = ({text, color}) => {
    const hexToRgb = hex => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16)
              }
            : null;
    };
    const rgb = hexToRgb(color);
    const bgColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)` : 'transparent';

    return (
        <span
            className="inline-flex items-center px-1.5 rounded-sm text-xs font-mono align-baseline mx-0.5"
            style={{
                backgroundColor: bgColor,
                border: `1px solid ${color}`,
                color: color,
                lineHeight: '1.1'
            }}>
            {text}
        </span>
    );
};

const DemoFooter = ({species, pdbId}) => (
    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
            <span>
                To structure <CitationTooltip pdbId={pdbId} />
            </span>
            <ChevronRight size={14} />
        </div>
        {species && <span className="italic ">{species}</span>}
    </div>
);
const SectionHeader = ({title, description, apiDocs, lastUpdate, className, children}) => {
    const [showDocs, setShowDocs] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyCode = code => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                </div>

                <button
                    onClick={() => setShowDocs(prev => !prev)}
                    className={cn(
                        'px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 border-2',
                        showDocs
                            ? 'text-blue-600 bg-blue-50 border-blue-200 shadow-md'
                            : 'text-gray-600 hover:text-gray-800 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                    )}>
                    <Terminal className="h-5 w-5" />
                    <span className="text-sm font-medium">Get via API</span>
                </button>
            </div>

            {lastUpdate && <p className="mt-2 text-xs text-gray-500">Last update: {lastUpdate}</p>}

            <div className="mt-4 overflow-hidden">
                <div
                    className={cn(
                        'transition-all duration-300 flex w-[200%]',
                        showDocs ? '-translate-x-1/2' : 'translate-x-0'
                    )}>
                    <div className="w-1/2 flex-shrink-0">
                        <div className={className}>{children}</div>
                    </div>

                    <div className="w-1/2 flex-shrink-0 pl-4">
                        <div className="bg-gray-50 rounded-lg overflow-hidden">
                            <div className="p-4">
                                <h3 className="text-sm font-medium mb-4">API Documentation</h3>
                                <div className="relative group">
                                    <pre className="text-sm bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                                        <code>{apiDocs}</code>
                                    </pre>
                                    <button
                                        onClick={() => copyCode(apiDocs)}
                                        className="absolute top-2 right-2 p-1.5 rounded-md 
                                        bg-gray-800 text-gray-300 opacity-0 group-hover:opacity-100 
                                        hover:bg-gray-700 transition-all duration-150">
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const tunnel_struct_citations = {
    '4UG0': {
        title: 'Ribosome structures to near-atomic resolution from thirty thousand cryo-EM particles',
        authors: 'Bai, X., Fernández, I., McMullan, G. et al.',
        journal: 'Nature',
        volume: '525',
        pages: '486–490',
        year: '2015',
        doi: '10.1038/nature14427'
    },
    '3J7Z': {
        title: 'Drug Sensing by the Ribosome Induces Translational Arrest via Active Site Perturbation',
        authors: 'Arenz, S., Meydan, S., Starosta, A.L. et al.',
        journal: 'Molecular Cell',
        volume: '56',
        pages: '446-452',
        year: '2014',
        doi: '10.1016/j.molcel.2014.09.014'
    },
    '7A5G': {
        title: 'Elongational stalling activates mitoribosome-associated quality control',
        authors: 'Desai, N., Yang, H., Chandrasekaran, V. et al.',
        journal: 'Science',
        volume: '370',
        pages: '1105-1110',
        year: '2020',
        doi: '10.1126/science.abc7782'
    }
};
const CitationTooltip = ({pdbId}) => {
    const [isHovered, setIsHovered] = useState(false);
    const citation = tunnel_struct_citations[pdbId];

    if (!citation) return null;

    return (
        <div
            className="relative inline-block group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
            <span className="italic cursor-help">
                {pdbId}
                <sup className="text-gray-400 ml-0.5">*</sup>
            </span>

            {isHovered && (
                <div className="absolute z-50 w-96 p-4 text-sm bg-white rounded-lg shadow-lg border border-gray-200 bottom-full left-full -ml-4">
                    <p className="font-medium text-gray-900 mb-2">Citation:</p>
                    <p className="text-gray-600">
                        {citation.authors} {citation.title}. {citation.journal} {citation.volume}, {citation.pages} (
                        {citation.year}).
                    </p>
                    <a
                        href={`https://doi.org/${citation.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
                        DOI: {citation.doi}
                    </a>
                </div>
            )}
        </div>
    );
};
const Acknowledgements = ({items}) => {
    const [hoveredItem, setHoveredItem] = useState(null);

    return (
        <section className="relative py-12">
            {/* Fading border line */}
            <div className="absolute top-0 left-0 w-full h-px">
                <div className="max-w-6xl mx-auto px-4 relative">
                    <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-12">
                    {/* <h2 className="text-xl font-semibold text-gray-900 mb-2">Acknowledgements</h2> */}
                    <p className="text-sm text-gray-500">
                        We are indebted to the following institutions and projects for being open source or supporting
                        us otherwise.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-12">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="relative group"
                            onMouseEnter={() => setHoveredItem(index)}
                            onMouseLeave={() => setHoveredItem(null)}>
                            <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block transition-transform duration-200 hover:scale-105">
                                <div className="relative flex items-center justify-center">
                                    <img
                                        src={item.icon}
                                        alt={item.name}
                                        className={cn(
                                            'w-24 h-24 object-contain transition-all duration-300', // Reduced size
                                            hoveredItem === index ? 'filter-none' : 'grayscale opacity-60'
                                        )}
                                    />
                                </div>
                            </a>

                            {hoveredItem === index && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white text-sm rounded-lg p-3 shadow-lg z-10 border border-gray-200">
                                    <div className="text-center">
                                        <p className="font-medium text-gray-900 mb-1">{item.name}</p>
                                        <p className="text-gray-600 text-xs">{item.description}</p>
                                    </div>
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                                        <div className="border-8 border-transparent border-t-white" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
const acknowledgements = [
    {
        name: 'Example Tool',
        description: 'Description of the tool or contribution',
        icon: '/logo_ubc.png',
        link: 'https://example.com'
    },

    {
        name: 'Example Tool',
        description: 'Description of the tool or contribution',
        icon: '/logo_molstar.png',
        link: 'https://example.com'
    },
    {
        name: 'Example Tool',
        description: 'Description of the tool or contribution',
        icon: '/logo_rcsb.png',
        link: 'https://example.com'
    },
    {
        name: 'Example Tool',
        description: 'Description of the tool or contribution',
        icon: '/logo_neo4j.png',
        link: 'https://example.com'
    },
    {
        name: 'Example Tool',
        description: 'Description of the tool or contribution',
        icon: '/logo_hmmer.png',
        link: 'https://example.com'
    },
    {
        name: 'Example Tool',
        description: 'Description of the tool or contribution',
        icon: '/logo_chimerax.svg',
        link: 'https://example.com'
    },
{
        name: 'Ribovision',
        description: 'Description of the tool or contribution',
        icon: '/logo_ribovision.jpg',
        link: 'https://example.com'
    }
];

const Homepage = () => {
    const last_pdb_sync = useAppSelector(state => state.structures_page.last_db_update);

    return (
        <>
            <div className="container mx-auto px-4 max-w-6xl min-h-screen space-y-8">
                <Hero />

                <section className="space-y-8">
                    <SectionHeader
                        title="Atomic Models & Loci of Interest"
                        description={<span>Latest structures deposited to the PDB ({last_pdb_sync}) </span>}
                        apiDocs={`
// Fetch recent depositions
GET /api/structures/recent
      `}>
                        <StructureCarousel />
                    </SectionHeader>

                    <SectionHeader
                        title="Ligand Binding Sites & Predictions"
                        description="All existing nonpolymer-ligand binding sites in deposited structures as well as binding sites predicted from them. "
                        apiDocs={`
// Get ligand binding sites
GET /api/structures/{pdb_id}/ligands
      `}>
                        <BsiteDemo />
                    </SectionHeader>
                    <SectionHeader
                        title="Nascent Peptide Exit Tunnel (NPET) geometries"
                        description={
                            <span>
                                Geometric data of ribosome exit tunnels available as <code>.ply</code> meshes.{' '}
                            </span>
                        }
                        apiDocs={`
// Get tunnel analysis for structure
GET /api/structures/{pdb_id}/tunnel
      `}>
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
                                                The geometry of human <em>mitochondrial</em> ribosome exit tunnel with
                                                parts of
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
                                            <DemoFooter
                                                pdbId={'7A5G'}
                                                species={<span> Mitochondria (H. sapiens)</span>}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SectionHeader>
                </section>
            </div>
            {/* <Acknowledgements items={acknowledgements} /> */}
            <BottomSection acknowledgements={acknowledgements} />
        </>
    );
};

export default Homepage;
