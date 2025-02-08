import {ScrollArea} from '@/components/ui/scroll-area';
import * as React from 'react';
import {StructureCarousel} from './homepage/structures_carousel';
import {Hero} from './homepage/hero';
import {TunnelDemo} from './homepage/demo_tunnel_human';
import '@/components/mstar/mstar.css';
import {BsiteDemo} from './homepage/demo_bsite';
import {Check, ChevronRight, Copy} from 'lucide-react';
import {TunnelDemoBacterial} from './homepage/demo_tunnel_bacterial_ligand';
import {TunnelDemoMito} from './homepage/demo_tunnel_mito';
import {cn} from '@/components/utils';
import {Terminal} from 'lucide-react';
import {useState} from 'react';
import {useAppSelector} from '@/store/store';
import BottomSection from './home_footer';
import Link from 'next/link';
const tunnel_struct_citations = {
    '4UG0': {
        title: 'Ribosome structures to near-atomic resolution from thirty thousand cryo-EM particles',
        authors: 'Bai, X., Fernández, I., McMullan, G. et al.',
        journal: 'Nature',
        volume: '525',
        pages: '486–490',
        year: '2015',
        doi: '10.1038/nature14427'
    },
    '3J7Z': {
        title: 'Drug Sensing by the Ribosome Induces Translational Arrest via Active Site Perturbation',
        authors: 'Arenz, S., Meydan, S., Starosta, A.L. et al.',
        journal: 'Molecular Cell',
        volume: '56',
        pages: '446-452',
        year: '2014',
        doi: '10.1016/j.molcel.2014.09.014'
    },
    '7A5G': {
        title: 'Elongational stalling activates mitoribosome-associated quality control',
        authors: 'Desai, N., Yang, H., Chandrasekaran, V. et al.',
        journal: 'Science',
        volume: '370',
        pages: '1105-1110',
        year: '2020',
        doi: '10.1126/science.abc7782'
    }
};

