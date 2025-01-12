import { useEffect, useState } from "react";
import { Polymer, RibosomeStructure } from "./store/ribxz_api/ribxz_api";

export function parseDateString(dateString: string|null| undefined): { year: number, month: number, day: number } {
  if (dateString === null || dateString === undefined) {
    return { year: 0, month: 0, day: 0 };
  }
  const date = new Date(dateString);
  
  return {
    year : date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,   // getUTCMonth() returns 0-11, so we add 1
    day  : date.getUTCDate()
  };
}

export function useDebouncePagination(value: number, delay: number): number {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export function map_ncbi_tax_id_to_name(taxid: number, taxdict: Record<number, string>): string {
  return taxdict[taxid]
}

export function contract_taxname(name: string) {
  if (name) {
    var name = name.toLowerCase()
    return name.split(" ")[0][0].toUpperCase() + ". " + name.split(" ")[1]
  } else {
    return ""
  }
}

export function capitalize_only_first_letter_w(_: string | undefined): string {
  if (_ === undefined) {
    return ""
  }
  var s = ""
  for (var word of _.split(" ")) {
    if (s != "") {
      s += " "
    }
    s += word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase()
  }
  return s
}

export function yield_nomenclature_map_profile(profile: RibosomeStructure):Record< string, string | undefined > {
  var _: Record<string, string | undefined> = {}
  for (let polymer of [...profile.rnas, ...profile.proteins, ...profile.other_polymers]) {
    if (!Object.keys(_).includes(polymer.auth_asym_id)) {
      _[polymer.auth_asym_id] = polymer.nomenclature.length > 0 ? polymer.nomenclature[0]  : undefined 
    }
  }
  return _

}

export const sort_by_polymer_class = (a: Polymer, b: Polymer): number => {
    if (a.nomenclature.length === 0 || b.nomenclature.length === 0) {
        return 0;
    }

    // Helper function to check if a nomenclature is RNA
    const isRNA = (name: string): boolean => {
        return name.includes('rRNA') || name === 'tRNA';
    };

    const nameA = a.nomenclature[0];
    const nameB = b.nomenclature[0];

    // If both are RNA or both are not RNA, sort normally
    if (isRNA(nameA) === isRNA(nameB)) {
        const [, prefixA, numberA] = nameA.match(/([a-zA-Z]+)(\d*\.?\d*)/) || [];
        const [, prefixB, numberB] = nameB.match(/([a-zA-Z]+)(\d*\.?\d*)/) || [];

        if (prefixA !== prefixB) {
            return prefixA.localeCompare(prefixB);
        }

        const numA = numberA ? parseFloat(numberA) : 0;
        const numB = numberB ? parseFloat(numberB) : 0;
        return numA - numB;
    }

    // If one is RNA and the other isn't, RNA comes first
    return isRNA(nameA) ? -1 : 1;
};

export const getLuminance = (hexColor: string): number => {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    
    // Using relative luminance formula
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const getContrastColor = (hexColor: string): string => {
    const luminance = getLuminance(hexColor);
    
    if (luminance > 0.7) {
        return '#374151';     // gray-700
    } else if (luminance > 0.5) {
        return '#6B7280';     // gray-500
    } else if (luminance > 0.3) {
        return '#D1D5DB';     // gray-300
    } else {
        return '#F3F4F6';     // gray-100
    }
};