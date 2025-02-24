import React from 'react';

export const StructureInfoSkeleton = () => {
  return (
    <div className="border border-gray-200 rounded-md shadow-inner bg-slate-100 p-2 animate-pulse">
      {/* ID and Title */}
      <div className="h-4 w-24 bg-gray-300 rounded mb-3"></div>
      <div className="h-3 w-3/4 bg-gray-200 rounded mb-4"></div>
      
      {/* Info rows */}
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
            <div className="h-3 w-20 bg-gray-300 rounded"></div>
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// components/skeletons/components_panel_skeleton.jsx
export const ComponentsPanelSkeleton = () => {
  return (
    <div className="h-full animate-pulse">
      {/* Tabs */}
      <div className="h-8 flex items-center justify-between bg-gray-50 border-b mb-4">
        <div className="flex items-center gap-2 px-2">
          <div className="h-3 w-16 bg-gray-300 rounded"></div>
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center gap-1 px-2">
          <div className="h-6 w-6 rounded-full bg-gray-200"></div>
          <div className="h-6 w-6 rounded-full bg-gray-200"></div>
        </div>
      </div>

      {/* Polymer items */}
      <div className="px-2 mb-2">
        <div className="relative">
          <div className="w-full h-6 bg-gray-100 rounded-md"></div>
        </div>
      </div>

      {/* Polymer list */}
      <div className="space-y-1 px-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex justify-between items-center p-2 rounded-md border border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-8 bg-gray-300 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-4 w-4 rounded-full bg-gray-200"></div>
              <div className="h-4 w-4 rounded-full bg-gray-200"></div>
              <div className="h-4 w-4 rounded-full bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// components/skeletons/molstar_skeleton.jsx
export const MolstarSkeleton = () => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 animate-pulse">
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-32 h-32 mb-4">
          <div className="absolute inset-0 rounded-full bg-gray-200 opacity-75"></div>
          <div className="absolute inset-4 rounded-full bg-gray-300"></div>
          <div className="absolute inset-8 rounded-full bg-gray-200"></div>
          <div className="absolute inset-12 rounded-full bg-gray-300"></div>
        </div>
        <div className="h-4 w-48 bg-gray-300 rounded"></div>
        <div className="h-3 w-32 bg-gray-200 rounded mt-2"></div>
      </div>
    </div>
  );
};

// components/skeletons/structure_page_skeleton.jsx
export const StructurePageSkeleton = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <div className="flex h-full">
        {/* Left panel - 25% */}
        <div className="w-1/4 h-full p-2 space-y-4">
          <StructureInfoSkeleton />
          <div className="h-2/3 bg-slate-100 rounded-sm shadow-inner p-2">
            <ComponentsPanelSkeleton />
          </div>
        </div>
        
        {/* Divider */}
        <div className="w-px bg-gray-200"></div>
        
        {/* Main viewer - 75% */}
        <div className="w-3/4 h-full">
          <MolstarSkeleton />
        </div>
      </div>
    </div>
  );
};