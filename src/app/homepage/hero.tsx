'use client';
import Image from 'next/image';
import {useEffect, useRef, useState} from 'react';
import * as React from 'react';
import {Input} from '@/components/ui/input';
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
    const [getStructures, {isLoading: structs_isLoading, isError: structs_isErorr, error: structs_error}] =
        useGetStructuresMutation();
    const [isLoading, setIsLoading] = useState(false);
    const debounced_filters = useDebounceFilters(filter_state, 250);
    const [hasMore, setHasMore] = useState(true);

    const structures_cursor = useAppSelector(state => state.structures_page.structures_cursor);
    const current_structures = useAppSelector(state => state.structures_page.current_structures);
    const total_structures_count = useAppSelector(state => state.structures_page.total_structures_count);



    const dispatch = useAppDispatch();
    const fetchStructures = async (newCursor: string | null = null) => {
        setIsLoading(true);
        const payload = {
            cursor: newCursor,
            limit: 10,
            year: filter_state.year[0] === null && filter_state.year[1] === null ? null : filter_state.year,
            search: filter_state.search || null,
            resolution:
                filter_state.resolution[0] === null && filter_state.resolution[1] === null
                    ? null
                    : filter_state.resolution,
            polymer_classes: filter_state.polymer_classes.length === 0 ? null : filter_state.polymer_classes,
            source_taxa: filter_state.source_taxa.length === 0 ? null : filter_state.source_taxa,
            host_taxa: filter_state.host_taxa.length === 0 ? null : filter_state.host_taxa,
            subunit_presence: filter_state.subunit_presence || null
        };

        try {
            const result = await getStructures(payload).unwrap();
            const {structures: new_structures, next_cursor, total_count} = result;

            if (newCursor === null) {
                dispatch(set_current_structures(new_structures));
            } else {
                dispatch(set_current_structures([...current_structures, ...new_structures]));
            }

            dispatch(set_total_structures_count(total_count));

            dispatch(set_structures_cursor(next_cursor));
            setHasMore(next_cursor !== null);
        } catch (err) {
            console.error('Error fetching structures:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        dispatch(set_current_structures([]));
        dispatch(set_structures_cursor(null));
        setHasMore(true);
        fetchStructures();
    }, [debounced_filters]);

    const loadMore = () => {
        if (!isLoading && hasMore) {
            fetchStructures(structures_cursor);
        }
    };





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
