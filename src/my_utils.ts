import { useEffect, useState } from "react";

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

export function map_ncbi_tax_id_to_name(taxid: number, taxdict: Record<number, [string, "Archaea" | "Eukaryota" | "Bacteria"]>): [string, "Archaea" | "Eukaryota" | "Bacteria"] {
  return taxdict[taxid]
}

export function contract_taxname(name: string) {
  if (name) {
    return name.split(" ")[0][0].toUpperCase() + ". " + name.split(" ")[1]
  } else {
    return ""
  }
}

export function capitalize_only_first_letter_w(_: string |undefined): string {
  if (_===undefined){
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