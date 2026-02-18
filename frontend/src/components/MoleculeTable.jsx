import React, {
  useState,
  useEffect,
  forwardRef,
  useRef,
  useImperativeHandle,
  useCallback,
  useMemo,
} from "react";
import { DataTable } from "primereact/datatable";
import { FilterMatchMode } from "primereact/api";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ContextMenu } from "primereact/contextmenu";
import { Image } from "primereact/image";
import { ToggleButton } from "primereact/togglebutton";
import { API_URL, FAILED_IMAGE_URL } from "../services/api";
import "./styles/MoleculeTable.css";
import "./styles/Loader.css";

export default forwardRef(function MoleculeTable(
  {
    products,
    setProducts,
    onSelectCell,
    onSelectRow,
    globalfilter,
    visibleColumns,
    projectId,
    onDelete,
    selectedCells,
    onSelectionChange,
    addColumn,
    removeColumn,
  },
  ref,
) {
  // Track cell and row selection
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortMode, setSortMode] = useState(false);
  const staticFields = ["code", "smiles"];

  // Refs for DataTable and ContextMenu and selection tracking
  const dt = useRef(null);
  const cm = useRef(null);
  const prevSelectionRef = useRef([]);

  // Define columns based states
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  // Generate dynamic columns based on unique keys in extra_data of products, excluding static fields
  // First create an array of all keys in extra_data across products and flatten it,
  // then create a unique set and map to column definitions (objects with field and header properties)
  const dynamicColumns = useMemo(() => {
    return [
      ...new Set(products.map((m) => Object.keys(m.extra_data || {})).flat()),
    ].map((key) => ({
      field: `extra_data.${key}`,
      //field: key,
      header: key,
      body: (rowData) => rowData.extra_data?.[key],
      filterField: `extra_data.${key}`,
    }));
  }, [products]);

  const columns = useMemo(() => {
    return [...visibleColumns, ...dynamicColumns];
  }, [visibleColumns, dynamicColumns]);

  const [filters, setFilters] = useState({});

  // Context menu items
  const menuModel = [
    {
      label: "View",
      icon: "pi pi-fw pi-search",
      command: () => console.log(selectedProduct),
    },
    {
      label: "Delete",
      icon: "pi pi-fw pi-times",
      disabled: selectedRows.length === 0,
      command: onDelete,
    },
  ];

  // Fetch molecule image from backend and return as blob URL
  const fetchMoleculeImageUrl = async (smiles) => {
    const res = await fetch(
      `${API_URL}/api/molecule-image/?smiles=${encodeURIComponent(smiles)}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      },
    );

    const contentType = res.headers.get("Content-Type");
    if (!res.ok || !contentType?.startsWith("image")) {
      console.error("Invalid image response for", smiles);
      return FAILED_IMAGE_URL;
    }

    const blob = await res.blob();
    //return FAILED_IMAGE_URL
    return URL.createObjectURL(blob);
  };

  // On mount and when products change, load images for molecules that have smiles but no imageUrl
  // This is useful when the imaes must be shown directly in the table
  useEffect(() => {
    let isMounted = true;

    const loadImages = async () => {
      const toLoad = products.filter((p) => p.smiles && !p.imageUrl);
      if (toLoad.length === 0) return;

      const fetched = await Promise.all(
        toLoad.map(async (p) => {
          const url = await fetchMoleculeImageUrl(p.smiles);
          return { smiles: p.smiles, url: url || FAILED_IMAGE_URL };
        }),
      );

      if (!isMounted || fetched.length === 0) return;

      setProducts((prev) => {
        let changed = false;
        const updated = prev.map((p) => {
          const found = fetched.find((f) => f.smiles === p.smiles);
          if (found && p.imageUrl !== found.url) {
            changed = true;
            return { ...p, imageUrl: found.url };
          }
          return p;
        });
        return changed ? updated : prev;
      });
    };

    loadImages();

    return () => {
      isMounted = false;
    };
  }, [products, setProducts]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getDataTable: () => dt.current,
    exportCSV: (options) => dt.current?.exportCSV(options),
  }));

  // When products change, scroll to bottom of table (for new entries)
  // The effect is lightly delayed to ensure the table has rendered with the new data before trying to scroll
  useEffect(() => {
    setTimeout(() => {
      if (dt.current && typeof dt.current.getElement === "function") {
        const tableElem = dt.current.getElement();
        if (tableElem) {
          const scroller = tableElem.querySelector(".p-datatable-wrapper");
          if (scroller) scroller.scrollTop = scroller.scrollHeight;
        }
      }
    }, 100);
  }, [products]);

  // Fort automatic scroll when drag row
  useEffect(() => {
    if (!sortMode) return; // only for row reordering

    const tableElem = dt.current?.getElement();
    if (!tableElem) return; // check if table element is available

    const wrapper = tableElem.querySelector(".p-datatable-wrapper");
    if (!wrapper) return; // check if wrapper element is available

    let scrollDirection = 0;
    let scrollInterval = null;

    // Start auto-scrolling in the given direction (-1 for up, 1 for down)
    const startAutoScroll = (direction) => {
      if (scrollDirection === direction) return;
      stopAutoScroll();
      scrollDirection = direction;
      // Scroll every 30ms by 10px in the desired direction
      scrollInterval = setInterval(() => {
        wrapper.scrollTop += direction * 10;
      }, 30);
    };

    const stopAutoScroll = () => {
      if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
      }
      scrollDirection = 0;
    };

    // On mouse move during drag, check if near top or bottom edge to start auto-scrolling
    const handleMouseMove = (e) => {
      const bounds = wrapper.getBoundingClientRect(); // get wrapper position
      const y = e.clientY; // mouse Y position

      const edgeThreshold = 50; // distance from edge to trigger auto-scroll

      if (y < bounds.top + edgeThreshold) {
        startAutoScroll(-1);
      } else if (y > bounds.bottom - edgeThreshold) {
        startAutoScroll(1);
      } else {
        stopAutoScroll();
      }
    };

    // Attach listeners for drag events
    document.addEventListener("dragover", handleMouseMove);
    document.addEventListener("dragend", stopAutoScroll);
    document.addEventListener("drop", stopAutoScroll);

    // Cleanup on unmount or when sortMode changes
    return () => {
      stopAutoScroll();
      document.removeEventListener("dragover", handleMouseMove);
      document.removeEventListener("dragend", stopAutoScroll);
      document.removeEventListener("drop", stopAutoScroll);
    };
  }, [sortMode]);

  const onCellEditComplete = async (e) => {
    const { rowData, newValue, field, originalEvent: event } = e;
    // Check if the new value is a non-empty string
    if (typeof newValue === "string" && newValue.trim().length > 0) {
      try {
        const moleculeId = rowData.id;
        // Update UI immediately for responsiveness, backend will confirm or rollback
        setProducts((prev) =>
          prev.map((p) =>
            p.id === moleculeId ? { ...p, [field]: newValue } : p,
          ),
        );

        let body = {};
        if (staticFields.includes(field)) {
          body[field] = newValue;
        } else {
          const key = field.replace("extra_data.", "");
          body.extra_data = {
            ...rowData.extra_data,
            [key]: newValue,
          };
        }

        const response = await fetch(
          `${API_URL}api/projects/${projectId}/molecules/${moleculeId}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            body: JSON.stringify(body),
          },
        );

        if (!response.ok) {
          throw new Error("Errore nella richiesta PATCH");
        }

        const data = await response.json();
        // Update the product with the response data to ensure consistency with backend
        const key = field.replace("extra_data.", "");

        setProducts((prev) =>
          prev.map((p) =>
            p.id === moleculeId
              ? {
                  ...p,
                  [field]: staticFields.includes(field)
                    ? data[field]
                    : p[field],
                  extra_data: staticFields.includes(field)
                    ? p.extra_data
                    : { ...p.extra_data, [key]: data.extra_data?.[key] },
                }
              : p,
          ),
        );
      } catch (err) {
        // On error, log and rollback to original value
        console.error(err);
        event.preventDefault();
      }
    } else {
      event.preventDefault(); // valore non valido, rollback
    }
  };

  // Cell editor component for text fields, used for both static and dynamic columns
  const textEditor = (options) => {
    const { rowData, field, value } = options;
    //console.log("Editing cell:", { rowData, field, value }); // For Debugging
    // Determine initial value: if value is provided (editing), use it; otherwise,
    // for static fields use rowData[field], for dynamic fields use rowData.extra_data[field] or empty string
    const initialValue =
      value !== undefined
        ? value
        : staticFields.includes(field)
          ? rowData[field]
          : (rowData.extra_data?.[field] ?? "");

    return (
      <InputText
        type="text"
        className="p-inputtext-sm"
        value={initialValue}
        onChange={(e) => options.editorCallback(e.target.value)}
      />
    );
  };

  // Handle selection change for both cell and row selection, with optimization to prevent redundant updates
  const handleSelectionChange = useCallback(
    (e) => {
      // Get new selection and previous selection from ref
      const newSelection = e.value;
      const oldSelection = prevSelectionRef.current;

      // Compare new and old selection by extracting IDs (or field for cell selection) and comparing as strings
      const newIds = newSelection.map((s) => s.rowData?.id ?? s.id ?? s.field);
      const oldIds = oldSelection.map((s) => s.rowData?.id ?? s.id ?? s.field);
      if (JSON.stringify(newIds) === JSON.stringify(oldIds)) return;

      prevSelectionRef.current = newSelection;

      // If selection is cleared, reset both cell and row selection states
      if (newSelection.length === 0) {
        onSelectionChange([]);
        setSelectedRows([]);
        onSelectRow([]);
      }
      // If the last selected item is a cell in the Image column, ignore it to prevent selection change (since Image column is not selectable)
      else if (newSelection[newSelection.length - 1].field !== "Image") {
        onSelectionChange(newSelection);
      }

      if (onSelectCell && newSelection.length > 0) {
        const lastCell = newSelection[newSelection.length - 1];
        // If the last selected item has rowData, it's a cell selection, otherwise it's a row selection
        onSelectCell(lastCell.rowData != null ? lastCell.rowData : lastCell);
        // If rowData is null, also update row selection to match the cell's row
        if (lastCell.rowData == null) {
          onSelectRow(newSelection);
          setSelectedRows(newSelection);
        }
      }
    },
    [onSelectCell, onSelectRow, onSelectionChange],
  );

  // Render molecule image cell
  const imageBodyTemplate = (product) => {
    //console.log(product)
    const { imageUrl, name } = product;
    return imageUrl ? (
      <Image
        src={imageUrl}
        alt={name}
        width="100px"
        preview
        downloadable
        className="molecule-image"
      />
    ) : (
      <div className="loader" />
    );
  };

  // const selectSpecificCell = (rowData) => {
  //   console.log(rowData)
  //   const cellData = {
  //     rowData: rowData,
  //     rowIndex: 0,
  //     cellIndex: 0,
  //   };

  //     setSelectedCells(prev => [...prev, cellData]);
  // };

  const header = (
    <div className="flex align-items-center justify-content-end gap-2">
      <ToggleButton
        onIcon="pi pi-sort"
        offIcon="pi pi-sort"
        id="sort_button"
        onLabel=""
        offLabel=""
        checked={sortMode}
        onChange={() => setSortMode(!sortMode)}
      />
    </div>
  );

  // Handle adding a new column.
  const handleAddColumn = async () => {
    // Trim the new column name and check if it's not empty
    const name = newColumnName.trim();
    if (!name) return;

    try {
      await addColumn(name); // aspetta backend
      setNewColumnName("");
      setAddingColumn(false);
    } catch (err) {
      console.error(err);
    }

    // Update the products state to add the new column with an empty value for all products
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        extra_data: {
          ...p.extra_data,
          [name]: p.extra_data?.[name] ?? "",
        },
      })),
    );
  };

  // Funzione per rimuovere una colonna dinamica
  const handleRemoveColumn = async (columnName) => {
    // Rimuove il campo extra_data da tutti i prodotti
    setProducts((prev) =>
      prev.map((p) => {
        const newExtraData = { ...p.extra_data };
        delete newExtraData[columnName]; // rimuove la proprietà
        return { ...p, extra_data: newExtraData };
      }),
    );
    try {
      await removeColumn(columnName); // aspetta backend
    } catch (err) {
      console.error(err);
    }

    // Aggiorna i filtri per rimuovere quello della colonna cancellata
    setFilters((prev) => {
      const updatedFilters = { ...prev };
      delete updatedFilters[`extra_data.${columnName}`];
      return updatedFilters;
    });

    // Se gestisci visibleColumns dinamicamente, puoi rimuoverla anche da lì
    // setVisibleColumns((prev) => prev.filter(col => col.field !== `extra_data.${columnName}`));
  };

  // When columns change (due to visibility toggle or dynamic column generation),
  // reset filters to match the current columns
  useEffect(() => {
    const newFilters = {};

    columns.forEach((col) => {
      newFilters[col.field] = {
        value: null,
        matchMode: FilterMatchMode.CONTAINS,
      };
    });

    // Add global filter
    newFilters["global"] = {
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
    };

    setFilters(newFilters);
  }, [columns]);

  // When globalfilter prop changes, update the global filter value in filters_ state
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      global: {
        value: globalfilter || null,
        matchMode: FilterMatchMode.CONTAINS,
      },
    }));
  }, [globalfilter]);

  // --- Render ---
  return (
    <div className="molecule-table-card card">
      {/* Context menù (right click) */}
      <ContextMenu
        model={menuModel}
        ref={cm}
        onHide={() => setSelectedProduct(null)}
      />
      {/* DataTable with dynamic columns, cell editing, selection, context menu, and row reordering */}
      <DataTable
        ref={dt} /* Reference to access DataTable methods from parent */
        value={products}
        dataKey="code"
        id="molecule-table"
        header={header}
        emptyMessage="No molecules present"
        onContextMenu={(e) =>
          cm.current.show(e.originalEvent)
        } /* Show context menu on right click */
        onContextMenuSelectionChange={(e) => setSelectedProduct(e.value)}
        filters={filters}
        filterDisplay="menu"
        globalFilterFields={columns.map((col) => col.field)}
        scrollable
        scrollHeight="100%"
        cellSelection={!sortMode}
        //selectionMode={'checkbox'}
        //reorderableColumns // Problems with column reordering and dynamic columns, each time it generates new check box column 
        onRowReorder={(e) => setProducts(e.value)}
        selection={selectedCells}
        onSelectionChange={handleSelectionChange}
        metaKeySelection
        removableSort
        columnResizeMode="expand"
        resizableColumns
        editMode="cell"
        dragSelection={!sortMode}
      >
        {/* <Column
          rowReorder={sortMode}
          selectionMode={!sortMode ? "multiple" : undefined}
          style={{ width: "3rem" }}
          exportable={false}
        /> */}
        <Column rowReorder style={{ width: '3rem' }} />
        <Column selectionMode="multiple" style={{ width: '3rem' }} />
        {/* Image column is rendered separately to ensure it can be toggled independently and is not editable */}
        {visibleColumns.some((col) => col.field === "Image") && (
          <Column header="Image" field="Image" body={imageBodyTemplate} />
        )}
        {/* Other columns */}
        {columns.map(({ field, header }) => {
          const isDynamic = field.startsWith("extra_data."); // Check if it's a dynamic column based on field name
          // For dynamic columns, the actual field in the data is the part after "extra_data.", for static columns it's just the field name
          const cleanField = isDynamic
            ? field.replace("extra_data.", "")
            : field;

          return (
            field !== "Image" && (
              <Column
                key={field}
                field={field}
                header={
                  isDynamic ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>{header}</span>{" "}
                      {/* testo header mantiene sortable/filter */}
                      <Button
                        icon="pi pi-trash"
                        rounded
                        text
                        className="p-button-text p-button-sm"
                        onClick={() => handleRemoveColumn(cleanField)}
                      />
                    </div>
                  ) : (
                    header
                  )
                }
                sortable
                filter
                style={{ width: "25%" }}
                editor={textEditor}
                onCellEditComplete={onCellEditComplete}
                // For static fields, the body is handled by the editor and default rendering, for dynamic fields we need to extract the value from extra_data
                body={
                  staticFields.includes(field)
                    ? undefined
                    : (rowData) => rowData.extra_data?.[cleanField] ?? ""
                }
              />
            )
          );
        })}

        {/* Column + (add new column) */}
        <Column
          header={
            // If we're in the process of adding a column, show an input and confirm button, otherwise show the add button
            addingColumn ? (
              <div style={{ display: "flex", gap: "4px" }}>
                <InputText
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddColumn();
                    if (e.key === "Escape") setAddingColumn(false);
                  }}
                  autoFocus
                />
                <Button
                  icon="pi pi-check"
                  onClick={handleAddColumn}
                  className="p-button-text p-button-sm"
                />
              </div>
            ) : (
              <Button
                icon="pi pi-plus"
                className="p-button-text p-button-sm"
                onClick={() => setAddingColumn(true)}
              />
            )
          }
          body={() => null}
          style={{ width: "150px" }}
        />
      </DataTable>
    </div>
  );
});
