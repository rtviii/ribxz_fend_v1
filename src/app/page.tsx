'use client';
import * as React from 'react';
import {StructureCarousel} from './homepage/structures_carousel';
import {Hero} from './homepage/hero';
import {TunnelDemo} from './homepage/demo_tunnel_human';
import '@/components/mstar/mstar.css';
import {BsiteDemo} from './homepage/demo_bsite';
import {ChevronRight} from 'lucide-react';
import {TunnelDemoBacterial} from './homepage/demo_tunnel_bacterial_ligand';
import {TunnelDemoMito} from './homepage/demo_tunnel_mito';

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

const DemoFooter = () => (
    <div className="flex items-center justify-end mt-2 space-x-1 text-xs text-gray-500">
        <span>To structure</span>
        <ChevronRight size={14} />
    </div>
);

const SectionHeader = ({title}) => <h2 className="text-2xl font-medium text-gray-800 mb-4">{title}</h2>;

const Homepage = () => {
    return (
        <div className="container mx-auto px-4 max-w-6xl min-h-screen space-y-8">
            <Hero />

            <section className="space-y-8">
                <StructureCarousel />

                <div>
                    <SectionHeader title="Ribosomal Tunnel Analysis" />
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
                                    <DemoFooter />
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
                                    <DemoFooter />
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
                                    <DemoFooter />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <SectionHeader title="Ligand Binding Sites" />
                    <BsiteDemo />
                </div>
            </section>
        </div>
    );
};

export default Homepage;
