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
import { ImageDown, Plus } from 'lucide-react';
import { StructureCard } from '@/components/ribxz/structure_card';
import { useAppSelector } from '@/store/store';
import { StructureCarousel } from './homepage/structures_carousel';
import { Footer } from './homepage/footer';


const Homepage = () => {
    return (
        <div className="container mx-auto px-4 max-w-6xl">
            <Hero />
            <StructureCarousel />
            <Footer />
        </div>
    );
};

const InkscapeOverlay = () => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div
            className="relative w-full h-full cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Image
                width={80}
                height={80}
                src="/inkscape_overlay/gray.png"
                alt="Molecular structure grayscale"
                className="absolute top-0 left-0 w-full h-full object-contain"
            />

            <Image
                width={80}
                height={80}
                src="/inkscape_overlay/circleds.png"
                alt="Molecular structure colored"
                className={`
                    absolute 
                    top-0 
                    left-0 
                    w-full 
                    h-full 
                    object-contain 
                    transition-opacity 
                    duration-300 
                    ${isHovered ? 'opacity-100' : 'opacity-0'}
                `}
            />
        </div>
    );
};



const Hero = () => {
    return (
        <div className="mt-20 flex flex-col items-center justify-center gap-4">
            {/* Logo + Text Container */}
            <div className="w-full max-w-2xl flex  items-start">
                {/* InkscapeOverlay - Made smaller and fixed to left */}
                <div className="absolute w-80 h-80">
                    <InkscapeOverlay />
                </div>


                {/* Text Container */}
                <div className="pl-80 mt-20 flex flex-col  justify-start items-start">
                    <Image
                        width={200}
                        height={40}
                        src="/inkscape_overlay/riboxyz_textlogo.svg"
                        alt="riboxyz"
                        className="h-12 w-auto object-contain"
                    />
                    <span className="pl-1 font-mono text-md text-gray-600">
                        An interface to the atomic structure of the ribosome.
                    </span>
                </div>
            </div>

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
