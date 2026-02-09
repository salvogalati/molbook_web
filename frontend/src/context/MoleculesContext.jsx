import React, { createContext, useCallback, useState, useEffect } from "react";
import { useMolecules } from "../hooks/useAPI.js";

/**
 * MoleculesContext - Gestisce lo state delle molecole per un progetto
 * Si sincronizza automaticamente con il projectId selezionato
 */
export const MoleculesContext = createContext();

export function useMoleculesContext() {
  const context = React.useContext(MoleculesContext);
  if (!context) {
    throw new Error("useMoleculesContext deve essere usato dentro MoleculesProvider");
  }
  return context;
}

/**
 * MoleculesProvider - Provider component
 */
export function MoleculesProvider({ children, projectId }) {
  const moleculesHook = useMolecules(projectId);
  const [selectedMoleculeId, setSelectedMoleculeId] = useState(null);
  const [filters, setFilters] = useState({});
  const [visibleColumns, setVisibleColumns] = useState([]);

  // Carica molecole quando projectId cambia
  useEffect(() => {
    if (projectId) {
      moleculesHook.fetchMolecules();
    }
  }, [projectId]);

  const selectMolecule = useCallback((moleculeId) => {
    setSelectedMoleculeId(moleculeId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedMoleculeId(null);
  }, []);

  const selectedMolecule = moleculesHook.molecules?.find(
    (m) => m.id === selectedMoleculeId
  );

  const value = {
    ...moleculesHook,
    selectedMoleculeId,
    selectedMolecule,
    selectMolecule,
    clearSelection,
    filters,
    setFilters,
    visibleColumns,
    setVisibleColumns,
  };

  return (
    <MoleculesContext.Provider value={value}>
      {children}
    </MoleculesContext.Provider>
  );
}
