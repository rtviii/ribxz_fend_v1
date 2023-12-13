import { useEffect, createRef, createContext } from "react";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import './mstar.css'
import "molstar/lib/mol-plugin-ui/skin/light.scss";
import { createPluginUI } from 'molstar/lib/mol-plugin-ui/index';
import { MySpec } from "./mstar_config";

import { } from 'molstar/lib/mol-plugin-state/helpers/structure-selection-query'

declare global {
  interface Window {
    molstar?: PluginUIContext;
  }
}

export function MolStarWrapper() {
  const parent = createRef<HTMLDivElement>();
  useEffect(() => {
    async function init() {

      window.molstar = await createPluginUI(parent.current as HTMLDivElement, MySpec);
      // ^ your actual "viewer"

      const data       = await window.molstar.builders.data.download({ url: "https://files.rcsb.org/download/3j7z.pdb" }, { state: { isGhost: true } });
      const trajectory = await window.molstar.builders.structure.parseTrajectory(data, "pdb");
      await window.molstar.builders.structure.hierarchy.applyPreset(trajectory, "default");

    }

    init();

    return () => {
      window.molstar?.dispose();
      window.molstar = undefined;
    };
  }, []);

  return <div id='molstar-wrapper' ref={parent} />;
}
