import React from 'react';
import { Select, Spin } from 'antd';
import { useRoutersRouterLigClassifyreReportQuery } from '@/store/ribxz_api/ribxz_api';

const categoryColors = {
    Aminoglycosides: '#BFDBFE', // blue-100
    Macrolides: '#BBF7D0', // green-100
    Tetracyclines: '#E9D5FF', // purple-100
    Oxazolidinones: '#FFEDD5', // orange-100
    Lincosamides: '#FCE7F3', // pink-100
    Streptogramins: '#FEF9C3', // yellow-100
    Ketolides: '#FEE2E2', // red-100
    Phenylpropanoids: '#E0E7FF', // indigo-100
    'Thiazolo peptides': '#CCFBF1', // teal-100
    Chloramphenicol: '#F3F4F6', // gray-100
    'Fusidic acid': '#FEF3C7'  // amber-100
};

const extractCategories = (ligand) => {
    if (!ligand) return [];
    const categories = new Set();

    // Check direct_parent
    if (ligand.direct_parent?.name) {
        categories.add(ligand.direct_parent.name);
    }

    // Check alternative_parents
    ligand.alternative_parents?.forEach(parent => {
        if (parent.name) categories.add(parent.name);
    });

    // Check ancestors
    ligand.ancestors?.forEach(ancestor => {
        if (categoryColors[ancestor]) {
            categories.add(ancestor);
        }
    });

    return Array.from(categories);
};

const LigandSelect = ({ onChange }) => {
    const { data: ligands, isLoading } = useRoutersRouterLigClassifyreReportQuery();

    // Custom option render with category tags
    const renderOption = (ligand) => {
        const categories = extractCategories(ligand);
        
        return {
            value: ligand.identifier,
            label: (
                <div className="flex items-center justify-between py-1">
                    <span style={{ fontFamily: 'monospace' }}>{ligand.identifier}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {categories.slice(0, 3).map((category) => (
                            <span
                                key={`${ligand.identifier}-${category}`}
                                style={{
                                    backgroundColor: categoryColors[category] || '#F3F4F6',
                                    padding: '2px 8px',
                                    borderRadius: '9999px',
                                    fontSize: '12px'
                                }}
                            >
                                {category}
                            </span>
                        ))}
                        {categories.length > 3 && (
                            <span style={{ fontSize: '12px', color: '#6B7280' }}>
                                +{categories.length - 3}
                            </span>
                        )}
                    </div>
                </div>
            ),
            data: ligand
        };
    };

    const options = ligands ? ligands.map(renderOption) : [];

    const handleChange = (values) => {
        if (!ligands) return;
        
        const selectedLigands = values.map(value => 
            ligands.find(l => l.identifier === value)
        ).filter(Boolean);
        
        onChange?.(selectedLigands);
    };

    return (
        <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder={isLoading ? 'Loading ligands...' : 'Search ligands...'}
            optionFilterProp="value"
            options={options}
            onChange={handleChange}
            loading={isLoading}
            notFoundContent={isLoading ? <Spin size="small" /> : null}
            maxTagCount="responsive"
            showSearch
            allowClear
            disabled={isLoading}
        />
    );
};

// Demo wrapper component
const DemoComponent = () => {
    return (
            <LigandSelect 
                onChange={selected => console.log('Selected:', selected)} 
            />
    );
};

export default DemoComponent;
