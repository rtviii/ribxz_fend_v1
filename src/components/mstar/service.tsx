// services/MolstarService.ts
import {ribxzMstarv2} from './mstar_v2';
import {MolstarStateController} from './mstar_controller';
import {AppDispatch, RootState} from '@/store/store';
import {StructureElement, StructureProperties} from 'molstar/lib/mol-model/structure';
import {useEffect, useState} from 'react';
import { InteractivityManager } from 'molstar/lib/mol-plugin-state/manager/interactivity';
import { debounceTime } from 'rxjs';

interface StructureElement {
    auth_asym_id?: string;
    auth_seq_id?: number;
    comp_id?: string;
}

type InteractionState = {
    hover: StructureElement | null;
    selection: StructureElement | null;
};

// You can expand these types as needed
type SubscriptionType = 'interaction';
type SubscriptionData = InteractionState;

function getElementDetails(location: StructureElement.Location) {
    return {
        entity_id: StructureProperties.chain.label_entity_id(location),
        label_asym_id: StructureProperties.chain.label_asym_id(location),
        auth_asym_id: StructureProperties.chain.auth_asym_id(location),
        seq_id: StructureProperties.residue.label_seq_id(location),
        auth_seq_id: StructureProperties.residue.auth_seq_id(location),
        comp_id: StructureProperties.atom.label_comp_id(location)
    };
}

export class MolstarService {
    private static instance: MolstarService;
    private viewer         : ribxzMstarv2 | null = null;
    private controller     : MolstarStateController | null = null;
    private subscribers = new Map<SubscriptionType, Set<(data: SubscriptionData) => void>>();
    private interactionState: InteractionState = {
        hover: null,
        selection: null
    };

    private constructor() {}

    static getInstance() {
        if (!this.instance) {
            this.instance = new MolstarService();
        }
        return this.instance;
    }

    async initialize(element: HTMLElement, dispatch: AppDispatch, getState: () => RootState) {
        if (this.viewer) return;
        
        this.viewer = new ribxzMstarv2();
        await this.viewer.init(element);
        this.controller = new MolstarStateController(this.viewer, dispatch, getState);

        // Setup interaction tracking
        this.setupInteractionObservers(element);
    }

    getController() {
        return this.controller;
    }

    getViewer() {
        return this.viewer;
    }

    subscribe(type: SubscriptionType, callback: (data: SubscriptionData) => void) {
        if (!this.subscribers.has(type)) {
            this.subscribers.set(type, new Set());
        }
        this.subscribers.get(type)!.add(callback);
        return () => {
            this.subscribers.get(type)!.delete(callback);
            return void 0; // explicitly return void
        };
    }

    private notifySubscribers(type: SubscriptionType, data: SubscriptionData) {
        this.subscribers.get(type)?.forEach(callback => callback(data));
    }

    private setupInteractionObservers(element: HTMLElement) {
        this.viewer?.ctx.behaviors.interaction.hover
            .pipe(debounceTime(200))
            .subscribe((e: InteractivityManager.HoverEvent) => {
                if (e.current?.loci && e.current.loci.kind !== 'empty-loci') {
                    const details = this.getLociDetails(e.current.loci);
                    if (details) {
                        this.interactionState.hover = details;
                        this.notifySubscribers('interaction', this.interactionState);
                    }
                } else {
                    this.interactionState.hover = null;
                    this.notifySubscribers('interaction', this.interactionState);
                }
            });
    }

    // private getLociDetails(loci: any): StructureElement | undefined {
    //     // Your existing getLociDetails implementation
    // }

    private getLociDetails(loci: any): StructureElement | undefined {
        if (loci.kind === 'element-loci') {
            const stats = StructureElement.Stats.ofLoci(loci);
            const {elementCount, residueCount, chainCount} = stats;

            if (elementCount === 1 && residueCount === 0 && chainCount === 0) {
                return getElementDetails(stats.firstElementLoc);
            } else if (elementCount === 0 && residueCount === 1 && chainCount === 0) {
                return getElementDetails(stats.firstResidueLoc);
            }
        }
        return undefined;
    }
}

export function useMolstarService() {
    const [interactionState, setInteractionState] = useState<InteractionState>({
        hover    : null,
        selection: null
    });

    useEffect(() => {
        const service = MolstarService.getInstance();
        const unsubscribe = service.subscribe('interaction', setInteractionState);
        return () => unsubscribe();
    }, []);

    return {
        service: MolstarService.getInstance(),
        interactionState
    };
}
