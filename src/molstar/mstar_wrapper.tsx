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
import { StructureSelectionManager, StructureSelectionModifier, StructureSelectionSnapshot } from 'molstar/lib/mol-plugin-state/manager/structure/selection'
import { StructureComponentManager } from 'molstar/lib/mol-plugin-state/manager/structure/component'
import { debounceTime } from "rxjs";
import { InteractivityManager } from "molstar/lib/mol-plugin-state/manager/interactivity";
import { Loci } from "molstar/lib/mol-model/loci";
import { lociLabel } from 'molstar/lib/mol-theme/label'
import { StructureElement, StructureProperties, StructureSelection } from "molstar/lib/mol-model/structure";
import { log } from "console";
import { MolScriptBuilder } from "molstar/lib/mol-script/language/builder";
import { StructureSelectionQuery } from "molstar/lib/mol-plugin-state/helpers/structure-selection-query";
import { } from 'molstar/lib/mol-plugin-state/helpers/structure-selection-query'
import { StateSelection } from "molstar/lib/mol-state";
import { PluginStateObject } from "molstar/lib/mol-plugin-state/objects";
import { Script } from "molstar/lib/mol-script/script";

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

      const data = await window.molstar.builders.data.download({ url: "https://files.rcsb.org/download/3j7z.pdb" }, { state: { isGhost: true } });
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
