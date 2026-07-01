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

      // Header Banner
      doc.rect(0, 0, doc.page.width, 100).fill('#1e293b');
      doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text('DAILY OPERATIONS REPORT', 50, 35, { align: 'left' });
      doc.fillColor('#94a3b8').fontSize(12).font('Helvetica').text('EduXeno Command Center', 50, 65, { align: 'left' });
      doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, 50, 65, { align: 'right' });
      
      let currentY = 130;

      const drawSectionHeader = (title: string) => {
        doc.rect(50, currentY, doc.page.width - 100, 30).fill('#f8fafc');
        doc.rect(50, currentY, 4, 30).fill('#6366f1'); // Indigo accent line
        doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text(title, 65, currentY + 8);
        currentY += 45;
      };

      // Section: Overall Health
      drawSectionHeader('1. Overall Academic Health');
      doc.fillColor('#334155').fontSize(12).font('Helvetica').text(`System Health Score:`, 65, currentY);
      doc.fillColor('#10b981').font('Helvetica-Bold').text(`${data.healthScore || 'N/A'}/100`, 200, currentY);
      currentY += 20;
      doc.fillColor('#64748b').font('Helvetica').text(`Status: Optimal performance across all tracked metrics.`, 65, currentY);
      currentY += 40;

      // Section: Attendance
      drawSectionHeader('2. Attendance & Staffing');
      doc.fillColor('#334155').fontSize(12).font('Helvetica').text(`Student Attendance Rate:`, 65, currentY);
      doc.fillColor('#0f172a').font('Helvetica-Bold').text(`${data.attendanceRate || 'N/A'}%`, 220, currentY);
      currentY += 20;
      doc.fillColor('#334155').font('Helvetica').text(`Staff Attendance Rate:`, 65, currentY);
      doc.fillColor('#0f172a').font('Helvetica-Bold').text(`${data.staffAttendanceRate || 'N/A'}%`, 220, currentY);
      currentY += 40;

      // Section: Financial
      drawSectionHeader('3. Fee Collections (Today)');
      doc.fillColor('#334155').fontSize(12).font('Helvetica').text(`Total Collection:`, 65, currentY);
      doc.fillColor('#10b981').font('Helvetica-Bold').text(`Rs. ${data.feeCollection || '0'}`, 180, currentY);
      currentY += 20;
      doc.fillColor('#334155').font('Helvetica').text(`Active Transactions:`, 65, currentY);
      doc.fillColor('#0f172a').font('Helvetica-Bold').text(`${data.transactionCount || '0'}`, 180, currentY);
      currentY += 40;

      // Section: Alerts
      drawSectionHeader('4. Critical Alerts & Notifications');
      if (data.alerts && data.alerts.length > 0) {
        data.alerts.forEach((alert: any, idx: number) => {
          const isWarning = alert.severity === 'warning';
          doc.fillColor(isWarning ? '#f59e0b' : '#3b82f6').font('Helvetica-Bold').text(`[${alert.severity.toUpperCase()}]`, 65, currentY);
          doc.fillColor('#334155').font('Helvetica').text(alert.message, 140, currentY);
          currentY += 20;
        });
      } else {
        doc.fillColor('#10b981').font('Helvetica').text('No active alerts at this time. All systems green.', 65, currentY);
      }
      
      // Footer
      doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill('#f1f5f9');
      doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text('This is an electronically generated report by EduXeno Enterprise.', 0, doc.page.height - 30, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
