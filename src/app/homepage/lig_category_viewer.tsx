import React, {useState} from 'react';
import {ChevronRight, ChevronDown} from 'lucide-react';
import {cn} from '@/components/utils';
import {MolstarDemoBsites} from '@/components/mstar/demos/molstar_demo_bsites';
const categoryColors = {
    Aminoglycosides : '#E8916B',   // Muted coral orange
    Aminocyclitols  : '#D4775E',   // Faded terracotta
    Fluoroquinolones: '#5C6BC0',   // Bright indigo (kept as is)
    Macrolides      : '#00BCD4',   // Bright cyan
    Ketolides       : '#00ACC1',   // Deeper cyan
    Lincosamides    : '#0288D1',   // Bright blue (kept as is)
    Streptogramins  : '#FF8A65',   // Soft coral
    Pleuromutilins  : '#2E7D32',   // Forest green
    Oxazolidinones  : '#FFB74D',   // Muted gold
    Tetracyclines   : '#2E7D32'    // Forest green
};

const CategoryLabel: React.FC<{text: string; count: number; color: string}> = ({text, count, color}) => {
    return (
        <div className="flex items-center space-x-1">
            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0 4px',
                    margin: '2px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    color: 'black',
                    border: `1px solid ${color}`
                }}>
                {text}
                <span className="ml-1.5 px-4 rounded-sm">{count}</span>
            </span>
        </div>
    );
};

const LigandItem: React.FC<{
    chemicalId: string;
    chemicalName: string;
    color: string;
}> = ({chemicalId, chemicalName, color}) => (
    <div
        className="flex items-center py-0.5 px-2 hover:bg-slate-100 cursor-pointer group"
        onMouseEnter={() => {
            console.log('Hover:', chemicalId);
        }}
        onMouseLeave={() => {
            console.log('Unhover:', chemicalId);
        }}
        onClick={() => {
            console.log('Click:', chemicalId);
        }}>
        <span
            className="inline-block w-1.5 h-1.5 rounded-full mr-2 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
            style={{backgroundColor: color}}
        />
        <div className="flex flex-col min-w-0">
            <span className="text-xs truncate font-medium">{chemicalId}</span>
            <span className="text-xs text-gray-500 truncate">{chemicalName}</span>
        </div>
    </div>
);

const LigandCategoryViewer: React.FC<{data: Record<string, any>; ctx: MolstarDemoBsites}> = ({data, ctx}) => {
    const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
    const toggleCategory = (category: string) => {
        const newOpen = new Set(openCategories);
        if (newOpen.has(category)) {
            newOpen.delete(category);
        } else {
            newOpen.add(category);
        }
        setOpenCategories(newOpen);
    };

    return (
        <div className="w-64 h-full overflow-hidden flex flex-col border rounded-md">
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {Object.entries(data).map(([category, categoryData]) => {
                    if (category === 'Other' || category === 'Aminoglycosides') return null;

                    const color = categoryColors[category] || '#808080';
                    const isOpen = openCategories.has(category);

                    return (
                        <div key={category} className="border-b border-gray-200 last:border-b-0">
                            <div
                                className={cn(
                                    'flex items-center px-2 py-1 hover:cursor-pointer hover:bg-gray-50 transition-colors',
                                    'hover:border-l-4 hover:border-l-slate-400'
                                )}
                                onMouseEnter={() => {}}
                                onMouseLeave={() => {}}
                                onClick={() => toggleCategory(category)}>
                                {isOpen ? (
                                    <ChevronDown size={14} className="shrink-0 mr-1 text-gray-400" />
                                ) : (
                                    <ChevronRight size={14} className="shrink-0 mr-1 text-gray-400" />
                                )}
                                <CategoryLabel text={category} count={categoryData.items.length} color={color} />
                            </div>
                            {isOpen && (
                                <div className="pl-7">
                                    {categoryData.items.map(ligand => (
                                        <LigandItem
                                            key={ligand.chemicalId}
                                            chemicalId={ligand.chemicalId}
                                            chemicalName={ligand.chemicalName}
                                            color={color}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LigandCategoryViewer;
