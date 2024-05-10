import { empty_api as api } from "./template";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    routersRouterStructStructureProfile: build.query<
      RoutersRouterStructStructureProfileApiResponse,
      RoutersRouterStructStructureProfileApiArg
    >({
      query: (queryArg) => ({
        url: `/structure/profile`,
        params: { rcsb_id: queryArg.rcsbId },
      }),
    }),
    routersRouterStructListStructures: build.query<
      RoutersRouterStructListStructuresApiResponse,
      RoutersRouterStructListStructuresApiArg
    >({
      query: () => ({ url: `/structure/list_structures` }),
    }),
    routersRouterClassesPolynucleotideClass: build.query<
      RoutersRouterClassesPolynucleotideClassApiResponse,
      RoutersRouterClassesPolynucleotideClassApiArg
    >({
      query: (queryArg) => ({
        url: `/polymer_class/polynucleotide`,
        params: { rna_class: queryArg.rnaClass },
      }),
    }),
    routersRouterClassesPolypeptideClass: build.query<
      RoutersRouterClassesPolypeptideClassApiResponse,
      RoutersRouterClassesPolypeptideClassApiArg
    >({
      query: (queryArg) => ({
        url: `/polymer_class/polypeptide`,
        params: { protein_class: queryArg.proteinClass },
      }),
    }),
    routersRouterClassesLifecycleFactorClass: build.query<
      RoutersRouterClassesLifecycleFactorClassApiResponse,
      RoutersRouterClassesLifecycleFactorClassApiArg
    >({
      query: (queryArg) => ({
        url: `/polymer_class/lifecyle_factor`,
        params: { factor_class: queryArg.factorClass },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as ribxz_api };
export type RoutersRouterStructStructureProfileApiResponse =
  /** status 200 OK */ RibosomeStructure;
export type RoutersRouterStructStructureProfileApiArg = {
  rcsbId: string;
};
export type RoutersRouterStructListStructuresApiResponse =
  /** status 200 OK */ RibosomeStructure[];
export type RoutersRouterStructListStructuresApiArg = void;
export type RoutersRouterClassesPolynucleotideClassApiResponse =
  /** status 200 OK */ Rna[];
export type RoutersRouterClassesPolynucleotideClassApiArg = {
  rnaClass:
    | "5SrRNA"
    | "16SrRNA"
    | "23SrRNA"
    | "25SrRNA"
    | "5.8SrRNA"
    | "18SrRNA"
    | "28SrRNA"
    | "mt12SrRNA"
    | "mt16SrRNA"
    | "tRNA";
};
export type RoutersRouterClassesPolypeptideClassApiResponse =
  /** status 200 OK */ Protein[];
export type RoutersRouterClassesPolypeptideClassApiArg = {
  proteinClass:
    | "bS1"
    | "eS1"
    | "uS2"
    | "uS3"
    | "uS4"
    | "eS4"
    | "uS5"
    | "bS6"
    | "eS6"
    | "uS7"
    | "eS7"
    | "uS8"
    | "eS8"
    | "uS9"
    | "uS10"
    | "eS10"
    | "uS11"
    | "uS12"
    | "eS12"
    | "uS13"
    | "uS14"
    | "uS15"
    | "bS16"
    | "uS17"
    | "eS17"
    | "bS18"
    | "uS19"
    | "eS19"
    | "bS20"
    | "bS21"
    | "bTHX"
    | "eS21"
    | "eS24"
    | "eS25"
    | "eS26"
    | "eS27"
    | "eS28"
    | "eS30"
    | "eS31"
    | "RACK1"
    | "uL1"
    | "uL2"
    | "uL3"
    | "uL4"
    | "uL5"
    | "uL6"
    | "eL6"
    | "eL8"
    | "bL9"
    | "uL10"
    | "uL11"
    | "bL12"
    | "uL13"
    | "eL13"
    | "uL14"
    | "eL14"
    | "uL15"
    | "eL15"
    | "uL16"
    | "bL17"
    | "uL18"
    | "eL18"
    | "bL19"
    | "eL19"
    | "bL20"
    | "eL20"
    | "bL21"
    | "eL21"
    | "uL22"
    | "eL22"
    | "uL23"
    | "uL24"
    | "eL24"
    | "bL25"
    | "bL27"
    | "eL27"
    | "bL28"
    | "eL28"
    | "uL29"
    | "eL29"
    | "uL30"
    | "eL30"
    | "bL31"
    | "eL31"
    | "bL32"
    | "eL32"
    | "bL33"
    | "eL33"
    | "bL34"
    | "eL34"
    | "bL35"
    | "bL36"
    | "eL36"
    | "eL37"
    | "eL38"
    | "eL39"
    | "eL40"
    | "eL41"
    | "eL42"
    | "eL43"
    | "P1P2"
    | "bS1m"
    | "uS2m"
    | "uS3m"
    | "uS4m"
    | "uS5m"
    | "bS6m"
    | "uS7m"
    | "uS8m"
    | "uS9m"
    | "uS10m"
    | "uS11m"
    | "uS12m"
    | "uS13m"
    | "uS14m"
    | "uS15m"
    | "bS16m"
    | "uS17m"
    | "bS18m"
    | "uS19m"
    | "bS21m"
    | "mS22"
    | "mS23"
    | "mS25"
    | "mS26"
    | "mS27"
    | "mS29"
    | "mS31"
    | "mS33"
    | "mS34"
    | "mS35"
    | "mS37"
    | "mS38"
    | "mS39"
    | "mS40"
    | "mS41"
    | "mS42"
    | "mS43"
    | "mS44"
    | "mS45"
    | "mS46"
    | "mS47"
    | "uL1m"
    | "uL2m"
    | "uL3m"
    | "uL4m"
    | "uL5m"
    | "uL6m"
    | "bL9m"
    | "uL10m"
    | "uL11m"
    | "bL12m"
    | "uL13m"
    | "uL14m"
    | "uL15m"
    | "uL16m"
    | "bL17m"
    | "uL18m"
    | "bL19m"
    | "bL20m"
    | "bL21m"
    | "uL22m"
    | "uL23m"
    | "uL24m"
    | "bL27m"
    | "bL28m"
    | "uL29m"
    | "uL30m"
    | "bL31m"
    | "bL32m"
    | "bL33m"
    | "bL34m"
    | "bL35m"
    | "bL36m"
    | "mL37"
    | "mL38"
    | "mL39"
    | "mL40"
    | "mL41"
    | "mL42"
    | "mL43"
    | "mL44"
    | "mL45"
    | "mL46"
    | "mL48"
    | "mL49"
    | "mL50"
    | "mL51"
    | "mL52"
    | "mL53"
    | "mL54"
    | "mL57"
    | "mL58"
    | "mL59"
    | "mL60"
    | "mL61"
    | "mL62"
    | "mL63"
    | "mL64"
    | "mL65"
    | "mL66"
    | "mL67";
};
export type RoutersRouterClassesLifecycleFactorClassApiResponse =
  /** status 200 OK */ Protein[];
export type RoutersRouterClassesLifecycleFactorClassApiArg = {
  factorClass:
    | "eEF1A"
    | "eEF1B"
    | "eFSec"
    | "eEF2"
    | "mtEF4"
    | "eIF5A"
    | "eEF3"
    | "EF-Tu"
    | "EF-Ts"
    | "SelB"
    | "EF-G"
    | "EF4"
    | "EF-P"
    | "Tet_O"
    | "Tet_M"
    | "RelA"
    | "BipA"
    | "aEF1A"
    | "aEF2"
    | "eIF1"
    | "eIF1A"
    | "eIF2_alpha"
    | "eIF2_beta"
    | "eIF2_gamma"
    | "eIF2B_alpha"
    | "eIF2B_beta"
    | "eIF2B_gamma"
    | "eIF2B_delta"
    | "eIF2B_epsilon"
    | "eIF3_subunitA"
    | "eIF3_subunitB"
    | "eIF3_subunitC"
    | "eIF3_subunitD"
    | "eIF3_subunitE"
    | "eIF3_subunitF"
    | "eIF3_subunitG"
    | "eIF3_subunitH"
    | "eIF3_subunitI"
    | "eIF3_subunitJ"
    | "eIF3_subunitK"
    | "eIF3_subunitL"
    | "eIF3_subunitM"
    | "eIF4F_4A"
    | "eIF4F_4G"
    | "eIF4F_4E"
    | "eIF4B"
    | "eIF5B"
    | "eIF5"
    | "IF1"
    | "IF2"
    | "IF3"
    | "aIF1A"
    | "aIF2_alpha"
    | "aIF2_beta"
    | "aIF2_gamma"
    | "aIF2B_alpha"
    | "aIF2B_beta"
    | "aIF2B_delta"
    | "aIF5A"
    | "aIF5B";
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
export type CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum =

    | "5SrRNA"
    | "16SrRNA"
    | "23SrRNA"
    | "25SrRNA"
    | "5.8SrRNA"
    | "18SrRNA"
    | "28SrRNA"
    | "mt12SrRNA"
    | "mt16SrRNA"
    | "tRNA"
    | "eEF1A"
    | "eEF1B"
    | "eFSec"
    | "eEF2"
    | "mtEF4"
    | "eIF5A"
    | "eEF3"
    | "EF-Tu"
    | "EF-Ts"
    | "SelB"
    | "EF-G"
    | "EF4"
    | "EF-P"
    | "Tet_O"
    | "Tet_M"
    | "RelA"
    | "BipA"
    | "aEF1A"
    | "aEF2"
    | "eIF1"
    | "eIF1A"
    | "eIF2_alpha"
    | "eIF2_beta"
    | "eIF2_gamma"
    | "eIF2B_alpha"
    | "eIF2B_beta"
    | "eIF2B_gamma"
    | "eIF2B_delta"
    | "eIF2B_epsilon"
    | "eIF3_subunitA"
    | "eIF3_subunitB"
    | "eIF3_subunitC"
    | "eIF3_subunitD"
    | "eIF3_subunitE"
    | "eIF3_subunitF"
    | "eIF3_subunitG"
    | "eIF3_subunitH"
    | "eIF3_subunitI"
    | "eIF3_subunitJ"
    | "eIF3_subunitK"
    | "eIF3_subunitL"
    | "eIF3_subunitM"
    | "eIF4F_4A"
    | "eIF4F_4G"
    | "eIF4F_4E"
    | "eIF4B"
    | "eIF5B"
    | "eIF5"
    | "IF1"
    | "IF2"
    | "IF3"
    | "aIF1A"
    | "aIF2_alpha"
    | "aIF2_beta"
    | "aIF2_gamma"
    | "aIF2B_alpha"
    | "aIF2B_beta"
    | "aIF2B_delta"
    | "aIF5A"
    | "aIF5B"
    | "bS1"
    | "eS1"
    | "uS2"
    | "uS3"
    | "uS4"
    | "eS4"
    | "uS5"
    | "bS6"
    | "eS6"
    | "uS7"
    | "eS7"
    | "uS8"
    | "eS8"
    | "uS9"
    | "uS10"
    | "eS10"
    | "uS11"
    | "uS12"
    | "eS12"
    | "uS13"
    | "uS14"
    | "uS15"
    | "bS16"
    | "uS17"
    | "eS17"
    | "bS18"
    | "uS19"
    | "eS19"
    | "bS20"
    | "bS21"
    | "bTHX"
    | "eS21"
    | "eS24"
    | "eS25"
    | "eS26"
    | "eS27"
    | "eS28"
    | "eS30"
    | "eS31"
    | "RACK1"
    | "uL1"
    | "uL2"
    | "uL3"
    | "uL4"
    | "uL5"
    | "uL6"
    | "eL6"
    | "eL8"
    | "bL9"
    | "uL10"
    | "uL11"
    | "bL12"
    | "uL13"
    | "eL13"
    | "uL14"
    | "eL14"
    | "uL15"
    | "eL15"
    | "uL16"
    | "bL17"
    | "uL18"
    | "eL18"
    | "bL19"
    | "eL19"
    | "bL20"
    | "eL20"
    | "bL21"
    | "eL21"
    | "uL22"
    | "eL22"
    | "uL23"
    | "uL24"
    | "eL24"
    | "bL25"
    | "bL27"
    | "eL27"
    | "bL28"
    | "eL28"
    | "uL29"
    | "eL29"
    | "uL30"
    | "eL30"
    | "bL31"
    | "eL31"
    | "bL32"
    | "eL32"
    | "bL33"
    | "eL33"
    | "bL34"
    | "eL34"
    | "bL35"
    | "bL36"
    | "eL36"
    | "eL37"
    | "eL38"
    | "eL39"
    | "eL40"
    | "eL41"
    | "eL42"
    | "eL43"
    | "P1P2"
    | "bS1m"
    | "uS2m"
    | "uS3m"
    | "uS4m"
    | "uS5m"
    | "bS6m"
    | "uS7m"
    | "uS8m"
    | "uS9m"
    | "uS10m"
    | "uS11m"
    | "uS12m"
    | "uS13m"
    | "uS14m"
    | "uS15m"
    | "bS16m"
    | "uS17m"
    | "bS18m"
    | "uS19m"
    | "bS21m"
    | "mS22"
    | "mS23"
    | "mS25"
    | "mS26"
    | "mS27"
    | "mS29"
    | "mS31"
    | "mS33"
    | "mS34"
    | "mS35"
    | "mS37"
    | "mS38"
    | "mS39"
    | "mS40"
    | "mS41"
    | "mS42"
    | "mS43"
    | "mS44"
    | "mS45"
    | "mS46"
    | "mS47"
    | "uL1m"
    | "uL2m"
    | "uL3m"
    | "uL4m"
    | "uL5m"
    | "uL6m"
    | "bL9m"
    | "uL10m"
    | "uL11m"
    | "bL12m"
    | "uL13m"
    | "uL14m"
    | "uL15m"
    | "uL16m"
    | "bL17m"
    | "uL18m"
    | "bL19m"
    | "bL20m"
    | "bL21m"
    | "uL22m"
    | "uL23m"
    | "uL24m"
    | "bL27m"
    | "bL28m"
    | "uL29m"
    | "uL30m"
    | "bL31m"
    | "bL32m"
    | "bL33m"
    | "bL34m"
    | "bL35m"
    | "bL36m"
    | "mL37"
    | "mL38"
    | "mL39"
    | "mL40"
    | "mL41"
    | "mL42"
    | "mL43"
    | "mL44"
    | "mL45"
    | "mL46"
    | "mL48"
    | "mL49"
    | "mL50"
    | "mL51"
    | "mL52"
    | "mL53"
    | "mL54"
    | "mL57"
    | "mL58"
    | "mL59"
    | "mL60"
    | "mL61"
    | "mL62"
    | "mL63"
    | "mL64"
    | "mL65"
    | "mL66"
    | "mL67";
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
  nomenclature: CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum[];
  pfam_accessions: string[];
  pfam_comments: string[];
  pfam_descriptions: string[];
  uniprot_accession: string[];
};
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
  nomenclature: CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum[];
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
  nomenclature: CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum[];
};
export type ChemCompContainerIdentifiers = {
  id: string;
  name: string;
  three_letter_code: string;
};
export type ChemComp = {
  chem_comp_container_identifiers: ChemCompContainerIdentifiers;
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
  chemp_comp?: ChemComp | null;
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
};
export type RibosomeStructure = {
  rcsb_id: string;
  expMethod: string;
  resolution: number;
  pdbx_keywords?: string | null;
  pdbx_keywords_text?: string | null;
  rcsb_external_ref_id: string[];
  rcsb_external_ref_type: string[];
  rcsb_external_ref_link: string[];
  citation_year?: number | null;
  citation_rcsb_authors?: string[] | null;
  citation_title?: string | null;
  citation_pdbx_doi?: string | null;
  src_organism_ids: number[];
  src_organism_names: string[];
  host_organism_ids: number[];
  host_organism_names: string[];
  assembly_map?: AssemblyInstancesMap[] | null;
  mitochondrial: boolean;
  proteins: Protein[];
  rnas: Rna[];
  other_polymers: Polymer[];
  nonpolymeric_ligands: NonpolymericLigand[];
};
export const {
  useRoutersRouterStructStructureProfileQuery,
  useRoutersRouterStructListStructuresQuery,
  useRoutersRouterClassesPolynucleotideClassQuery,
  useRoutersRouterClassesPolypeptideClassQuery,
  useRoutersRouterClassesLifecycleFactorClassQuery,
} = injectedRtkApi;