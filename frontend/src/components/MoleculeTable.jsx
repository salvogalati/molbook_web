import React, { useState, useEffect, forwardRef, useRef, useImperativeHandle, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ContextMenu } from "primereact/contextmenu";
import { Image } from 'primereact/image';
import { ToggleButton } from 'primereact/togglebutton';
import { API_URL, FAILED_IMAGE_URL } from "../services/api";
import "./styles/MoleculeTable.css";
import "./styles/Loader.css";


export default forwardRef(function MoleculeTable({
  products,
  setProducts,
  onSelectCell,
  onSelectRow,
  filters,
  visibleColumns,
  projectId,
  onDelete,
  selectedCells,
  onSelectionChange,
}, ref) {

  // Track cell and row selection
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortMode, setSortMode] = useState(false);

  const fetchMoleculeImageUrl = async (smiles) => {
    const res = await fetch(
      `${API_URL}/api/molecule-image/?smiles=${encodeURIComponent(smiles)}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
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

useEffect(() => {
  let isMounted = true;

  const loadImages = async () => {
    const toLoad = products.filter(p => p.smiles && !p.imageUrl);
    if (toLoad.length === 0) return;

    const fetched = await Promise.all(
      toLoad.map(async p => {
        const url = await fetchMoleculeImageUrl(p.smiles);
        return { smiles: p.smiles, url: url || FAILED_IMAGE_URL };
      })
    );

    if (!isMounted || fetched.length === 0) return;

    setProducts(prev => {
      let changed = false;
      const updated = prev.map(p => {
        const found = fetched.find(f => f.smiles === p.smiles);
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

  return () => { isMounted = false; };
}, [products]);



  // Refs for DataTable and ContextMenu
  const dt = useRef(null);
  const cm = useRef(null);

  useImperativeHandle(ref, () => ({
    getDataTable: () => dt.current,
    exportCSV: (options) => dt.current?.exportCSV(options),
  }));

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

  // When products change, scroll to bottom of table (for new entries)
  useEffect(() => {
    setTimeout(() => {
      if (dt.current && typeof dt.current.getElement === "function") {
        const tableElem = dt.current.getElement();
        if (tableElem) {
          const scroller = tableElem.querySelector('.p-datatable-wrapper');
          if (scroller) scroller.scrollTop = scroller.scrollHeight;
        }
      }
    }, 100);
  }, [products]);

// Fort automatic scroll when drag row
useEffect(() => {
  if (!sortMode) return;

  const tableElem = dt.current?.getElement();
  if (!tableElem) return;

  const wrapper = tableElem.querySelector('.p-datatable-wrapper');
  if (!wrapper) return;

  let scrollDirection = 0;
  let scrollInterval = null;

  const startAutoScroll = (direction) => {
    if (scrollDirection === direction) return;
    stopAutoScroll();
    scrollDirection = direction;
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

  const handleMouseMove = (e) => {
    const bounds = wrapper.getBoundingClientRect();
    const y = e.clientY;

    const edgeThreshold = 50;

    if (y < bounds.top + edgeThreshold) {
      startAutoScroll(-1);
    } else if (y > bounds.bottom - edgeThreshold) {
      startAutoScroll(1);
    } else {
      stopAutoScroll();
    }
  };

  document.addEventListener('dragover', handleMouseMove);
  document.addEventListener('dragend', stopAutoScroll);
  document.addEventListener('drop', stopAutoScroll);

  return () => {
    stopAutoScroll();
    document.removeEventListener('dragover', handleMouseMove);
    document.removeEventListener('dragend', stopAutoScroll);
    document.removeEventListener('drop', stopAutoScroll);
  };
}, [sortMode]);

const onCellEditComplete = async (e) => {
  const { rowData, newValue, field, originalEvent: event } = e;

  if (typeof newValue === "string" && newValue.trim().length > 0) {
    try {
      const moleculeId = rowData.id;
      setProducts(prev => prev.map(p => p.id === moleculeId ? { ...p, [field]: newValue } : p));
      const response = await fetch(
        `${API_URL}api/projects/${projectId}/molecules/${moleculeId}/`,
        {
          method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
          body: JSON.stringify({ [field]: newValue })
        }
      );

      if (!response.ok) {
        throw new Error("Errore nella richiesta PATCH");
      }

      const data = await response.json();
      rowData[field] = data[field]; // aggiorna il valore con quello del backend

    } catch (err) {
      console.error(err);
      event.preventDefault(); // impedisce il salvataggio in UI
    }
  } else {
    event.preventDefault(); // valore non valido, rollback
  }
};

  // Text editor for cell editing
  const textEditor = (options) => (
    <InputText
      type="text"
      className="p-inputtext-sm"
      value={options.value}
      onChange={e => options.editorCallback(e.target.value)}
    />
  );

  const cellEditor = (options) => textEditor(options);

const prevSelectionRef = useRef([]);

const handleSelectionChange = useCallback((e) => {
  const newSelection = e.value;
  const oldSelection = prevSelectionRef.current;

  // Confronta solo gli ID delle righe selezionate
  const newIds = newSelection.map(s => s.rowData?.id ?? s.id ?? s.field);
  const oldIds = oldSelection.map(s => s.rowData?.id ?? s.id ?? s.field);
  if (JSON.stringify(newIds) === JSON.stringify(oldIds)) return;

  prevSelectionRef.current = newSelection;
  if (newSelection.length === 0) {
    onSelectionChange([]);
    setSelectedRows([]);
    onSelectRow([]);
  } else if (newSelection[newSelection.length - 1].field !== "Image") {
    onSelectionChange(newSelection);
  }

  if (onSelectCell && newSelection.length > 0) {
    const lastCell = newSelection[newSelection.length - 1];
    onSelectCell(lastCell.rowData != null ? lastCell.rowData : lastCell);
    if (lastCell.rowData == null) {
      onSelectRow(newSelection);
      setSelectedRows(newSelection);
    }
  }
}, [onSelectCell, onSelectRow, onSelectionChange]);



  // Render molecule image cell
const imageBodyTemplate = (product) => {
  //console.log(product)
  const { imageUrl, name } = product;
;

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
            <ToggleButton onIcon="pi pi-sort" offIcon="pi pi-sort" id="sort_button"
            onLabel="" offLabel="" checked={sortMode}
            onChange={() => setSortMode(!sortMode)}/>
        </div>
    );

    const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [columns, setColumns] = useState(visibleColumns);


  const handleAddColumn = () => {
    if (newColumnName.trim() !== "") {
      setColumns([...columns, { field: newColumnName, header: newColumnName }]);
      setNewColumnName("");
      setAddingColumn(false);
    }
  };

  // --- Render ---
  return (
    <div className="molecule-table-card card">
      <ContextMenu
        model={menuModel}
        ref={cm}
        onHide={() => setSelectedProduct(null)}
      />
      <DataTable
        ref={dt}
        value={products}
        dataKey="code"
        id="molecule-table"
        header={header}
        emptyMessage="No molecules present"
        onContextMenu={e => cm.current.show(e.originalEvent)}
        onContextMenuSelectionChange={e => setSelectedProduct(e.value)}
        filters={filters}
        filterDisplay="menu"
        globalFilterFields={["code", "name", "category", "quantity"]}
        scrollable
        scrollHeight="100%"
        cellSelection={!sortMode}
        //selectionMode={'checkbox'}
        reorderableColumns
        reorderableRows={sortMode}
        onRowReorder={(e) => setProducts(e.value)}
        selection={selectedCells}
        onSelectionChange={handleSelectionChange}
        metaKeySelection
        removableSort
        editMode="cell"
        dragSelection={!sortMode}
      >
        {!sortMode ?
         (<Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>)
         :
        (<Column rowReorder style={{ width: '3rem' }} />)
        }
        {columns.some(col => col.field === "Image") && (
          <Column
            header="Image"
            field="Image"
            body={imageBodyTemplate}
          />
        )}
        {/* Other columns */}
        {columns.map(({ field, header }) => (
          field !== "Image" && (
            <Column
              key={field}
              field={field}
              header={header}
              sortable
              filter
              filterPlaceholder="Search by name"
              style={{ width: "25%" }}
              editor={cellEditor}
              onCellEditComplete={onCellEditComplete}
            />
          )
        ))}
   {/* Colonna + */}
      <Column
        header={
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
              <Button icon="pi pi-check" onClick={handleAddColumn} className="p-button-text p-button-sm" />
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
})
