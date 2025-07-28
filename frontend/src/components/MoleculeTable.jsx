import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { ContextMenu } from "primereact/contextmenu";
import { Image } from 'primereact/image';
import { API_URL, FAILED_IMAGE_URL } from "../api";
import "./styles/MoleculeTable.css";
import "./styles/Loader.css";


export default function MoleculeTable({
  products,
  setProducts,
  onSelectCell,
  onSelectRow,
  filters,
  visibleColumns,
  projectId
}) {
  // Track cell and row selection
  const [selectedCells, setSelectedCells] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imageUrls, setImageUrls] = useState({});

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
    // 1) individua i prodotti che NON hanno ancora imageUrl
    const toLoad = products.filter(p => p.smiles && !p.imageUrl);
    if (toLoad.length === 0) return;  // niente da fare!

    // 2) scarica in parallelo
    const fetched = await Promise.all(
      toLoad.map(async p => {
        const url = await fetchMoleculeImageUrl(p.smiles);
        return { smiles: p.smiles, url: url || FAILED_IMAGE_URL };
      })
    );

    if (!isMounted) return;

    setProducts(prev =>
      prev.map(p => {
        const found = fetched.find(f => f.smiles === p.smiles);
        return found ? { ...p, imageUrl: found.url } : p;
      })
    );
  };

  loadImages();

  return () => { isMounted = false; };
}, [products]);




  // Refs for DataTable and ContextMenu
  const dt = useRef(null);
  const cm = useRef(null);

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
      command: () => deleteProduct(selectedProduct),
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

const onCellEditComplete = async (e) => {
  const { rowData, newValue, field, originalEvent: event } = e;

  if (typeof newValue === "string" && newValue.trim().length > 0) {
    try {
      const moleculeId = rowData.id;

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
      onKeyDown={e => e.preventDefault()}
    />
  );

  const cellEditor = (options) => textEditor(options);

const onRowCheckboxChange = (e, rowData) => {
  const key = rowData.id;
  
  const newSelectedRows = e.checked
    ? [...selectedRows, key]
    : selectedRows.filter(k => k !== key);

  setSelectedRows(newSelectedRows);
  // console.log(newSelectedRows);
  onSelectRow(newSelectedRows);
};


  // Check if row is selected
  const isRowSelected = (rowData) => selectedRows.includes(rowData.id);

  // Remove product from table
  const deleteProduct = (product) => {
    setProducts(prev => prev.filter(p => p.code !== product.code));
  };

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

const selectSpecificCell = (rowData) => {
  console.log(rowData)
  const cellData = {
    rowData: rowData,
    rowIndex: 0,
    cellIndex: 0,
  };

    setSelectedCells(prev => [...prev, cellData]);
  
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
        onContextMenu={e => cm.current.show(e.originalEvent)}
        onContextMenuSelectionChange={e => setSelectedProduct(e.value)}
        filters={filters}
        filterDisplay="menu"
        globalFilterFields={["code", "name", "category", "quantity"]}
        scrollable
        scrollHeight="100%"
        cellSelection
        selectionMode={'checkbox'}
        selection={selectedCells}
        onSelectionChange={e => {
          // Don't allow selecting the image cell
          //console.log("VALORE", e.value)
          if (e.value.length === 0 ){
            setSelectedCells(e.value);
          }
          else if (e.value[e.value.length - 1].field !== "Image") {
            
            setSelectedCells(e.value);
          }
          // Notify parent of molecule selection
          if (onSelectCell && e.value.length > 0) {
            //const firstCell = e.value[0];
            const lastCell = e.value[e.value.length - 1];
            onSelectCell(lastCell.rowData != null ? lastCell.rowData : lastCell);
          }
        }}
        metaKeySelection
        removableSort
        editMode="cell"
        dragSelection
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
        {visibleColumns.some(col => col.field === "Image") && (
          <Column
            header="Image"
            field="Image"
            body={imageBodyTemplate}
          />
        )}
        {/* Other columns */}
        {visibleColumns.map(({ field, header }) => (
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
      </DataTable>
    </div>
  );
}