export const ProteinPill = ({text, color}) => {
    const hexToRgb = hex => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16)
              }
            : null;
    };
    const rgb = hexToRgb(color);
    const bgColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)` : 'transparent';

    return (
        <span
            className="inline-flex items-center px-1.5 rounded-sm text-xs font-mono align-baseline mx-0.5"
            style={{
                backgroundColor: bgColor,
                border: `1px solid ${color}`,
                color: color,
                lineHeight: '1.1'
            }}>
            {text}
        </span>
    );
};

export const DocSection = ({text, code}) => (
    <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">{text}</p>
        <CodeBlock code={code} />
    </div>
);

export const SectionHeader = ({
    title,
    description,
    documentation,
    lastUpdate,
    className,
    children,
    navigationPath // New prop for navigation
}) => {
    const [showDocs, setShowDocs] = useState(false);
    const [demoHeight, setDemoHeight] = useState(0);
    const demoRef = React.useRef(null);
    const isClickable = !!navigationPath;

    React.useEffect(() => {
        if (demoRef.current) {
            const updateHeight = () => {
                setDemoHeight(demoRef.current.offsetHeight);
            };
            updateHeight();
            window.addEventListener('resize', updateHeight);
            return () => window.removeEventListener('resize', updateHeight);
        }
    }, [children]);

    const HeaderContent = () => (
        <div className={cn(
            "flex items-start justify-between  py-4 -my-4",  // Added vertical padding and negative margin
            isClickable && "cursor-pointer"
        )}>
            <div className="max-w-[75%]">
                <h2 className={cn(
                    "text-lg font-semibold text-gray-900  group/nav flex items-center",
                    isClickable && "group-hover/nav:text-blue-600 transition-colors duration-200"
                )}>
                    <span>{title}</span>
                    {isClickable && (
                        <span className="inline-flex items-center ml-2 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-200">
                            <div className="w-8 bg-gradient-to-l from-gray-100 to-transparent h-full absolute right-full" />
                            <ChevronRight className="h-5 w-5 text-blue-600" />
                        </span>
                    )}
                </h2>
                <p className="mt-1 text-sm text-gray-500 whitespace-pre-line">{description}</p>
            </div>

            <button
                onClick={(e) => {
                    e.preventDefault(); // Prevent the default link behavior
                    e.stopPropagation(); // Stop event from bubbling up to parent link
                    setShowDocs(prev => !prev);
                }}
                className={cn(
                    'px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 border-2 flex-shrink-0',
                    showDocs
                        ? 'text-blue-600 bg-blue-50 border-blue-200 shadow-md'
                        : 'text-gray-600 hover:text-gray-800 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                )}>
                <Terminal className="h-5 w-5" />
                <span className="text-sm font-medium">Get via API</span>
            </button>
        </div>
    );

    const header = isClickable ? (
        <Link href={navigationPath}>
            <HeaderContent />
        </Link>
    ) : (
        <HeaderContent />
    );

    return (
        <div className="mb-6">
            {header}
            {lastUpdate && <p className="mt-2 text-xs text-gray-500">Last update: {lastUpdate}</p>}

            <div className="mt-4 overflow-hidden">
                <div
                    className={cn(
                        'transition-all duration-300 flex w-[200%]',
                        showDocs ? '-translate-x-1/2' : 'translate-x-0'
                    )}>
                    <div className="w-1/2 flex-shrink-0" ref={demoRef}>
                        <div className={className}>{children}</div>
                    </div>

                    <div className="w-1/2 flex-shrink-0">
                        <div className="bg-gray-50 rounded-lg" style={{height: `${demoHeight}px`}}>
                            <ScrollArea className="h-full">
                                <div className="p-4">
                                    {documentation.map((doc, index) => (
                                        <DocSection key={index} {...doc} />
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const CitationContent = ({citation}) => (
    <div className="absolute z-50 w-96 p-4 text-sm bg-white rounded-lg shadow-lg border border-gray-200 bottom-full left-full -ml-4">
        <p className="font-medium text-gray-900 mb-2">Citation:</p>
        <p className="text-gray-600">
            {citation.authors} {citation.title}. {citation.journal} {citation.volume}, {citation.pages} ({citation.year}
            ).
        </p>
        <p className="text-blue-600 hover:text-blue-800 mt-2">DOI: {citation.doi}</p>
    </div>
);

export const CitationTooltip = ({pdbId}) => {
    const [isHovered, setIsHovered] = useState(false);
    const citation = tunnel_struct_citations[pdbId];

    if (!citation) return null;

    const handleClick = e => {
        e.preventDefault(); // Prevent the parent Link from triggering
        window.open(`https://doi.org/${citation.doi}`, '_blank', 'noopener,noreferrer');
    };

    return (
        <span
            className="relative inline-block group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
            role="button"
            tabIndex={0}>
            <span className="italic cursor-help">
                {pdbId}
                <sup className="text-gray-400 ml-0.5">*</sup>
            </span>

            {isHovered && <CitationContent citation={citation} />}
        </span>
    );
};

export const DemoFooter = ({species, pdbId}) => (
    <Link href={`/structures/${pdbId}`} className="block">
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 group hover:text-gray-700">
            <div className="flex items-center space-x-1">
                <span>
                    To structure <CitationTooltip pdbId={pdbId} />
                </span>
                <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </div>
            {species && <span className="italic">{species}</span>}
        </div>
    </Link>
);

import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import 'highlight.js/styles/nord.css'; // or any other style you prefer

// Register bash language
hljs.registerLanguage('bash', bash);

export const CodeBlock = ({ code }) => {
  const [copied, setCopied] = useState(false);

  // Clean up code for copying
  const copyCode = () => {
    const cleanCode = code
      .replace(/^\$ /gm, '')  // Remove $ prompts
      .replace(/\\\s*\n\s*/g, ' ')  // Join lines that end in backslash
      .trim();
    
    navigator.clipboard.writeText(cleanCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Add $ prompt if not present
  const displayCode = !code.startsWith('$ ') ? `$ ${code}` : code;
  
  // Highlight the code
  const highlightedCode = hljs.highlight(displayCode, {
    language: 'bash'
  }).value;

  return (
    <div className="relative group my-4">
      <pre 
        className="text-sm bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono"
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
      <button
        onClick={copyCode}
        className="absolute top-2 right-2 p-1.5 rounded-md 
                  bg-gray-800 text-gray-300 opacity-0 group-hover:opacity-100 
                  hover:bg-gray-700 transition-all duration-150"
        title="Copy to clipboard"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
};;
