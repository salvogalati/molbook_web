import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { ContextMenu } from "primereact/contextmenu";
import { Image } from 'primereact/image';
import "./styles/MoleculeTable.css";

/**
 * Displays a table of molecules with advanced features:
 * - Context menu
 * - Editable cells
 * - Row selection with checkboxes
 * - Optional molecule image
 * - Responsive scroll
 */
export default function MoleculeTable({
  products,
  setProducts,
  onSelectCell,
  onSelectRow,
  filters,
  visibleColumns
}) {
  // Track cell and row selection
  const [selectedCells, setSelectedCells] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  // Handle cell editing
  const onCellEditComplete = (e) => {
    const { rowData, newValue, field, originalEvent: event } = e;
    if (typeof newValue === "string" && newValue.trim().length > 0) {
      rowData[field] = newValue;
    } else {
      event.preventDefault();
    }
  };

  // Text editor for cell editing
  const textEditor = (options) => (
    <InputText
      type="text"
      className="p-inputtext-sm"
      value={options.value}
      onChange={e => options.editorCallback(e.target.value)}
      onKeyDown={e => e.stopPropagation()}
    />
  );

  const cellEditor = (options) => textEditor(options);

const onRowCheckboxChange = (e, rowData) => {
  const key = rowData.code;

  const newSelectedRows = e.checked
    ? [...selectedRows, key]
    : selectedRows.filter(k => k !== key);

  setSelectedRows(newSelectedRows);
  // console.log(newSelectedRows);
  onSelectRow(newSelectedRows);
};


  // Check if row is selected
  const isRowSelected = (rowData) => selectedRows.includes(rowData.code);

  // Remove product from table
  const deleteProduct = (product) => {
    setProducts(prev => prev.filter(p => p.code !== product.code));
  };

  // Render molecule image cell
  const imageBodyTemplate = (product) => (
    <Image
      src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(product.smiles)}/PNG?record_type=2d&image_size=300x300`}
      alt={product.name}
      preview
      width="100px"
      downloadable
      className="molecule-image"
    />
  );

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
        selectionMode="multiple"
        selection={selectedCells}
        onSelectionChange={e => {
          // Don't allow selecting the image cell
          if (e.value[e.value.length - 1].field !== "Image") {
            setSelectedCells(e.value);
          }
          // Notify parent of molecule selection
          if (onSelectCell && e.value.length > 0) {
            const firstCell = e.value[0];
            onSelectCell(firstCell.rowData);
          }
        }}
        metaKeySelection
        removableSort
        editMode="cell"
        dragSelection
        rowSelectionKey={selectedRows.join(",")}
        key={selectedRows}
      >
        {/* Checkbox column for row selection */}
        <Column
          headerStyle={{
            width: "3rem",
            textAlign: "center",
            padding: "0 0 0 30px",
          }}
          style={{ width: "1%" }}
          body={rowData => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Checkbox
                onClick={e => e.stopPropagation()}
                checked={isRowSelected(rowData)}
                onChange={e => onRowCheckboxChange(e, rowData)}
              />
            </div>
          )}
        />
        {/* Molecule image column (optional) */}
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
      {/* If you want a button to log selection, uncomment below */}
      {/* <div style={{ marginTop: "1rem" }}>
        <Button label="Log Selection" icon="pi pi-list" onClick={logSelection} />
      </div> */}
    </div>
  );
}
