import { Router } from 'express';
import { getApplicants, createApplicant, updateApplicantStage, enrollApplicant, updateDocumentStatus, addAssessmentResult } from '../controllers/applicantController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

router.get('/', getApplicants);
router.post('/', createApplicant);
router.put('/:id/stage', updateApplicantStage);
router.post('/:id/enroll', enrollApplicant);
router.put('/:id/documents/:docId/status', updateDocumentStatus);
router.post('/:id/assessments', addAssessmentResult);

export default router;
