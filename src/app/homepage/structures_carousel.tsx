import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Plus, Loader2 } from 'lucide-react';
import { StructureCard } from '@/components/ribxz/structure_card';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { 
    set_current_structures, 
    set_structures_cursor, 
    set_total_structures_count 
} from '@/store/slices/slice_structures';
import { useGetStructuresMutation } from '@/store/ribxz_api/structures_api';

export const StructureCarousel = () => {
    const dispatch = useAppDispatch();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const current_structures = useAppSelector(state => state.structures_page.current_structures);
    const structures_cursor = useAppSelector(state => state.structures_page.structures_cursor);
    const total_count = useAppSelector(state => state.structures_page.total_structures_count);
    
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [getStructures] = useGetStructuresMutation();

    const handleWheel = (e: WheelEvent) => {
        const scrollViewport = scrollContainerRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollViewport) {
            e.preventDefault();
            e.stopPropagation();
            const scrollAmount = e.deltaY * 0.5;
            scrollViewport.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    };

    const fetchStructures = async (newCursor: string | null = null) => {
        setIsLoading(true);
        try {
            const payload = {
                cursor: newCursor,
                limit: 10,
                // Add any additional filter parameters here if needed
            };

            const result = await getStructures(payload).unwrap();
            const { structures: new_structures, next_cursor, total_count } = result;

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

    const loadMore = () => {
        if (!isLoading && hasMore) {
            fetchStructures(structures_cursor);
        }
    };

    useEffect(() => {
        const element = scrollContainerRef.current;
        if (element) {
            element.addEventListener('wheel', handleWheel, { passive: false });
            return () => element.removeEventListener('wheel', handleWheel);
        }
    }, []);

    useEffect(() => {
        if (current_structures.length === 0) {
            fetchStructures();
        }
    }, []);

    // Only show load more if we have 20 or more total items
    const shouldShowLoadMore = total_count >= 20 && hasMore;

    return (
        <div className="w-full space-y-4" ref={scrollContainerRef}>
            <ScrollArea className="no-scrollbar w-full rounded-md border bg-white/80 backdrop-blur-none border-gray-200 focus:border-gray-300 transition-colors">
                <div className="bg-slate-100 flex p-4 space-x-4 shadow-inner">
                    {current_structures.map((structure, i) => (
                        <StructureCard _={structure} key={i} />
                    ))}

                    {shouldShowLoadMore && (
                        <div className="w-64 shrink-0" onClick={loadMore}>
                            <Card className="w-full h-full flex flex-col items-center justify-center hover:bg-muted cursor-pointer transition-colors rounded-md bg-slate-50">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
                                        <span className="mt-2">Loading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-10 h-10 text-muted-foreground" />
                                        <span className="mt-2">Load More</span>
                                    </>
                                )}
                            </Card>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};
