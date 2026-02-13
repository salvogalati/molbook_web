import React, { useRef, useState, useEffect, useCallback } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { SplitButton } from "primereact/splitbutton";
import useIsMobile from "../hooks/useIsMobile";
import { Dialog } from "primereact/dialog";
import { TabView, TabPanel } from "primereact/tabview";
import ProjectsManager from "./ProjectManager";
import { Image } from "primereact/image";
import Project from "../components/Project";
import { Toast } from "primereact/toast";
import { useLocation } from "react-router-dom";
import { API_URL } from "../services/api";
import { fetchUIState, saveUIState, listProjectNames } from "./api/Molecules";
import "./styles/Molecules.css";

export default function ProjectsDashboard() {
  // Get the project to open (if any) from router state
  const location = useLocation();
  const projectToOpen = location.state || {};

  // State for tab handling and UI management
  const [tabsReady, setTabsReady] = useState(false);
  const [tabs, setTabs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleProjectDialog, setVisibleProjectDialog] = useState(false);
  const [editingTabId, setEditingTabId] = useState(null);
  const isMobile = useIsMobile();
  const [originalTitle, setOriginalTitle] = useState("");
  const toastErr = useRef(null);
  const [projectSelections, setProjectSelections] = useState({});

  // Menu options for the SplitButton
  const items = [
    {
      label: "Add",
      icon: "pi pi-refresh",
      command: () => handleCreateNewProject(),
    },
    {
      label: "Load",
      icon: "pi pi-folder-open",
      command: () => setVisibleProjectDialog(true),
    },
  ];

  // Authorization headers for API calls
  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  });

  // Generic toast message helper
  const showMessage = useCallback(
    ({ severity = "info", toastRef, summary, detail, life = 3000 }) => {
      toastRef.current?.show({ severity, summary, detail, life });
    },
    []
  );

  // Ensures unique project names (compared to local + backend)
  const getUniqueTitle = async (
    desiredTitle,
    existingTitles,
    fallbackBase = "New Project"
  ) => {
    const base = (desiredTitle && desiredTitle.trim()) || fallbackBase;
    try {
      const backendNames = await listProjectNames();
      for (const name of backendNames) existingTitles.add(name);
    } catch (err) {
      console.warn("⚠️ Failed to load backend names:", err);
    }
    if (!existingTitles.has(base)) return base;
    let i = 2;
    while (existingTitles.has(`${base} ${i}`)) i += 1;
    return `${base} ${i}`;
  };

  // Create a new project via backend and open a new tab
  const handleCreateNewProject = async (projectName) => {
    const existingTitles = new Set(tabs.map((t) => t.title));
    const localUniqueTitle = await getUniqueTitle(projectName, existingTitles);
    try {
      const res = await fetch(`${API_URL}/api/projects/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name: projectName ?? localUniqueTitle }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        /* empty */
      }

      if (!res.ok) {
        showMessage({
          severity: "error",
          toastRef: toastErr,
          summary: "Project not created",
          detail:
            data?.detail || data?.error || "Error during project creation",
        });
        return;
      }

      const finalTitle = data?.name || localUniqueTitle;
      const backendId = data?.id ?? null;
      addNewTab(finalTitle, backendId);
    } catch (err) {
      console.error("Creation error:", err);
    }
  };

  // Adds a new project tab (or focuses an existing one)
  const addNewTab = useCallback(
    (name, backendId = null) => {
      setTabs((prev) => {
        // Check if project already open
        if (backendId !== null && backendId !== undefined) {
          const existingIndex = prev.findIndex(
            (t) => t.backendId === backendId
          );
          if (existingIndex !== -1) {
            setActiveIndex(existingIndex);
            setVisibleProjectDialog(false);
            showMessage({
              severity: "info",
              toastRef: toastErr,
              summary: "Project already open",
              life: 1500,
            });
            return prev;
          }
        }

        // Create new tab entry
        const newId = (prev.at(-1)?.id ?? 0) + 1;
        const next = [
          ...prev,
          { id: newId, title: name ?? `New Project ${newId}`, backendId },
        ];
        setActiveIndex(next.length - 1);
        setVisibleProjectDialog(false);
        return next;
      });
    },
    [setTabs, showMessage, toastErr]
  );

  // Close a tab and adjust active index
  const closeTab = (index) => {
    setTabs((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setActiveIndex((ai) => {
        if (next.length === 0) return 0;
        if (ai > index) return ai - 1;
        if (ai === index) return Math.max(0, ai - 1);
        return ai;
      });
      return next;
    });
  };

  // Update title while editing
  const handleTitleChange = (id, newTitle) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === id ? { ...tab, title: newTitle } : tab))
    );
  };

  // Commit rename to backend (PATCH)
  const commitRename = async (tab) => {
    const newTitle = (tabs.find((t) => t.id === tab.id)?.title || "").trim();
    if (!newTitle || newTitle === originalTitle) {
      // Restore old name if empty or unchanged
      setEditingTabId(null);
      setOriginalTitle("");
      if (!newTitle) {
        setTabs((prev) =>
          prev.map((t) =>
            t.id === tab.id ? { ...t, title: originalTitle } : t
          )
        );
      }
      return;
    }

    // Skip backend if it's a local-only tab
    if (!tab.backendId) {
      setEditingTabId(null);
      setOriginalTitle("");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/projects/${tab.backendId}/`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ name: newTitle }),
      });

      // Restore title if rename fails
      if (!res.ok) {
        setTabs((prev) =>
          prev.map((t) =>
            t.id === tab.id ? { ...t, title: originalTitle } : t
          )
        );
        const data = await res.json().catch(() => null);
        showMessage({
          severity: "error",
          toastRef: toastErr,
          summary: "Project not renamed",
          detail:
            data?.detail || data?.error || "Error during renaming project",
        });
      }
    } catch (e) {
      // Network failure → revert
      setTabs((prev) =>
        prev.map((t) => (t.id === tab.id ? { ...t, title: originalTitle } : t))
      );
      console.error("Network error on rename:", e);
    } finally {
      setEditingTabId(null);
      setOriginalTitle("");
    }
  };

  // Cancel rename on Escape
  const cancelRename = (tab) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tab.id ? { ...t, title: originalTitle } : t))
    );
    setEditingTabId(null);
    setOriginalTitle("");
  };

  // Close tab by id or backend id
  const closeTabById = (idOrBackendId) => {
    setTabs((prev) => {
      const idx = prev.findIndex(
        (t) => t.id === idOrBackendId || t.backendId === idOrBackendId
      );
      if (idx === -1) return prev;
      const next = prev.filter((_, i) => i !== idx);
      setActiveIndex((ai) => (ai > idx ? ai - 1 : Math.max(0, ai - 1)));
      return next;
    });
  };

  const handleSelectionChange = useCallback((projectId, sel) => {
    //console.log("handleSelectionChange", projectSelections, projectId, sel)
  setProjectSelections((prev) => ({
    ...prev,
    [projectId]: sel,
  }));
}, []);

  // Load UI state (tabs, active index) from backend when component mounts
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        const ui = await fetchUIState({ API_URL, token });
        const { tabs: savedTabs = [], activeIndex: savedIndex = 0 } =
          ui?.state || {};

        // Clean and reassign tab IDs
        const withIds = (savedTabs || []).map((t, i) => ({
          id: i + 1,
          title: t.title ?? "Untitled",
          backendId: t.backendId ?? null,
        }));

        setTabs((prev) => {
          const merged = [...prev];
          withIds.forEach((t) => {
            if (!merged.some((m) => m.backendId === t.backendId))
              merged.push(t);
          });
          return merged;
        });
        setActiveIndex(Math.min(savedIndex, Math.max(0, withIds.length - 1)));
        setTabsReady(true);
      } catch {
        // Ignore if no state is found
      }
    })();
  }, []);

  const saveDebounceRef = useRef(null);

  // Debounced UI state save (on tabs or activeIndex change)
  useEffect(() => {
    const snapshot = {
      version: 1,
      tabs: tabs.map((t) => ({
        backendId: t.backendId ?? null,
        title: t.title,
      })),
      activeIndex,
    };
    const token = localStorage.getItem("access_token");

    if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    saveDebounceRef.current = setTimeout(() => {
      saveUIState({ API_URL, token, state: snapshot }).catch((e) =>
        console.warn("UI state save failed:", e.message)
      );
    }, 400);

    return () => clearTimeout(saveDebounceRef.current);
  }, [tabs, activeIndex]);

  // Automatically open project passed via router (only once)
  const projectOpened = useRef(false);
  useEffect(() => {
    if (!tabsReady) return;
    if (!projectToOpen?.id || !projectToOpen?.name) return;
    if (projectOpened.current) return;

    const alreadyOpen = tabs.some(
      (t) => t.backendId === parseInt(projectToOpen.id)
    );
    if (!alreadyOpen) addNewTab(projectToOpen.name, parseInt(projectToOpen.id));
    projectOpened.current = true;
  }, [addNewTab, projectToOpen.id, projectToOpen.name, tabs, tabsReady]);

  // --- Render UI ---
  return (
    <div className="molecules-card">
      {/* Tabs area */}
      {tabs.length > 0 && (
        <div className="tabbar-extended" style={{flex: 1, flexDirection: "column", minHeight: "0"}}>
          <TabView
            activeIndex={activeIndex}
            scrollable
            onTabChange={(e) => setActiveIndex(e.index)}
            onTabClose={(e) => closeTab(e.index)}
          >
            {tabs.map((tab) => (
              <TabPanel
                key={tab.id}
                closable
                header={
                  editingTabId === tab.id ? (
                    // Inline title editor
                    <InputText
                      value={tab.title}
                      autoFocus
                      onChange={(e) =>
                        handleTitleChange(tab.id, e.target.value)
                      }
                      onBlur={() => setEditingTabId(null)}
                      onKeyDown={(e) => {
                        e.stopPropagation()
                        if (e.key === "Enter") commitRename(tab);
                        if (e.key === "Escape") cancelRename(tab);
                      }}
                      style={{ width: "160px" }}
                    />
                  ) : (
                    // Normal tab title
                    <span
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setOriginalTitle(tab.title);
                        setEditingTabId(tab.id);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {tab.title}
                    </span>
                  )
                }
              >
                {/* Project content */}
                <Project projectId={tab.backendId}   selectionState={projectSelections[tab.backendId]}
  onSelectionChange={(sel) => handleSelectionChange(tab.backendId, sel)}
  
   />
              </TabPanel>
            ))}
          </TabView>

          {/* New project button */}
          <div className="tabbar-actions">
            <SplitButton
              label={isMobile ? undefined : "New"}
              onClick={() => handleCreateNewProject()}
              rounded
              icon="pi pi-plus"
              model={items}
            />
          </div>
        </div>
      )}

      {/* Project manager dialog */}
      <Dialog
        header="My Projects"
        visible={visibleProjectDialog}
        style={{ width: "80vw" }}
        onHide={() => visibleProjectDialog && setVisibleProjectDialog(false)}
      >
        <ProjectsManager
          addNewTab={addNewTab}
          setVisibleProjectDialog={setVisibleProjectDialog}
          closeTabById={closeTabById}
        />
      </Dialog>

      {/* Empty-state welcome screen */}
      {tabs.length === 0 && (
        <div
          style={{
            backgroundImage: "url('/images/empty-background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            gap: "0.5rem",
          }}
        >
          <Image src="/images/empty-logo.png" alt="Image" width="250" />
          <h2>Welcome to your Project Dashboard</h2>
          <p>Start by creating a new project or loading an existing one.</p>
          <div style={{ display: "flex", gap: "2rem" }}>
            <Button
              label="Add new"
              icon="pi pi-plus-circle"
              onClick={() => handleCreateNewProject()}
            />
            <Button
              label="Load"
              icon="pi pi-folder-open"
              onClick={() => setVisibleProjectDialog(true)}
            />
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <Toast ref={toastErr} position="center" />
    </div>
  );
}
