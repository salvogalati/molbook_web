import React, { useState, useEffect, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Accordion, AccordionTab } from "primereact/accordion";
import VerticalSplitIcon from "@mui/icons-material/VerticalSplit";
import HorizontalSplitIcon from "@mui/icons-material/HorizontalSplit";
import ViewListIcon from "@mui/icons-material/ViewList";
import useIsMobile from "../hooks/useIsMobile";
import { API_URL, FAILED_IMAGE_URL } from "../api";
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';
import ProjectsManager from "./ProjectManager";
import "./styles/Molecules.css";


export default function ProjectsDashboard({}) {
  const [tabs, setTabs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleProjectDialog, setVisibleProjectDialog] = useState(false);
  const [editingTabId, setEditingTabId] = useState(null);

  const addNewTab = (name) => {
    const newId = tabs.length + 1;
    setTabs([
      ...tabs,
      { id: newId, title: name ?? `New Project ${newId}`, content: `Contenuto del progetto ${newId}` }
    ]);
    setActiveIndex(tabs.length); // attiva subito la nuova tab
    setVisibleProjectDialog(false);
  };

const handleTitleChange = (id, newTitle) => {
  setTabs(prev =>
    prev.map(tab =>
      tab.id === id ? { ...tab, title: newTitle } : tab
    )
  );
};


  // --- Render ---
  return (
    <div className="molecules-card">
      
        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
          {tabs.map((tab) => (
            <TabPanel key={tab.id} closable header={
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
}>
            </TabPanel>
          ))}
        </TabView>
    <Dialog header="My Projects" visible={visibleProjectDialog} style={{ width: '80vw' }} onHide={() => {if (!visibleProjectDialog) return; setVisibleProjectDialog(false); }}>
    <ProjectsManager addNewTab={addNewTab} setVisibleProjectDialog={setVisibleProjectDialog}></ProjectsManager>
    </Dialog>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // occupa tutta l'altezza della viewport
        margin: 0,
        boxSizing: 'border-box',
        gap: "2rem"
      }}>
        <Button label="Add new" icon="pi pi-plus-circle" onClick={() => addNewTab()} />
        <Button label="Load" icon="pi pi-plus-circle" onClick={() => setVisibleProjectDialog(true)}/>
      </div>
    </div>
  );
}
