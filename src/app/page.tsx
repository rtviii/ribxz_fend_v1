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
import { useRouter } from 'next/navigation';
import { AsteriskTooltip } from '@/components/ribxz/asterisk_tooltip';
import { IconVisibilityOn } from '@/components/ribxz/visibility_icon';
import * as React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full space-y-6 py-16">
      <Image 
        src="/ribxz_logo_black.png" 
        alt="RiboXYZ Logo" 
        width={240} 
        height={240} 
        className="w-60"
      />
      <h1 className="text-2xl font-medium text-center max-w-2xl">
        Comprehensive database for visualizing and analyzing ribosome structures
      </h1>
    </div>
  );
};

const StructureCarousel = () => {
  return (
    <div className="w-full space-y-4 py-8">
      <Input 
        className="w-full max-w-2xl mx-auto" 
        placeholder="Search structures..."
      />
      
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <div className="flex w-full space-x-4 p-4">
          {/* Placeholder for your StructureCard components */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-[300px] shrink-0">
              <Card className="w-full h-[200px] flex items-center justify-center">
                StructureCard {i}
              </Card>
            </div>
          ))}
          
          {/* Load More Card */}
          <div className="w-[300px] shrink-0">
            <Card className="w-full h-[200px] flex items-center justify-center hover:bg-muted cursor-pointer transition-colors">
              <Plus className="w-10 h-10 text-muted-foreground" />
            </Card>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
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

export default Homepage;
