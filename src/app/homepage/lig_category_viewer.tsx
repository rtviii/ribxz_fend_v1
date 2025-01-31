import React, {useState, useCallback} from 'react';
import {ChevronRight, ChevronDown} from 'lucide-react';
import {cn} from '@/components/utils';
import {MolstarDemoBsites} from '@/components/mstar/demos/molstar_demo_bsites';
import {MolScriptBuilder as MS} from 'molstar/lib/mol-script/language/builder';
import {compile} from 'molstar/lib/mol-script/runtime/query/base';
import {QueryContext} from 'molstar/lib/mol-model/structure';
import {StructureSelection} from 'molstar/lib/mol-model/structure';

const categoryColors = {
    Aminoglycosides : '#E8916B',   
    Aminocyclitols  : '#D4775E',   
    Fluoroquinolones: '#5C6BC0',   
    Macrolides      : '#00BCD4',   
    Ketolides       : '#00ACC1',   
    Lincosamides    : '#0288D1',   
    Streptogramins  : '#FF8A65',   
    Pleuromutilins  : '#2E7D32',   
    Oxazolidinones  : '#FFB74D',   
    Tetracyclines   : '#2E7D32'    
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
    purported_7K00_binding_site: Array<[string, number]>;
    ctx: MolstarDemoBsites;
}> = ({chemicalId, chemicalName, color, purported_7K00_binding_site, ctx}) => {
    
    const createResidueExpression = useCallback(() => {
        const groups = purported_7K00_binding_site.map(([chain, residue]) =>
            MS.struct.generator.atomGroups({
                'chain-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_asym_id(), chain]),
                'residue-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_seq_id(), residue])
            })
        );
        
        return MS.struct.combinator.merge(groups);
    }, [purported_7K00_binding_site]);

    const getLociFromExpression = useCallback(() => {
        if (!ctx?.ctx.managers.structure.hierarchy.current.structures[0]) return;
        const data = ctx.ctx.managers.structure.hierarchy.current.structures[0].cell.obj?.data;
        if (!data) return;
        
        const expr = createResidueExpression();
        const compiled = compile<StructureSelection>(expr)(new QueryContext(data));
        return StructureSelection.toLociWithSourceUnits(compiled);
    }, [ctx, createResidueExpression]);

    const handleMouseEnter = useCallback(() => {
        if (!ctx || purported_7K00_binding_site.length === 0) return;
        
        const loci = getLociFromExpression();
        if (!loci) return;
        
        ctx.ctx.managers.interactivity.lociHighlights.highlightOnly({ loci });
    }, [ctx, purported_7K00_binding_site, getLociFromExpression]);

    const handleMouseLeave = useCallback(() => {
        if (!ctx) return;
        ctx.ctx.managers.interactivity.lociHighlights.clearHighlights();
    }, [ctx]);

    const handleClick = useCallback(() => {
        if (!ctx || purported_7K00_binding_site.length === 0) return;
        
        const loci = getLociFromExpression();
        if (!loci) return;

        // Clear existing selection and add new one
        ctx.ctx.managers.structure.selection.clear();
        ctx.ctx.managers.structure.selection.fromLoci('add', loci);
        
        // Focus camera on selection
        ctx.ctx.managers.camera.focusLoci(loci);
    }, [ctx, purported_7K00_binding_site, getLociFromExpression]);

    return (
        <div
            className="flex items-center py-0.5 px-2 hover:bg-slate-100 cursor-pointer group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}>
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
};

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
 <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {Object.entries(data).map(([category, categoryData]) => {
                    if (category === 'Other' || category === 'Aminoglycosides') return null;

                    const color = categoryColors[category] || '#808080';
                    const isOpen = openCategories.has(category);

                    return (
                        <div key={category} className="border-b border-gray-200 last:border-b-0">
                            <div
                                className={cn(
                                    'flex items-center px-3 py-2 hover:cursor-pointer hover:bg-gray-50 transition-colors',
                                    'hover:border-l-4 hover:border-l-slate-400'
                                )}
                                onClick={() => toggleCategory(category)}>
                                {isOpen ? (
                                    <ChevronDown size={16} className="shrink-0 mr-2 text-gray-400" />
                                ) : (
                                    <ChevronRight size={16} className="shrink-0 mr-2 text-gray-400" />
                                )}
                                <CategoryLabel text={category} count={categoryData.items.length} color={color} />
                            </div>
                            {isOpen && (
                                <div className="pl-8 py-1">
                                    {categoryData.items.map(ligand => (
                                        <LigandItem
                                            key={ligand.chemicalId}
                                            chemicalId={ligand.chemicalId}
                                            chemicalName={ligand.chemicalName}
                                            purported_7K00_binding_site={ligand.purported_7K00_binding_site}
                                            color={color}
                                            ctx={ctx}
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
