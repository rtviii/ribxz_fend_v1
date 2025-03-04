import {empty_api as api} from './template';
const injectedRtkApi = api.injectEndpoints({
    endpoints: build => ({
        routersRouterStructAllRcsbIds: build.query<
            RoutersRouterStructAllRcsbIdsApiResponse,
            RoutersRouterStructAllRcsbIdsApiArg
        >({
            query: () => ({url: `/structures/all_rcsb_ids`})
        }),
        routersRouterStructTaxDict: build.query<
            RoutersRouterStructTaxDictApiResponse,
            RoutersRouterStructTaxDictApiArg
        >({
            query: () => ({url: `/structures/tax_dict`})
        }),
        routersRouterStructPolymerClassificationReport: build.query<
            RoutersRouterStructPolymerClassificationReportApiResponse,
            RoutersRouterStructPolymerClassificationReportApiArg
        >({
            query: queryArg => ({url: `/structures/polymer_classification_report`, params: {rcsb_id: queryArg.rcsbId}})
        }),
        routersRouterStructRandomProfile: build.query<
            RoutersRouterStructRandomProfileApiResponse,
            RoutersRouterStructRandomProfileApiArg
        >({
            query: () => ({url: `/structures/random_profile`})
        }),
        routersRouterStructListStructures: build.mutation<
            RoutersRouterStructListStructuresApiResponse,
            RoutersRouterStructListStructuresApiArg
        >({
            query: queryArg => ({
                url: `/structures/list_structures`,
                method: 'POST',
                body: queryArg.structureFilterParams
            })
        }),
        routersRouterStructOverview: build.query<
            RoutersRouterStructOverviewApiResponse,
            RoutersRouterStructOverviewApiArg
        >({
            query: () => ({url: `/structures/structures_overview`})
        }),
        routersRouterStructStructureProfile: build.query<
            RoutersRouterStructStructureProfileApiResponse,
            RoutersRouterStructStructureProfileApiArg
        >({
            query: queryArg => ({url: `/structures/profile`, params: {rcsb_id: queryArg.rcsbId}})
        }),
        routersRouterStructChainsByStruct: build.query<
            RoutersRouterStructChainsByStructApiResponse,
            RoutersRouterStructChainsByStructApiArg
        >({
            query: () => ({url: `/structures/chains_by_struct`})
        }),
        routersRouterStructListSourceTaxa: build.query<
            RoutersRouterStructListSourceTaxaApiResponse,
            RoutersRouterStructListSourceTaxaApiArg
        >({
            query: queryArg => ({url: `/structures/list_source_taxa`, params: {source_or_host: queryArg.sourceOrHost}})
        }),
        routersRouterStructPolymerClassesNomenclature: build.query<
            RoutersRouterStructPolymerClassesNomenclatureApiResponse,
            RoutersRouterStructPolymerClassesNomenclatureApiArg
        >({
            query: () => ({url: `/structures/list_nomenclature`})
        }),
        routersRouterPolymersGetPolymerData: build.query<
            RoutersRouterPolymersGetPolymerDataApiResponse,
            RoutersRouterPolymersGetPolymerDataApiArg
        >({
            query: queryArg => ({
                url: `/polymers/polymer/`,
                params: {rcsb_id: queryArg.rcsbId, auth_asym_id: queryArg.authAsymId, format: queryArg.format}
            })
        }),
        routersRouterPolymersPolynucleotideClass: build.query<
            RoutersRouterPolymersPolynucleotideClassApiResponse,
            RoutersRouterPolymersPolynucleotideClassApiArg
        >({
            query: queryArg => ({url: `/polymers/polynucleotide`, params: {rna_class: queryArg.rnaClass}})
        }),
        routersRouterPolymersPolypeptideClass: build.query<
            RoutersRouterPolymersPolypeptideClassApiResponse,
            RoutersRouterPolymersPolypeptideClassApiArg
        >({
            query: queryArg => ({url: `/polymers/polypeptide`, params: {protein_class: queryArg.proteinClass}})
        }),
        routersRouterPolymersLifecycleFactorClass: build.query<
            RoutersRouterPolymersLifecycleFactorClassApiResponse,
            RoutersRouterPolymersLifecycleFactorClassApiArg
        >({
            query: queryArg => ({url: `/polymers/lifecyle_factor`, params: {factor_class: queryArg.factorClass}})
        }),
        routersRouterPolymersListPolymers: build.mutation<
            RoutersRouterPolymersListPolymersApiResponse,
            RoutersRouterPolymersListPolymersApiArg
        >({
            query: queryArg => ({url: `/polymers/list_polymers`, method: 'POST', body: queryArg.polymersFilterParams})
        }),
        routersRouterPolymersPolymerClassesStats: build.query<
            RoutersRouterPolymersPolymerClassesStatsApiResponse,
            RoutersRouterPolymersPolymerClassesStatsApiArg
        >({
            query: () => ({url: `/polymers/polymer_classes_stats`})
        }),
        routersRouterLigLigNbhd: build.query<RoutersRouterLigLigNbhdApiResponse, RoutersRouterLigLigNbhdApiArg>({
            query: queryArg => ({
                url: `/ligands/binding_pocket`,
                params: {
                    source_structure: queryArg.sourceStructure,
                    chemical_id: queryArg.chemicalId,
                    radius: queryArg.radius
                }
            })
        }),
        routersRouterLigLigTranspose: build.query<
            RoutersRouterLigLigTransposeApiResponse,
            RoutersRouterLigLigTransposeApiArg
        >({
            query: queryArg => ({
                url: `/ligands/transpose`,
                params: {
                    source_structure: queryArg.sourceStructure,
                    target_structure: queryArg.targetStructure,
                    chemical_id: queryArg.chemicalId,
                    radius: queryArg.radius
                }
            })
        }),
        routersRouterLigListLigands: build.query<
            RoutersRouterLigListLigandsApiResponse,
            RoutersRouterLigListLigandsApiArg
        >({
            query: () => ({url: `/ligands/list_ligands`})
        }),
        routersRouterLigEntity: build.query<RoutersRouterLigEntityApiResponse, RoutersRouterLigEntityApiArg>({
            query: queryArg => ({url: `/ligands/entity`, params: {rcsb_id: queryArg.rcsbId}})
        }),
        routersRouterLigInStructure: build.query<
            RoutersRouterLigInStructureApiResponse,
            RoutersRouterLigInStructureApiArg
        >({
            query: queryArg => ({url: `/ligands/in_structure`, params: {rcsb_id: queryArg.rcsbId}})
        }),
        routersRouterLigDemo7K00: build.query<RoutersRouterLigDemo7K00ApiResponse, RoutersRouterLigDemo7K00ApiArg>({
            query: () => ({url: `/ligands/demo_7k00`})
        }),
        routersRouterLociGetShape: build.query<RoutersRouterLociGetShapeApiResponse, RoutersRouterLociGetShapeApiArg>({
            query: queryArg => ({
                url: `/loci/tunnel_geometry`,
                params: {rcsb_id: queryArg.rcsbId, is_ascii: queryArg.isAscii}
            })
        }),
        routersRouterLociGetHelices: build.query<
            RoutersRouterLociGetHelicesApiResponse,
            RoutersRouterLociGetHelicesApiArg
        >({
            query: queryArg => ({url: `/loci/helices/${queryArg.rcsbId}`})
        }),
        routersRouterLociStructurePtc: build.query<
            RoutersRouterLociStructurePtcApiResponse,
            RoutersRouterLociStructurePtcApiArg
        >({
            query: queryArg => ({url: `/loci/ptc`, params: {rcsb_id: queryArg.rcsbId}})
        }),
        routersRouterLociConstrictionSite: build.query<
            RoutersRouterLociConstrictionSiteApiResponse,
            RoutersRouterLociConstrictionSiteApiArg
        >({
            query: queryArg => ({url: `/loci/constriction_site`, params: {rcsb_id: queryArg.rcsbId}})
        }),
        routersRouterMmcifPolymer: build.query<RoutersRouterMmcifPolymerApiResponse, RoutersRouterMmcifPolymerApiArg>({
            query: queryArg => ({
                url: `/mmcif/polymer`,
                params: {rcsb_id: queryArg.rcsbId, auth_asym_id: queryArg.authAsymId}
            })
        }),
        routersRouterMmcifNonpolymer: build.query<
            RoutersRouterMmcifNonpolymerApiResponse,
            RoutersRouterMmcifNonpolymerApiArg
        >({
            query: queryArg => ({
                url: `/mmcif/nonpolymer`,
                params: {rcsb_id: queryArg.rcsbId, chemicalId: queryArg.chemicalId}
            })
        })
    }),
    overrideExisting: false
});
export {injectedRtkApi as ribxz_api};
export type RoutersRouterStructAllRcsbIdsApiResponse = /** status 200 OK */ string[];
export type RoutersRouterStructAllRcsbIdsApiArg = void;
export type RoutersRouterStructTaxDictApiResponse = /** status 200 OK */ object;
export type RoutersRouterStructTaxDictApiArg = void;
export type RoutersRouterStructPolymerClassificationReportApiResponse = unknown;
export type RoutersRouterStructPolymerClassificationReportApiArg = {
    rcsbId: string;
};
export type RoutersRouterStructRandomProfileApiResponse = /** status 200 OK */ RibosomeStructure;
export type RoutersRouterStructRandomProfileApiArg = void;
export type RoutersRouterStructListStructuresApiResponse = /** status 200 OK */ object;
export type RoutersRouterStructListStructuresApiArg = {
    structureFilterParams: StructureFilterParams;
};
export type RoutersRouterStructOverviewApiResponse = /** status 200 OK */ object[];
export type RoutersRouterStructOverviewApiArg = void;
export type RoutersRouterStructStructureProfileApiResponse = /** status 200 OK */ RibosomeStructure;
export type RoutersRouterStructStructureProfileApiArg = {
    rcsbId: string;
};
export type RoutersRouterStructChainsByStructApiResponse = /** status 200 OK */ ChainsByStruct[];
export type RoutersRouterStructChainsByStructApiArg = void;
export type RoutersRouterStructListSourceTaxaApiResponse = /** status 200 OK */ object[];
export type RoutersRouterStructListSourceTaxaApiArg = {
    sourceOrHost: 'source' | 'host';
};
export type RoutersRouterStructPolymerClassesNomenclatureApiResponse = /** status 200 OK */ NomenclatureSet;
export type RoutersRouterStructPolymerClassesNomenclatureApiArg = void;
export type RoutersRouterPolymersGetPolymerDataApiResponse = unknown;
export type RoutersRouterPolymersGetPolymerDataApiArg = {
    rcsbId: string;
    authAsymId: string;
    format?: string;
};
export type RoutersRouterPolymersPolynucleotideClassApiResponse = /** status 200 OK */ Rna[];
export type RoutersRouterPolymersPolynucleotideClassApiArg = {
    rnaClass: CytosolicRnaClass | MitochondrialRnaClass | TRna;
};
export type RoutersRouterPolymersPolypeptideClassApiResponse = /** status 200 OK */ Protein[];
export type RoutersRouterPolymersPolypeptideClassApiArg = {
    proteinClass: ElongationFactorClass | InitiationFactorClass | MitochondrialProteinClass | CytosolicProteinClass;
};
export type RoutersRouterPolymersLifecycleFactorClassApiResponse = /** status 200 OK */ Protein[];
export type RoutersRouterPolymersLifecycleFactorClassApiArg = {
    factorClass: ElongationFactorClass | InitiationFactorClass;
};
export type RoutersRouterPolymersListPolymersApiResponse = /** status 200 OK */ object;
export type RoutersRouterPolymersListPolymersApiArg = {
    polymersFilterParams: PolymersFilterParams;
};
export type RoutersRouterPolymersPolymerClassesStatsApiResponse = /** status 200 OK */ [string, number][];
export type RoutersRouterPolymersPolymerClassesStatsApiArg = void;
export type RoutersRouterLigLigNbhdApiResponse = /** status 200 OK */ BindingSite;
export type RoutersRouterLigLigNbhdApiArg = {
    sourceStructure: string;
    chemicalId: string;
    radius?: number;
};
export type RoutersRouterLigLigTransposeApiResponse = /** status 200 OK */ LigandTransposition;
export type RoutersRouterLigLigTransposeApiArg = {
    sourceStructure: string;
    targetStructure: string;
    chemicalId: string;
    radius: number;
};
export type RoutersRouterLigListLigandsApiResponse = /** status 200 OK */ [object, object[]][];
export type RoutersRouterLigListLigandsApiArg = void;
export type RoutersRouterLigEntityApiResponse = unknown;
export type RoutersRouterLigEntityApiArg = {
    rcsbId: string;
};
export type RoutersRouterLigInStructureApiResponse = unknown;
export type RoutersRouterLigInStructureApiArg = {
    rcsbId: string;
};
export type RoutersRouterLigDemo7K00ApiResponse = /** status 200 OK */ ProcessedLigands;
export type RoutersRouterLigDemo7K00ApiArg = void;
export type RoutersRouterLociGetShapeApiResponse = unknown;
export type RoutersRouterLociGetShapeApiArg = {
    rcsbId: string;
    isAscii?: boolean;
};
export type RoutersRouterLociGetHelicesApiResponse = unknown;
export type RoutersRouterLociGetHelicesApiArg = {
    rcsbId: string;
};
export type RoutersRouterLociStructurePtcApiResponse = /** status 200 OK */ PtcInfo;
export type RoutersRouterLociStructurePtcApiArg = {
    rcsbId: string;
};
export type RoutersRouterLociConstrictionSiteApiResponse = /** status 200 OK */ ConstrictionSite;
export type RoutersRouterLociConstrictionSiteApiArg = {
    rcsbId: string;
};
export type RoutersRouterMmcifPolymerApiResponse = unknown;
export type RoutersRouterMmcifPolymerApiArg = {
    rcsbId: string;
    authAsymId: string;
};
export type RoutersRouterMmcifNonpolymerApiResponse = unknown;
export type RoutersRouterMmcifNonpolymerApiArg = {
    rcsbId: string;
    chemicalId: string;
};
export type NonpolymerEntityInstanceContainerIdentifiers = {
    entity_id: string;
    auth_asym_id: string;
    auth_seq_id: string;
};
export type NonpolymerEntityInstance = {
    rcsb_nonpolymer_entity_instance_container_identifiers: NonpolymerEntityInstanceContainerIdentifiers;
};
export type PolymerEntityInstanceContainerIdentifiers = {
    entity_id: string;
    auth_asym_id: string;
};
export type PolymerEntityInstance = {
    rcsb_polymer_entity_instance_container_identifiers: PolymerEntityInstanceContainerIdentifiers;
};
export type AssemblyInstancesMap = {
    rcsb_id: string;
    nonpolymer_entity_instances?: NonpolymerEntityInstance[] | null;
    polymer_entity_instances: PolymerEntityInstance[];
};
export type CytosolicRnaClass = '5SrRNA' | '16SrRNA' | '23SrRNA' | '25SrRNA' | '5.8SrRNA' | '18SrRNA' | '28SrRNA';
export type MitochondrialRnaClass = 'mt12SrRNA' | 'mt16SrRNA';
export type TRna = 'tRNA';
export type ElongationFactorClass =
    | 'eEF1A'
    | 'eEF1B'
    | 'eFSec'
    | 'eEF2'
    | 'mtEF4'
    | 'eIF5A'
    | 'eEF3'
    | 'EF-Tu'
    | 'EF-Ts'
    | 'SelB'
    | 'EF-G'
    | 'EF4'
    | 'EF-P'
    | 'Tet_O'
    | 'Tet_M'
    | 'RelA'
    | 'BipA'
    | 'aEF1A'
    | 'aEF2';
