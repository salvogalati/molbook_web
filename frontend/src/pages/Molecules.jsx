import React, { useState, useEffect, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { SplitButton } from 'primereact/splitbutton';
import { MultiSelect } from "primereact/multiselect";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Accordion, AccordionTab } from "primereact/accordion";
import VerticalSplitIcon from "@mui/icons-material/VerticalSplit";
import HorizontalSplitIcon from "@mui/icons-material/HorizontalSplit";
import ViewListIcon from "@mui/icons-material/ViewList";
import useIsMobile from "../hooks/useIsMobile";
import { API_URL, FAILED_IMAGE_URL } from "../api";
import { Dialog } from "primereact/dialog";
import { TabView, TabPanel } from "primereact/tabview";
import ProjectsManager from "./ProjectManager";
import { Image } from "primereact/image";
import "./styles/Molecules.css";

export default function ProjectsDashboard({}) {
  const [tabs, setTabs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleProjectDialog, setVisibleProjectDialog] = useState(false);
  const [editingTabId, setEditingTabId] = useState(null);
  const isMobile = useIsMobile();
      const items = [
        {
            label: 'Add',
            icon: 'pi pi-refresh',
            command: () => {addNewTab()}
        },
        {
            label: 'Load',
            icon: 'pi pi-folder-open',
            command: () => {setVisibleProjectDialog(true)}
}]

const addNewTab = (name) => {
  setTabs(prev => {
    const newId = (prev.at(-1)?.id ?? 0) + 1;
    const next = [
      ...prev,
      { id: newId, title: name ?? `New Project ${newId}`, content: `Project ${newId}` }
    ];
    setActiveIndex(next.length - 1); // indice coerente con "next"
    setVisibleProjectDialog(false);
    return next;
  });
};

const closeTab = (index) => {
  setTabs(prev => {
    const next = prev.filter((_, i) => i !== index);
    // ricalibra l'activeIndex
    setActiveIndex(ai => {
      if (next.length === 0) return 0;               // non ci sono più tab
      if (ai > index) return ai - 1;                 // chiusa una prima della corrente
      if (ai === index) return Math.max(0, ai - 1);  // chiusa quella attiva
      return ai;                                     // chiusa una dopo la corrente
    });
    return next;
  });
};


  const handleTitleChange = (id, newTitle) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === id ? { ...tab, title: newTitle } : tab))
    );
  };

  // --- Render ---
  return (
    <div className="molecules-card">
      {tabs.length > 0 && (
      <div style = {{display: "flex", justifyContent: "space-between"}}>
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
                <InputText
                  value={tab.title}
                  autoFocus
                  onChange={(e) => handleTitleChange(tab.id, e.target.value)}
                  onBlur={() => setEditingTabId(null)}
                  onKeyDown={(e) => e.key === "Enter" && setEditingTabId(null)}
                  style={{ width: "160px" }}
                />
              ) : (
                <span
                  onDoubleClick={(e) => {
                    e.stopPropagation(); // evita focus blu
                    setEditingTabId(tab.id);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {tab.title}
                </span>
              )
            }
          ></TabPanel>
        ))}
      </TabView>
        <div style={{ display: "flex", gap: isMobile ? "1rem" : "2rem" }}>
          {/* <Button
            style={{maxHeight: "50%"}}
            label={isMobile ? undefined : "New"}
            rounded={isMobile}
            icon="pi pi-plus-circle"
            onClick={() => addNewTab()}
          /> */}
        <SplitButton label={isMobile ? undefined : "New"} onClick={() => addNewTab()} style={{maxHeight: "50%"}} rounded icon="pi pi-plus" model={items} />
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
        <h2 style= {{margin: "0"}}>Welcome to your Project Dashboard</h2>
        <p style= {{margin: "0 0 1rem 0"}}>Start by creating a new project or loading an existing one.</p>
        <div style={{ display: "flex", gap: "2rem" }}>
          <Button
            label="Add new"
            icon="pi pi-plus-circle"
            onClick={() => addNewTab()}
          />
          <Button
            label="Load"
            icon="pi pi-folder-open"
            onClick={() => setVisibleProjectDialog(true)}
          />
        </div>
      </div>
      )}
    </div>
  );
}
