import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable'
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

applyPlugin(jsPDF)

// Parametri che devono essere passati alle funzioni
export const exportCSV = (dt, selectionOnly) => {
    if (dt && dt.current) {
        dt.current.exportCSV({ selectionOnly });
    }
};


export const exportPdf = async (exportColumns, products) => {
    const doc = new jsPDF();

    // 1. Converti le immagini in base64
    const productsWithBase64 = await prepareProductsWithBase64(products);
    console.log(productsWithBase64)
    const columns = exportColumns.map(col => {
        const key = col.dataKey || col.field;
        if (key.toLowerCase() === 'image') {
            return { header: col.title || 'Image', dataKey: 'imageBase64' };
        }
        return { header: col.title, dataKey: key };
    });


    doc.autoTable({
        columns,
        body: productsWithBase64,
        styles: {
            cellPadding: 2, minCellHeight: 22, halign: 'center', // testo centrato orizzontalmente
            valign: 'middle'
        },
        columnStyles: {
            imageBase64: { cellWidth: 28, halign: 'center' } // colonna un filo più larga
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.dataKey === 'imageBase64') {
                data.cell.text = '';
            }
        },
        didDrawCell: (data) => {
            if (data.column.dataKey === 'imageBase64' && data.cell.raw !== "Image") {
                const raw = data.cell.raw;
                const pad = 2;
                const boxW = data.cell.width - pad * 2;
                const boxH = data.cell.height - pad * 2;

                // Lato massimo: non deve superare boxH, così non sborda
                const side = Math.min(boxW, boxH);
                const x = data.cell.x + pad + (boxW - side) / 2;
                const y = data.cell.y + pad + (boxH - side) / 2;
                // debug utile
                if (typeof raw !== 'string' || !raw.startsWith('data:image/')) {
                    console.warn('imageBase64 non valido:', typeof raw, raw?.slice?.(0, 30));
                    return; // evita addImage su contenuti non immagine
                }
                try {
                    const fmt = raw.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG';
                    doc.addImage(raw, fmt, x, y, side, side);
                } catch (err) {
                    console.error('addImage error:', err);
                }
            }
        },

    });

    doc.save('products.pdf');
};

const blobUrlToBase64 = async (blobUrl) => {
    const blob = await fetch(blobUrl).then((res) => res.blob());

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // base64 string
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const prepareProductsWithBase64 = async (products) => {
    return await Promise.all(
        products.map(async (p) => {
            const imageBase64 = await blobUrlToBase64(p.imageUrl);
            return {
                 ...p,
                imageBase64,
            };
        })
    );
};



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


export function ExportDialog({ showExportDialog, setShowExportDialog, exportColumns, products, exportCSV}) {
    return (
        <div className="card flex justify-content-center" style={{padding: 0}}>
            <Dialog 
                header="Select the format to export the data" 
                visible={showExportDialog} 
                style={{ width: '35vw' }} 
                onHide={() => { 
                    if (!showExportDialog) return; 
                    setShowExportDialog(false); 
                }}
            >
                {/* contenitore dei gruppetti: in riga */}
<div className="flex w-full justify-content-evenly">
  <div className="flex-1 flex flex-column align-items-center gap-2">
    <Button icon="pi pi-file-excel" severity="success" rounded onClick={() => exportExcel(products)}/>
    <h3 className="m-0 text-center">MS Excel</h3>
  </div>
  <div className="flex-1 flex flex-column align-items-center gap-2">
    <Button icon="pi pi-file" severity="info" rounded onClick={() => exportCSV()}/>
    <h3 className="m-0 text-center">CSV</h3>
  </div>
  <div className="flex-1 flex flex-column align-items-center gap-2">
    <Button icon="pi pi-file-pdf" severity="warning" rounded onClick={() => exportPdf(exportColumns, products)}/>
    <h3 className="m-0 text-center">PDF</h3>
  </div>
</div>

            </Dialog>
        </div>
    )
}
