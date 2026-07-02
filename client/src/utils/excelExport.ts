import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExportToExcelOptions {
  filename: string;
  sheetName?: string;
  title: string;
  subtitle?: string;
  data: any[];
  columns: ExcelColumn[];
}

export const exportToExcel = async ({
  filename,
  sheetName = 'Data',
  title,
  subtitle,
  data,
  columns,
}: ExportToExcelOptions) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: false }] // Clean look
  });

  // Calculate total columns width for title spanning
  const numColumns = columns.length;

  // Add empty row for spacing
  worksheet.addRow([]);

  // Title Row
  const titleRow = worksheet.addRow([title]);
  titleRow.height = 35;
  worksheet.mergeCells(2, 1, 2, numColumns);
  titleRow.getCell(1).font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }; // slate-900
  titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };

  // Subtitle Row
  let startDataRow = 4;
  if (subtitle) {
    const subtitleRow = worksheet.addRow([subtitle]);
    subtitleRow.height = 20;
    worksheet.mergeCells(3, 1, 3, numColumns);
    subtitleRow.getCell(1).font = { size: 10, italic: true, color: { argb: 'FF64748B' } }; // slate-500
    subtitleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    startDataRow = 5;
  }

  // Add another empty row before headers
  worksheet.addRow([]);

  // Setup columns
  columns.forEach((col, index) => {
    const colNumber = index + 1;
    worksheet.getColumn(colNumber).width = col.width || 20;
    worksheet.getColumn(colNumber).key = col.key;
  });

  // Style Header Row
  const headerRow = worksheet.getRow(startDataRow);
  headerRow.values = columns.map(c => c.header);
  headerRow.height = 25;
  headerRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }; // slate-800
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    // Borders
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF334155' } },
      bottom: { style: 'thin', color: { argb: 'FF334155' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      right: { style: 'thin', color: { argb: 'FF334155' } }
    };
  });

  // Add Data Rows
  if (data && data.length > 0) {
    data.forEach((item, index) => {
      const rowValues = columns.map(col => item[col.key]);
      const row = worksheet.addRow(rowValues);
      const isEven = index % 2 === 0;
      
      row.eachCell((cell, colNumber) => {
        // Zebra striping
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF8FAFC' } // white or slate-50
        };
        cell.font = { size: 11, color: { argb: 'FF334155' } }; // slate-700
        cell.alignment = { vertical: 'middle' };
        
        // Borders
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }, // slate-200
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };

        // Custom formatting based on content
        if (typeof cell.value === 'number' && columns[colNumber - 1]?.key.toLowerCase().includes('amount')) {
          cell.numFmt = '₹#,##0.00';
          cell.alignment = { ...cell.alignment, horizontal: 'right' };
        }

        // Color badges for status
        const stringVal = String(cell.value || '').toLowerCase();
        if (columns[colNumber - 1]?.key.toLowerCase().includes('status')) {
            cell.alignment = { ...cell.alignment, horizontal: 'center' };
            cell.font = { ...cell.font, bold: true };
            if (stringVal.includes('paid') || stringVal.includes('active') || stringVal.includes('resolved') || stringVal.includes('closed') || stringVal.includes('good') || stringVal.includes('excellent')) {
                cell.font.color = { argb: 'FF10B981' }; // emerald-500
            } else if (stringVal.includes('pending') || stringVal.includes('progress') || stringVal.includes('warning') || stringVal.includes('new')) {
                cell.font.color = { argb: 'FFF59E0B' }; // amber-500
            } else if (stringVal.includes('failed') || stringVal.includes('overdue') || stringVal.includes('critical') || stringVal.includes('error')) {
                cell.font.color = { argb: 'FFEF4444' }; // red-500
            }
        }
      });
    });
  } else {
    // No data row
    const emptyRow = worksheet.addRow(['No data available']);
    worksheet.mergeCells(emptyRow.number, 1, emptyRow.number, numColumns);
    emptyRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    emptyRow.getCell(1).font = { italic: true, color: { argb: 'FF94A3B8' } };
  }

  // Generate and save file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
};
