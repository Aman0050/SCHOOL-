import { Router } from 'express';
import { authenticate, authorizeRoles, SystemRole } from '../middlewares/auth';
import {
  getSessions, createSession, updateSession,
  getTerms, createTerm,
  getSubjects, createSubject, mapSubjectToClass,
  getExams, createExam, getExam, updateExam, publishExam,
  getMarksForExam, saveMarksEntry, bulkSaveMarks, lockMarks, submitMarks,
  getGradeConfigs, createGradeConfig,
  computeResults, getResults, getReportCard, getRankings,
  getAnalyticsOverview, getStudentAnalytics, getDashboardStats,
} from '../controllers/examController';

const router = Router();
router.use(authenticate);

// Dashboard
router.get('/stats', getDashboardStats);

// Academic Sessions
router.get('/sessions', getSessions);
router.post('/sessions', authorizeRoles(SystemRole.SCHOOL_ADMIN), createSession);
router.patch('/sessions/:id', authorizeRoles(SystemRole.SCHOOL_ADMIN), updateSession);

// Exam Terms
router.get('/terms', getTerms);
router.post('/terms', authorizeRoles(SystemRole.SCHOOL_ADMIN), createTerm);

// Exam Subjects
router.get('/subjects', getSubjects);
router.post('/subjects', authorizeRoles(SystemRole.SCHOOL_ADMIN), createSubject);
router.post('/subjects/map', authorizeRoles(SystemRole.SCHOOL_ADMIN), mapSubjectToClass);

// Grade Config
router.get('/grade-configs', getGradeConfigs);
router.post('/grade-configs', authorizeRoles(SystemRole.SCHOOL_ADMIN), createGradeConfig);

// Analytics
router.get('/analytics/overview', authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER), getAnalyticsOverview);
router.get('/analytics/student/:studentId', getStudentAnalytics);

// Exams
router.get('/', getExams);
router.post('/', authorizeRoles(SystemRole.SCHOOL_ADMIN), createExam);
router.get('/:id', getExam);
router.patch('/:id', authorizeRoles(SystemRole.SCHOOL_ADMIN), updateExam);
router.post('/:id/publish', authorizeRoles(SystemRole.SCHOOL_ADMIN), publishExam);

// Marks
router.get('/:id/marks', authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER), getMarksForExam);
router.post('/:id/marks', authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER), saveMarksEntry);
router.post('/:id/marks/bulk', authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER), bulkSaveMarks);
router.post('/:id/marks/submit', authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER), submitMarks);
router.post('/:id/marks/lock', authorizeRoles(SystemRole.SCHOOL_ADMIN), lockMarks);

// Results
router.post('/:id/compute', authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER), computeResults);
router.get('/:id/results', getResults);
router.get('/:id/rankings', getRankings);
router.get('/:id/report-card/:studentId', getReportCard);

export default router;
