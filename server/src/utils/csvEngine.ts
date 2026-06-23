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

export const generateExcel = async (data: any[], sheetName = 'Data'): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  if (data && data.length > 0) {
    const headers = Object.keys(data[0]);
    worksheet.columns = headers.map(header => ({
      header: header.toUpperCase(),
      key: header,
      width: 20
    }));

    data.forEach(row => {
      worksheet.addRow(row);
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer as ArrayBuffer);
};
