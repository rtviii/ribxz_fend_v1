import { useEffect, createRef } from "react";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import './mstar.css'
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Plugin } from 'molstar/lib/mol-plugin-ui/plugin';
import "molstar/lib/mol-plugin-ui/skin/light.scss";
import { createPluginUI } from 'molstar/lib/mol-plugin-ui/index';
import { MySpec } from "./mstar_config";
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { DefaultPluginUISpec, PluginUISpec } from "molstar/lib/mol-plugin-ui/spec";


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
        const data           = await window.molstar.builders.data.download( { url: "https://files.rcsb.org/download/1lol.pdb" }, { state: { isGhost: true } } );
        const trajectory     = await window.molstar.builders.structure.parseTrajectory(data, "pdb");
        await window.molstar.builders.structure.hierarchy.applyPreset( trajectory, "default" );
    }

    init();
    return () => {
      window.molstar?.dispose();
      window.molstar = undefined;
    };
  }, []);

  return <div id='molstar-wrapper' ref={parent} />;
}
