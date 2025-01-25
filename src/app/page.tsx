'use client';
import * as React from 'react';
import {StructureCarousel} from './homepage/structures_carousel';
import {Footer} from './homepage/footer';
import {Hero} from './homepage/hero';
import {TunnelDemo} from './homepage/demo_tunnel';
import '@/components/mstar/mstar.css';
import {BsiteDemo} from './homepage/demo_bsite';
import {TreeSelect} from 'antd';
import {useState, useMemo, useRef, useEffect} from 'react';
import { LigandSelectDemo } from './ligselect';

const Homepage = () => {
    return (
        <div className="container mx-auto px-4 max-w-6xl min-h-screen space-y-4">
            <Hero />
            <StructureCarousel />
            <div className="w-full h-80 py-8">
                <TunnelDemo />
            </div>
            <div className="w-full h-[32rem] py-8 space-y-2">
                <BsiteDemo />
            </div>

            {/* <div className="w-full h-[32rem] py-8">
                <Footer />
            </div> */}
        </div>
    );
};

export default Homepage;
