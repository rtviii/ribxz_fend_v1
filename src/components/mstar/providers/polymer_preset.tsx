import {
  ResidueIndex,
  Structure,
  StructureProperties,
  Unit,
} from "molstar/lib/mol-model/structure";
import { MolScriptBuilder as MS } from "molstar/lib/mol-script/language/builder";
import { StateObjectRef, StateObjectSelector } from "molstar/lib/mol-state";
import { PluginStateObject } from "molstar/lib/mol-plugin-state/objects";
import { StructureRepresentationPresetProvider } from "molstar/lib/mol-plugin-state/builder/structure/representation-preset";
import { ParamDefinition as PD } from "molstar/lib/mol-util/param-definition";
import { Color } from "molstar/lib/mol-util/color";
import ribxzPolymerColorScheme from "./colorscheme";

export const IonNames = new Set([
  "118",
  "119",
  "543",
  "1AL",
  "1CU",
  "2FK",
  "2HP",
  "2OF",
  "3CO",
  "3MT",
  "3NI",
  "3OF",
  "3P8",
  "4MO",
  "4PU",
  "4TI",
  "6MO",
  "ACT",
  "AG",
  "AL",
  "ALF",
  "AM",
  "ATH",
  "AU",
  "AU3",
  "AUC",
  "AZI",
  "BA",
  "BCT",
  "BEF",
  "BF4",
  "BO4",
  "BR",
  "BS3",
  "BSY",
  "CA",
  "CAC",
  "CD",
  "CD1",
  "CD3",
  "CD5",
  "CE",
  "CF",
  "CHT",
  "CL",
  "CO",
  "CO3",
  "CO5",
  "CON",
  "CR",
  "CS",
  "CSB",
  "CU",
  "CU1",
  "CU3",
  "CUA",
  "CUZ",
  "CYN",
  "DME",
  "DMI",
  "DSC",
  "DTI",
  "DY",
  "E4N",
  "EDR",
  "EMC",
  "ER3",
  "EU",
  "EU3",
  "F",
  "FE",
  "FE2",
  "FPO",
  "GA",
  "GD3",
  "GEP",
  "HAI",
  "HG",
  "HGC",
  "IN",
  "IOD",
  "IR",
  "IR3",
  "IRI",
  "IUM",
  "K",
  "KO4",
  "LA",
  "LCO",
  "LCP",
  "LI",
  "LU",
  "MAC",
  "MG",
  "MH2",
  "MH3",
  "MLI",
  "MMC",
  "MN",
  "MN3",
  "MN5",
  "MN6",
  "MO1",
  "MO2",
  "MO3",
  "MO4",
  "MO5",
  "MO6",
  "MOO",
  "MOS",
  "MOW",
  "MW1",
  "MW2",
  "MW3",
  "NA",
  "NA2",
  "NA5",
  "NA6",
  "NAO",
  "NAW",
  "ND",
  "NET",
  "NH4",
  "NI",
  "NI1",
  "NI2",
  "NI3",
  "NO2",
  "NO3",
  "NRU",
  "NT3",
  "O4M",
  "OAA",
  "OC1",
  "OC2",
  "OC3",
  "OC4",
  "OC5",
  "OC6",
  "OC7",
  "OC8",
  "OCL",
  "OCM",
  "OCN",
  "OCO",
  "OF1",
  "OF2",
  "OF3",
  "OH",
  "OS",
  "OS4",
  "OXL",
  "PB",
  "PBM",
  "PD",
  "PDV",
  "PER",
  "PI",
  "PO3",
  "PO4",
  "PR",
  "PT",
  "PT4",
  "PTN",
  "RB",
  "RH3",
  "RHD",
  "RHF",
  "RU",
  "SB",
  "SCN",
  "SE4",
  "SEK",
  "SM",
  "SMO",
  "SO3",
  "SO4",
  "SR",
  "T1A",
  "TB",
  "TBA",
  "TCN",
  "TEA",
  "TH",
  "THE",
  "TL",
  "TMA",
  "TRA",
  "UNX",
  "V",
  "VN3",
  "VO4",
  "W",
  "WO5",
  "Y1",
  "YB",
  "YB2",
  "YH",
  "YT3",
  "ZCM",
  "ZN",
  "ZN2",
  "ZN3",
  "ZNO",
  "ZO3",
  "ZR",
  "ZTM",
  "NCO",
  "OHX",
]);

