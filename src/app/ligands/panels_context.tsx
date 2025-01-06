// Create a new file: PanelContext.tsx
import React, { createContext, useContext, useState } from 'react';

type PanelContextType = {
  isPredictionPanelOpen: boolean;
  togglePredictionPanel: () => void;
};

const PanelContext = createContext<PanelContextType | undefined>(undefined);

export function PanelProvider({ children }: { children: React.ReactNode }) {
  const [isPredictionPanelOpen, setIsPredictionPanelOpen] = useState(false);

  const togglePredictionPanel = () => {
    setIsPredictionPanelOpen(prev => !prev);
  };

  return (
    <PanelContext.Provider value={{ isPredictionPanelOpen, togglePredictionPanel }}>
      {children}
    </PanelContext.Provider>
  );
}

export function usePanelContext() {
  const context = useContext(PanelContext);
  if (!context) {
    throw new Error('usePanelContext must be used within a PanelProvider');
  }
  return context;
}