export type InitiationFactorClass =
    | 'eIF1'
    | 'eIF1A'
    | 'eIF2_alpha'
    | 'eIF2_beta'
    | 'eIF2_gamma'
    | 'eIF2B_alpha'
    | 'eIF2B_beta'
    | 'eIF2B_gamma'
    | 'eIF2B_delta'
    | 'eIF2B_epsilon'
    | 'eIF3_subunitA'
    | 'eIF3_subunitB'
    | 'eIF3_subunitC'
    | 'eIF3_subunitD'
    | 'eIF3_subunitE'
    | 'eIF3_subunitF'
    | 'eIF3_subunitG'
    | 'eIF3_subunitH'
    | 'eIF3_subunitI'
    | 'eIF3_subunitJ'
    | 'eIF3_subunitK'
    | 'eIF3_subunitL'
    | 'eIF3_subunitM'
    | 'eIF4F_4A'
    | 'eIF4F_4G'
    | 'eIF4F_4E'
    | 'eIF4B'
    | 'eIF5B'
    | 'eIF5'
    | 'IF1'
    | 'IF2'
    | 'IF3'
    | 'aIF1A'
    | 'aIF2_alpha'
    | 'aIF2_beta'
    | 'aIF2_gamma'
    | 'aIF2B_alpha'
    | 'aIF2B_beta'
    | 'aIF2B_delta'
    | 'aIF5A'
    | 'aIF5B';
