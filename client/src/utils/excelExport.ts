import * as XLSX from 'xlsx';

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
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Create an array of arrays for the sheet data
  const sheetData: any[][] = [];

  // Title Row
  sheetData.push([title]);
  
  // Subtitle Row
  if (subtitle) {
    sheetData.push([subtitle]);
  }
  
  // Empty row
  sheetData.push([]);

  // Headers
  const headerRow = columns.map(c => c.header);
  sheetData.push(headerRow);

  // Data rows
  if (data && data.length > 0) {
    data.forEach(item => {
      const row = columns.map(c => item[c.key]);
      sheetData.push(row);
    });
  } else {
    sheetData.push(['No data available']);
  }

  // Convert array of arrays to sheet
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths
  ws['!cols'] = columns.map(c => ({ wch: c.width || 20 }));

  // Append sheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));

  // Generate file and download
  XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
};
