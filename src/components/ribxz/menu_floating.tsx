import React from 'react';
import Link from 'next/link';
import { Settings2, HomeIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function FloatingMenu() {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button className="group fixed bottom-16 right-8 z-50 flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 hover:scale-105 transition-all">
            <span>Menu</span>
            <Settings2 className="w-4 h-4 transition-transform duration-700 ease-in-out group-hover:rotate-180" />
          </button>
        </TooltipTrigger>
        
        <TooltipContent side="top" align="end" className="w-48 p-0">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 shadow-lg">
            {/* Main Navigation */}
            <div className="p-3">
              <Link href="/" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 mb-4 group">
                <HomeIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm">Home</span>
              </Link>
              
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-gray-400 uppercase">Data</h3>
                <nav className="space-y-1">
                  <Link href="/structures" className="block text-sm text-gray-600 hover:text-gray-900 hover:translate-x-1 transition-transform">
                    Structures
                  </Link>
                  <Link href="/polymers" className="block text-sm text-gray-600 hover:text-gray-900 hover:translate-x-1 transition-transform">
                    Polymers
                  </Link>
                  <Link href="/ligands" className="block text-sm text-gray-600 hover:text-gray-900 hover:translate-x-1 transition-transform">
                    Ligands
                  </Link>
                </nav>
              </div>
            </div>
            {/* Footer Links */}
            <div className="border-t border-gray-100 p-3">
              <div className="space-y-1">
                <Link href="mailto:rtkushner@gmail.com,kdd@math.ubc.ca" className="block text-xs text-gray-500 hover:text-gray-700">Contact</Link>
                <span className="block text-xs text-gray-400">v1.0.0</span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}