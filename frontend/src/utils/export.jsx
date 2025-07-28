import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable'
applyPlugin(jsPDF)

// Parametri che devono essere passati alle funzioni
export const exportCSV = (dt, selectionOnly) => {
    if (dt && dt.current) {
        dt.current.exportCSV({ selectionOnly });
    }
};

export const exportPdf = (exportColumns, products) => {
    const doc = new jsPDF(); // Parametri corretti mancanti
    
    // Aggiungi controllo per i dati
    if (exportColumns && products) {
        doc.autoTable({
            head: [exportColumns.map(col => col.header)],
            body: products.map(product => 
                exportColumns.map(col => product[col.dataKey] || product[col.field])
            )
        });
        doc.save('products.pdf');
    }
}


export const exportExcel = (products, fileName = 'products') => {
    import('xlsx').then((xlsx) => {
        if (products && products.length > 0) {
            const worksheet = xlsx.utils.json_to_sheet(products);
            const workbook = { 
                Sheets: { data: worksheet }, 
                SheetNames: ['data'] 
            };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            saveAsExcelFile(excelBuffer, fileName);
        }
    }).catch(error => {
        console.error('Errore durante l\'import di xlsx:', error);
    });
};

export const saveAsExcelFile = (buffer, fileName) => {
    import('file-saver').then((module) => {
        if (module && module.default) {
            let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
            let EXCEL_EXTENSION = '.xlsx';
            const data = new Blob([buffer], {
                type: EXCEL_TYPE
            });

            module.default.saveAs(
                data, 
                fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
            );
        }
    }).catch(error => {
        console.error('Errore durante l\'import di file-saver:', error);
    });
};