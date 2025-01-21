'use client';
import * as React from 'react';
import {StructureCarousel} from './homepage/structures_carousel';
import {Footer} from './homepage/footer';
import {Hero} from './homepage/hero';
import {TunnelDemo} from './homepage/demo_tunnel';
import '@/components/mstar/mstar.css';
import {BsiteDemo} from './homepage/demo_bsite';
import {useRoutersRouterLigClassifyreReportQuery} from '@/store/ribxz_api/ribxz_api';
import {TreeSelect} from 'antd';
import {useState, useMemo, useRef, useEffect} from 'react'
import DemoComponent from './ligselect';

const Homepage = () => {
    return (
        <div className="container mx-auto px-4 max-w-6xl">
            <Hero />
            <StructureCarousel />
            <div className="w-full flex flex-col md:flex-row gap-8 py-8">
                <TunnelDemo />
                <BsiteDemo />
            </div>
            <div className="w-full flex flex-col md:flex-row gap-8 py-8">
                <DemoComponent/>
            </div>
            <Footer />
        </div>
    );
};

export default Homepage;
