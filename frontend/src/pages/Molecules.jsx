import React, { useState, useEffect } from "react";
import MoleculeTable from "../components/MoleculeTable";
import WebCamDialog from "../components/WebCamDialog";
import AddMoleculeDialog from "../components/AddMoleculeDialog";
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
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from 'primereact/tooltip';
import { API_URL, FAILED_IMAGE_URL } from "../api";
import "./styles/Molecules.css";


export default function Molecules({ projectId = 2 }) {
  // State for current selected molecule
  const [selectedMolecule, setSelectedMolecule] = useState(null);
  const [selectedRows, setSelectedRows] = useState(null);
  // State for layout
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [showImage, setShowImage] = useState(true);
  const isMobile = useIsMobile();
  const [showWebcamDialog, setShowWebcamDialog] = useState(false);
  const [visibleAddMolecule, setVisibleAddMolecule] = useState(false);
  const [moleculeImageUrl, setMoleculeImageUrl] = useState(null);

  const handleDelete = () => {
    if (!selectedRows || selectedRows.length === 0) return;

    //console.log(selectedRows)

    // try {
    //   const res = await fetch(
    //     `${API_URL}/api/molecule-image/?smiles=${encodeURIComponent(smiles)}`,
    //     {
    //       headers: {
    //         Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    //       },
    //     }
    //   );
    //   if (!res.ok) throw new Error("Fetch failed");

    //   const blob = await res.blob();
    //   return URL.createObjectURL(blob);
    // } catch (error) {
    //   console.error("Image loading error", error);
    //   return FAILED_IMAGE_URL
    //}
  
    setSelectedRows([]); // reset selezione
  };

  const fetchMoleculeImage = async (smiles) => {
    try {
      const res = await fetch(
        `${API_URL}/api/molecule-image/?smiles=${encodeURIComponent(smiles)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      if (!res.ok) throw new Error("Fetch failed");

      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Image loading error", error);
      return FAILED_IMAGE_URL
    }
  };

  useEffect(() => {
    let objectUrl;

    const loadImage = async () => {
      try {
        objectUrl = await fetchMoleculeImage(selectedMolecule.smiles);
        setMoleculeImageUrl(objectUrl);
      } catch (err) {
        console.error("Failed to fetch image", err);
        setMoleculeImageUrl(null);
      }
    };

    if (selectedMolecule?.smiles) {
      loadImage();
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [selectedMolecule]);

  const actions = [
    {
      label: "Add",
      icon: "pi pi-plus",
      command: () => setVisibleAddMolecule(true)
    },
        {
      label: "Depict",
      icon: "pi pi-camera",
      command: () => setShowWebcamDialog(true)
    },
    {
      label: "Delete",
      icon: "pi pi-trash",
      command: handleDelete,
    },
    {
      label: "Import",
      icon: "pi pi-upload",
    },
    {
      label: "Export",
      icon: "pi pi-download",
    },
  ];



  // Define table columns (always include image, but can be hidden)
  const columns = [
    { field: "Image", header: "Image" },
    { field: "code", header: "Code" },
    { field: "name", header: "Name" },
    { field: "quantity", header: "Quantity" },
    { field: "category", header: "Category" },
  ];

const [products, setProducts] = useState([]); 
useEffect(() => {
  fetch(`${API_URL}api/projects/${projectId}/molecules/`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  })
    .then(res => {
      if (!res.ok) throw new Error("Errore nel fetch delle molecole");
      return res.json();
    })
    .then(data => {
      setProducts(data);
    })
    .catch(err => {
      console.error("Errore caricamento molecole:", err);
    });
}, [projectId]);

  // Handle row addition

  const handleAddRow = (newFields) => {
    // 1. Riduci fields in un singolo oggetto entry
    const entry = newFields.reduce((obj, { id, value }) => {
      if (id === "Image") {
        obj.smiles = value;
      } else {
        obj[id] = value;
      }
      return obj;
    }, {});

    // 2. Applica su setProducts esattamente come facevi prima
    setProducts(prev => [
      ...prev,
      {
        code: entry.code || "M" + Math.floor(Math.random() * 1000),
        name: entry.name || "NewMolecule",
        category: entry.category || "Mock",
        quantity: entry.quantity ?? Math.floor(Math.random() * 200),
        smiles: entry.smiles || "CNO",
      }
    ]);
  };

  // Responsive layout: on mobile, hide image and force vertical layout
  useEffect(() => {
    if (isMobile) {
      setShowImage(false);
      setIsHorizontal(false);
      setVisibleColumns((prev) => {
        const others = prev.filter((col) => col.field !== "Image");
        return [columns[0], ...others];
      });
    }
  }, [isMobile]);

  // Columns visibility for MultiSelect (code always shown)
  const [visibleColumns, setVisibleColumns] = useState(
    columns.filter((col) => col.field !== "Image")
  );

  // Filters for the MoleculeTable
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: "contains" },
    code: { value: null, matchMode: "startsWith" },
    name: { value: null, matchMode: "contains" },
    category: { value: null, matchMode: "contains" },
    quantity: { value: null, matchMode: "equals" },
  });

  // Toggle which columns are visible
  const onColumnToggle = (event) => {
    let selected = event.value;
    let ordered = columns.filter((col) =>
      selected.some((sCol) => sCol.field === col.field)
    );
    const codeCol = columns.find((col) => col.field === "code");
    ordered = [codeCol, ...ordered];
    setVisibleColumns(ordered);
  };

  // Global filter handler
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setFilters((filters) => ({
      ...filters,
      global: { ...filters.global, value },
    }));
  };

  // Layout for the molecule image panel
  const imagePanelStyle = isHorizontal
    ? { flex: "0 0 40%",}
    : { flex: "0 0 200px" };

  // Header panel with filters and actions
  const renderHeader = () => (
    <Accordion className="molecules-menu" id="menu-accordion">
      <AccordionTab header="Menu">
        <div className="menu-toolbar">
          {/* Global search */}
          <div className="menu-block">
            <label htmlFor="molecule-search" className="menu-label">
              Search
            </label>
            <IconField iconPosition="left">
              <InputIcon className="pi pi-search" />
              <InputText
                id="molecule-search"
                onInput={onGlobalFilterChange}
                type="search"
                placeholder="Search"
                size="30"
              />
            </IconField>
          </div>
          {/* Visible columns */}
          <div className="menu-block">
            <label className="menu-label">Visible columns</label>
            <MultiSelect
              value={visibleColumns.filter((col) => col.field !== "code")}
              options={columns.filter((col) => col.field !== "code")}
              onChange={onColumnToggle}
              optionLabel="header"
              className="molecules-multiselect"
              display="chip"
            />
          </div>
          {/* Layout switch (desktop only) */}
          {!isMobile && (
            <div className="menu-block">
              <label className="menu-label">Layout</label>
              <div className="layout-switch">
                <Button
                  className="layout-btn"
                  onClick={() => {
                    setIsHorizontal(false);
                    setShowImage(true);
                    setVisibleColumns((prev) =>
                      prev.filter((col) => col.field !== "Image")
                    );
                  }}
                  tooltip="Vertical layout"
                  icon={(opts) => <VerticalSplitIcon {...opts.iconProps} />}
                />
                <Button
                  className="layout-btn"
                  onClick={() => {
                    setIsHorizontal(true);
                    setShowImage(true);
                    setVisibleColumns((prev) =>
                      prev.filter((col) => col.field !== "Image")
                    );
                  }}
                  tooltip="Horizontal layout"
                  icon={(opts) => <HorizontalSplitIcon {...opts.iconProps} />}
                />
                <Button
                  className="layout-btn"
                  onClick={() => {
                    setShowImage(false);
                    setVisibleColumns((prev) => [columns[0], ...prev]);
                  }}
                  tooltip="Image table layout"
                  icon={(opts) => <ViewListIcon {...opts.iconProps} />}
                />
              </div>
            </div>
          )}
        </div>
      </AccordionTab>
    </Accordion>
  );


  // --- Render ---
  return (
    <div className="molecules-card">
      <div className="molecules-header">{renderHeader()}</div>
      <WebCamDialog
        showWebcamDialog={showWebcamDialog}
        setShowWebcamDialog={setShowWebcamDialog}
        handleAddRow={handleAddRow}
      />
      <AddMoleculeDialog
        showDialog={visibleAddMolecule}
        setShowDialog={setVisibleAddMolecule}
        columns={columns}
        onSave={handleAddRow}
      />
      <div className="molecules-layout-container">
        <div
          className="molecules-layout"
          style={{ flexDirection: isHorizontal ? "row" : "column" }}
        >
          {/* Molecule image panel */}
          <div
            className="molecules-image-panel"
            style={{
              ...imagePanelStyle,
              display: showImage ? undefined : "none",
            }}
          >
            {selectedMolecule && (
              <img
                src={moleculeImageUrl}
                alt={`Structure of ${selectedMolecule.name}`}
                className="molecules-image"
                onError={(e) =>
                (e.currentTarget.src =
                  "https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/LD7WEPSAP7XPVEERGVIKMYX24Q.JPG&w=1800&h=1800")
                }
              />
            )}
          </div>
          {/* Molecule table */}
          <div
            className="molecules-table-panel"
            style={{ flex: isHorizontal ? "1 1 60%" : 1 }}
          >
            <MoleculeTable
              onSelectCell={setSelectedMolecule}
              onSelectRow={setSelectedRows}
              filters={filters}
              products={products}
              setProducts={setProducts}
              visibleColumns={visibleColumns}
            />
          </div>
        </div>
      </div>
      <Tooltip target=".speeddial-bottom-right .p-speeddial-action" position="left" />
      <SpeedDial model={actions} className="speeddial-bottom-right" direction="up"
        showIcon="pi pi-plus" hideIcon="pi pi-times" style={{
          position: "fixed", bottom: "2rem", right: "2rem", zIndex: 1000
        }} />

    </div>
  );
}
