import React, {useState, useRef, useEffect} from 'react';
import {X, Minimize2, Maximize2} from 'lucide-react';
import SequenceViewer, {ResidueData} from './sequence_viewer';
import {createPortal} from 'react-dom';
import {createContext, useContext, useCallback} from 'react';

interface Position {
    x: number;
    y: number;
}

interface DraggableWindowProps {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    title: string;
    initialPosition?: Position;
    minWidth?: number;
    minHeight?: number;
}

interface Size {
    width: number;
    height: number;
}

interface DraggableWindowProps {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    title: string;
    initialPosition?: Position;
    initialSize?: Size;
    minWidth?: number;
    minHeight?: number;
}

interface DragOffset {
    x: number;
    y: number;
}

export const DraggableWindow: React.FC<DraggableWindowProps> = ({
    children,
    isOpen,
    onClose,
    title,
    initialPosition = {x: 100, y: 100},
    initialSize = {width: 400, height: 300},
    minWidth = 400,
    minHeight = 300
}) => {
    const [position, setPosition] = useState<Position>(initialPosition);
    const [size, setSize] = useState<Size>(initialSize);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState<DragOffset>({x: 0, y: 0});
    const [isMinimized, setIsMinimized] = useState(false);
    const windowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const newX = e.clientX - dragOffset.x;
                const newY = e.clientY - dragOffset.y;

                const maxX = window.innerWidth - (windowRef.current?.offsetWidth || 0);
                const maxY = window.innerHeight - (windowRef.current?.offsetHeight || 0);

                setPosition({
                    x: Math.max(0, Math.min(newX, maxX)),
                    y: Math.max(0, Math.min(newY, maxY))
                });
            } else if (isResizing) {
                e.preventDefault();
                const rect = windowRef.current?.getBoundingClientRect();
                if (!rect) return;

                if (isResizing.includes('right')) {
                    const newWidth = Math.max(minWidth, e.clientX - rect.left);
                    setSize(prev => ({...prev, width: newWidth}));
                }
                if (isResizing.includes('bottom')) {
                    const newHeight = Math.max(minHeight, e.clientY - rect.top);
                    setSize(prev => ({...prev, height: newHeight}));
                }
                if (isResizing.includes('left')) {
                    const newWidth = Math.max(minWidth, rect.right - e.clientX);
                    const newX = position.x + (rect.width - newWidth);
                    setSize(prev => ({...prev, width: newWidth}));
                    setPosition(prev => ({...prev, x: newX}));
                }
                if (isResizing.includes('top')) {
                    const newHeight = Math.max(minHeight, rect.bottom - e.clientY);
                    const newY = position.y + (rect.height - newHeight);
                    setSize(prev => ({...prev, height: newHeight}));
                    setPosition(prev => ({...prev, y: newY}));
                }
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(null);
        };

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragOffset, minWidth, minHeight, position.x, position.y]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const startResize = (direction: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(direction);
    };

    if (!isOpen) return null;

    // Only create the portal if we're in a browser environment
    if (typeof window === 'undefined') return null;

    const windowContent = (
        <div
            ref={windowRef}
            className="fixed bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
            style={{
                left: position.x,
                top: position.y,
                width: isMinimized ? 'auto' : size.width,
                height: isMinimized ? 'auto' : size.height,
                zIndex: 50
            }}>
            {/* Title Bar */}
            <div
                className="bg-gray-100 px-4 py-2 cursor-move flex items-center justify-between select-none"
                onMouseDown={handleMouseDown}>
                <span className="font-medium">{title}</span>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-gray-200 rounded">
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className={isMinimized ? 'hidden' : 'p-4 h-[calc(100%-3rem)] overflow-auto'}>{children}</div>

            {/* Resize Handles */}
            {!isMinimized && (
                <>
                    <div
                        className="absolute top-0 left-0 w-2 h-full cursor-ew-resize"
                        onMouseDown={startResize('left')}
                    />
                    <div
                        className="absolute top-0 right-0 w-2 h-full cursor-ew-resize"
                        onMouseDown={startResize('right')}
                    />
                    <div
                        className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize"
                        onMouseDown={startResize('bottom')}
                    />
                    <div
                        className="absolute top-0 left-0 w-full h-2 cursor-ns-resize"
                        onMouseDown={startResize('top')}
                    />
                    <div
                        className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize"
                        onMouseDown={startResize('top-left')}
                    />
                    <div
                        className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize"
                        onMouseDown={startResize('top-right')}
                    />
                    <div
                        className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize"
                        onMouseDown={startResize('bottom-left')}
                    />
                    <div
                        className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
                        onMouseDown={startResize('bottom-right')}
                    />
                </>
            )}
        </div>
    );

    return createPortal(windowContent, document.body);
};


