'use client';
import {useCallback, useEffect, useMemo, useState, useContext} from 'react';
import {ribxzMstarv2} from './mstar_v2';
import {MolstarStateController} from './mstar_controller';
import {AppStore, RootState, useAppDispatch} from '@/store/store';
import React from 'react';
import {useStore} from 'react-redux';
import { MolstarInstanceId } from '@/store/molstar/slice_refs';

// Keep the existing interface
interface MolstarService {
    viewer: ribxzMstarv2;
    controller: MolstarStateController;
    instanceId: MolstarInstanceId;  // Add this
}

// Define the context value interface
interface MolstarContextValue {
    services: Map<MolstarInstanceId, MolstarService>;  // Now keys are strictly typed
    getService: (id: MolstarInstanceId) => MolstarService | undefined;
    registerService: (id: MolstarInstanceId, service: MolstarService) => void;
    unregisterService: (id: MolstarInstanceId) => void;
}

// Create the context
export const MolstarContext = React.createContext<MolstarContextValue | null>(null);

// Provider component
export function MolstarProvider({children}: {children: React.ReactNode}) {
    const [services] = useState(() => new Map<MolstarInstanceId, MolstarService>());

    const value = useMemo(
        () => ({
            services,
            getService: (id: MolstarInstanceId) => services.get(id),
            registerService: (id: MolstarInstanceId, service: MolstarService) => services.set(id, service),
            unregisterService: (id: MolstarInstanceId) => services.delete(id)
        }),
        [services]
    );

    return <MolstarContext.Provider value={value}>{children}</MolstarContext.Provider>;
}

// Main service hook
export const useMolstarService = (
    containerRef: React.RefObject<HTMLDivElement>, 
    instanceId: MolstarInstanceId 
) => {
    const context = useContext(MolstarContext);
    const [isInitialized, setIsInitialized] = useState(false);
    const dispatch = useAppDispatch();
    const store = useStore<AppStore>();

    const getState = useCallback((): RootState => {
        return store.getState();
    }, [store]);

    useEffect(() => {
        const initMolstar = async () => {
            if (!containerRef.current || context?.getService(instanceId)) return;

            const viewer = new ribxzMstarv2();
            await viewer.init(containerRef.current);
            
            // Pass instanceId to controller
            const controller = new MolstarStateController(
                viewer, 
                dispatch, 
                getState,
                instanceId
            );

            const service = {viewer, controller, instanceId};  // Include instanceId
            context?.registerService(instanceId, service);
            setIsInitialized(true);
        };

        initMolstar();

        return () => {
            const service = context?.getService(instanceId);
            if (service?.viewer?.ctx) {
                service.viewer.ctx.dispose();
            }
            context?.unregisterService(instanceId);
            setIsInitialized(false);

            if (containerRef.current) {
                while (containerRef.current.firstChild) {
                    containerRef.current.removeChild(containerRef.current.firstChild);
                }
            }
        };
    }, [containerRef.current, instanceId, context, dispatch, getState]);

    const service = context?.getService(instanceId);

    return {
        viewer: service?.viewer ?? null,
        controller: service?.controller ?? null,
        isInitialized,
        instanceId: service?.instanceId ?? null
    };
};

// Convenience hook for accessing service instances
export function useMolstarInstance(id: MolstarInstanceId): MolstarService | null {
    const context = useContext(MolstarContext);
    return context?.getService(id) ?? null;
}

// Error hook for checking context availability
export function useMolstarContext(): MolstarContextValue {
    const context = useContext(MolstarContext);
    if (context === null) {
        throw new Error('useMolstarContext must be used within a MolstarProvider');
    }
    return context;
}
