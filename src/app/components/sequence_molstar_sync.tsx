import { useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import type { ResidueData } from '@/app/components/sequence_viewer';
import debounce from 'lodash/debounce';
import { useMolstarInstance } from '@/components/mstar/mstar_service';
// import { molstarServiceInstance } from '@/components/mstar/mstar_service';

export const SequenceMolstarSync: React.FC = () => {
    const selections        = useSelector((state: RootState) => state.sequenceViewer.selections);
    const prevSelectionsRef = useRef<typeof selections>({});
    const service           = useMolstarInstance('main');
    const controller        = service?.controller;
    const ctx               = service?.viewer?.ctx;

    // Create a stable reference to the sync function
    const syncWithMolstar = useCallback((selections: typeof prevSelectionsRef.current) => {
        if (!service?.viewer) return;

        console.time('molstar-sync-batch');
        
        // Process all changes in one batch
        const updates: {
            auth_asym_id: string;
            parent_ref  : string;
            toAdd       : ResidueData[];
            toRemove    : ResidueData[];
        }[] = [];

        // Calculate all changes first
        Object.entries(selections).forEach(([auth_asym_id, selection]) => {
            const prevSelection = prevSelectionsRef.current[auth_asym_id];
            const parent_ref = service.controller.retrievePolymerRef(auth_asym_id);
            if (!parent_ref) return;

            const currentKeys = new Set(Object.keys(selection.selectedMap));
            const prevKeys = prevSelection ? new Set(Object.keys(prevSelection.selectedMap)) : new Set();

            const toAdd: ResidueData[] = [];
            const toRemove: ResidueData[] = [];

            // Find additions
            currentKeys.forEach(key => {
                if (!prevKeys.has(key)) {
                    toAdd.push(selection.selectedMap[key]);
                }
            });

            // Find removals
            if (prevSelection) {
                prevKeys.forEach(key => {
                    if (!currentKeys.has(key)) {
                        toRemove.push(prevSelection.selectedMap[key]);
                    }
                });
            }

            if (toAdd.length > 0 || toRemove.length > 0) {
                updates.push({ auth_asym_id, parent_ref, toAdd, toRemove });
            }
        });

        // Handle completely deselected chains
        Object.keys(prevSelectionsRef.current).forEach(auth_asym_id => {
            if (!selections[auth_asym_id]) {
                const parent_ref = service.controller.retrievePolymerRef(auth_asym_id);
                if (!parent_ref) return;

                const residuesToRemove = Object.values(prevSelectionsRef.current[auth_asym_id].selectedMap);
                updates.push({
                    auth_asym_id,
                    parent_ref,
                    toAdd: [],
                    toRemove: residuesToRemove
                });
            }
        });

        // Apply all updates in one batch
        service.viewer.ctx.dataTransaction(async () => {
            updates.forEach(({ parent_ref: parent_polymer_ref, toAdd, toRemove }) => {
                if (toAdd.length > 0) {
                    service.viewer.interactions.select_residues(parent_polymer_ref, toAdd, 'add');
                }
                if (toRemove.length > 0) {
                    service.viewer.interactions.select_residues(parent_polymer_ref, toRemove, 'remove');
                }
            });
        });

        console.timeEnd('molstar-sync-batch');
        prevSelectionsRef.current = selections;
    }, [service]);

    // Debounced version of the sync function
    const debouncedSync = useCallback(
        debounce((selections) => {
            syncWithMolstar(selections);
        }, 100),
        [syncWithMolstar]
    );

    useEffect(() => {
        if (selections === prevSelectionsRef.current) return;
        debouncedSync(selections);
    }, [selections, debouncedSync]);

    return null;
};

export default SequenceMolstarSync;