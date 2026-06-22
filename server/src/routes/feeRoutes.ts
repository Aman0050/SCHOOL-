import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getStructures,
  createStructure,
  updateStructure,
  getAssignments,
  getStudentAssignment,
  createAssignment,
  bulkCreateAssignment,
  getCollections,
  createCollection,
  recordPayment,
  getReceipt,
  getReceiptPdf,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getFines,
  createFine,
  updateFine,
  getDiscounts,
  createDiscount,
  applyDiscount,
  getDueReport,
  getCollectionReport,
  getLedger,
  getDashboardStats,
} from '../controllers/feeController';

const router = Router();

// All fee routes require authentication
router.use(authenticate);

// Dashboard
router.get('/stats', getDashboardStats);

// Fee Categories
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.patch('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Fee Structures
router.get('/structures', getStructures);
router.post('/structures', createStructure);
router.patch('/structures/:id', updateStructure);

// Fee Assignments
router.get('/assignments', getAssignments);
router.get('/assignments/student/:studentId', getStudentAssignment);
router.post('/assignments', createAssignment);
router.post('/assignments/bulk', bulkCreateAssignment);

// Fee Collections
router.get('/collections', getCollections);
router.post('/collections', createCollection);
router.post('/collections/:id/payments', recordPayment);
router.get('/collections/:id/receipt', getReceipt);
router.get('/collections/:id/receipt/pdf', getReceiptPdf);

// Razorpay
router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

// Fines
router.get('/fines', getFines);
router.post('/fines', createFine);
router.patch('/fines/:id', updateFine);

// Discounts & Scholarships
router.get('/discounts', getDiscounts);
router.post('/discounts', createDiscount);
router.post('/discounts/apply', applyDiscount);

// Reports
router.get('/reports/due', getDueReport);
router.get('/reports/collection', getCollectionReport);
router.get('/reports/ledger/:studentId', getLedger);

export default router;
