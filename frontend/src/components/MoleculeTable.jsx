import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';


export default function MoleculeTable() {
    // Stato per i prodotti (righe)
    const [products, setProducts] = useState([]);

    // Stato per le celle selezionate (opzionale, se ti serve sempre)
    const [selectedCells, setSelectedCells] = useState([]);

    const [selectedRows, setSelectedRows] = useState([]);

    // Stato per i filtri: ogni chiave corrisponde a un campo (field)
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: 'contains' },
        code:   { value: null, matchMode: 'startsWith' },
        name:   { value: null, matchMode: 'contains' },
        category: { value: null, matchMode: 'contains' },
        quantity: { value: null, matchMode: 'equals' }
    });

    // Riferimento per il campo di ricerca globale (se lo vogliamo)
    const dt = useRef(null);
    const columns = [
        { field: 'code', header: 'Code' },
        { field: 'name', header: 'Name' },
        { field: 'quantity', header: 'Quantity' },
        { field: 'category', header: 'category' }
    ]
    // Simulazione dati fittizi
    useEffect(() => {
        const mockData = [
            { code: 'M001', name: 'Acetone',      category: 'Solvent',    quantity: 100 },
            { code: 'M002', name: 'Benzene',      category: 'Aromatic',   quantity: 50  },
            { code: 'M003', name: 'Ethanol',      category: 'Alcohol',    quantity: 200 },
            { code: 'M004', name: 'Toluene',      category: 'Aromatic',   quantity: 75  },
            { code: 'M005', name: 'Methanol',     category: 'Alcohol',    quantity: 150 },
            { code: 'M006', name: 'Hexane',       category: 'Alkane',     quantity: 90  },
            { code: 'M007', name: 'Chloroform',   category: 'Halogenated',quantity: 60  },
            { code: 'M008', name: 'Diethyl Ether',category: 'Ether',      quantity: 120 },
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
            </div>
        );
    };

    const header = renderHeader();


    const isPositiveInteger = (val) => {
        let str = String(val);

        str = str.trim();

        if (!str) {
            return false;
        }

        str = str.replace(/^0+/, '') || '0';
        let n = Math.floor(Number(str));

        return n !== Infinity && String(n) === str && n >= 0;
    };

    const onCellEditComplete = (e) => {
        let { rowData, newValue, field, originalEvent: event } = e;
        switch (field) {
            case 'quantity':
            case 'price':
                if (isPositiveInteger(newValue)) rowData[field] = newValue;
                else event.preventDefault();
                break;

            default:
                if (typeof newValue === 'string' && newValue.trim().length > 0) rowData[field] = newValue;
                else event.preventDefault();
                break;
        }
    };

    const cellEditor = (options) => {
        if (options.field === 'price') return priceEditor(options);
        else return textEditor(options);
    };

    const textEditor = (options) => {
        return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} onKeyDown={(e) => e.stopPropagation()} />;
    };

    const priceEditor = (options) => {
        return <InputNumber value={options.value} onValueChange={(e) => options.editorCallback(e.value)} mode="currency" currency="USD" locale="en-US" onKeyDown={(e) => e.stopPropagation()} />;
    };


    const onRowCheckboxChange = (e, rowData) => {
    const key = rowData.code;
    setSelectedRows(prev => {
        let next;
        if (e.checked) {
        next = [...prev, key];
        } else {
        next = prev.filter(k => k !== key);
        }
        return next;
    });
    };


    // Verifico se una certa riga è selezionata
    const isRowSelected = (rowData) => {
        if (selectedRows.length > 0) {
            return selectedRows[0].includes(rowData.code);
        }
    };


    // Funzione di logging, se vuoi ancora vedere le celle selezionate
    const logSelection = () => {
        console.log('Celle selezionate:', selectedCells);
    };

    return (
        <div className="card">
            <DataTable
                ref={dt}
                value={products}
                dataKey="code"
                
                /*** Filtri ***/
                filters={filters}
                filterDisplay="menu"  // puoi usare "menu" (predefinito) o "row" 
                globalFilterFields={['code', 'name', 'category', 'quantity']}
                header={header}        // header con input globale

                /*** Selezione Celle (opzionale) ***/
                cellSelection
                selectionMode="multiple"
                selection={selectedCells}
                onSelectionChange={(e) => setSelectedCells(e.value)}
                metaKeySelection={true}
                removableSort
                editMode="cell"
                dragSelection
                rowSelectionKey={selectedRows.join(',')} 
                >
                <Column
                    headerStyle={{ width: '3rem', textAlign: 'center' }}
                    bodyStyle={{ textAlign: 'center' }}
                    body={(rowData) => {
                        return (
                            <Checkbox
                            onClick={(e) => e.stopPropagation()}
                            checked={isRowSelected(rowData)}
                            onChange={(e) => onRowCheckboxChange(e, rowData)}
                            />
                        );
                    }}
                />
                {columns.map(({ field, header }) => {
                    return <Column key={field} field={field} header={header} sortable filter filterPlaceholder="Search by name"
                    style={{ width: '25%' }} editor={(options) => cellEditor(options)} onCellEditComplete={onCellEditComplete} />;
                })}
            
            </DataTable>

            {/*** Pulsante per loggare la selezione, se serve ***/}
            <div style={{ marginTop: '1rem' }}>
                <Button
                    label="Log Selezione"
                    icon="pi pi-list"
                    onClick={logSelection}
                />
            </div>
        </div>
    );
}