export type MitochondrialProteinClass =
    | 'bS1m'
    | 'uS2m'
    | 'uS3m'
    | 'uS4m'
    | 'uS5m'
    | 'bS6m'
    | 'uS7m'
    | 'uS8m'
    | 'uS9m'
    | 'uS10m'
    | 'uS11m'
    | 'uS12m'
    | 'uS13m'
    | 'uS14m'
    | 'uS15m'
    | 'bS16m'
    | 'uS17m'
    | 'bS18m'
    | 'uS19m'
    | 'bS21m'
    | 'mS22'
    | 'mS23'
    | 'mS25'
    | 'mS26'
    | 'mS27'
    | 'mS29'
    | 'mS31'
    | 'mS33'
    | 'mS34'
    | 'mS35'
    | 'mS37'
    | 'mS38'
    | 'mS39'
    | 'mS40'
    | 'mS41'
    | 'mS42'
    | 'mS43'
    | 'mS44'
    | 'mS45'
    | 'mS46'
    | 'mS47'
    | 'uL1m'
    | 'uL2m'
    | 'uL3m'
    | 'uL4m'
    | 'uL5m'
    | 'uL6m'
    | 'bL9m'
    | 'uL10m'
    | 'uL11m'
    | 'bL12m'
    | 'uL13m'
    | 'uL14m'
    | 'uL15m'
    | 'uL16m'
    | 'bL17m'
    | 'uL18m'
    | 'bL19m'
    | 'bL20m'
    | 'bL21m'
    | 'uL22m'
    | 'uL23m'
    | 'uL24m'
    | 'bL27m'
    | 'bL28m'
    | 'uL29m'
    | 'uL30m'
    | 'bL31m'
    | 'bL32m'
    | 'bL33m'
    | 'bL34m'
    | 'bL35m'
    | 'bL36m'
    | 'mL37'
    | 'mL38'
    | 'mL39'
    | 'mL40'
    | 'mL41'
    | 'mL42'
    | 'mL43'
    | 'mL44'
    | 'mL45'
    | 'mL46'
    | 'mL48'
    | 'mL49'
    | 'mL50'
    | 'mL51'
    | 'mL52'
    | 'mL53'
    | 'mL54'
    | 'mL57'
    | 'mL58'
    | 'mL59'
    | 'mL60'
    | 'mL61'
    | 'mL62'
    | 'mL63'
    | 'mL64'
    | 'mL65'
    | 'mL66'
    | 'mL67';
