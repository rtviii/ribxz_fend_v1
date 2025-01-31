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

const DemoFooter = ({ species }) => (
  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
    <div className="flex items-center space-x-1">
      <span>To structure</span>
      <ChevronRight size={14} />
    </div>
    {species && <em>{species}</em>}
  </div>
);
const SectionHeader = ({ title, description, apiDocs, lastUpdate, className, children }) => {
  const [showDocs, setShowDocs] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyCode = (code) => {
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
            "p-2 rounded-md transition-colors group",
            showDocs ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          )}
        >
          <Terminal className="h-5 w-5" />
          <span className="absolute right-0 -mt-8 px-2 py-1 text-xs bg-gray-800 text-white rounded 
            opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Get this data via API
          </span>
        </button>
      </div>

      {lastUpdate && (
        <p className="mt-2 text-xs text-gray-500">Last update: {lastUpdate}</p>
      )}

      <div className="mt-4 overflow-hidden">
        <div className={cn(
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
                      hover:bg-gray-700 transition-all duration-150"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
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

const Homepage = () => {
    return (
        <div className="container mx-auto px-4 max-w-6xl min-h-screen space-y-8">
            <Hero />

            <section className="space-y-8">
                <SectionHeader
                    title="Recent Depositions"
                    description="Latest ribosome structures deposited in the PDB database"
                    apiDocs={`
// Fetch recent depositions
GET /api/structures/recent
      `}>
                    <StructureCarousel />
                </SectionHeader>

                <SectionHeader
                    title="Ribosomal Tunnel Analysis"
                    description="Geometric analysis of ribosomal exit tunnel with highlighted protein regions"
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
                                        <DemoFooter species={"H. sapiens"}/>
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
                                        <DemoFooter species={"E. coli"} />
                                    </div>
                                </div>

                                <div className="w-1/3 flex flex-col">
                                    <div className="h-20">
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            The geometry of human <em>mitochondrial</em> ribosome exit tunnel with parts
                                            of
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
                                        <DemoFooter species={"Mitochondria (H. sapiens)"}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </SectionHeader>

                <SectionHeader
                    title="Ligand Binding Sites"
                    description="Distribution and statistics of ligand binding sites across the structure"
                    apiDocs={`
// Get ligand binding sites
GET /api/structures/{pdb_id}/ligands
      `}>
                    <BsiteDemo />
                </SectionHeader>
            </section>
        </div>
    );
};

export default Homepage;
