import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { ContextMenu } from "primereact/contextmenu";
import { Image } from 'primereact/image';
        

import "./styles/MoleculeTable.css";

export default function MoleculeTable({ onSelectMolecule, filters, visibleColumns }) {


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


  const onCellEditComplete = (e) => {
    let { rowData, newValue, field, originalEvent: event } = e;
    switch (field) {
      case "quantity":


      default:
        if (typeof newValue === "string" && newValue.trim().length > 0)
          rowData[field] = newValue;
        else event.preventDefault();
        break;
    }
  };

  const cellEditor = (options) => {
    return textEditor(options);
  };

  const textEditor = (options) => {
    return (
      <InputText
        type="text"
        className="p-inputtext-sm"
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
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


  // Funzione di logging, se vuoi ancora vedere le celle selezionate
  const logSelection = () => {
    console.log("Celle selezionate:", selectedCells);
    console.log("Righe selezionate:", selectedRows);
  };

  const imageBodyTemplate = (product) => {

    return <Image src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(product.name)}/PNG?record_type=2d&image_size=300x300`}
     alt={product.image} preview width="100px" downloadable className="w-6rem shadow-2 border-round" />;
  };
  return (
    <div id="card-table" className="card" style={{ height: "100%" }}>
      <ContextMenu
        model={menuModel}
        ref={cm}
        onHide={() => setSelectedProduct(null)}
      />
      <DataTable
        id="tableproject"
        ref={dt}
        value={products}
        dataKey="code"
        onContextMenu={(e) => cm.current.show(e.originalEvent)}
        onContextMenuSelectionChange={(e) => setSelectedProduct(e.value)}
        /*** Filtri ***/
        filters={filters}
        filterDisplay="menu" // puoi usare "menu" (predefinito) o "row"
        globalFilterFields={["code", "name", "category", "quantity"]}
        scrollable scrollHeight="flex" style={{ minWidth: '50rem' }}
        /*** Selezione Celle (opzionale) ***/
        cellSelection
        selectionMode="multiple"
        selection={selectedCells}
        onSelectionChange={(e) => {
          if (e.value[e.value.length - 1].field !== "Image") {
            setSelectedCells(e.value);
          }
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
        {visibleColumns.some(item => item.field === "Image") && (
          <Column header="Image" field="Image" body={imageBodyTemplate}></Column>
        )}
        {visibleColumns.map(({ field, header }) => {
          if (field !== "Image") {
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
          }
        })}
      </DataTable>

      {/*** Pulsante per loggare la selezione, se serve ***/}
      {/* <div style={{ marginTop: "1rem" }}>
        <Button
          label="Log Selezione"
          icon="pi pi-list"
          onClick={logSelection}
        />
      </div> */}
    </div>
  );
}
