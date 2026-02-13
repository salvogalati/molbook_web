import { useEffect, useState, useMemo } from "react";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Chip } from "primereact/chip";
import { DataView } from "primereact/dataview";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tooltip } from "primereact/tooltip";

import { useProjectsContext } from "../context/ProjectsContext";
import { useNotification } from "../hooks";
import { formatDate } from "../utils/date";
import "../components/styles/Loader.css";
import "./styles/ProjectManager.css";

function ProjectsManager({ addNewTab, closeTabById }) {
  // Context e hooks
  const { projects, loading, fetchProjects, deleteProject } = useProjectsContext();
  const { success, error: showError } = useNotification();

  // Set background
  useEffect(() => {
    document.body.style.background = "#F0F8FF";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  // Carica progetti al mount
  useEffect(() => {
    fetchProjects().catch((err) => {
      showError("Error", `Failed to load projects: ${err.message}`);
    });
  }, [fetchProjects, showError]);

  // Local state per filtri e ordinamento
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState("updatedAt");
  const [sortAsc, setSortAsc] = useState(true);

  const sortingFields = ["name", "molecules", "createdAt", "updatedAt"];

  // Memoized filtered and sorted projects
  const visibleProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? projects.filter((p) =>
          [p.name].some((v) => (v ?? "").toLowerCase().includes(q))
        )
      : projects;

    const sorted = [...filtered].sort((a, b) => {
      const field = sortField || "updatedAt";
      const av = a[field];
      const bv = b[field];

      if (av == null && bv == null) return 0;
      if (av == null) return -1;
      if (bv == null) return 1;

      // numerico
      if (typeof av === "number" && typeof bv === "number") {
        return (av - bv) * (sortAsc ? 1 : -1);
      }

      // date
      if (field === "createdAt" || field === "updatedAt") {
        return (new Date(av) - new Date(bv)) * (sortAsc ? 1 : -1);
      }

      // stringa
      return String(av).localeCompare(String(bv)) * (sortAsc ? 1 : -1);
    });

    return sorted;
  }, [projects, query, sortField, sortAsc]);

  // Handle delete project
  const handleDelete = async (projectId) => {
    try {
      await deleteProject(projectId);
      closeTabById(projectId);
      success("Success", "Project deleted successfully");
    } catch (err) {
      showError("Error", err.message || "Failed to delete project");
    }
  };

  const confirmDelete = (id) => {
    confirmDialog({
      message: "Do you want to delete this project?",
      header: "Delete Confirmation",
      icon: "pi pi-info-circle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept: () => handleDelete(id),
    });
  };

  const itemTemplate = (p) => (
    <div className="col-12 md:col-4 p-2">
      <Card id="project-card">
        <div style={{ gap: "1rem", flexWrap: "wrap", maxHeight: "220px" }}>
          <div className="flex align-items-center justify-content-between">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{ display: "flex", gap: "1rem" }}
                className="align-items-center"
              >
                <h4>{p.name}</h4>
                <Chip
                  label={`${p.molecules} molecole`}
                  style={{ height: "100%" }}
                  pt={{ root: { style: { fontSize: "0.85rem" } } }}
                />
              </div>
              <div
                style={{ display: "flex", gap: "0.7rem" }}
                className="align-items-center justify-content-between"
              >
                <div
                  style={{ display: "flex", gap: "0.5rem" }}
                  className="align-items-center justify-content-between createdAtDiv"
                  data-pr-tooltip="Created at"
                >
                  <i
                    className="pi pi-calendar"
                    style={{ fontSize: "1rem" }}
                  />
                  <span className="text-xs">{formatDate(p.createdAt)}</span>
                </div>
                <div
                  style={{ display: "flex", gap: "0.5rem" }}
                  className="updateAtDiv align-items-center justify-content-between"
                  data-pr-tooltip="Last Updated"
                >
                  <i
                    className="pi pi-calendar"
                    style={{ fontSize: "1rem" }}
                  />
                  <span className="text-xs">{formatDate(p.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2 align-items-center">
            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              onClick={() => confirmDelete(p.id)}
              tooltip="Delete"
            />
            <Button
              icon="pi pi-external-link"
              text
              onClick={() => {
                addNewTab(p.name, p.id);
              }}
              tooltip="Open project"
            />
          </div>
        </div>
      </Card>
    </div>
  );

  const centerContent = (
    <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: "100%" }}
        />
      </IconField>
      <div className="flex align-items-center justify-content-between gap-2">
        <Dropdown
          value={sortField}
          onChange={(e) => setSortField(e.value)}
          options={sortingFields}
          placeholder="Sort by"
          className="w-full md:w-14rem"
        />
        <Button
          icon={sortAsc ? "pi pi-sort-amount-up" : "pi pi-sort-amount-down"}
          outlined
          onClick={() => setSortAsc((prev) => !prev)}
        />
      </div>
    </div>
  );

  return (
    <div 
      className="card xl:flex" 
      style={{ 
        flexDirection: "column",
        maxHeight: "85vh",
        overflow: "hidden",
        display: "flex"
      }}
    >
      <Tooltip
        target=".createdAtDiv, .updateAtDiv"
        position="top"
        appendTo={document.body}
        showDelay={150}
      />
      <ConfirmDialog />
      <Toolbar center={centerContent} style={{ width: "100%" }} />
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
          <div className="loader" />
        </div>
      ) : (
        <div style={{ overflowY: "auto", flex: 1 }}>
          <DataView
            emptyMessage="No Project saved"
            value={visibleProjects}
            itemTemplate={itemTemplate}
            layout="grid"
            paginator
            rows={6}
          />
        </div>
      )}
    </div>
  );
}

export default ProjectsManager;
