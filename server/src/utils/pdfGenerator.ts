import PDFDocument from 'pdfkit';

export const generateReceiptPdfBuffer = async (collection: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(20).text('FEE RECEIPT', { align: 'center' });
      doc.moveDown();
      
      // School Info
      doc.fontSize(14).text('Acme International School', { align: 'center' });
      doc.fontSize(10).text('123 Education Lane, Learning City', { align: 'center' });
      doc.moveDown(2);

      // Receipt Details
      doc.fontSize(12).text(`Receipt No: ${collection.receiptNumber}`);
      doc.text(`Date: ${new Date(collection.createdAt).toLocaleDateString()}`);
      doc.text(`Status: ${collection.status}`);
      doc.moveDown();

      // Student Info
      const admissionNum = collection.student.admission?.admissionNumber || collection.student.id.substring(0,8);
      doc.text(`Student ID: ${admissionNum}`);
      doc.text(`Name: ${collection.student.firstName} ${collection.student.lastName}`);
      doc.moveDown(2);

      // Payment Summary
      doc.fontSize(14).text('Payment Summary', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Total Amount: ${collection.totalAmount}`);
      doc.text(`Paid Amount: ${collection.paidAmount}`);
      doc.text(`Balance Due: ${Math.max(0, collection.totalAmount - collection.paidAmount)}`);
      doc.moveDown(2);

      // Transactions
      if (collection.payments && collection.payments.length > 0) {
        doc.fontSize(14).text('Transactions', { underline: true });
        doc.moveDown();
        collection.payments.forEach((p: any, idx: number) => {
           doc.fontSize(10).text(`${idx + 1}. Date: ${new Date(p.createdAt).toLocaleDateString()} | Method: ${p.method} | Amount: ${p.amount} | Ref: ${p.transactionId || 'N/A'}`);
        });
      }

      doc.moveDown(3);
      doc.fontSize(10).text('This is an electronically generated receipt.', { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export const generateDailyReportPdfBuffer = async (data: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('DAILY OPERATIONS REPORT', { align: 'center' });
      doc.moveDown(0.5);
      
      // School Info
      doc.fontSize(14).font('Helvetica').text('EduXeno Command Center', { align: 'center' });
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      // Section: Overall Health
      doc.fontSize(16).font('Helvetica-Bold').text('1. Overall Academic Health', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').text(`System Health Score: ${data.healthScore || 'N/A'}/100`);
      doc.text(`Status: Optimal performance across all tracked metrics.`);
      doc.moveDown(1.5);

      // Section: Attendance
      doc.fontSize(16).font('Helvetica-Bold').text('2. Attendance & Staffing', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').text(`Student Attendance Rate: ${data.attendanceRate || 'N/A'}%`);
      doc.text(`Staff Attendance Rate: ${data.staffAttendanceRate || 'N/A'}%`);
      doc.moveDown(1.5);

      // Section: Financial
      doc.fontSize(16).font('Helvetica-Bold').text('3. Fee Collections', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').text(`Today's Collection: $${data.feeCollection || '0'}`);
      doc.text(`Active Transactions: ${data.transactionCount || '0'}`);
      doc.moveDown(1.5);

      // Section: Alerts
      doc.fontSize(16).font('Helvetica-Bold').text('4. Critical Alerts & Notifications', { underline: true });
      doc.moveDown(0.5);
      if (data.alerts && data.alerts.length > 0) {
        data.alerts.forEach((alert: any, idx: number) => {
          doc.fontSize(12).font('Helvetica').text(`${idx + 1}. [${alert.severity.toUpperCase()}] ${alert.message}`);
        });
      } else {
        doc.fontSize(12).font('Helvetica').text('No active alerts at this time. All systems green.');
      }
      
      doc.moveDown(3);
      doc.fontSize(10).fillColor('gray').text('This is an electronically generated report by EduXeno Enterprise.', { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
