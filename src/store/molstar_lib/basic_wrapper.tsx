"use client"
import { createPluginUI } from "molstar/lib/mol-plugin-ui";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import { DefaultPluginUISpec, PluginUISpec } from "molstar/lib/mol-plugin-ui/spec";
import { useEffect, createRef, createContext, Ref, forwardRef, RefObject } from "react";
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


declare global {
  interface Window {
    molstar?: PluginUIContext;
  }
}



export class BasicWrapper {

  plugin: PluginUIContext

  constructor(_: PluginUIContext) {
    this.plugin = _
  }

  static async init(target: string | HTMLElement) {
    var plugin = await createPluginUI(typeof target === 'string' ? document.getElementById(target)! : target, MySpec);
    return new BasicWrapper(plugin)
  }
}



export const MolstarNode = forwardRef<HTMLDivElement, {}>( function MolstarNode(_, ref) { return <div ref={ref} id='molstar-wrapper' className="min-h-screen" /> })