export type CytosolicProteinClass =
    | 'bS1'
    | 'eS1'
    | 'uS2'
    | 'uS3'
    | 'uS4'
    | 'eS4'
    | 'uS5'
    | 'bS6'
    | 'eS6'
    | 'uS7'
    | 'eS7'
    | 'uS8'
    | 'eS8'
    | 'uS9'
    | 'uS10'
    | 'eS10'
    | 'uS11'
    | 'uS12'
    | 'eS12'
    | 'uS13'
    | 'uS14'
    | 'uS15'
    | 'bS16'
    | 'uS17'
    | 'eS17'
    | 'bS18'
    | 'uS19'
    | 'eS19'
    | 'bS20'
    | 'bS21'
    | 'bTHX'
    | 'eS21'
    | 'eS24'
    | 'eS25'
    | 'eS26'
    | 'eS27'
    | 'eS28'
    | 'eS30'
    | 'eS31'
    | 'RACK1'
    | 'uL1'
    | 'uL2'
    | 'uL3'
    | 'uL4'
    | 'uL5'
    | 'uL6'
    | 'eL6'
    | 'eL8'
    | 'bL9'
    | 'uL10'
    | 'uL11'
    | 'bL12'
    | 'uL13'
    | 'eL13'
    | 'uL14'
    | 'eL14'
    | 'uL15'
    | 'eL15'
    | 'uL16'
    | 'bL17'
    | 'uL18'
    | 'eL18'
    | 'bL19'
    | 'eL19'
    | 'bL20'
    | 'eL20'
    | 'bL21'
    | 'eL21'
    | 'uL22'
    | 'eL22'
    | 'uL23'
    | 'uL24'
    | 'eL24'
    | 'bL25'
    | 'bL27'
    | 'eL27'
    | 'bL28'
    | 'eL28'
    | 'uL29'
    | 'eL29'
    | 'uL30'
    | 'eL30'
    | 'bL31'
    | 'eL31'
    | 'bL32'
    | 'eL32'
    | 'bL33'
    | 'eL33'
    | 'bL34'
    | 'eL34'
    | 'bL35'
    | 'bL36'
    | 'eL36'
    | 'eL37'
    | 'eL38'
    | 'eL39'
    | 'eL40'
    | 'eL41'
    | 'eL42'
    | 'eL43'
    | 'P1P2';
