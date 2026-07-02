import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import ExcelJS from 'exceljs';

export const parseCSV = (fileBuffer: Buffer): any[] => {
  return parse(fileBuffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
};

export const generateCSV = (data: any[]): Buffer => {
  if (!data || data.length === 0) return Buffer.from('');
  return Buffer.from(stringify(data, { header: true }));
};

export const applyPremiumStyling = (
  worksheet: ExcelJS.Worksheet,
  title: string,
  subtitle: string | undefined,
  columns: { header: string; key: string; width?: number }[],
  data: any[]
) => {
  worksheet.views = [{ showGridLines: false }];
  const numColumns = columns.length;

  // Spacing
  worksheet.addRow([]);

  // Title Row
  const titleRow = worksheet.addRow([title]);
  titleRow.height = 35;
  worksheet.mergeCells(2, 1, 2, numColumns);
  titleRow.getCell(1).font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };

  // Subtitle
  let startDataRow = 4;
  if (subtitle) {
    const subtitleRow = worksheet.addRow([subtitle]);
    subtitleRow.height = 20;
    worksheet.mergeCells(3, 1, 3, numColumns);
    subtitleRow.getCell(1).font = { size: 10, italic: true, color: { argb: 'FF64748B' } };
    subtitleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    startDataRow = 5;
  }

  worksheet.addRow([]);

  // Setup columns
  columns.forEach((col, index) => {
    const colNumber = index + 1;
    worksheet.getColumn(colNumber).width = col.width || 20;
    worksheet.getColumn(colNumber).key = col.key;
  });

  // Headers
  const headerRow = worksheet.getRow(startDataRow);
  headerRow.values = columns.map(c => c.header);
  headerRow.height = 25;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF334155' } },
      bottom: { style: 'thin', color: { argb: 'FF334155' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      right: { style: 'thin', color: { argb: 'FF334155' } }
    };
  });

  // Add Data
  if (data && data.length > 0) {
    data.forEach((item, index) => {
      const rowValues = columns.map(col => item[col.key]);
      const row = worksheet.addRow(rowValues);
      const isEven = index % 2 === 0;
      
      row.eachCell((cell, colNumber) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF8FAFC' } };
        cell.font = { size: 11, color: { argb: 'FF334155' } };
        cell.alignment = { vertical: 'middle' };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };

        const stringVal = String(cell.value || '').toLowerCase();
        if (columns[colNumber - 1]?.key.toLowerCase().includes('status')) {
            cell.alignment = { ...cell.alignment, horizontal: 'center' };
            cell.font = { ...cell.font, bold: true };
            if (stringVal.includes('paid') || stringVal.includes('active')) {
                cell.font.color = { argb: 'FF10B981' };
            } else if (stringVal.includes('pending') || stringVal.includes('progress')) {
                cell.font.color = { argb: 'FFF59E0B' };
            } else if (stringVal.includes('failed') || stringVal.includes('overdue')) {
                cell.font.color = { argb: 'FFEF4444' };
            }
        }
      });
    });
  } else {
    const emptyRow = worksheet.addRow(['No data available']);
    worksheet.mergeCells(emptyRow.number, 1, emptyRow.number, numColumns);
    emptyRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    emptyRow.getCell(1).font = { italic: true, color: { argb: 'FF94A3B8' } };
  }
};

export const generateExcel = async (
  data: any[], 
  sheetName = 'Data', 
  title = 'Data Export',
  columns?: { header: string; key: string; width?: number }[]
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  let finalColumns = columns;
  if (!finalColumns && data.length > 0) {
    finalColumns = Object.keys(data[0]).map(key => ({ header: key.toUpperCase(), key, width: 20 }));
  }

  applyPremiumStyling(
    worksheet,
    title,
    `Generated on: ${new Date().toLocaleString()}`,
    finalColumns || [],
    data
  );

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer as ArrayBuffer);
};
