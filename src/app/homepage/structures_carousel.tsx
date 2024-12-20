"use client"
import { useEffect, useRef, useState } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import * as React from "react"
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { StructureCard } from '@/components/ribxz/structure_card';
import { useAppSelector } from '@/store/store';

export const StructureCarousel = () => {

    const current_structures = useAppSelector(state => state.structures_page.current_structures);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const last_updated       = useAppSelector(state => state.structures_page.last_db_update);

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
        <div className="w-full space-y-4 py-8" ref={scrollContainerRef} >

            <div className="px-4">
                <h2 className="text-sm font-medium text-muted-foreground">Latest PDB Depositions [ {last_updated} ] </h2>
            </div>
            <ScrollArea className="no-scrollbar w-full rounded-md border bg-white/80 backdrop-blur-none border-gray-200 focus:border-gray-300 transition-colors">
                <div className="bg-slate-100 flex p-4 space-x-4 shadow-inner">
                    {current_structures.slice(0, 10).map((_, i) => (
                        <StructureCard _={_} key={i} />
                    ))}

                    <div className="w-64 shrink-0">
                        <Card className="w-full h-full flex items-center justify-center hover:bg-muted cursor-pointer transition-colors rounded-md bg-slate-50">
                            <Plus className="w-10 h-10 text-muted-foreground" />
                            <span>Load More</span>
                        </Card>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}