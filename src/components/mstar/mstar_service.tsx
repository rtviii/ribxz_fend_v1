import {useCallback, useEffect, useRef, useState} from 'react';
import {ribxzMstarv2} from './mstar_v2';
import {MolstarStateController} from './mstar_controller';
import {AppStore, RootState, useAppDispatch, useAppSelector} from '@/store/store';
import React from 'react';
import {useStore} from 'react-redux';

interface MolstarService {
    viewer: ribxzMstarv2;
    controller: MolstarStateController;
}

// Create a singleton instance outside of the hook
export let molstarServiceInstance: MolstarService | null = null;
export const useMolstarService = (containerRef: React.RefObject<HTMLDivElement>) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const dispatch = useAppDispatch();
    const store = useStore<AppStore>();

    // Explicitly type the getState function
    const getState = useCallback((): RootState => {
        // @ts-ignore
        return store.getState();
    }, [store]);

    useEffect(() => {
        const initMolstar = async () => {
            if (!containerRef.current || molstarServiceInstance) return;

            const viewer = new ribxzMstarv2();
            await viewer.init(containerRef.current);
            const controller = new MolstarStateController(viewer, dispatch, getState);

            molstarServiceInstance = {viewer, controller};
            setIsInitialized(true);
        };

        initMolstar();

        return () => {
            // Cleanup if needed
            if (molstarServiceInstance) {
                // Add any necessary cleanup
                molstarServiceInstance = null;
            }
        };
    }, [containerRef.current]);

    return {
        viewer: molstarServiceInstance?.viewer ?? null,
        controller: molstarServiceInstance?.controller ?? null,
        isInitialized
    };
};

// Optional: Create a context for components that need direct access
export const MolstarServiceContext = React.createContext<MolstarService | null>(null);
