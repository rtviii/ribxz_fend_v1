import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { useMolstarInstance } from '@/components/mstar/mstar_service';
import { mapAssetModelComponentsAdd, mapResetInstance, selectComponentById, selectComponentsForRCSB } from '@/store/molstar/slice_refs';
import { useSelector } from 'react-redux';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Focus } from 'lucide-react'
import { Eye } from 'lucide-react'
import { EyeOff } from 'lucide-react'
import { useRoutersRouterStructStructureProfileQuery } from '@/store/ribxz_api/ribxz_api';
import Image from 'next/image';
import { Ellipsis } from 'lucide-react';
import { cn } from '@/components/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ResidueGrid from './residue_grid';
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-12">
      {/* Top spinner with loading text */}
      <div className="flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <span className="text-lg text-muted-foreground">Loading prediction...</span>
      </div>

      {/* Skeleton UI for expected content */}
      <div className="w-full max-w-2xl space-y-4">
        {/* Structure info skeleton */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>

        {/* Binding site skeleton */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <Skeleton className="h-6 w-64" />
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-md" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// Shared button component
const IconButton = ({ icon, onClick, title, active = false }) => (
  <button
    onClick={onClick}
    title={title}
    className={cn(
      'p-1 rounded-full transition-colors',
      active ? 'text-blue-500 hover:text-blue-600' : 'text-gray-400 hover:text-gray-500'
    )}>
    {icon}
  </button>
);

// Download Menu Component
const BsiteDownloadMenu = ({
  onDownloadJSON,
  onDownloadCIF,
  className,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadOptions = [
    {
      extension: 'json',
      label: 'Download',
      onClick: async () => {
        if (isDownloading) return;
        setIsDownloading(true);
        try {
          await onDownloadJSON();
        } finally {
          setIsDownloading(false);
        }
      }
    },
    {
      extension: 'cif',
      label: 'Download',
      onClick: onDownloadCIF
    }
  ];

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            className={cn('rounded-full p-1 text-gray-500', className)}
            onClick={(e) => e.stopPropagation()}>
            <Ellipsis size={14} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="p-0 min-w-[140px] bg-gray-50/95 border border-gray-200">
          <div className="flex flex-col py-1">
            {downloadOptions.map((option) => (
              <button
                key={option.extension}
                disabled={isDownloading}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("runnign download option inside mene");

                  option.onClick();

                  console.log("finished inside menu");
                }}
                className={cn(
                  "px-3 py-1.5 text-sm text-gray-600 text-left hover:bg-slate-100 transition-colors whitespace-nowrap flex items-center justify-between group",
                  isDownloading && "opacity-50 cursor-not-allowed"
                )}>
                <span className="group-hover:text-gray-900">{option.label}</span>
                <code className="ml-2 text-xs font-mono bg-slate-200/80 px-1.5 py-0.5 rounded text-gray-500 group-hover:text-blue-600 group-hover:bg-blue-50">
                  .{option.extension}
                </code>
              </button>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
export const LigandPanel = ({
  chemicalId,
  drugbank_id,
  drugbank_description,
  formula_weight,
  pdbx_description,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  className = '',

  visible,           // Add this prop for visibility state
  onToggleVisibility, // Add this prop for visibility toggle function
}) => {
  return (
    <div
      className={cn('rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden', className)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate font-medium">Ligand {chemicalId}</span>
          {drugbank_id && (
            <a
              href={`https://go.drugbank.com/drugs/${drugbank_id}`}
              className="text-xs text-blue-500 hover:underline hover:text-blue-600 flex-shrink-0"
              target="_blank"
              rel="noopener noreferrer">
              DrugBank: {drugbank_id}
            </a>
          )}
        </div>



        <div className="flex gap-2">
          <IconButton icon={<Focus size={16} />} onClick={onFocus} title="Focus on ligand" />
          <IconButton
            icon={visible ? <Eye size={16} /> : <EyeOff size={16} />}
            onClick={onToggleVisibility}
            title={`${visible ? 'Hide' : 'Show'} structure`}
            active={visible}
          />
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-1/3 w-full max-w-[200px]">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-white border border-gray-100">
              <Image
                src={`https://cdn.rcsb.org/images/ccd/labeled/${chemicalId.toUpperCase()[0]}/${chemicalId.toUpperCase()}.svg`}
                alt={`${chemicalId} chemical structure`}
                fill
                className="object-contain p-2"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            {drugbank_description && (
              <p className="text-sm text-gray-600 line-clamp-3">{drugbank_description}</p>
            )}
            {!drugbank_description && pdbx_description && (
              <p className="text-sm text-gray-600">{pdbx_description}</p>
            )}
            {formula_weight && (
              <div className="flex gap-2 text-sm">
                <span className="text-gray-500">Formula Weight:</span>
                <span>{formula_weight.toFixed(2)} Da</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const BindingSitePanel = ({
  chemicalId,
  residueCount,
  visible,
  onToggleVisibility,
  onFocus,
  onDownloadJSON,
  onDownloadCIF,
  residues,
  nomenclature_map,
  onResidueClick,
  onResidueHover,
  onMouseEnter,
  onMouseLeave,
  className,
}) => {
  const [groupByChain, setGroupByChain] = useState(true);

  return (
    <div
      className={cn('rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden', className)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate font-medium">{chemicalId} Binding Site</span>
          <span className="text-sm text-gray-500">({residueCount} residues)</span>
        </div>
        <div className="flex gap-2">
          <IconButton icon={<Focus size={16} />} onClick={onFocus} title="Focus binding site" />
          <IconButton
            icon={visible ? <Eye size={16} /> : <EyeOff size={16} />}
            onClick={onToggleVisibility}
            title={`${visible ? 'Hide' : 'Show'} binding site`}
            active={visible}
          />
          <BsiteDownloadMenu
            onDownloadJSON={onDownloadJSON}
            onDownloadCIF={onDownloadCIF}
            className={visible ? 'text-blue-500' : ''}
          />
        </div>
      </div>

      <div className="p-4">
        {residues.length > 0 && (
          <ResidueGrid
            residues={residues}
            nomenclature_map={nomenclature_map}
            onResidueClick={onResidueClick}
            onResidueHover={onResidueHover}
            groupByChain={groupByChain}
          />
        )}
      </div>
    </div>
  );
};
// Structure setup hook
const useStructureSetup = (currentLigand, msc, ctx, bsiteRadius, dispatch, data) => {
  const [rootRef, setRootRef] = useState(null);
  const [nomenclatureMap, setNomenclatureMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {

    if (!currentLigand || !data || !msc) return;
    const setupStructure = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await msc.clear(); // Clear Molstar state
        dispatch(mapResetInstance({ instanceId: 'main' }))
        // Create nomenclature map
        const newNomenclatureMap = [...data.proteins, ...data.rnas, ...data.other_polymers].reduce(
          (prev, current) => {
            prev[current.auth_asym_id] = current.nomenclature.length > 0 ? current.nomenclature[0] : '';
            return prev;
          },
          {}
        );
        setNomenclatureMap(newNomenclatureMap);
        const { root_ref } = await msc.loadStructure(currentLigand.parent_structure.rcsb_id, newNomenclatureMap);
        setRootRef(root_ref);

        // Create ligand component
        const ligandComponent = await ctx?.ligands.create_ligand(
          currentLigand.parent_structure.rcsb_id,
          currentLigand.ligand.chemicalId
        );

        // Create binding site
        const refs = await ctx?.ligands.create_ligand_surroundings(
          currentLigand.parent_structure.rcsb_id,
          currentLigand.ligand.chemicalId,
          bsiteRadius,
          newNomenclatureMap
        );

        if (refs) {
          const bsiteId = `${currentLigand.ligand.chemicalId}_bsite`;
          const bsiteRef = refs[bsiteId];

          if (bsiteRef && bsiteRef.ref && bsiteRef.repr_ref && bsiteRef.sel_ref) {
            dispatch(
              mapAssetModelComponentsAdd({
                instanceId: 'main',
                rcsbId: currentLigand.parent_structure.rcsb_id,
                components: {
                  [currentLigand.ligand.chemicalId]: ligandComponent,
                  [bsiteId]: {
                    type: 'bsite',
                    rcsb_id: currentLigand.parent_structure.rcsb_id,
                    chemicalId: currentLigand.ligand.chemicalId,
                    ref: bsiteRef.ref,
                    repr_ref: bsiteRef.repr_ref,
                    sel_ref: bsiteRef.sel_ref
                  }
                }
              })
            );
          }
        }
      } catch (err) {
        setError(err);
        setRootRef(null);
        setNomenclatureMap({});
      } finally {
        setIsLoading(false);
      }
    };

    setupStructure();
    return () => {
      setRootRef(null);
      setNomenclatureMap({});
      setError(null);
    };
  }, [currentLigand, data, msc, ctx, bsiteRadius, dispatch]);

  return { rootRef, nomenclatureMap, isLoading, error };
};
;
// Reusable hooks from your existing code
const useSurroundingResidues = (currentLigand, msc, rootRef, bsiteRadius) => {
  const [surroundingResidues, setSurroundingResidues] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentLigand || !msc || !rootRef) return;

    const fetchSurroundingResidues = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const residues = await msc.ligands.get_ligand_surroundings(
          rootRef,
          currentLigand.ligand.chemicalId,
          bsiteRadius
        );
        if (residues) {
          setSurroundingResidues(residues);
        }
      } catch (err) {
        setError(err);
        setSurroundingResidues([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurroundingResidues();
  }, [currentLigand, msc, rootRef, bsiteRadius]);

  return { surroundingResidues, isLoading, error };
};

export default function CurrentBindingSiteInfoPanel() {
  const dispatch = useAppDispatch();
  const current_ligand = useAppSelector(state => state.ligands_page.current_ligand);
  const bsite_radius = useAppSelector(state => state.ligands_page.radius);

  const refs_state = useAppSelector(state => state.mstar_refs)
  // MolStar service and component references
  const mainMolstarService = useMolstarInstance('main');
  const ctx = mainMolstarService?.viewer;
  const msc = mainMolstarService?.controller;

  const ligand_component = useAppSelector(state =>
    selectComponentById(state, {
      instanceId: 'main',
      rcsbId: current_ligand?.parent_structure.rcsb_id,
      componentId: current_ligand?.ligand.chemicalId
    })
  );

  // Structure profile query
  const { data: structureData, isLoading: isLoadingProfile } = useRoutersRouterStructStructureProfileQuery(
    { rcsbId: current_ligand?.parent_structure.rcsb_id },
    { skip: !current_ligand }
  );

  // ADD: Structure setup with loading state
  const {
    rootRef,
    nomenclatureMap,
    isLoading: isLoadingSetup,
    error: setupError
  } = useStructureSetup(current_ligand, msc, ctx, bsite_radius, dispatch, structureData);

  // State for visibility toggles
  const [bsiteVisibility, setBsiteVisibility] = useState(true);

  // Get surrounding residues - NOW USING rootRef from structure setup
  const { surroundingResidues, isLoading: isLoadingResidues } = useSurroundingResidues(
    current_ligand,
    msc,
    rootRef,
    bsite_radius
  );

  // Add state for structure visibility
  const [structureVisibility, setStructureVisibility] = useState(true);

  // Initialize visibility when structure changes
  useEffect(() => {
    setStructureVisibility(true);
  }, [rootRef]);

  const safeToggleStructureVisibility = async () => {
    if (!msc || !ctx || !current_ligand?.parent_structure?.rcsb_id || !rootRef) {
      console.warn("Cannot toggle structure visibility: Missing required references");
      return;
    }

    try {
      const rcsbId = current_ligand.parent_structure.rcsb_id;
      const setVisible = !structureVisibility;

      const success = await msc.polymers.togglePolymersVisibility(rcsbId, setVisible);
      if (success) {
        setStructureVisibility(setVisible);
      }
      return;

      // Fallback: Find polymer components manually and toggle visibility
      // This uses the correct state structure from your Redux store
      const polymerComponents = selectComponentsForRCSB(
        refs_state,
        {
          instanceId: 'main',
          rcsbId: rcsbId,
          componentType: 'polymer'
        }
      );

      if (polymerComponents.length === 0) {
        console.warn(`No polymer components found for structure ${rcsbId}`);
        return;
      }

      // Apply visibility change to all polymer components
      await ctx.ctx.dataTransaction(async () => {
        for (const comp of polymerComponents) {
          if (comp.ref) {
            ctx.interactions.setSubtreeVisibility(comp.ref, setVisible);
          }
        }
      });

      // Update state
      setStructureVisibility(setVisible);

    } catch (error) {
      console.error("Error toggling structure visibility:", error);
    }
  };;

  // State for visibility toggles
  const [isToggling, setIsToggling] = useState(false); // Add this to prevent rapid toggling

  // Reset visibility states when structure changes
  useEffect(() => {
    if (rootRef) {
      setStructureVisibility(true);
      setBsiteVisibility(true);
    }
  }, [rootRef, current_ligand?.parent_structure?.rcsb_id]);

  if (!current_ligand) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Selection</AlertTitle>
        <AlertDescription>
          Please select a ligand-structure pair to view binding site information.
        </AlertDescription>
      </Alert>
    );
  }

  if (setupError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to set up structure visualization: {setupError.message}
        </AlertDescription>
      </Alert>
    );
  }

  // Loading states
  // Loading states
  if (isLoadingProfile || isLoadingSetup || isLoadingResidues) {
    return <LoadingState />;
  }

  const handleDownloadJSON = async () => {
    try {
      const bindingSiteData = {
        purported_binding_site: {
          chains: surroundingResidues.reduce((acc, residue) => {
            const chainIndex = acc.findIndex(c => c.chain_id === residue.auth_asym_id);
            if (chainIndex === -1) {
              acc.push({
                chain_id: residue.auth_asym_id,
                bound_residues: [residue]
              });
            } else {
              acc[chainIndex].bound_residues.push(residue);
            }
            return acc;
          }, [])
        },
        metadata: {
          rcsb_id: current_ligand.parent_structure.rcsb_id,
          chemical_id: current_ligand.ligand.chemicalId,
          radius: bsite_radius
        }
      };

      const blob = new Blob([JSON.stringify(bindingSiteData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${current_ligand.parent_structure.rcsb_id}_${current_ligand.ligand.chemicalId}_predicted_bsite.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDownloadCIF = async (bsiteRef: string) => {
    if (!ctx) {
      return
    };
    const loci = ctx.loci_from_ref(bsiteRef);
    if (!loci) {
      return;
    }

    ctx.ctx.managers.structure.selection.clear();
    ctx.ctx.managers.structure.selection.fromLoci('add', loci);
    await ctx.downloads.downloadSelection(
      `${current_ligand.parent_structure.rcsb_id}_${current_ligand.ligand.chemicalId}_predicted_bsite.cif`
    );
    ctx.ctx.managers.structure.selection.clear();
  };
  const handleLigandHover = (isEntering: boolean) => {
    if (!ctx) return;
    if (isEntering) {
      let loci = ctx.loci_from_ref(ligand_component.sel_ref);
      ctx.ctx.managers.interactivity.lociHighlights.highlight({ loci });
    } else {
      ctx.ctx.managers.interactivity.lociHighlights.clearHighlights()
    }
  };

  const handleBSiteHover = (isEntering: boolean) => {
    if (!ctx || !msc) return;

    const bsite = msc.bindingSites.retrieveBSiteComponent(
      current_ligand.parent_structure.rcsb_id,
      current_ligand.ligand.chemicalId
    );

    if (!bsite?.sel_ref) return;
    if (isEntering) {
      let loci = ctx.loci_from_ref(bsite.sel_ref);
      ctx.ctx.managers.interactivity.lociHighlights.highlight({ loci })
    } else {
      ctx.ctx.managers.interactivity.lociHighlights.clearHighlights()
    }
  };


  return (
    <div className="space-y-4">
      <LigandPanel

        onMouseEnter={() => handleLigandHover(true)}
        onMouseLeave={() => handleLigandHover(false)}
        chemicalId={current_ligand.ligand.chemicalId}
        drugbank_id={current_ligand.ligand.drugbank_id}
        drugbank_description={current_ligand.ligand.drugbank_description}
        formula_weight={current_ligand.ligand.formula_weight}
        pdbx_description={current_ligand.ligand.pdbx_description}
        onFocus={() => {
          ctx?.interactions.focus(ligand_component?.sel_ref);
        }}


        visible={structureVisibility}
        onToggleVisibility={safeToggleStructureVisibility}
      />

      <BindingSitePanel

        onMouseEnter={() => handleBSiteHover(true)}
        onMouseLeave={() => handleBSiteHover(false)}
        chemicalId={current_ligand.ligand.chemicalId}
        residueCount={surroundingResidues.length}
        visible={bsiteVisibility}

        onDownloadJSON={handleDownloadJSON}
        onDownloadCIF={() => {
          console.log("Running download cif");

          const bsite = msc?.bindingSites.retrieveBSiteComponent(
            current_ligand.parent_structure.rcsb_id,
            current_ligand.ligand.chemicalId
          );
          console.log("Retrieved bsite", bsite);

          handleDownloadCIF(bsite?.sel_ref)
          console.log("ran handle download cif");

        }
        }

        onToggleVisibility={async () => {
          const toggleVisibility = async () => {
            const bsite = msc?.bindingSites.retrieveBSiteComponent(
              current_ligand.parent_structure.rcsb_id,
              current_ligand.ligand.chemicalId
            );

            if (bsite && ctx) {
              await ctx.ctx.dataTransaction(async () => {
                ctx.interactions.setSubtreeVisibility(bsite.ref, !bsiteVisibility);
              });
            }
          };
          toggleVisibility().then(() => {
            setBsiteVisibility(!bsiteVisibility);
          });
        }}
        onFocus={() => {
          msc?.bindingSites.focusBindingSite(
            current_ligand.parent_structure.rcsb_id,
            current_ligand.ligand.chemicalId
          );
        }}
        residues={surroundingResidues}
        nomenclature_map={nomenclatureMap}
        onResidueClick={residue => {
          ctx?.residues.selectResidue(
            residue.rcsb_id,
            residue.auth_asym_id,
            residue.auth_seq_id,
            true
          );
        }}
        onResidueHover={residue => {
          ctx?.residues.highlightResidue(
            residue.rcsb_id,
            residue.auth_asym_id,
            residue.auth_seq_id
          );
        }}
      />
    </div>
  );
}
