import { Router } from 'express';
import { getApplicants, createApplicant, updateApplicantStage, enrollApplicant, updateDocumentStatus, addAssessmentResult, uploadApplicantDocument } from '../controllers/applicantController';
import { authenticate } from '../middlewares/auth';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'applicant-docs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(4).toString('hex');
    cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // 10MB
});

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

router.get('/', getApplicants);
router.post('/', createApplicant);
router.put('/:id/stage', updateApplicantStage);
router.post('/:id/enroll', enrollApplicant);
router.put('/:id/documents/:docId/status', updateDocumentStatus);
router.post('/:id/assessments', addAssessmentResult);
router.post('/:id/documents', upload.single('file'), uploadApplicantDocument);

export default router;
