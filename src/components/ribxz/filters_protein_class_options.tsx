
export interface PolymerClassOption {
    readonly value: string;
    readonly label: string;
    readonly color: string;
}

type ElongationFactorClass     = PolymerClassOption
type InitiationFactorClass     = PolymerClassOption
type CytosolicProteinClass     = PolymerClassOption
type MitochondrialProteinClass = PolymerClassOption
type CytosolicRNAClass         = PolymerClassOption
type MitochondrialRNAClass     = PolymerClassOption
type tRNA                      = PolymerClassOption

export interface GroupedOption {
    readonly label: string;
    readonly options: readonly ElongationFactorClass[] | readonly InitiationFactorClass[] | CytosolicProteinClass[] | MitochondrialProteinClass[] | CytosolicRNAClass[] | MitochondrialRNAClass[] | tRNA[];
}


// const {data:tax_dict, isLoading:tax_dict_is_loading} = useRoutersRouterStructPolymerClassesNomenclatureQuery();
export const groupedOptions = (data: {
    "ElongationFactorClass"    : string[],
    "InitiationFactorClass"    : string[],
    "CytosolicProteinClass"    : string[],
    "MitochondrialProteinClass": string[],
    "CytosolicRNAClass"        : string[],
    "MitochondrialRNAClass"    : string[],
    "tRNAClass"                : string[],

}): readonly GroupedOption[] => {

    return [

        {
            label: 'Cytosolic RNA',
            options: data['CytosolicRNAClass'].map((value) => ({ value,id:value, label: value, color: 'red' })),
        },
        {
            label: 'Cytosolic Proteins',
            options: data['CytosolicProteinClass'].map((value) => ({ value, id:value, label: value, color: 'red' })),
        },
        {
            label: 'Mitochondrial RNA',
            options: data['MitochondrialRNAClass'].map((value) => ({ value, id:value, label: value, color: 'red' })),
        },
        {
            label: 'Mitochondrial Proteins',
            options: data['MitochondrialProteinClass'].map((value) => ({ value,id:value, label: value, color: 'red' })),
        },
        {
            label: 'Elongation Factors',
            options: data['ElongationFactorClass'].map((value) => ({ value, id:value,label: value, color: 'red' })),
        },
        {
            label: 'Initiation Factors',
            options: data['InitiationFactorClass'].map((value) => ({ value,id:value, label: value, color: 'red' })),
        },
        {
            label: 'tRNA',
            options: data['tRNAClass'].map((value) => ({ value,id:value, label: value, color: 'red' })),
        },
    ]
};