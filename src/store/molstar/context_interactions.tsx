import React, { createContext, useContext, useState, useCallback } from 'react';

interface StructureElement {
  auth_asym_id?: string;
  auth_seq_id ?: number;
  comp_id     ?: string;
  entity_id   ?: string;
}

interface InteractionState {
  hover   : StructureElement | null;
  selected: StructureElement | null;
}

interface InteractionContextType {
  state         : InteractionState;
  setHovered    : (element: StructureElement | null) => void;
  setSelected   : (element: StructureElement | null) => void;
  clearHover    : () => void;
  clearSelection: () => void;
}

const InteractionContext = createContext<InteractionContextType>(null!);

export const InteractionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<InteractionState>({
    hover: null,
    selected: null
  });

  const setHovered = useCallback((element: StructureElement | null) => {
    setState(prev => ({ ...prev, hover: element }));
  }, []);

  const setSelected = useCallback((element: StructureElement | null) => {
    setState(prev => ({ ...prev, selected: element }));
  }, []);

  const clearHover = useCallback(() => {
    setState(prev => ({ ...prev, hover: null }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selected: null }));
  }, []);

  return (
    <InteractionContext.Provider 
      value={{ 
        state, 
        setHovered, 
        setSelected,
        clearHover,
        clearSelection
      }}
    >
      {children}
    </InteractionContext.Provider>
  );
};

// Custom hooks for consuming components
export const useStructureInteraction = () => {
  const context = useContext(InteractionContext);
  if (!context) {
    throw new Error('useStructureInteraction must be used within an InteractionProvider');
  }
  return context;
};

export const useStructureHover = (auth_asym_id?: string, auth_seq_id?: number) => {
  const { state } = useStructureInteraction();
  
  return {
    isChainHovered  : auth_asym_id ? state.hover?.auth_asym_id === auth_asym_id: false,
    isResidueHovered: auth_seq_id ? state.hover?.auth_seq_id === auth_seq_id   : false,
    hoveredElement  : state.hover
  };
};

export const useStructureSelection = (auth_asym_id?: string, auth_seq_id?: number) => {
  const { state } = useStructureInteraction();
  
  return {
    isChainSelected: auth_asym_id ? state.selected?.auth_asym_id === auth_asym_id : false,
    isResidueSelected: auth_seq_id ? state.selected?.auth_seq_id === auth_seq_id : false,
    selectedElement: state.selected
  };
};