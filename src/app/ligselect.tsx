import React, {useMemo, useState} from 'react';
import {Select, Space, Typography, Button} from 'antd';
import {useRoutersRouterLigDemo7K00Query} from '@/store/ribxz_api/ribxz_api';

const {Text} = Typography;

const PRIMARY_CATEGORIES = {
    Aminoglycosides: '#BFDBFE',
    Macrolides     : '#BBF7D0',
    Tetracyclines  : '#E9D5FF',
    Oxazolidinones : '#FFEDD5'
};

const CategoryButton = ({category, color, isSelected, onClick}) => (
    <Button
        type="default"
        onClick={onClick}
        style={{
            backgroundColor: isSelected ? color : '#f3f4f6',
            borderColor: color,
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#1f2937',
            padding: '4px 12px',
            height: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
        <span style={{marginRight: '4px'}}>{isSelected ? '−' : '+'}</span>
        {category}
    </Button>
);

const extractCategories = ligand => {
    if (!ligand) return {primary: [], secondary: []};
    const primary = ligand.tags.filter(tag => PRIMARY_CATEGORIES.hasOwnProperty(tag));
    return {primary, secondary: []};
};

export const LigandSelectDemo = ({onChange}) => {
    const {data: ligands, isLoading} = useRoutersRouterLigDemo7K00Query();
    const [selectedValues, setSelectedValues] = useState([]);

    const filterOption = (input, option) => {
        if (!input?.trim() || !option?.value) return true;

        const searchStr = input.toLowerCase();
        const ligand = ligands?.find(l => l.chemicalId === option.value);
        if (!ligand) return false;

        // Search in chemicalId, chemicalName, and categories
        return (
            ligand.chemicalId.toLowerCase().includes(searchStr) ||
            ligand.chemicalName.toLowerCase().includes(searchStr) ||
            ligand.tags.some(tag => tag.toLowerCase().includes(searchStr))
        );
    };

    const handleChange = values => {
        if (!ligands) return;
        setSelectedValues(values);
        const selectedLigands = values.map(value => ligands.find(l => l.chemicalId === value)).filter(Boolean);
        onChange?.(selectedLigands);
    };

    const handleCategorySelect = category => {
        if (!ligands) return;

        const categoryLigands = ligands.filter(ligand => {
            const {primary} = extractCategories(ligand);
            return primary.includes(category);
        });

        const categoryIds = categoryLigands.map(l => l.chemicalId);
        const hasSelectedFromCategory = selectedValues.some(value => categoryIds.includes(value));

        const newSelection = hasSelectedFromCategory
            ? selectedValues.filter(value => !categoryIds.includes(value))
            : [...new Set([...selectedValues, ...categoryIds])];

        handleChange(newSelection);
    };

    const isCategorySelected = category => {
        if (!ligands) return false;
        const categoryLigands = ligands.filter(ligand => {
            const {primary} = extractCategories(ligand);
            return primary.includes(category);
        });
        return categoryLigands.some(ligand => selectedValues.includes(ligand.chemicalId));
    };

    const options = useMemo(
        () =>
            ligands
                ?.filter(ligand => ligand && ligand.chemicalId)
                .map(ligand => {
                    const {primary} = extractCategories(ligand);

                    return {
                        value: ligand.chemicalId,
                        label: (
                            <Space direction="vertical" style={{width: '100%', minHeight: '32px'}}>
                                <Space
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                        alignItems: 'center',
                                        minHeight: '24px'
                                    }}>
                                    <Space direction="vertical" size={0}>
                                        <Text strong style={{fontFamily: 'monospace'}}>
                                            {ligand.chemicalId}
                                        </Text>
                                        <Text type="secondary" style={{fontSize: '12px'}}>
                                            {ligand.chemicalName}
                                        </Text>
                                    </Space>
                                    <Space wrap style={{justifyContent: 'flex-end'}}>
                                        {primary.map(category => (
                                            <span
                                                key={`${ligand.chemicalId}-${category}`}
                                                style={{
                                                    backgroundColor: PRIMARY_CATEGORIES[category],
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: 500
                                                }}>
                                                {category}
                                            </span>
                                        ))}
                                    </Space>
                                </Space>
                            </Space>
                        )
                    };
                }) || [],
        [ligands]
    );

    return (
        <Space direction="vertical" style={{width: '100%'}} size="small">
            <Space wrap>
                {Object.entries(PRIMARY_CATEGORIES).map(([category, color]) => (
                    <CategoryButton
                        key={category}
                        category={category}
                        color={color}
                        isSelected={isCategorySelected(category)}
                        onClick={() => handleCategorySelect(category)}
                    />
                ))}
            </Space>

            <Select
                mode="multiple"
                placeholder={isLoading ? 'Loading ligands...' : 'Search ligands...'}
                loading={isLoading}
                showSearch
                filterOption={filterOption}
                options={options}
                onChange={handleChange}
                disabled={isLoading}
                value={selectedValues}
                maxTagCount={false}
                allowClear={true}
                tagRender={props => {
                    const {value, closable, onClose} = props;
                    return (
                        <span
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0 4px',
                                margin: '2px',
                                borderRadius: '4px',
                                backgroundColor: '#f0f0f0',
                                fontSize: '14px',
                                fontFamily: 'monospace'
                            }}>
                            {value}
                            {closable && (
                                <span
                                    style={{
                                        marginLeft: '4px',
                                        cursor: 'pointer',
                                        color: '#999',
                                        fontSize: '12px'
                                    }}
                                    onClick={onClose}>
                                    ×
                                </span>
                            )}
                        </span>
                    );
                }}
                listHeight={256}
                style={{
                    width: '100%',
                    minHeight: '32px',
                    height: 'auto',
                    maxHeight: '120px',
                    overflow: 'auto'
                }}
            />
        </Space>
    );
};
