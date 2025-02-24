import React from 'react';
import { Card } from '@/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { QuestionMarkCircledIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import { GlobalStructureSelection } from '@/components/ribxz/ribxz_structure_selection';
import LigandSelection from './ligand_selection';
import { useAppSelector } from '@/store/store';
import { cn } from '@/components/utils'

interface ControlPanelProps {
    isPredictionEnabled: boolean;
    onPredictionToggle: (enabled: boolean) => void;
    onTargetStructureChange: (rcsb_id: string) => void;
}

const BindingSiteControlPanel: React.FC<ControlPanelProps> = ({
    isPredictionEnabled,
    onPredictionToggle,
    onTargetStructureChange,
}) => {
    const current_ligand = useAppSelector(state => state.ligands_page.current_ligand);

    return (
        <div className="space-y-2">
            <Card className="p-3 bg-background">
                {/* Source Selection */}
                <div>
                    <div className="flex items-center mb-1">
                        <span className="text-sm font-medium mr-2 min-w-[120px]">Binding Site Source:</span>
                        <HoverCard>
                            <HoverCardTrigger>
                                <QuestionMarkCircledIcon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                            </HoverCardTrigger>
                            <HoverCardContent align="start" className="w-80">
                                <div className="space-y-2">
                                    <p className="text-sm">Select a source ligand-structure pair to analyze binding sites.</p>
                                </div>
                            </HoverCardContent>
                        </HoverCard>
                    </div>
                    <LigandSelection />
                </div>

                {/* Compact Expansion Control */}
                <div 
                    className={cn(
                        "mt-2 pt-2 border-t flex items-center justify-center cursor-pointer group h-6",
                        !current_ligand && "opacity-50 pointer-events-none"
                    )}
                    onClick={() => current_ligand && onPredictionToggle(!isPredictionEnabled)}
                >
                    <div className="flex items-center gap-2">
                        {!isPredictionEnabled && (
                            <span className="text-xs text-muted-foreground group-hover:text-foreground">
                                Predict Similar Sites
                            </span>
                        )}
                        <div className={cn(
                            "flex items-center justify-center w-5 h-5 rounded-full bg-muted/50 group-hover:bg-muted transition-all",
                            isPredictionEnabled && "rotate-180"
                        )}>
                            <ChevronDownIcon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        </div>
                    </div>
                </div>

                {/* Prediction Section */}
                {isPredictionEnabled && (
                    <div className="mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center mb-1">
                            <span className="text-sm font-medium mr-2 min-w-[120px]">Prediction Target:</span>
                            <HoverCard>
                                <HoverCardTrigger>
                                    <QuestionMarkCircledIcon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                                </HoverCardTrigger>
                                <HoverCardContent align="start" className="w-80">
                                    <div className="space-y-2">
                                        <p className="text-sm">
                                            Choose a target structure to predict potential binding sites.
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            The algorithm will attempt to predict the source binding site pattern
                                             in the target structure.
                                        </p>
                                    </div>
                                </HoverCardContent>
                            </HoverCard>
                            {current_ligand && (
                                <span className="ml-auto text-xs text-muted-foreground italic">
                                    Using {current_ligand.parent_structure.rcsb_id}/{current_ligand.ligand.chemicalId}
                                </span>
                            )}
                        </div>
                        
                        <GlobalStructureSelection
                            // @ts-ignore
                            onChange={onTargetStructureChange}
                            disabled={!current_ligand}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
};

export default BindingSiteControlPanel;
