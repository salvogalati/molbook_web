import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { ContextMenu } from "primereact/contextmenu";
import { MultiSelect } from "primereact/multiselect";

export default function MoleculeTable({ onSelectMolecule }) {
  const columns = [
    { field: "code", header: "Code" },
    { field: "name", header: "Name" },
    { field: "quantity", header: "Quantity" },
    { field: "category", header: "category" },
  ];

  // Stato per i prodotti (righe)
  const [products, setProducts] = useState([]);

  // Stato per le celle selezionate (opzionale, se ti serve sempre)
  const [selectedCells, setSelectedCells] = useState([]);

  const [selectedRows, setSelectedRows] = useState([]);
  const cm = useRef(null);
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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(columns);

  // Stato per i filtri: ogni chiave corrisponde a un campo (field)
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: "contains" },
    code: { value: null, matchMode: "startsWith" },
    name: { value: null, matchMode: "contains" },
    category: { value: null, matchMode: "contains" },
    quantity: { value: null, matchMode: "equals" },
  });

  // Riferimento per il campo di ricerca globale (se lo vogliamo)
  const dt = useRef(null);

  // Simulazione dati fittizi
  useEffect(() => {
    const mockData = [
      { code: "M001", name: "Acetone", category: "Solvent", quantity: 100 },
      { code: "M002", name: "Benzene", category: "Aromatic", quantity: 50 },
      { code: "M003", name: "Ethanol", category: "Alcohol", quantity: 200 },
      { code: "M004", name: "Toluene", category: "Aromatic", quantity: 75 },
      { code: "M005", name: "Methanol", category: "Alcohol", quantity: 150 },
      { code: "M006", name: "Hexane", category: "Alkane", quantity: 90 },
      {
        code: "M007",
        name: "Chloroform",
        category: "Halogenated",
        quantity: 60,
      },
      { code: "M008", name: "Diethyl Ether", category: "Ether", quantity: 120 },
    ];
    setProducts(mockData);
  }, []);

  // Funzione per il filtro globale (se vogliamo un solo input superiore)
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    const _filters = { ...filters };
    _filters.global.value = value;
    setFilters(_filters);
  };

  const isPositiveInteger = (val) => {
    let str = String(val);

    str = str.trim();

    if (!str) {
      return false;
    }

    str = str.replace(/^0+/, "") || "0";
    let n = Math.floor(Number(str));

    return n !== Infinity && String(n) === str && n >= 0;
  };

  const onCellEditComplete = (e) => {
    let { rowData, newValue, field, originalEvent: event } = e;
    switch (field) {
      case "quantity":
      case "price":
        if (isPositiveInteger(newValue)) rowData[field] = newValue;
        else event.preventDefault();
        break;

      default:
        if (typeof newValue === "string" && newValue.trim().length > 0)
          rowData[field] = newValue;
        else event.preventDefault();
        break;
    }
  };

  const cellEditor = (options) => {
    if (options.field === "price") return priceEditor(options);
    else return textEditor(options);
  };

  const textEditor = (options) => {
    return (
      <InputText
        type="text"
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()}
      />
    );
  };

  const priceEditor = (options) => {
    return (
      <InputNumber
        value={options.value}
        onValueChange={(e) => options.editorCallback(e.value)}
        mode="currency"
        currency="USD"
        locale="en-US"
        onKeyDown={(e) => e.stopPropagation()}
      />
    );
  };

  const onRowCheckboxChange = (e, rowData) => {
    const key = rowData.code;
    setSelectedRows((prev) => {
      let next;
      if (e.checked) {
        next = [...prev, key];
      } else {
        next = prev.filter((k) => k !== key);
      }
      return next;
    });
  };

  // Verifico se una certa riga è selezionata
  const isRowSelected = (rowData) => {
    if (selectedRows.length > 0) {
      return selectedRows.includes(rowData.code);
    }
  };

  const deleteProduct = (product) => {
    // filtro l'array corrente, rimuovendo il prodotto col code corrispondente
    setProducts((prevProducts) =>
      prevProducts.filter((p) => p.code !== product.code)
    );
  };

  const onColumnToggle = (event) => {
    let selectedColumns = event.value;
    let orderedSelectedColumns = columns.filter((col) =>
      selectedColumns.some((sCol) => sCol.field === col.field)
    );

    setVisibleColumns(orderedSelectedColumns);
  };

  // Funzione di logging, se vuoi ancora vedere le celle selezionate
  const logSelection = () => {
    console.log("Celle selezionate:", selectedCells);
    console.log("Righe selezionate:", selectedRows);
  };

  // Template per l’input di testo nel filtro globale
  const renderHeader = () => {
    return (
      <div className="p-3 justify-content-between align-items-center">
        <h4 className="m-0">Molecole</h4>

        <InputText
          type="search"
          onInput={onGlobalFilterChange}
          placeholder="Ricerca globale"
          size="30"
        />
        <div>
          <MultiSelect
            value={visibleColumns.filter((col) => col.field !== "code")}
            options={visibleColumns.filter((col) => col.field !== "code")}
            optionLabel="header"
            onChange={onColumnToggle}
            className="w-full sm:w-20rem"
            display="chip"
          />
          ;
        </div>
      </div>
    );
  };

  const header = renderHeader();

  return (
    <div className="card">
      <ContextMenu
        model={menuModel}
        ref={cm}
        onHide={() => setSelectedProduct(null)}
      />
      <DataTable
        ref={dt}
        value={products}
        dataKey="code"
        onContextMenu={(e) => cm.current.show(e.originalEvent)}
        onContextMenuSelectionChange={(e) => setSelectedProduct(e.value)}
        /*** Filtri ***/
        filters={filters}
        filterDisplay="menu" // puoi usare "menu" (predefinito) o "row"
        globalFilterFields={["code", "name", "category", "quantity"]}
        header={header} // header con input globale
        /*** Selezione Celle (opzionale) ***/
        cellSelection
        selectionMode="multiple"
        selection={selectedCells}
        onSelectionChange={(e) => {
          setSelectedCells(e.value);
          // se esiste almeno una cella selezionata, notifica il genitore
          if (onSelectMolecule && e.value.length > 0) {
            // prende la molecola (rowData) della PRIMA cella selezionata
            const firstCell = e.value[0];
            onSelectMolecule(firstCell.rowData);
          }
        }}
        metaKeySelection={true}
        removableSort
        editMode="cell"
        dragSelection
        rowSelectionKey={selectedRows.join(",")}
        key={selectedRows}
      >
        <Column
          headerStyle={{
            width: "3rem",
            textAlign: "center",
            padding: "0 0 0 30px",
          }}
          style={{ width: "1%" }}
          //selectionMode="multiple"
          body={(rowData) => {
            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "center", // verticale
                  justifyContent: "center", // orizzontale
                  height: "100%", // occupa tutta l’altezza della cella
                }}
              >
                <Checkbox
                  //style={{ padding: "5px "}}
                  onClick={(e) => e.stopPropagation()}
                  checked={isRowSelected(rowData)}
                  onChange={(e) => onRowCheckboxChange(e, rowData)}
                />
              </div>
            );
          }}
        />
        {visibleColumns.map(({ field, header }) => {
          return (
            <Column
              key={field}
              field={field}
              header={header}
              sortable
              filter
              filterPlaceholder="Search by name"
              style={{ width: "25%" }}
              editor={(options) => cellEditor(options)}
              onCellEditComplete={onCellEditComplete}
            />
          );
        })}
      </DataTable>

      {/*** Pulsante per loggare la selezione, se serve ***/}
      <div style={{ marginTop: "1rem" }}>
        <Button
          label="Log Selezione"
          icon="pi pi-list"
          onClick={logSelection}
        />
      </div>
    </div>
  );
}
