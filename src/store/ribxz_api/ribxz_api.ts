import { empty_api as api } from "./template";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    routersRouterStructAllRcsbIds: build.query<
      RoutersRouterStructAllRcsbIdsApiResponse,
      RoutersRouterStructAllRcsbIdsApiArg
    >({
      query: () => ({ url: `/structures/all_rcsb_ids` }),
    }),
    routersRouterStructPolymerClassesStats: build.query<
      RoutersRouterStructPolymerClassesStatsApiResponse,
      RoutersRouterStructPolymerClassesStatsApiArg
    >({
      query: () => ({ url: `/structures/polymer_classes_stats` }),
    }),
    routersRouterStructTaxDict: build.query<
      RoutersRouterStructTaxDictApiResponse,
      RoutersRouterStructTaxDictApiArg
    >({
      query: () => ({ url: `/structures/tax_dict` }),
    }),
    routersRouterStructPolymerClassificationReport: build.query<
      RoutersRouterStructPolymerClassificationReportApiResponse,
      RoutersRouterStructPolymerClassificationReportApiArg
    >({
      query: (queryArg) => ({
        url: `/structures/polymer_classification_report`,
        params: { rcsb_id: queryArg.rcsbId },
      }),
    }),
    routersRouterStructStructureCompositionStats: build.query<
      RoutersRouterStructStructureCompositionStatsApiResponse,
      RoutersRouterStructStructureCompositionStatsApiArg
    >({
      query: () => ({ url: `/structures/structure_composition_stats` }),
    }),
    routersRouterStructRandomProfile: build.query<
      RoutersRouterStructRandomProfileApiResponse,
      RoutersRouterStructRandomProfileApiArg
    >({
      query: () => ({ url: `/structures/random_profile` }),
    }),
    routersRouterStructPolymersByPolymerClass: build.query<
      RoutersRouterStructPolymersByPolymerClassApiResponse,
      RoutersRouterStructPolymersByPolymerClassApiArg
    >({
      query: (queryArg) => ({
        url: `/structures/list_polymers_filtered_by_polymer_class`,
        params: { polymer_class: queryArg.polymerClass, page: queryArg.page },
      }),
    }),
    routersRouterStructPolymersByStructure: build.query<
      RoutersRouterStructPolymersByStructureApiResponse,
      RoutersRouterStructPolymersByStructureApiArg
    >({
      query: (queryArg) => ({
        url: `/structures/list_polymers_by_structure`,
        params: {
          page: queryArg.page,
          search: queryArg.search,
          year: queryArg.year,
          resolution: queryArg.resolution,
          polymer_classes: queryArg.polymerClasses,
          source_taxa: queryArg.sourceTaxa,
          host_taxa: queryArg.hostTaxa,
        },
      }),
    }),
    routersRouterStructListLigands: build.query<
      RoutersRouterStructListLigandsApiResponse,
      RoutersRouterStructListLigandsApiArg
    >({
      query: () => ({ url: `/structures/list_ligands` }),
    }),
    routersRouterStructFilterList: build.query<
      RoutersRouterStructFilterListApiResponse,
      RoutersRouterStructFilterListApiArg
    >({
      query: (queryArg) => ({
        url: `/structures/list`,
        params: {
          page: queryArg.page,
          search: queryArg.search,
          year: queryArg.year,
          resolution: queryArg.resolution,
          polymer_classes: queryArg.polymerClasses,
          source_taxa: queryArg.sourceTaxa,
          host_taxa: queryArg.hostTaxa,
          subunit_presence: queryArg.subunitPresence,
        },
      }),
    }),
    routersRouterStructOverview: build.query<
      RoutersRouterStructOverviewApiResponse,
      RoutersRouterStructOverviewApiArg
    >({
      query: () => ({ url: `/structures/structures_overview` }),
    }),
    routersRouterStructStructureProfile: build.query<
      RoutersRouterStructStructureProfileApiResponse,
      RoutersRouterStructStructureProfileApiArg
    >({
      query: (queryArg) => ({
        url: `/structures/profile`,
        params: { rcsb_id: queryArg.rcsbId },
      }),
    }),
    routersRouterStructStructurePtc: build.query<
      RoutersRouterStructStructurePtcApiResponse,
      RoutersRouterStructStructurePtcApiArg
    >({
      query: (queryArg) => ({
        url: `/structures/ptc`,
        params: { rcsb_id: queryArg.rcsbId },
      }),
    }),
    routersRouterStructChainsByStruct: build.query<
      RoutersRouterStructChainsByStructApiResponse,
      RoutersRouterStructChainsByStructApiArg
    >({
      query: () => ({ url: `/structures/chains_by_struct` }),
    }),
    routersRouterStructPolymerClassesNomenclature: build.query<
      RoutersRouterStructPolymerClassesNomenclatureApiResponse,
      RoutersRouterStructPolymerClassesNomenclatureApiArg
    >({
      query: () => ({ url: `/structures/list_nomenclature` }),
    }),
    routersRouterStructListSourceTaxa: build.query<
      RoutersRouterStructListSourceTaxaApiResponse,
      RoutersRouterStructListSourceTaxaApiArg
    >({
      query: (queryArg) => ({
        url: `/structures/list_source_taxa`,
        params: { source_or_host: queryArg.sourceOrHost },
      }),
    }),
    routersRouterStructGetShape: build.query<
      RoutersRouterStructGetShapeApiResponse,
      RoutersRouterStructGetShapeApiArg
    >({
      query: (queryArg) => ({
        url: `/structures/tunnel_geometry`,
        params: { rcsb_id: queryArg.rcsbId, is_ascii: queryArg.isAscii },
      }),
    }),
    routersRouterStructGetRadial: build.query<
      RoutersRouterStructGetRadialApiResponse,
      RoutersRouterStructGetRadialApiArg
    >({
      query: (queryArg) => ({
        url: `/structures/tunnel_radial`,
        params: { rcsb_id: queryArg.rcsbId },
      }),
    }),
    routersRouterClassesPolynucleotideClass: build.query<
      RoutersRouterClassesPolynucleotideClassApiResponse,
      RoutersRouterClassesPolynucleotideClassApiArg
    >({
      query: (queryArg) => ({
        url: `/polymers/polynucleotide`,
        params: { rna_class: queryArg.rnaClass },
      }),
    }),
    routersRouterClassesPolypeptideClass: build.query<
      RoutersRouterClassesPolypeptideClassApiResponse,
      RoutersRouterClassesPolypeptideClassApiArg
    >({
      query: (queryArg) => ({
        url: `/polymers/polypeptide`,
        params: { protein_class: queryArg.proteinClass },
      }),
    }),
    routersRouterClassesLifecycleFactorClass: build.query<
      RoutersRouterClassesLifecycleFactorClassApiResponse,
      RoutersRouterClassesLifecycleFactorClassApiArg
    >({
      query: (queryArg) => ({
        url: `/polymers/lifecyle_factor`,
        params: { factor_class: queryArg.factorClass },
      }),
    }),
    routersRouterMmcifPolymer: build.query<
      RoutersRouterMmcifPolymerApiResponse,
      RoutersRouterMmcifPolymerApiArg
    >({
      query: (queryArg) => ({
        url: `/mmcif/polymer`,
        params: { rcsb_id: queryArg.rcsbId, auth_asym_id: queryArg.authAsymId },
      }),
    }),
    routersRouterLigLigNbhd: build.query<
      RoutersRouterLigLigNbhdApiResponse,
      RoutersRouterLigLigNbhdApiArg
    >({
      query: (queryArg) => ({
        url: `/ligand/binding_pocket`,
        params: {
          source_structure: queryArg.sourceStructure,
          chemical_id: queryArg.chemicalId,
          radius: queryArg.radius,
        },
      }),
    }),
    routersRouterLigLigTranspose: build.query<
      RoutersRouterLigLigTransposeApiResponse,
      RoutersRouterLigLigTransposeApiArg
    >({
      query: (queryArg) => ({
        url: `/ligand/transpose`,
        params: {
          source_structure: queryArg.sourceStructure,
          target_structure: queryArg.targetStructure,
          chemical_id: queryArg.chemicalId,
          radius: queryArg.radius,
        },
      }),
    }),
    routersRouterLigLigChemicalCategories: build.query<
      RoutersRouterLigLigChemicalCategoriesApiResponse,
      RoutersRouterLigLigChemicalCategoriesApiArg
    >({
      query: () => ({ url: `/ligand/chemical_classification` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as ribxz_api };
export type RoutersRouterStructAllRcsbIdsApiResponse =
  /** status 200 OK */ string[];
export type RoutersRouterStructAllRcsbIdsApiArg = void;
export type RoutersRouterStructPolymerClassesStatsApiResponse =
  /** status 200 OK */ [string, number][];
export type RoutersRouterStructPolymerClassesStatsApiArg = void;
export type RoutersRouterStructTaxDictApiResponse = /** status 200 OK */ object;
export type RoutersRouterStructTaxDictApiArg = void;
export type RoutersRouterStructPolymerClassificationReportApiResponse = unknown;
export type RoutersRouterStructPolymerClassificationReportApiArg = {
  rcsbId: string;
};
export type RoutersRouterStructStructureCompositionStatsApiResponse =
  /** status 200 OK */ StructureCompositionStats;
export type RoutersRouterStructStructureCompositionStatsApiArg = void;
export type RoutersRouterStructRandomProfileApiResponse =
  /** status 200 OK */ RibosomeStructure;
export type RoutersRouterStructRandomProfileApiArg = void;
export type RoutersRouterStructPolymersByPolymerClassApiResponse =
  /** status 200 OK */ object;
export type RoutersRouterStructPolymersByPolymerClassApiArg = {
  polymerClass:
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
  page?: number;
};
export type RoutersRouterStructPolymersByStructureApiResponse =
  /** status 200 OK */ object;
export type RoutersRouterStructPolymersByStructureApiArg = {
  page?: number;
  search?: string;
  year?: string;
  resolution?: string;
  polymerClasses?: string;
  sourceTaxa?: string;
  hostTaxa?: string;
};
export type RoutersRouterStructListLigandsApiResponse = /** status 200 OK */ [
  object,
  object[]
][];
export type RoutersRouterStructListLigandsApiArg = void;
export type RoutersRouterStructFilterListApiResponse =
  /** status 200 OK */ object;
export type RoutersRouterStructFilterListApiArg = {
  page?: number;
  search?: string;
  year?: string;
  resolution?: string;
  polymerClasses?: string;
  sourceTaxa?: string;
  hostTaxa?: string;
  subunitPresence?: string;
};
export type RoutersRouterStructOverviewApiResponse =
  /** status 200 OK */ object[];
export type RoutersRouterStructOverviewApiArg = void;
export type RoutersRouterStructStructureProfileApiResponse =
  /** status 200 OK */ RibosomeStructure;
export type RoutersRouterStructStructureProfileApiArg = {
  rcsbId: string;
};
export type RoutersRouterStructStructurePtcApiResponse =
  /** status 200 OK */ object;
export type RoutersRouterStructStructurePtcApiArg = {
  rcsbId: string;
};
export type RoutersRouterStructChainsByStructApiResponse =
  /** status 200 OK */ ChainsByStruct[];
export type RoutersRouterStructChainsByStructApiArg = void;
export type RoutersRouterStructPolymerClassesNomenclatureApiResponse =
  /** status 200 OK */ NomenclatureSet;
export type RoutersRouterStructPolymerClassesNomenclatureApiArg = void;
export type RoutersRouterStructListSourceTaxaApiResponse =
  /** status 200 OK */ object[];
export type RoutersRouterStructListSourceTaxaApiArg = {
  sourceOrHost: "source" | "host";
};
export type RoutersRouterStructGetShapeApiResponse = unknown;
export type RoutersRouterStructGetShapeApiArg = {
  rcsbId: string;
  isAscii?: boolean;
};
export type RoutersRouterStructGetRadialApiResponse = unknown;
export type RoutersRouterStructGetRadialApiArg = {
  rcsbId: string;
};
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
export type RoutersRouterMmcifPolymerApiResponse = unknown;
export type RoutersRouterMmcifPolymerApiArg = {
  rcsbId: string;
  authAsymId: string;
};
export type RoutersRouterLigLigNbhdApiResponse =
  /** status 200 OK */ BindingSite;
export type RoutersRouterLigLigNbhdApiArg = {
  sourceStructure: string;
  chemicalId: string;
  radius?: number;
};
export type RoutersRouterLigLigTransposeApiResponse =
  /** status 200 OK */ LigandTransposition;
export type RoutersRouterLigLigTransposeApiArg = {
  sourceStructure: string;
  targetStructure: string;
  chemicalId: string;
  radius: number;
};
export type RoutersRouterLigLigChemicalCategoriesApiResponse =
  /** status 200 OK */ object;
export type RoutersRouterLigLigChemicalCategoriesApiArg = void;
export type CompositionStats = {
  lsu_only: number;
  ssu_only: number;
  ssu_lsu: number;
  drugbank_compounds: number;
  mitochondrial: number;
};
export type StructureCompositionStats = {
  archaea: CompositionStats;
  bacteria: CompositionStats;
  eukaryota: CompositionStats;
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
  subunit_presence?: ("ssu" | "lsu")[] | null;
  proteins: Protein[];
  rnas: Rna[];
  other_polymers: Polymer[];
  nonpolymeric_ligands: NonpolymericLigand[];
};
export type PolymerByStruct = {
  nomenclature: CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum[];
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
  nomenclature: CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum[];
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
export type PredictedResiduesPolymer = {
  polymer_class: CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum;
  source: PredictionSource;
  target: PredictionTarget;
};
export type LigandTransposition = {
  source: string;
  target: string;
  constituent_chains: PredictedResiduesPolymer[];
  purported_binding_site: BindingSite;
};
export const {
  useRoutersRouterStructAllRcsbIdsQuery,
  useRoutersRouterStructPolymerClassesStatsQuery,
  useRoutersRouterStructTaxDictQuery,
  useRoutersRouterStructPolymerClassificationReportQuery,
  useRoutersRouterStructStructureCompositionStatsQuery,
  useRoutersRouterStructRandomProfileQuery,
  useRoutersRouterStructPolymersByPolymerClassQuery,
  useRoutersRouterStructPolymersByStructureQuery,
  useRoutersRouterStructListLigandsQuery,
  useRoutersRouterStructFilterListQuery,
  useRoutersRouterStructOverviewQuery,
  useRoutersRouterStructStructureProfileQuery,
  useRoutersRouterStructStructurePtcQuery,
  useRoutersRouterStructChainsByStructQuery,
  useRoutersRouterStructPolymerClassesNomenclatureQuery,
  useRoutersRouterStructListSourceTaxaQuery,
  useRoutersRouterStructGetShapeQuery,
  useRoutersRouterStructGetRadialQuery,
  useRoutersRouterClassesPolynucleotideClassQuery,
  useRoutersRouterClassesPolypeptideClassQuery,
  useRoutersRouterClassesLifecycleFactorClassQuery,
  useRoutersRouterMmcifPolymerQuery,
  useRoutersRouterLigLigNbhdQuery,
  useRoutersRouterLigLigTransposeQuery,
  useRoutersRouterLigLigChemicalCategoriesQuery,
} = injectedRtkApi;
