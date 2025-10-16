import { useEffect, useState, useMemo, useRef } from "react";
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
import { Toast } from "primereact/toast";
import { Tooltip } from "primereact/tooltip";
import { API_URL } from "../api";
import "../components/styles/Loader.css";
import "./styles/ProjectManager.css";

function ProjectsManager({ addNewTab, closeTabById }) {
  // Set a pleasant background when the component is mounted
  useEffect(() => {
    document.body.style.background = "#F0F8FF";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  const [projects, setProjects] = useState([]);
  useEffect(() => {
    fetch(`${API_URL}api/projects/`, {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": 'skip-browser-warning',
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Errore nel fetch delle molecole");
        return res.json();
      })
      .then((data) => {
        setProjects(data);
      })
      .catch((err) => {
        console.error("Errore caricamento molecole:", err);
      });
  }, []);

  // Example: mock data for recent projects
  const toastMessage = useRef(null);

  // setProjects([
  //   { id: '1000', code: 'f230fh0g3', name: 'My project TEST', molecules: 8, createdAt: "2025-01-12T09:24:00Z", updatedAt: "2025-01-15T14:45:00Z" },
  //   { id: '1001', code: 'a230dh0d1', name: 'My project RF445', molecules: 12, createdAt: "2025-02-05T11:10:00Z", updatedAt: "2025-02-08T16:32:00Z" },
  //   { id: '1002', code: 'b330gh0d2', name: 'My project TEST 3', molecules: 57, createdAt: "2024-12-22T08:40:00Z", updatedAt: "2025-01-03T19:20:00Z" },
  //   { id: '1003', code: 'c440hh0d3', name: 'My project WE41', molecules: 18, createdAt: "2025-03-01T07:15:00Z", updatedAt: "2025-03-04T21:50:00Z" },
  //   { id: '1004', code: 'd550ih0d4', name: 'My project GT4', molecules: 1863, createdAt: "2024-11-10T13:25:00Z", updatedAt: "2025-01-20T09:05:00Z" },
  //   { id: '1005', code: 'e660jh0d5', name: 'My project 6EQA', molecules: 2, createdAt: "2025-02-14T15:00:00Z", updatedAt: "2025-02-15T10:45:00Z" },
  //   { id: '1006', code: 'e660jh0d6', name: 'My project e7f4', molecules: 245, createdAt: "2024-10-05T10:12:00Z", updatedAt: "2025-02-28T18:33:00Z" },
  //   { id: '1007', code: 'f230fh0g3', name: 'My project A', molecules: 8, createdAt: "2025-01-03T09:55:00Z", updatedAt: "2025-01-05T20:14:00Z" },
  //   { id: '1008', code: 'a230dh0d1', name: 'My project F', molecules: 12, createdAt: "2025-02-01T11:40:00Z", updatedAt: "2025-02-03T16:02:00Z" },
  //   { id: '1009', code: 'b330gh0d2', name: 'My project C', molecules: 57, createdAt: "2024-12-12T14:22:00Z", updatedAt: "2025-01-02T09:48:00Z" },
  //   { id: '1010', code: 'c440hh0d3', name: 'My project E', molecules: 18, createdAt: "2025-01-28T17:11:00Z", updatedAt: "2025-01-30T08:25:00Z" },
  //   { id: '1011', code: 'd550ih0d4', name: 'My project D', molecules: 1863, createdAt: "2024-11-22T09:05:00Z", updatedAt: "2025-02-05T22:10:00Z" },
  //   { id: '1012', code: 'e660jh0d5', name: 'My project Z', molecules: 2, createdAt: "2025-03-02T06:20:00Z", updatedAt: "2025-03-02T18:05:00Z" },
  //   { id: '1013', code: 'e660jh0d6', name: 'My project S', molecules: 245, createdAt: "2024-12-01T12:30:00Z", updatedAt: "2025-01-25T11:50:00Z" }
  // ]);

  const sortingFields = ["name", "molecules", "createdAt", "updatedAt"];
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState("updatedAt");
  const [sortAsc, setSortAsc] = useState(true);

  const showMessage = ({
    severity = "info",
    toastRef,
    summary,
    detail,
    life = 3000,
  }) => {
    toastRef.current?.show({ severity, summary, detail, life });
  };

  function formatDate(isoString) {
    const date = new Date(isoString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} | ${hours}:${minutes}:${seconds}`;
  }

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

  //const handleDelete = (id) => setProjects(prev => prev.filter(p => p.id !== id));

  const handleDelete = async (projectId) => {
    try {
      const res = await fetch(`${API_URL}/api/projects/${projectId}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      let data = null;
      try {
        data = await res.json();
      } catch {
        //
      }
      if (!res.ok) {
        const detail =
          data?.detail || data?.error || "Errore during project deleting";
        showMessage({
          severity: "error",
          toastRef: toastMessage,
          summary: "Project not deleted",
          detail,
        });
        return;
      }

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      closeTabById(projectId);
      showMessage({
        severity: "success",
        toastRef: toastMessage,
        summary: "Confirmed",
        detail: "Project deleted",
      });
    } catch (err) {
      console.error("Delete error:", err);
      // qui puoi mostrare un messaggio di errore all’utente
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
        <div style={{gap: "1rem", flexWrap: "wrap", maxHeight: "220px" }}>
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
                  ></i>
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
                  ></i>
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
            {/* <Button icon="pi pi-clone" severity="success" text tooltip="Duplicate"/> */}
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
    <div className="card xl:flex" style={{ flexDirection: "column" }}>
      <Tooltip
        target=".createdAtDiv, .updateAtDiv"
        position="top"
        appendTo={document.body}
        showDelay={150}
      />

      <Toast ref={toastMessage} />
      <ConfirmDialog />
      <Toolbar center={centerContent} style={{ width: "100%" }} />
      <DataView
      emptyMessage="No Project saved"
        value={visibleProjects}
        itemTemplate={itemTemplate}
        layout="grid"
        paginator
        rows={6}
      />
    </div>
  );
}

export default ProjectsManager;
