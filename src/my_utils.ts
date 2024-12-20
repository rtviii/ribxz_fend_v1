import { useEffect, useState } from "react";
import { RibosomeStructure } from "./store/ribxz_api/ribxz_api";

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