export type Rna = {
    assembly_id: number;
    asym_ids: string[];
    auth_asym_id: string;
    parent_rcsb_id: string;
    src_organism_names: string[];
    host_organism_names: string[];
    src_organism_ids: number[];
    host_organism_ids: number[];
    rcsb_pdbx_description?: string | null;
    entity_poly_strand_id: string;
    entity_poly_seq_one_letter_code: string;
    entity_poly_seq_one_letter_code_can: string;
    entity_poly_seq_length: number;
    entity_poly_polymer_type: string;
    entity_poly_entity_type: string;
    nomenclature: (
        | CytosolicRnaClass
        | MitochondrialRnaClass
        | TRna
        | ElongationFactorClass
        | InitiationFactorClass
        | MitochondrialProteinClass
        | CytosolicProteinClass
    )[];
};
export type Polymer = {
    assembly_id: number;
    asym_ids: string[];
    auth_asym_id: string;
    parent_rcsb_id: string;
    src_organism_names: string[];
    host_organism_names: string[];
    src_organism_ids: number[];
    host_organism_ids: number[];
    rcsb_pdbx_description?: string | null;
    entity_poly_strand_id: string;
    entity_poly_seq_one_letter_code: string;
    entity_poly_seq_one_letter_code_can: string;
    entity_poly_seq_length: number;
    entity_poly_polymer_type: string;
    entity_poly_entity_type: string;
    nomenclature: (
        | CytosolicRnaClass
        | MitochondrialRnaClass
        | TRna
        | ElongationFactorClass
        | InitiationFactorClass
        | MitochondrialProteinClass
        | CytosolicProteinClass
    )[];
};
export type DrugbankContainerIdentifiers = {
    drugbank_id: string;
};
export type DrugbankInfo = {
    cas_number?: string | null;
    description?: string | null;
};
export type Drugbank = {
    drugbank_container_identifiers: DrugbankContainerIdentifiers;
    drugbank_info: DrugbankInfo;
};
export type RcsbChemCompTarget = {
    interaction_type?: string | null;
    name?: string | null;
    provenance_source?: string | null;
    reference_database_accession_code?: string | null;
    reference_database_name?: string | null;
};
export type NonpolymerComp = {
    drugbank?: Drugbank | null;
    rcsb_chem_comp_target?: RcsbChemCompTarget[] | null;
};
export type NonpolymericLigand = {
    chemicalId: string;
    chemicalName: string;
    formula_weight?: number | null;
    pdbx_description: string;
    number_of_instances: number;
    nonpolymer_comp?: NonpolymerComp | null;
    SMILES?: string | null;
    SMILES_stereo?: string | null;
    InChI?: string | null;
    InChIKey?: string | null;
};
export type Protein = {
    assembly_id: number;
    asym_ids: string[];
    auth_asym_id: string;
    parent_rcsb_id: string;
    src_organism_names: string[];
    host_organism_names: string[];
    src_organism_ids: number[];
    host_organism_ids: number[];
    rcsb_pdbx_description?: string | null;
    entity_poly_strand_id: string;
    entity_poly_seq_one_letter_code: string;
    entity_poly_seq_one_letter_code_can: string;
    entity_poly_seq_length: number;
    entity_poly_polymer_type: string;
    entity_poly_entity_type: string;
    nomenclature: (
        | CytosolicRnaClass
        | MitochondrialRnaClass
        | TRna
        | ElongationFactorClass
        | InitiationFactorClass
        | MitochondrialProteinClass
        | CytosolicProteinClass
    )[];
    pfam_accessions: string[];
    pfam_comments: string[];
    pfam_descriptions: string[];
    uniprot_accession: string[];
};
export type RibosomeStructure = {
    rcsb_id: string;
    expMethod: string;
    resolution: number;
    deposition_date?: string | null;
    pdbx_keywords?: string | null;
    pdbx_keywords_text?: string | null;
    rcsb_external_ref_id: string[];
    rcsb_external_ref_type: string[];
    rcsb_external_ref_link: string[];
    citation_year?: number | string | null;
    citation_rcsb_authors?: string[] | null;
    citation_title?: string | null;
    citation_pdbx_doi?: string | null;
    src_organism_ids: number[];
    src_organism_names: string[];
    host_organism_ids: number[];
    host_organism_names: string[];
    assembly_map?: AssemblyInstancesMap[] | null;
    mitochondrial: boolean;
    subunit_presence?: ('ssu' | 'lsu')[] | null;
    rnas: Rna[];
    other_polymers: Polymer[];
    nonpolymeric_ligands: NonpolymericLigand[];
    proteins: Protein[];
};
export type StructureFilterParams = {
    cursor?: string | null;
    limit?: number;
    year?: [number | null, number | null] | null;
    search?: string | null;
    resolution?: [number | null, number | null] | null;
    polymer_classes?:
        | (
              | CytosolicRnaClass
              | MitochondrialRnaClass
              | TRna
              | ElongationFactorClass
              | InitiationFactorClass
              | MitochondrialProteinClass
              | CytosolicProteinClass
          )[]
        | null;
    source_taxa?: number[] | null;
    host_taxa?: number[] | null;
    subunit_presence?: ('SSU+LSU' | 'LSU' | 'SSU') | null;
};
export type PolymerByStruct = {
    nomenclature: (
        | CytosolicRnaClass
        | MitochondrialRnaClass
        | TRna
        | ElongationFactorClass
        | InitiationFactorClass
        | MitochondrialProteinClass
        | CytosolicProteinClass
    )[];
    auth_asym_id: string;
    entity_poly_polymer_type: string;
    entity_poly_seq_length: number;
};
export type ChainsByStruct = {
    polymers: PolymerByStruct[];
    rcsb_id: string;
};
export type NomenclatureSet = {
    ElongationFactorClass: string[];
    InitiationFactorClass: string[];
    CytosolicProteinClass: string[];
    MitochondrialProteinClass: string[];
    CytosolicRNAClass: string[];
    MitochondrialRNAClass: string[];
    tRNAClass: string[];
};
export type PolymersFilterParams = {
    cursor?: [string | null, string | null] | (string | null)[] | string | null;
    limit?: number;
    year?: [number | null, number | null] | null;
    search?: string | null;
    resolution?: [number | null, number | null] | null;
    polymer_classes?:
        | (
              | CytosolicRnaClass
              | MitochondrialRnaClass
              | TRna
              | ElongationFactorClass
              | InitiationFactorClass
              | MitochondrialProteinClass
              | CytosolicProteinClass
          )[]
        | null;
    source_taxa?: number[] | null;
    host_taxa?: number[] | null;
    subunit_presence?: ('SSU+LSU' | 'LSU' | 'SSU') | null;
    current_polymer_class?:
        | CytosolicRnaClass
        | MitochondrialRnaClass
        | TRna
        | ElongationFactorClass
        | InitiationFactorClass
        | MitochondrialProteinClass
        | CytosolicProteinClass
        | null;
    uniprot_id?: string | null;
    has_motif?: string | null;
};
export type ResidueSummary = {
    label_seq_id?: number | null;
    label_comp_id?: string | null;
    auth_asym_id: string;
    auth_seq_id: number;
    rcsb_id: string;
    full_id: [string, number, string, [string, number, string]] | null;
};
export type BindingSiteChain = {
    assembly_id: number;
    asym_ids: string[];
    auth_asym_id: string;
    parent_rcsb_id: string;
    src_organism_names: string[];
    host_organism_names: string[];
    src_organism_ids: number[];
    host_organism_ids: number[];
    rcsb_pdbx_description?: string | null;
    entity_poly_strand_id: string;
    entity_poly_seq_one_letter_code: string;
    entity_poly_seq_one_letter_code_can: string;
    entity_poly_seq_length: number;
    entity_poly_polymer_type: string;
    entity_poly_entity_type: string;
    nomenclature: (
        | CytosolicRnaClass
        | MitochondrialRnaClass
        | TRna
        | ElongationFactorClass
        | InitiationFactorClass
        | MitochondrialProteinClass
        | CytosolicProteinClass
    )[];
    bound_residues: ResidueSummary[];
};
export type BindingSite = {
    source: string;
    ligand: string;
    radius: number;
    chains: BindingSiteChain[];
};
export type PredictionSource = {
    source_seq: string;
    source_bound_residues: ResidueSummary[];
    auth_asym_id: string;
};
export type PredictionTarget = {
    target_seq: string;
    target_bound_residues: ResidueSummary[];
    auth_asym_id: string;
};
export type ResiduesMapping = {
    polymer_class:
        | CytosolicRnaClass
        | MitochondrialRnaClass
        | TRna
        | ElongationFactorClass
        | InitiationFactorClass
        | MitochondrialProteinClass
        | CytosolicProteinClass;
    source: PredictionSource;
    target: PredictionTarget;
};
export type LigandTransposition = {
    source: string;
    target: string;
    constituent_chains: ResiduesMapping[];
    purported_binding_site: BindingSite;
};
export type ProcessedLigands = {
    [key: string]: any;
};
export type PtcInfo = {
    location: number[];
    residues: ResidueSummary[];
};
export type ConstrictionSite = {
    location: number[];
};
export const {
    useRoutersRouterStructAllRcsbIdsQuery,
    useRoutersRouterStructTaxDictQuery,
    useRoutersRouterStructPolymerClassificationReportQuery,
    useRoutersRouterStructRandomProfileQuery,
    useRoutersRouterStructListStructuresMutation,
    useRoutersRouterStructOverviewQuery,
    useRoutersRouterStructStructureProfileQuery,
    useRoutersRouterStructChainsByStructQuery,
    useRoutersRouterStructListSourceTaxaQuery,
    useRoutersRouterStructPolymerClassesNomenclatureQuery,
    useRoutersRouterPolymersGetPolymerDataQuery,
    useRoutersRouterPolymersPolynucleotideClassQuery,
    useRoutersRouterPolymersPolypeptideClassQuery,
    useRoutersRouterPolymersLifecycleFactorClassQuery,
    useRoutersRouterPolymersListPolymersMutation,
    useRoutersRouterPolymersPolymerClassesStatsQuery,
    useRoutersRouterLigLigNbhdQuery,
    useRoutersRouterLigLigTransposeQuery,
    useRoutersRouterLigListLigandsQuery,
    useRoutersRouterLigEntityQuery,
    useRoutersRouterLigInStructureQuery,
    useRoutersRouterLigDemo7K00Query,
    useRoutersRouterLociGetShapeQuery,
    useRoutersRouterLociGetHelicesQuery,
    useRoutersRouterLociStructurePtcQuery,
    useRoutersRouterLociConstrictionSiteQuery,
    useRoutersRouterMmcifPolymerQuery,
    useRoutersRouterMmcifNonpolymerQuery
} = injectedRtkApi;
