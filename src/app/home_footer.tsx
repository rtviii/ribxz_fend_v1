import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/components/utils';

const CITATION_FORMATS = [
    { id: 'bibtex', label: 'BibTeX' },
    { id: 'vancouver', label: 'Vancouver' },
    { id: 'apa', label: 'APA' },
    { id: 'mla', label: 'MLA' },
];

const CITATIONS = {
    bibtex: `@article{kushner2023riboxyz,
  title={RiboXYZ: a comprehensive database for visualizing and analyzing ribosome structures},
  author={Kushner, Artem and Petrov, Anton S and Dao Duc, Khanh},
  journal={Nucleic Acids Research},
  volume={51},
  number={D1},
  pages={D509--D516},
  year={2023},
  publisher={Oxford University Press}
}`,
    vancouver: `Kushner A, Petrov AS, Dao Duc K. RiboXYZ: a comprehensive database for visualizing and analyzing ribosome structures. Nucleic Acids Research. 2023 Jan 6;51(D1):D509-16.`,
    apa: `Kushner, A., Petrov, A. S., & Dao Duc, K. (2023). RiboXYZ: a comprehensive database for visualizing and analyzing ribosome structures. Nucleic Acids Research, 51(D1), D509-D516.`,
    mla: `Kushner, Artem, Anton S. Petrov, and Khanh Dao Duc. "RiboXYZ: a comprehensive database for visualizing and analyzing ribosome structures." Nucleic Acids Research 51.D1 (2023): D509-D516.`,
};

const Citations = () => {
    const [format, setFormat] = useState('bibtex');
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(CITATIONS[format]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-2/3 pl-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">How to Cite</h2>
            <div className="flex gap-2 mb-4">
                {CITATION_FORMATS.map((citationFormat) => (
                    <button
                        key={citationFormat.id}
                        onClick={() => setFormat(citationFormat.id)}
                        className={cn(
                            'px-3 py-1 text-sm rounded-md transition-colors',
                            format === citationFormat.id
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                        )}>
                        {citationFormat.label}
                    </button>
                ))}
            </div>
            <div className="relative h-64"> {/* Fixed height container */}
                <div className="absolute inset-0 overflow-auto">
                    <pre className="text-sm bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono whitespace-pre-wrap">
                        {CITATIONS[format]}
                    </pre>
                </div>
                <button
                    onClick={copyToClipboard}
                    className="absolute top-2 right-2 p-1.5 rounded-md 
                    bg-white text-gray-500 opacity-60 hover:opacity-100 
                    hover:bg-gray-100 transition-all duration-150 border border-gray-200
                    z-10">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
            </div>
        </div>
    );
};

const Acknowledgements = ({items}) => {
    const [hoveredItem, setHoveredItem] = useState(null);

    return (
        <div className="w-1/3">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Acknowledgements</h2>
            <p className="text-sm text-gray-500 mb-6">
                We are indebted to the following institutions and projects for being open source or supporting us otherwise
            </p>
            <div className="grid grid-cols-2 gap-8">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="relative group"
                        onMouseEnter={() => setHoveredItem(index)}
                        onMouseLeave={() => setHoveredItem(null)}>
                        <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block transition-transform duration-200 hover:scale-105">
                            <div className="relative flex items-center justify-center">
                                <img
                                    src={item.icon}
                                    alt={item.name}
                                    className={cn(
                                        'w-20 h-20 object-contain transition-all duration-300',
                                        hoveredItem === index ? 'filter-none' : 'grayscale opacity-60'
                                    )}
                                />
                            </div>
                        </a>

                        {hoveredItem === index && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white text-sm rounded-lg p-3 shadow-lg z-10 border border-gray-200">
                                <div className="text-center">
                                    <p className="font-medium text-gray-900 mb-1">{item.name}</p>
                                    <p className="text-gray-600 text-xs">{item.description}</p>
                                </div>
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                                    <div className="border-8 border-transparent border-t-white" />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const BottomSection = ({ acknowledgements }) => {
    return (
        <section className="relative py-12">
            <div className="absolute top-0 left-0 w-full h-px">
                <div className="max-w-6xl mx-auto px-4 relative">
                    <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex">
                    <Acknowledgements items={acknowledgements} />
                    <Citations />
                </div>
            </div>
        </section>
    );
};

export default BottomSection;