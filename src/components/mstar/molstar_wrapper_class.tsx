"use client"
import { createPluginUI } from "molstar/lib/mol-plugin-ui";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import { DefaultPluginUISpec, PluginUISpec } from "molstar/lib/mol-plugin-ui/spec";
import { useEffect, createRef, createContext, Ref, forwardRef, RefObject } from "react";
import { renderReact18 } from "molstar/lib/mol-plugin-ui/react18";
import './mstar.css'
import "molstar/lib/mol-plugin-ui/skin/light.scss";
import { PluginConfig, PluginConfigItem } from 'molstar/lib/mol-plugin/config';
import { StructureComponentControls } from 'molstar/lib/mol-plugin-ui/structure/components';
import { StructureSourceControls } from 'molstar/lib/mol-plugin-ui/structure/source';
import { StructureQuickStylesControls } from 'molstar/lib/mol-plugin-ui/structure/quick-styles';
import { VolumeStreamingControls, VolumeSourceControls } from 'molstar/lib/mol-plugin-ui/structure/volume'
import { PluginUIComponent } from 'molstar/lib/mol-plugin-ui/base';
import { BuildSvg, Icon } from 'molstar/lib/mol-plugin-ui/controls/icons';
import { PluginBehaviors } from 'molstar/lib/mol-plugin/behavior'
import React from "react";
import { PluginSpec } from "molstar/lib/mol-plugin/spec";
import { PluginLayoutControlsDisplay } from "molstar/lib/mol-plugin/layout";
import { ObjectKeys } from "molstar/lib/mol-util/type-helpers";
import { StateTransforms } from "molstar/lib/mol-plugin-state/transforms";
import { AssignColorVolume } from "molstar/lib/mol-plugin-state/actions/volume";
import { BoxifyVolumeStreaming, CreateVolumeStreamingBehavior, InitVolumeStreaming } from "molstar/lib/mol-plugin/behavior/dynamic/volume-streaming/transformers";
import { StateActions } from 'molstar/lib/mol-plugin-state/actions'

import { MySpec } from "./lib";
import { addListener } from "@reduxjs/toolkit";
import { useAppDispatch } from "@/store/store";
import { molstarSlice } from "@/store/slices/molstar_state";



// TODO : 
//! - It's a class component tthat initiates into a given div element
//! - mapstate and mapdispatch listens to redux state


declare global {
  interface Window {
    molstar?: PluginUIContext;
  }
}

interface WrapperProps {
  switch: boolean
}

export function MolStarWrapper(props: WrapperProps) {
  const parent = createRef<HTMLDivElement>();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = dispatch(
      addListener({
        actionCreator: molstarSlice.actions.toggle_tools,
        effect: (action, listenerApi) => {
        },
      })
    )
    return unsubscribe
  }, [])


  async function _download_struct({ plugin, rcsb_id }: { plugin: PluginUIContext, rcsb_id: string }): Promise<null> {
    const data = await plugin.builders.data.download({ url: `https://files.rcsb.org/download/${rcsb_id}.cif` }, { state: { isGhost: true } });
    const trajectory = await plugin.builders.structure.parseTrajectory(data, "mmcif");
    await plugin.builders.structure.hierarchy.applyPreset(trajectory, "default");
    return null
  }

  useEffect(() => {
    console.log("Got new props");
    console.log(props);
  }, [props])

  useEffect(() => {
    async function init() {
      window.molstar = await createPluginUI({
        target: parent.current as HTMLDivElement,
        render: renderReact18,
        spec: MySpec
      },);

      const data = await window.molstar.builders.data.download(
        { url: "https://files.rcsb.org/download/3PTB.pdb" }, /* replace with your URL */
        { state: { isGhost: true } }
      );
      const trajectory =
        await window.molstar.builders.structure.parseTrajectory(data, "pdb");
      await window.molstar.builders.structure.hierarchy.applyPreset(
        trajectory,
        "default"
      );
    }
    init();
    return () => {
      window.molstar?.dispose();
      window.molstar = undefined;
    };
  }, []);

  return <div ref={parent} id='molstar-wrapper' className={`min-h-screen bg-blue-${props.switch ? 200 : 800}`} />
}


export class MolstarRibxz {

  plugin: PluginUIContext;
  constructor() { }

  async init(parent: HTMLElement) {
    this.plugin = await createPluginUI({
      target: parent,
      spec: MySpec,
      render: renderReact18
    });

    //   const data = await this.plugin.builders.data.download(
    //       { url: "https://files.rcsb.org/download/3PTB.pdb" }, /* replace with your URL */
    //       { state: { isGhost: true } }
    //     );
    // const trajectory = await this.plugin.builders.structure.parseTrajectory(data, 'pdb');
    // await this.plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default');

  }



  async download_struct(rcsb_id: string): Promise<null> {
    const data = await this.plugin.builders.data.download({ url: `https://files.rcsb.org/download/${rcsb_id.toUpperCase()}.cif` }, { state: { isGhost: true } });
    const trajectory = await this.plugin.builders.structure.parseTrajectory(data, "mmcif");
    await this.plugin.builders.structure.hierarchy.applyPreset(trajectory, "default");
    return null
  }


}