function getLigands(structure: Structure) {
  const non_ion_ligands = new Set<string>();
  const { _rowCount: residueCount } = structure.model.atomicHierarchy.residues;
  const { offsets: residueOffsets } =
    structure.model.atomicHierarchy.residueAtomSegments;
  const chainIndex = structure.model.atomicHierarchy.chainAtomSegments.index;

  for (let rI = 0 as ResidueIndex; rI < residueCount; rI++) {
    const cI = chainIndex[residueOffsets[rI]];
    const eI = structure.model.atomicHierarchy.index.getEntityFromChain(cI);
    const entityType = structure.model.entities.data.type.value(eI);
    if (entityType !== "non-polymer" && entityType !== "branched") continue;
    const comp_id = structure.model.atomicHierarchy.atoms.label_comp_id.value(
      residueOffsets[rI]
    );
    IonNames.has(comp_id) ? null : non_ion_ligands.add(comp_id);
  }

  return non_ion_ligands;
}

export const chainSelectionPreset = StructureRepresentationPresetProvider({
  id: "polymers-ligand-ribxz-theme",
  display: {
    name: "Split Components",
    group: "ribxz",
    description:
      "Shows each polymer chain and ligand as separate selectable components.",
  },
  params: () => ({
    ...StructureRepresentationPresetProvider.CommonParams,
    structureId: PD.Text("", { description: "ID to prefix chain labels with" }),
    nomenclature_map:PD.Value({}) }),
  async apply(ref, params, plugin) {
    const structureCell = StateObjectRef.resolveAndCheck(
      plugin.state.data,
      ref
    );
    if (!structureCell) return {};
    const structure = structureCell.obj!.data;
    const { update, builder, typeParams, color, symmetryColor } =
      StructureRepresentationPresetProvider.reprBuilder(
        plugin,
        params,
        structure
      );
    const idPrefix = params.structureId ? `${params.structureId}-` : "";
    const nommap = params.nomenclature_map;
    console.log("Got nomenclature_map, " ,nommap);
    

    const chains = new Set<string>();

    for (const unit of structure.units) {
      const chainLocation = {
        structure,
        unit,
        element: unit.elements[0],
        kind: "unit" as const,
      };

      // @ts-ignore
      const unitChains = StructureProperties.chain.auth_asym_id(chainLocation);
      chains.add(unitChains);
    }

    const components: { [k: string]: StateObjectSelector | undefined } = {};
    const representations: { [k: string]: StateObjectSelector | undefined } =
      {};

    for (const chainId of Array.from(chains)) {
      const chainSelection = MS.struct.generator.atomGroups({
        "chain-test": MS.core.rel.eq([
          MS.struct.atomProperty.macromolecular.auth_asym_id(),
          chainId,
        ]),
      });
      const component =
        await plugin.builders.structure.tryCreateComponentFromExpression(
          ref,
          chainSelection,
          `${idPrefix}chain-${chainId}`,
          {
            label: `${
              params.structureId ? `${params.structureId} ` : ""
            }Polymer ${chainId}`,
            tags: [`${idPrefix}chain-${chainId}`, params.structureId],
          }
        );

      if (component) {
        console.log("nommap chainid: , ", chainId, "->",nommap[chainId]);
        
        console.log("Will paint ", chainId, " color: " ,ribxzPolymerColorScheme[nommap[chainId]]);
        
        components[`chain-${chainId}`] = component;
        const representation =
          await plugin.builders.structure.representation.addRepresentation(
            component,
            {
              type: "cartoon",
              color:'uniform',
             
              colorParams: {
                value: ribxzPolymerColorScheme[nommap[chainId]],
              },
            }
          );

        representations[`chain-${chainId}`] = representation;
      }
    }

    // Handle ligands
    const ligands = getLigands(structure);
    for (const ligandId of Array.from(ligands)) {
      const ligandSelection = MS.struct.generator.atomGroups({
        "atom-test": MS.core.rel.eq([
          MS.struct.atomProperty.macromolecular.label_comp_id(),
          ligandId,
        ]),
      });

      const component =
        await plugin.builders.structure.tryCreateComponentFromExpression(
          ref,
          ligandSelection,
          `${idPrefix}ligand-${ligandId}`,
          {
            label: `${
              params.structureId ? `${params.structureId} ` : ""
            }${ligandId}`,
            tags: [`${idPrefix}ligand-${ligandId}`, params.structureId],
          }
        );

      if (component) {
        components[`ligand-${ligandId}`] = component;

        const representation =
          await plugin.builders.structure.representation.addRepresentation(
            component,
            {
              type: "ball-and-stick",
              colorParams: {
                style: {
                  name: "element-symbol",
                },
              },
            }
          );

        representations[`ligand-${ligandId}`] = representation;
      }
    }

    await update.commit({ revertOnError: true });

    return {
      components,
      representations,
      metadata: {
        polymer: [],
        ligand: [],
      },
    };
  },
});
