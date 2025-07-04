import React, { useState, useEffect } from 'react';
import MoleculeTable from '../components/MoleculeTable';
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Accordion, AccordionTab } from 'primereact/accordion';
import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';
import HorizontalSplitIcon from '@mui/icons-material/HorizontalSplit';
import ViewListIcon from '@mui/icons-material/ViewList';
import useIsMobile from "../hooks/useIsMobile";
import "./styles/Molecules.css";

const getPubChemImageUrl = name =>
  `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/PNG?record_type=2d&image_size=300x300`;

export default function Molecules() {
  const [selectedMolecule, setSelectedMolecule] = useState(null);
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [showImage, setShowImage] = useState(true); 
  const isMobile = useIsMobile();

  useEffect(() => {
    console.log(isMobile)
  if (isMobile) {
    setShowImage(false);
    setIsHorizontal(false);
    setVisibleColumns(prev => {
      // Se non c'è già la colonna "Image" in prima posizione, aggiungila
      if (prev.length === 0 || prev[0].field !== "Image") {
        // Prendi tutte le colonne tranne "Image"
        const otherCols = prev.filter(col => col.field !== "Image");
        return [columns[0], ...otherCols];
      }
      return prev;
    });
  }
}, [isMobile]);


  const columns = [
    { field: "Image", header: "Image" },
    { field: "code", header: "Code" },
    { field: "name", header: "Name" },
    { field: "quantity", header: "Quantity" },
    { field: "category", header: "category" },
  ];

  const [visibleColumns, setVisibleColumns] = useState(columns.filter((element, index) => element.field !== "Image"));

  // Stato per i filtri: ogni chiave corrisponde a un campo (field)
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: "contains" },
    code: { value: null, matchMode: "startsWith" },
    name: { value: null, matchMode: "contains" },
    category: { value: null, matchMode: "contains" },
    quantity: { value: null, matchMode: "equals" },
  });

  const onColumnToggle = (event) => {
    let selectedColumns = event.value;
    let orderedSelectedColumns = columns.filter((col) =>
      selectedColumns.some((sCol) => sCol.field === col.field)
    );
    const codeColumn = columns.find(col => col.field === "code");
    orderedSelectedColumns = [codeColumn, ...orderedSelectedColumns];
    setVisibleColumns(orderedSelectedColumns);
  };

  // Funzione per il filtro globale (se vogliamo un solo input superiore)
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    const _filters = { ...filters };
    _filters.global.value = value;
    setFilters(_filters);
  };

  // pannello immagine questo parametrova in imageContainerStyle
  const imageStyle = isHorizontal
    ? { flex: '0 0 40%', backgroundColor: "#F5F5F5" }
    : { flex: '0 0 200px' };



  const renderHeader = () => {
    return (
      <Accordion id="menutable_accordion" style={{ width: "100%", height: "100%" }}>
        <AccordionTab header="Menu" style={{ textAlign: "left" }}>

      <div className="p-2 align-items-center flex flex-row flex-wrap" style={{ gap: "1.2rem" }}>
        <div> <h5 style={{ margin: 0, textAlign: "left", minHeight: "1.5em" }}> </h5>
          <IconField iconPosition="left">
            <InputIcon className="pi pi-search"> </InputIcon>

            <InputText
              onInput={onGlobalFilterChange}
              type="search"
              placeholder="Search"
              size="30"
            />
          </IconField>
        </div>
        <div style={{width: "100%"}}>
          <h5 style={{ margin: 0, textAlign: "left" }}> Visible columns</h5>
          <MultiSelect
            id="multiselect"
            value={visibleColumns.filter((col) => col.field !== "code")}
            options={columns.filter((col) => col.field !== "code")}
            onChange={onColumnToggle}
            optionLabel="header"
            className="w-full sm:w-20rem"
            display="chip"
          />
        </div>
        {!isMobile && (
        <div style={{ display: "flex", flexDirection: "column", }}>
          <h5 style={{ margin: 0, textAlign: "left", alignItems: "center" }}> Layout</h5>
          <div style={{ display: "flex", gap: "1rem", border: "1px solid rgb(204, 204, 204)", borderRadius: "8px", padding: "0.5rem" }}>
            <Button style={{ width: "2rem", height: "2rem" }} 
            onClick={() => {setIsHorizontal(false); setShowImage(true); setVisibleColumns(prev => prev.filter((element, index) => element.field !== "Image"))}}
              tooltip="Vertical layout" icon={(options) => <VerticalSplitIcon {...options.iconProps} />} />
            <Button style={{ width: "2rem", height: "2rem" }}
             onClick={() => {setIsHorizontal(true); setShowImage(true); setVisibleColumns(prev => prev.filter((element, index) => element.field !== "Image"))}}
            tooltip="Horizontal layout" icon={(options) => <HorizontalSplitIcon {...options.iconProps} />} />
            <Button style={{ width: "2rem", height: "2rem" }} onClick={() => {setShowImage(false); setVisibleColumns(prev => [columns[0], ...prev]);}}
             tooltip="Image table layout" icon={(options) => <ViewListIcon {...options.iconProps} />} />
          </div>
        </div>
        )}
      </div>
      </AccordionTab>
      </Accordion>
    );
  };

  const header = renderHeader();
  return (
    <div id="card_molecule_project">
      <div id="header"> {header} </div>

      <div id="containerLayout">
        <div id="pageStyle" style={{flexDirection: isHorizontal ? 'row' : 'column',}}>
          <div id="imageContainerStyle" style={{
    ...imageStyle,
    display: showImage ? undefined : 'none'
  }}>
            {selectedMolecule && (
              <img
                src={getPubChemImageUrl(selectedMolecule.name)}
                alt={`Struttura di ${selectedMolecule.name}`}
                id="imgStyle"
                onError={e => (e.currentTarget.src = 'https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/LD7WEPSAP7XPVEERGVIKMYX24Q.JPG&w=1800&h=1800')}
              />
            )}
          </div>

          <div id="tableContainerStyle" style={{flex: isHorizontal ? '1 1 60%' : 1}}>
            <MoleculeTable onSelectMolecule={setSelectedMolecule} filters={filters} visibleColumns={visibleColumns} />
          </div>
        </div>
      </div>
    </div>
  );
}
