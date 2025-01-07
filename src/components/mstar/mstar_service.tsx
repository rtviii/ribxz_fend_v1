'use client';
import {useCallback, useEffect, useMemo, useState, useContext} from 'react';
import {ribxzMstarv2} from './mstar_v2';
import {MolstarStateController} from './mstar_controller';
import {AppStore, RootState, useAppDispatch} from '@/store/store';
import React from 'react';
import {useStore} from 'react-redux';

// Keep the existing interface
interface MolstarService {
    viewer: ribxzMstarv2;
    controller: MolstarStateController;
}

// Define the context value interface
interface MolstarContextValue {
    services: Map<string, MolstarService>;
    getService: (id: string) => MolstarService | undefined;
    registerService: (id: string, service: MolstarService) => void;
    unregisterService: (id: string) => void;
}

// Create the context
export const MolstarContext = React.createContext<MolstarContextValue | null>(null);

// Provider component
export function MolstarProvider({children}: {children: React.ReactNode}) {
    const [services] = useState(() => new Map<string, MolstarService>());

    const value = useMemo(
        () => ({
            services,
            getService: (id: string) => services.get(id),
            registerService: (id: string, service: MolstarService) => services.set(id, service),
            unregisterService: (id: string) => services.delete(id)
        }),
        [services]
    );

    return <MolstarContext.Provider value={value}>{children}</MolstarContext.Provider>;
}

// Main service hook
export const useMolstarService = (containerRef: React.RefObject<HTMLDivElement>, id: string ) => {

    const context                           = useContext(MolstarContext);
    const [isInitialized, setIsInitialized] = useState(false);
    const dispatch                          = useAppDispatch();
    const store                             = useStore<AppStore>();

    // Get state function for the controller
    const getState = useCallback((): RootState => {
        // @ts-ignore
        return store.getState();
    }, [store]);

    useEffect(() => {
        const initMolstar = async () => {
            if (!containerRef.current || context?.getService(id)) return;

            const viewer = new ribxzMstarv2();
            await viewer.init(containerRef.current);
            const controller = new MolstarStateController(viewer, dispatch, getState);

            const service = {viewer, controller};
            context?.registerService(id, service);
            setIsInitialized(true);
        };

        initMolstar();

        return () => {
            const service = context?.getService(id);
            if (service?.viewer?.ctx) {
                service.viewer.ctx.dispose(); // Make sure Molstar's context is properly disposed
            }
            context?.unregisterService(id);
            setIsInitialized(false);

            // Also clear the container
            if (containerRef.current) {
                while (containerRef.current.firstChild) {
                    containerRef.current.removeChild(containerRef.current.firstChild);
                }
            }
        };
    }, [containerRef.current, id, context, dispatch, getState]);

    const service = context?.getService(id);

    return {
        viewer: service?.viewer ?? null,
        controller: service?.controller ?? null,
        isInitialized
    };
};

// Convenience hook for accessing service instances
export function useMolstarInstance(id: string ): MolstarService | null {
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
