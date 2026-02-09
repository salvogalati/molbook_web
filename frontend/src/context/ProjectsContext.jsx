import React, { createContext, useCallback, useState } from "react";
import { useProjects } from "../hooks/useAPI.js";

/**
 * ProjectsContext - Gestisce lo state dei progetti a livello globale
 * Elimina il bisogno di passare progetti attraverso props (props drilling)
 */
export const ProjectsContext = createContext();

export function useProjectsContext() {
  const context = React.useContext(ProjectsContext);
  if (!context) {
    throw new Error("useProjectsContext deve essere usato dentro ProjectsProvider");
  }
  return context;
}

/**
 * ProjectsProvider - Provider component da wrappare intorno all'app
 */
export function ProjectsProvider({ children }) {
  const projectsHook = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const selectProject = useCallback((projectId) => {
    setSelectedProjectId(projectId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedProjectId(null);
  }, []);

  const selectedProject = projectsHook.projects?.find(
    (p) => p.id === selectedProjectId
  );

  const value = {
    ...projectsHook,
    selectedProjectId,
    selectedProject,
    selectProject,
    clearSelection,
    isCreating,
    setIsCreating,
    isEditing,
    setIsEditing,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}
