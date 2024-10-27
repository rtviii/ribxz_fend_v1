'use client'
import { createContext , useState} from "react";
import { MolstarRibxz } from "./molstar_ribxz";

export const MolstarContext = createContext<null | MolstarRibxz>(null);
export default function MolstarContextProvider({ children, value }:{children:React.ReactNode, value: null | MolstarRibxz}) {
  return (
    <MolstarContext.Provider value={value}>
      {children}
    </MolstarContext.Provider>
  );
}