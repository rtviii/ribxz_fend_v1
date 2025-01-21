'use client';
import * as React from 'react';
import {StructureCarousel} from './homepage/structures_carousel';
import {Footer} from './homepage/footer';
import {Hero} from './homepage/hero';
import {TunnelDemo} from './homepage/demo_tunnel';
import '@/components/mstar/mstar.css';
import {BsiteDemo} from './homepage/demo_bsite';
import {useRoutersRouterLigClassifyreReportQuery} from '@/store/ribxz_api/ribxz_api';
import {TreeSelect} from 'antd';
import {useState, useMemo, useRef, useEffect} from 'react'
// Utility to build tree data structure for antd TreeSelect from chemical entities
export function buildChemicalTreeData(entities) {
    if (!Array.isArray(entities)) return [];
    
    // Pre-allocate maps with estimated size
    const categoryMap = new Map();
    const treeMap = new Map();
    
    // First pass - quick categorization
    for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        if (!entity?.kingdom?.name) continue;
        
        // Handle inorganic compounds with early return
        if (entity.kingdom.name !== "Organic compounds") {
            const inorganics = categoryMap.get("Inorganic/Metals") || [];
            inorganics.push(entity);
            categoryMap.set("Inorganic/Metals", inorganics);
            continue;
        }

        // Quick category determination
        const mainCategory = entity.direct_parent?.name || 
                           entity.subclass?.name || 
                           entity.class?.name || 
                           entity.superclass?.name;

        if (mainCategory) {
            const categoryCompounds = categoryMap.get(mainCategory) || [];
            categoryCompounds.push(entity);
            categoryMap.set(mainCategory, categoryCompounds);
        }
    }

    // Set up organic compounds root once
    treeMap.set("Organic compounds", {
        description: "Organic compounds",
        children: new Map()
    });

    // Build tree structure efficiently
    for (const [category, compounds] of categoryMap) {
        if (category === "Organic compounds") continue;
        
        const parentMap = category === "Inorganic/Metals" ? treeMap : treeMap.get("Organic compounds").children;
        
        if (compounds.length > 0) {
            parentMap.set(category, {
                description: compounds[0]?.direct_parent?.description || '',
                children: new Map(
                    compounds.map(compound => [
                        compound.identifier,
                        { description: compound.description, children: null }
                    ])
                )
            });
        }
    }

    // Optimized conversion to antd format
    function convertMapToAntd(map) {
        return Array.from(map.entries()).map(([key, value]) => ({
            value: key,
            title: key,
            key: key,
            description: value.description,
            children: value.children ? convertMapToAntd(value.children) : undefined
        }));
    }

    return convertMapToAntd(treeMap);
}


const ChemicalTreeSelect = ({
    placeholder = 'Search chemical classes...',
    label = 'Chemical Classification',
    onSelectionChange
}) => {
    const [selectedValues, setSelectedValues] = useState([]);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const { data: entities, isLoading } = useRoutersRouterLigClassifyreReportQuery();
    const dropdownRef = useRef(null);
    
    const treeData = useMemo(() => {
        if (!entities) return [];
        return buildChemicalTreeData(entities);
    }, [entities]);

    // Handle dropdown visibility
    useEffect(() => {
        if (dropdownVisible) {
            // Reset scroll position when opening
            setTimeout(() => {
                const dropdown = document.querySelector('.ant-select-tree');
                if (dropdown) {
                    dropdown.scrollTop = 0;
                }
            }, 100);
        }
    }, [dropdownVisible]);

    const handleDropdownVisibleChange = (visible) => {
        setDropdownVisible(visible);
    };

    const handleFilter = (input, node) => {
        const entity = entities?.find(e => e.identifier === node.value);
        if (entity) {
            if (node.title.toLowerCase().includes(input.toLowerCase())) return true;
            if (entity.alternative_parents?.some(parent => 
                parent.name.toLowerCase().includes(input.toLowerCase())
            )) return true;
            if (entity.substituents?.some(sub => 
                sub.toLowerCase().includes(input.toLowerCase())
            )) return true;
            return false;
        }
        return node.title.toLowerCase().includes(input.toLowerCase());
    };

    return (
        <div className="w-full">
            <label className="text-sm font-medium mb-2 block">{label}</label>
            <TreeSelect
                className="w-full"
                ref={dropdownRef}
                value={selectedValues}
                dropdownStyle={{
                    maxHeight: 400,
                    overflow: 'auto',
                    padding: '4px 0',
                }}
                treeNodeFilterProp="title"
                placeholder={placeholder}
                allowClear
                multiple
                treeData={treeData}
                onChange={setSelectedValues}
                treeNodeLabelProp="title"
                showSearch
                filterTreeNode={handleFilter}
                notFoundContent={
                    <div className="py-2 px-4 text-gray-500">
                        <p>No matches found</p>
                        <p className="text-xs mt-1">Try searching by chemical class, structure type, or properties</p>
                    </div>
                }
                popupMatchSelectWidth={true}
                virtual={false}  // Disable virtual scrolling
                listHeight={400}
                style={{ width: '100%' }}
                maxTagCount={5}
                maxTagPlaceholder={(omittedValues) => `+ ${omittedValues.length} more...`}
                onDropdownVisibleChange={handleDropdownVisibleChange}
                // Use CSS to ensure the dropdown is always visible
                popupClassName="chemical-tree-select-dropdown"
            />
            <style jsx global>{`
                .chemical-tree-select-dropdown .ant-select-tree {
                    display: block !important;
                    visibility: visible !important;
                }
                .chemical-tree-select-dropdown .ant-select-tree-list {
                    position: static !important;
                }
                .chemical-tree-select-dropdown .ant-select-tree-list-holder-inner {
                    position: static !important;
                }
            `}</style>
        </div>
    );
};

const Homepage = () => {
    return (
        <div className="container mx-auto px-4 max-w-6xl">
            <Hero />
            <StructureCarousel />
            <div className="w-full flex flex-col md:flex-row gap-8 py-8">
                <TunnelDemo />
                <BsiteDemo />
            </div>
            <div className="w-full flex flex-col md:flex-row gap-8 py-8">
                <ChemicalTreeSelect
                    placeholder="Search..."
                    label="Chemical Classification"
                    onSelectionChange={(values) => {}}
                />
            </div>
            <Footer />
        </div>
    );
};

export default Homepage;
