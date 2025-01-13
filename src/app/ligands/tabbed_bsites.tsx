import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CurrentBindingSiteInfoPanel from './source_bsite';
import BindingSitePredictionPanel from './target_bsite';
import { useAppSelector } from '@/store/store';
import { ScrollArea } from '@/components/ui/scroll-area';
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
        <Tabs 
            value={activeTab}
            onValueChange={setActiveTab}
            className="relative h-[calc(100vh-200px)]"
        >
            {/* Top-aligned tabs */}
            <div className="absolute top-0 left-0 right-0 flex justify-start z-10">
                <TabsList className="flex flex-row space-x-1 bg-transparent p-0">
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
                            "transition-all duration-200"
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
                                "transition-all duration-200"
                            )}
                        >
                            Prediction
                            {current_ligand && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                    {current_ligand.ligand.chemicalId}
                                </span>
                            )}
                        </TabsTrigger>
                    )}
                </TabsList>
            </div>

            {/* Content area with top padding for tabs */}
            <ScrollArea className="h-full pt-12">
                <div className="bg-background rounded-md border min-h-full">
                    {/* Both panels always rendered, visibility controlled by CSS */}
                    <div className={cn(
                        'transition-opacity duration-200',
                        activeTab === 'prediction' ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
                    )}>
                        <BindingSitePredictionPanel />
                    </div>
                    <div className={cn(
                        'transition-opacity duration-200',
                        activeTab === 'source' ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
                    )}>
                        <CurrentBindingSiteInfoPanel />
                    </div>
                </div>
            </ScrollArea>
        </Tabs>
    );
};

export default TabbedBindingSite;