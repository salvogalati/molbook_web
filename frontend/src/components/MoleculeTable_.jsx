
import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
        

export default function CellEditingDemo() {


      const mockData = [
        { id: 1, code: 'M001', name: 'Acetone',      category: 'Solvent',    quantity: 100 },
        { id: 2, code: 'M002', name: 'Benzene',      category: 'Aromatic',   quantity: 50  },
        { id: 3, code: 'M003', name: 'Ethanol',      category: 'Alcohol',    quantity: 200 },
        { id: 4, code: 'M004', name: 'Toluene',      category: 'Aromatic',   quantity: 75  },
        { id: 5, code: 'M005', name: 'Methanol',     category: 'Alcohol',    quantity: 150 },
        { id: 6, code: 'M006', name: 'Hexane',       category: 'Alkane',     quantity: 90  },
        { id: 7, code: 'M007', name: 'Chloroform',   category: 'Halogenated',quantity: 60  },
        { id: 8, code: 'M008', name: 'Diethyl Ether',category: 'Ether',      quantity: 120 }
    ];
        
    const [products, setProducts] = useState(mockData);
    const [selectedCells, setSelectedCells] = useState(null);
    const [metaKey, setMetaKey] = useState(true);

    const columns = [
        { field: 'code', header: 'Code' },
        { field: 'name', header: 'Name' },
        { field: 'quantity', header: 'Quantity' },
        { field: 'category', header: 'category' }
    ];


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

    const priceBodyTemplate = (rowData) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rowData.price);
    };

    const logSelection = () => {
        console.log('Celle selezionate:', selectedCells);
    };

    return (

        <div className="card">
          <div style={{ marginTop: '1rem' }}>
                <Button 
                    label="Log Selezione" 
                    onClick={logSelection} 
                />
            </div>
            <DataTable value={products} cellSelection selectionMode="multiple" selection={selectedCells}
                    globalFilterFields={['name',]}
                    onSelectionChange={(e) => setSelectedCells(e.value)} metaKeySelection={metaKey} editMode="cell"
                    dragSelection tableStyle={{ minWidth: '50rem' }}>
                {columns.map(({ field, header }) => {
                    return <Column key={field} field={field} header={header} filter filterPlaceholder="Search by name"
                    style={{ width: '25%' }} body={field === 'price' && priceBodyTemplate} editor={(options) => cellEditor(options)} onCellEditComplete={onCellEditComplete} />;
                })}
            </DataTable>
        </div>
    );
}
        