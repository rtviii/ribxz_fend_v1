import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EntityCard } from './entity_base';
import { StructureEntity } from './entity_structure';
import { LigandEntity } from './entity_ligand';
import { BindingSiteEntity } from './entity_bsite';

export const withEntityState = (WrappedComponent:any) => {
  return ({ 
    isLoading, 
    error,
    icon,
    loadingTitle = 'Loading...',
    errorTitle = 'Error',
    ...props 
  }) => {
    if (isLoading) {
      return (
        <EntityCard
          icon={icon}
          title={loadingTitle}
        >
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* If it's a LigandEntity, show the image skeleton */}
              {props.chemicalId && (
                <div className="lg:w-1/3 w-full max-w-[200px]">
                  <div className="aspect-square relative rounded-lg bg-gray-100 animate-pulse" />
                </div>
              )}
              <div className="lg:flex-1 w-full space-y-3">
                <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
                    <div className="h-4 bg-gray-100 rounded w-32 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </EntityCard>
      );
    }

    if (error) {
      return (
        <EntityCard
          icon={icon}
          title={errorTitle}
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error?.message || 'Failed to load data. Please try again.'}
            </AlertDescription>
          </Alert>
        </EntityCard>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

withEntityState.displayName = 'withEntityState';

// Enhanced versions of your entities
export const EnhancedStructureEntity = withEntityState(StructureEntity);
export const EnhancedLigandEntity = withEntityState(LigandEntity);
export const EnhancedBindingSiteEntity = withEntityState(BindingSiteEntity);