import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Polymer } from '@/store/ribxz_api/ribxz_api';

interface PolymerTooltipWrapperProps {
  polymer: Polymer;
  children: React.ReactNode;
}

const PolymerTooltipWrapper: React.FC<PolymerTooltipWrapperProps> = ({ polymer, children }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent 
        side="right" 
        sideOffset={5} 
        className="z-[100] pointer-events-auto max-w-sm"
        style={{ transform: 'translate3d(0,0,999px)' }}
      >
        <div className="space-y-2">
          {polymer.rcsb_pdbx_description && (
            <div className="bg-blue-50 p-2 rounded-sm">
              <p className="text-xs text-gray-700">{polymer.rcsb_pdbx_description}</p>
            </div>
          )}
          
          <div className="space-y-1">
            <div className="text-xs text-gray-500">
              {polymer.entity_poly_polymer_type} ({polymer.entity_poly_entity_type})
            </div>
            <div className="bg-blue-50 p-2 rounded-sm">
              <div className="text-xs font-mono">
                Length: {polymer.entity_poly_seq_length}
              </div>
              {polymer.src_organism_names.length > 0 && (
                <div className="text-xs text-gray-600 mt-1">
                  Source: {polymer.src_organism_names.join(', ')}
                </div>
              )}
            </div>
            {polymer.entity_poly_seq_one_letter_code && (
              <div className="bg-blue-50 p-2 rounded-sm">
                <div className="text-xs font-mono break-all">
                  {polymer.entity_poly_seq_one_letter_code}
                </div>
              </div>
            )}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default PolymerTooltipWrapper;