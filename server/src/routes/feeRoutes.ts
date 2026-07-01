import { Router } from 'express';
import { authenticate, authorizeRoles, SystemRole } from '../middlewares/auth';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getStructures,
  createStructure,
  updateStructure,
  deleteStructure,
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

const adminAccountantOnly = authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.ACCOUNTANT);

// Dashboard
router.get('/stats', adminAccountantOnly, getDashboardStats);

// Fee Categories
router.get('/categories', getCategories); // Open to all authenticated to view
router.post('/categories', adminAccountantOnly, createCategory);
router.patch('/categories/:id', adminAccountantOnly, updateCategory);
router.delete('/categories/:id', adminAccountantOnly, deleteCategory);

// Fee Structures
router.get('/structures', getStructures);
router.post('/structures', adminAccountantOnly, createStructure);
router.patch('/structures/:id', adminAccountantOnly, updateStructure);
router.delete('/structures/:id', adminAccountantOnly, deleteStructure);

// Fee Assignments
router.get('/assignments', adminAccountantOnly, getAssignments); // Admins see all
router.get('/assignments/student/:studentId', getStudentAssignment); // Students see their own (controller must enforce this later)
router.post('/assignments', adminAccountantOnly, createAssignment);
router.post('/assignments/bulk', adminAccountantOnly, bulkCreateAssignment);

// Fee Collections
router.get('/collections', getCollections);
router.post('/collections', adminAccountantOnly, createCollection);
router.post('/collections/:id/payments', adminAccountantOnly, recordPayment);
router.get('/collections/:id/receipt', getReceipt);
router.get('/collections/:id/receipt/pdf', getReceiptPdf);

// Razorpay (open to student for their own payments)
router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

// Fines
router.get('/fines', getFines);
router.post('/fines', adminAccountantOnly, createFine);
router.patch('/fines/:id', adminAccountantOnly, updateFine);

// Discounts & Scholarships
router.get('/discounts', getDiscounts);
router.post('/discounts', adminAccountantOnly, createDiscount);
router.post('/discounts/apply', adminAccountantOnly, applyDiscount);

// Reports
router.get('/reports/due', adminAccountantOnly, getDueReport);
router.get('/reports/collection', adminAccountantOnly, getCollectionReport);
router.get('/reports/ledger/:studentId', getLedger);

export default router;
