'use client';
import DiceIcon from '../../public/dice.svg';
import Image from 'next/image';
import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Separator} from '@/components/ui/separator';
import {Table, TableHeader, TableRow, TableHead, TableBody, TableCell} from '@/components/ui/table';
import {HoverCard, HoverCardContent, HoverCardTrigger} from '@/components/ui/hover-card';
import {ScrollArea, ScrollBar} from '@/components/ui/scroll-area';
import * as React from 'react';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {Input} from '@/components/ui/input';
import {Card} from '@/components/ui/card';
import {ImageDown, Plus} from 'lucide-react';
import {StructureCard} from '@/components/ribxz/structure_card';
import {useAppDispatch, useAppSelector} from '@/store/store';
import {useGetStructuresMutation} from '@/store/ribxz_api/structures_api';
import {useDebounceFilters} from '@/components/filters/structure_filters_component';
import {
    set_current_structures,
    set_structures_cursor,
    set_structures_filter,
    set_total_structures_count
} from '@/store/slices/slice_structures';
import FloatingMenu from '@/components/ribxz/menu_floating';

const InkscapeOverlay = ({active}) => {
    return (
        <div className="relative w-full h-full pointer-events-none">
            {' '}
            {/* Added pointer-events-none */}
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
                    ${active ? 'opacity-100' : 'opacity-0'}
                `}
            />
        </div>
    );
};

export const Hero = () => {
    const [inputActive, setInputActive] = useState(false);
    const handleInputChange = (e: any) => {
        const hasValue = e.target.value.length > 0;
        setInputActive(hasValue);
        dispatch(
            set_structures_filter({
                filter_type: 'search',
                value: e.target.value
            })
        );
    };

    const handleInputFocus = () => {
        setInputActive(true);
    };

    const handleInputBlur = (e: any) => {
        if (e.target.value.length === 0) {
            setInputActive(false);
        }
    };

    const filter_state = useAppSelector(state => state.structures_page.filters);

    const dispatch = useAppDispatch();

    return (
        <div className="mt-20 flex flex-col items-center justify-center">
            <FloatingMenu />
            {/* Logo + Text Container */}
            <div className="w-full max-w-2xl flex gap-4 items-start relative mb-4">
                {/* InkscapeOverlay - Larger and positioned to extend below */}
                <div className="absolute -bottom-32 left-0 w-72 h-72">
                    <InkscapeOverlay active={inputActive} />
                </div>

                {/* Text Container - Pushed to the right to make room for overlay */}
                <div className="pl-44 ml-auto flex flex-col gap-2 max-w-xl justify-start items-start">
                    <Image
                        width={200}
                        height={40}
                        src="/inkscape_overlay/riboxyz_textlogo.svg"
                        alt="riboxyz"
                        className="h-10 w-auto object-contain"
                    />
                    <span className="pl-1 font-mono text-gray-600">
                        An interface to the atomic structure of the ribosome.
                    </span>
                </div>
            </div>

            {/* Search Input */}
            <div className="w-full max-w-2xl relative z-10">
                <Input
                    className="w-full bg-white/80 backdrop-blur-none border-gray-200 focus:border-gray-300 transition-colors"
                    placeholder="Search structures..."
                    value={filter_state.search || ''} // Always provide a string value
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                />
            </div>
        </div>
    );
};
