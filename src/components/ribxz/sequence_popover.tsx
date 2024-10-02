import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import  {  useRef, useEffect } from 'react';
import { ArrowUpRight } from "lucide-react";


const ArrowIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.5 3.04999C11.7485 3.04999 11.95 3.25146 11.95 3.49999V7.49999C11.95 7.74852 11.7485 7.94999 11.5 7.94999C11.2515 7.94999 11.05 7.74852 11.05 7.49999V4.58639L4.58638 11.05H7.49999C7.74852 11.05 7.94999 11.2515 7.94999 11.5C7.94999 11.7485 7.74852 11.95 7.49999 11.95L3.49999 11.95C3.38064 11.95 3.26618 11.9026 3.18179 11.8182C3.0974 11.7338 3.04999 11.6193 3.04999 11.5L3.04999 7.49999C3.04999 7.25146 3.25146 7.04999 3.49999 7.04999C3.74852 7.04999 3.94999 7.25146 3.94999 7.49999L3.94999 10.4136L10.4136 3.94999L7.49999 3.94999C7.25146 3.94999 7.04999 3.74852 7.04999 3.49999C7.04999 3.25146 7.25146 3.04999 7.49999 3.04999L11.5 3.04999Z"
      fill={color}
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
);


const SequencePopover = ({ sequence, seqType }: { sequence: string; seqType: 'amino' | 'rna' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selection, setSelection] = useState({ start: -1, end: -1 });
  const sequenceRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (index: number) => {
    setSelection({ start: index, end: index });
  };

  const handleMouseMove = (index: number) => {
    if (selection.start !== -1) {
      setSelection(prev => ({ ...prev, end: index }));
    }
  };

  const handleMouseUp = () => {
    if (selection.start !== -1 && selection.end !== -1) {
      const start = Math.min(selection.start, selection.end);
      const end = Math.max(selection.start, selection.end);
      console.log(`Selected: ${sequence.substring(start, end + 1)} (indices: ${start}-${end})`);
    }
  };

  useEffect(() => {
    const handleMouseLeave = () => {
      if (selection.start !== -1) {
        handleMouseUp();
        setSelection({ start: -1, end: -1 });
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    sequenceRef.current?.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      sequenceRef.current?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [selection]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="p-0" onMouseEnter={() => setIsOpen(true)}>
          <ArrowUpRight size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[800px] max-h-[300px] overflow-y-auto p-0" 
        onMouseLeave={() => setIsOpen(false)}
      >
        <div 
          ref={sequenceRef}
          className="font-mono text-sm whitespace-pre-wrap p-4"
          style={{ userSelect: 'none' }}
        >
          {sequence.split('').map((char, index) => (
            <span
              key={index}
              className={`inline-block w-[1ch] text-center ${
                index >= Math.min(selection.start, selection.end) && 
                index <= Math.max(selection.start, selection.end)
                  ? 'bg-blue-200'
                  : ''
              }`}
              onMouseDown={() => handleMouseDown(index)}
              onMouseMove={() => handleMouseMove(index)}
            >
              {char}
            </span>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SequencePopover;
