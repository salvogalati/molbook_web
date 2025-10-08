import React, { useRef, useState } from "react";
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
import { API_URL } from "../api";
import "./styles/Molecules.css";

export default function ProjectsDashboard() {
  const [tabs, setTabs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleProjectDialog, setVisibleProjectDialog] = useState(false);
  const [editingTabId, setEditingTabId] = useState(null);
  const isMobile = useIsMobile();
  const [originalTitle, setOriginalTitle] = useState("");
  const toastErr = useRef(null);
  const items = [
    {
      label: "Add",
      icon: "pi pi-refresh",
      command: () => {
        handleCreateNewProject();
      },
    },
    {
      label: "Load",
      icon: "pi pi-folder-open",
      command: () => {
        setVisibleProjectDialog(true);
      },
    },
  ];
  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  });

  const showMessage = ({
    severity = "info",
    toastRef,
    summary,
    detail,
    life = 3000,
  }) => {
    toastRef.current?.show({ severity, summary, detail, life });
  };

  const getUniqueTitle = (
    desiredTitle,
    existingTitles,
    fallbackBase = "New Project"
  ) => {
    const base = (desiredTitle && desiredTitle.trim()) || fallbackBase;
    if (!existingTitles.has(base)) return base;

    let i = 2;
    while (existingTitles.has(`${base} ${i}`)) i += 1;
    return `${base} ${i}`;
  };

  const handleCreateNewProject = async (projectName) => {
    const existingTitles = new Set(tabs.map((t) => t.title));
    const localUniqueTitle = getUniqueTitle(
      projectName,
      existingTitles,
      "New Project"
    );
    console.log("CREATE", projectName);
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
        /* ok se vuoto */
      }

      if (!res.ok) {
        const detail =
          data?.detail || data?.error || "Errore during project creation";
        showMessage({
          severity: "error",
          toastRef: toastErr,
          summary: "Project not created",
          detail,
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

  const addNewTab = (name, backendId = null) => {
    setTabs((prev) => {
      const newId = (prev.at(-1)?.id ?? 0) + 1;

      const next = [
        ...prev,
        {
          id: newId,
          title: name ?? `New Project ${newId}`,
          content: `Project ${newId}`,
          backendId,
        },
      ];
      setActiveIndex(next.length - 1); // indice coerente con "next"
      setVisibleProjectDialog(false);
      return next;
    });
  };

  const closeTab = (index) => {
    setTabs((prev) => {
      const next = prev.filter((_, i) => i !== index);
      // ricalibra l'activeIndex
      setActiveIndex((ai) => {
        if (next.length === 0) return 0; // non ci sono più tab
        if (ai > index) return ai - 1; // chiusa una prima della corrente
        if (ai === index) return Math.max(0, ai - 1); // chiusa quella attiva
        return ai; // chiusa una dopo la corrente
      });
      return next;
    });
  };

  const handleTitleChange = (id, newTitle) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === id ? { ...tab, title: newTitle } : tab))
    );
  };

  const commitRename = async (tab) => {
    // prendo il titolo corrente dalla UI (lo stai già aggiornando mentre digiti)
    const newTitle = (tabs.find((t) => t.id === tab.id)?.title || "").trim();

    // niente da fare se vuoto o invariato
    if (!newTitle || newTitle === originalTitle) {
      setEditingTabId(null);
      setOriginalTitle("");
      // se è vuoto, ripristino quello originale
      if (!newTitle) {
        setTabs((prev) =>
          prev.map((t) =>
            t.id === tab.id ? { ...t, title: originalTitle } : t
          )
        );
      }
      return;
    }

    // se non ho backendId, è solo tab locale → chiudo editor
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

      // se il backend rifiuta (es. nome già esistente), ripristino
      if (!res.ok) {
        setTabs((prev) =>
          prev.map((t) =>
            t.id === tab.id ? { ...t, title: originalTitle } : t
          )
        );
        const data = await res.json().catch(() => null);
        const detail = data?.detail || data?.error || "Error during renaming project";
        showMessage({
          severity: "error",
          toastRef: toastErr,
          summary: "Project not renamed",
          detail,
        });
      }
    } catch (e) {
      // errore di rete → ripristino
      setTabs((prev) =>
        prev.map((t) => (t.id === tab.id ? { ...t, title: originalTitle } : t))
      );
      console.error("Network error on rename:", e);
    } finally {
      setEditingTabId(null);
      setOriginalTitle("");
    }
  };

  const cancelRename = (tab) => {
    // annulla (Esc): ripristina UI senza chiamare backend
    setTabs((prev) =>
      prev.map((t) => (t.id === tab.id ? { ...t, title: originalTitle } : t))
    );
    setEditingTabId(null);
    setOriginalTitle("");
  };

  const closeTabById = (idOrBackendId) => {
    setTabs((prev) => {
      const idx = prev.findIndex(
        (t) => t.id === idOrBackendId || t.backendId === idOrBackendId
      );
      if (idx === -1) return prev;
      const next = prev.filter((_, i) => i !== idx);
      setActiveIndex((ai) => {
        if (next.length === 0) return 0;
        if (ai > idx) return ai - 1;
        if (ai === idx) return Math.max(0, ai - 1);
        return ai;
      });
      return next;
    });
  };

  // --- Render ---
  return (
    <div className="molecules-card">
      {tabs.length > 0 && (
        <div className="tabbar-extended">
          <TabView
            activeIndex={activeIndex}
            scrollable
            onTabChange={(e) => setActiveIndex(e.index)}
            onTabClose={(e) => closeTab(e.index)}
          >
            {tabs.map((tab) => (
              <TabPanel
                style={{ marginLeft: "0.5rem" }}
                key={tab.id}
                closable
                header={
                  editingTabId === tab.id ? (
                    <InputText
                      value={tab.title}
                      autoFocus
                      onChange={(e) =>
                        handleTitleChange(tab.id, e.target.value)
                      }
                      onBlur={() => setEditingTabId(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename(tab);
                        if (e.key === "Escape") cancelRename(tab);
                      }}
                      style={{ width: "160px" }}
                    />
                  ) : (
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
                <Project projectId={tab.backendId} />
              </TabPanel>
            ))}
          </TabView>
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
      <Dialog
        header="My Projects"
        visible={visibleProjectDialog}
        style={{ width: "80vw" }}
        onHide={() => {
          if (!visibleProjectDialog) return;
          setVisibleProjectDialog(false);
        }}
      >
        <ProjectsManager
          addNewTab={addNewTab}
          setVisibleProjectDialog={setVisibleProjectDialog}
          closeTabById={closeTabById}
        ></ProjectsManager>
      </Dialog>
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
            height: "100vh", // occupa tutta l'altezza della viewport
            margin: 0,
            boxSizing: "border-box",
            gap: "0.5rem",
          }}
        >
          <Image src="/images/empty-logo.png" alt="Image" width="250" />
          <h2 style={{ margin: "0" }}>Welcome to your Project Dashboard</h2>
          <p style={{ margin: "0 0 1rem 0" }}>
            Start by creating a new project or loading an existing one.
          </p>
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
      <Toast ref={toastErr} position="center" />
    </div>
  );
}
