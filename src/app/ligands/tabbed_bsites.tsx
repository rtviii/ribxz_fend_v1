import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CurrentBindingSiteInfoPanel from './source_bsite';
import BindingSitePredictionPanel from './target_bsite';
import { useAppSelector } from '@/store/store';
import { cn } from '@/components/utils';

interface TabbedBindingSiteProps {
    isPredictionEnabled: boolean;
}

const TabbedBindingSite: React.FC<TabbedBindingSiteProps> = ({
    isPredictionEnabled,
}) => {
    const current_ligand = useAppSelector(state => state.ligands_page.current_ligand);
    const [activeTab, setActiveTab] = React.useState<string>("source");
    
    return (
        <div className="h-[calc(100vh-200px)] flex flex-col">
            <Tabs 
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex flex-col flex-grow"
            >
                <div className="px-4"> {/* Container for tabs only */}
                    <TabsList className="flex-shrink-0 flex flex-row space-x-1 bg-transparent p-0 -ml-4"> {/* Negative margin to align with edge */}
                        <TabsTrigger 
                            value="source"
                            className={cn(
                                "justify-start px-4 py-2 rounded-t-md rounded-b-none",
                                "border border-b-0",
                                "data-[state=active]:bg-background",
                                "data-[state=active]:border-border",
                                "data-[state=active]:border-b-background",
                                "data-[state=inactive]:bg-muted",
                                "data-[state=inactive]:border-transparent",
                                "transition-all duration-200",
                                "min-w-0 truncate"
                            )}
                        >
                            Source Site
                        </TabsTrigger>
                        {isPredictionEnabled && (
                            <TabsTrigger 
                                value="prediction"
                                className={cn(
                                    "justify-start px-4 py-2 rounded-t-md rounded-b-none",
                                    "border border-b-0",
                                    "data-[state=active]:bg-background",
                                    "data-[state=active]:border-border",
                                    "data-[state=active]:border-b-background",
                                    "data-[state=inactive]:bg-muted",
                                    "data-[state=inactive]:border-transparent",
                                    "transition-all duration-200",
                                    "min-w-0 truncate"
                                )}
                            >
                                Prediction
                                {current_ligand && (
                                    <span className="ml-2 text-xs text-muted-foreground truncate">
                                        {current_ligand.ligand.chemicalId}
                                    </span>
                                )}
                            </TabsTrigger>
                        )}
                    </TabsList>
                </div>

                <div className="flex-grow min-h-0 bg-background rounded-md border mt-0">
                    <div className="w-full h-full relative overflow-hidden">
                        <div 
                            className={cn(
                                "flex transition-transform duration-200 w-[200%] h-full",
                                activeTab === 'prediction' ? '-translate-x-1/2' : 'translate-x-0'
                            )}
                        >
                            <div className="w-1/2 h-full flex-shrink-0">
                                <CurrentBindingSiteInfoPanel />
                            </div>
                            <div className="w-1/2 h-full flex-shrink-0">
                                <BindingSitePredictionPanel />
                            </div>
                        </div>
                    </div>
                </div>
            </Tabs>
        </div>
    );
};

export default TabbedBindingSite;