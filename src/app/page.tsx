"use client"
import StoreProvider from './store_provider';
import DiceIcon from '../../public/dice.svg'
import Image from 'next/image';
import { ribxz_api, useRoutersRouterStructAllRcsbIdsQuery, useRoutersRouterStructListLigandsQuery, useRoutersRouterStructPolymerClassesNomenclatureQuery, useRoutersRouterStructPolymerClassesStatsQuery, useRoutersRouterStructRandomProfileQuery, useRoutersRouterStructStructureCompositionStatsQuery } from '@/store/ribxz_api/ribxz_api';
import Link from "next/link"
import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button"
import { SidebarMenu } from '@/components/ribxz/sidebar_menu';
import { Separator } from '@/components/ui/separator';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { HoverCard, HoverCardContent, HoverCardTrigger, } from "@/components/ui/hover-card"
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import * as React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { StructureCard } from '@/components/ribxz/structure_card';
import { useAppSelector } from '@/store/store';

const StructureCarousel = () => {
    const current_structure = useAppSelector(state => state.structures_page.current_structures);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleWheel = (e: WheelEvent) => {
        const scrollViewport = scrollContainerRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollViewport) {
            e.preventDefault();
            e.stopPropagation();
            
            const scrollAmount = e.deltaY * 0.5;
            
            scrollViewport.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const element = scrollContainerRef.current;
        if (element) {
            element.addEventListener('wheel', handleWheel, { passive: false });
            return () => element.removeEventListener('wheel', handleWheel);
        }
    }, []);

    return (
        <div 
            className="w-full space-y-4 py-8"
            ref={scrollContainerRef}
        >
            <ScrollArea className="no-scrollbar w-full rounded-md border bg-white/80 backdrop-blur-none border-gray-200 focus:border-gray-300 transition-colors">
                <div className="bg-slate-100 flex p-4 space-x-4 shadow-inner">
                    {current_structure.slice(0, 10).map((_, i) => (
                        <StructureCard _={_} key={i} />
                    ))}

                    {/* Load More Card */}
                    <div className="w-64 shrink-0">
                        <Card className="w-full h-full flex items-center justify-center hover:bg-muted cursor-pointer transition-colors rounded-md bg-slate-50">
                            <Plus className="w-10 h-10 text-muted-foreground" />
                            <span>Load More</span>
                        </Card>
                    </div>
                </div>
                {/* <ScrollBar orientation="horizontal" /> */}
            </ScrollArea>
        </div>
    );
};
const Footer = () => {
    const citation = `@article{kushner2023riboxyz,
    title={RiboXYZ: a comprehensive database for visualizing and analyzing ribosome structures},
    author={Kushner, Artem and Petrov, Anton S and Dao Duc, Khanh},
    journal={Nucleic Acids Research},
    volume={51}, number={D1}, pages={D509--D516},
    year={2023},
    publisher={Oxford University Press}
  }`;

    return (
        <div className="grid grid-cols-2 gap-8 w-full py-8">
            {/* Acknowledgements */}
            <Card className="p-6 space-y-4">
                <h2 className="text-lg font-medium">Acknowledgement</h2>
                <p className="text-sm text-muted-foreground">
                    We kindly thank the following platforms and packages for making their work freely available or supporting us otherwise.
                </p>
                <div className="flex items-center space-x-4">
                    {['rcsb', 'hmmer', 'molstar', 'neo4j', 'chimerax'].map((logo) => (
                        <div key={logo} className="border p-2 rounded-md hover:border-primary hover:shadow-lg transition-all">
                            <Image
                                src={`/logo_${logo}.png`}
                                alt={`${logo} logo`}
                                width={40}
                                height={40}
                            />
                        </div>
                    ))}
                </div>
            </Card>

            {/* Citation */}
            <Card className="p-6 relative">
                <h2 className="text-lg font-medium mb-4">Citation</h2>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    <pre className="text-sm">
                        <code>{citation}</code>
                    </pre>
                </ScrollArea>
                <Button
                    size="sm"
                    className="absolute bottom-4 right-4"
                    onClick={() => navigator.clipboard.writeText(citation)}
                >
                    Copy
                </Button>
            </Card>
        </div>
    );
};
const Homepage = () => {
    return (
        <div className="container mx-auto px-4 max-w-6xl">
            <Hero />
            <StructureCarousel />
            <Footer />
        </div>
    );
};


const Hero = () => {
    return (
        <div className="mt-80 flex flex-col items-center justify-center gap-8">
            <div className="w-full max-w-2xl">
                <Input
                    className="w-full bg-white/80 backdrop-blur-none border-gray-200 focus:border-gray-300 transition-colors"
                    placeholder="Search structures..."
                />
            </div>
        </div>
    );
};

export default Homepage;
