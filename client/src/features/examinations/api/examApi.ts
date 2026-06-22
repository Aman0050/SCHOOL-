import { api } from '../../../lib/api';
import type { 
  Exam, ExamSubject, AcademicSession, ExamTerm, 
  MarksEntry, GradeConfig, StudentResult, StudentRanking, DashboardStats
} from '../types/exam.types';

export const examApi = {
  // Dashboard
  getDashboardStats: () => api.get<{ success: boolean; data: DashboardStats }>('/examinations/stats').then(res => res.data.data),

  // Academic Sessions
  getSessions: () => api.get<{ success: boolean; data: AcademicSession[] }>('/examinations/sessions').then(res => res.data.data),
  createSession: (data: Partial<AcademicSession>) => api.post('/examinations/sessions', data).then(res => res.data.data),
  updateSession: (id: string, data: Partial<AcademicSession>) => api.patch(`/examinations/sessions/${id}`, data).then(res => res.data.data),

  // Exam Terms
  getTerms: (sessionId?: string) => api.get<{ success: boolean; data: ExamTerm[] }>('/examinations/terms', { params: { sessionId } }).then(res => res.data.data),
  createTerm: (data: Partial<ExamTerm>) => api.post('/examinations/terms', data).then(res => res.data.data),

  // Exam Subjects
  getSubjects: (classId?: string, boardType?: string) => api.get<{ success: boolean; data: ExamSubject[] }>('/examinations/subjects', { params: { classId, boardType } }).then(res => res.data.data),
  createSubject: (data: Partial<ExamSubject>) => api.post('/examinations/subjects', data).then(res => res.data.data),
  mapSubjectToClass: (data: { classId: string; subjectId: string; isElective?: boolean; isOptional?: boolean }) => api.post('/examinations/subjects/map', data).then(res => res.data.data),

  // Grade Configs
  getGradeConfigs: () => api.get<{ success: boolean; data: GradeConfig[] }>('/examinations/grade-configs').then(res => res.data.data),
  createGradeConfig: (data: Partial<GradeConfig>) => api.post('/examinations/grade-configs', data).then(res => res.data.data),

  // Exams
  getExams: (params?: { sessionId?: string; classId?: string; status?: string; examType?: string }) => api.get<{ success: boolean; data: Exam[] }>('/examinations', { params }).then(res => res.data.data),
  getExam: (id: string) => api.get<{ success: boolean; data: Exam }>(`/examinations/${id}`).then(res => res.data.data),
  createExam: (data: Partial<Exam> & { subjects?: any[] }) => api.post('/examinations', data).then(res => res.data.data),
  updateExam: (id: string, data: Partial<Exam>) => api.patch(`/examinations/${id}`, data).then(res => res.data.data),
  publishExam: (id: string) => api.post(`/examinations/${id}/publish`).then(res => res.data.data),

  // Marks Entry
  getMarksForExam: (examId: string, subjectId?: string) => api.get<{ success: boolean; data: MarksEntry[] }>(`/examinations/${examId}/marks`, { params: { subjectId } }).then(res => res.data.data),
  saveMarksEntry: (examId: string, data: Partial<MarksEntry>) => api.post(`/examinations/${examId}/marks`, data).then(res => res.data.data),
  bulkSaveMarks: (examId: string, entries: Partial<MarksEntry>[]) => api.post(`/examinations/${examId}/marks/bulk`, { entries }).then(res => res.data.data),
  lockMarks: (examId: string, subjectId?: string) => api.post(`/examinations/${examId}/marks/lock`, { subjectId }).then(res => res.data.data),
  submitMarks: (examId: string, subjectId?: string) => api.post(`/examinations/${examId}/marks/submit`, { subjectId }).then(res => res.data.data),

  // Results
  computeResults: (examId: string, gradeConfigId?: string) => api.post(`/examinations/${examId}/compute`, { gradeConfigId }).then(res => res.data.data),
  getResults: (examId: string) => api.get<{ success: boolean; data: StudentResult[] }>(`/examinations/${examId}/results`).then(res => res.data.data),
  getRankings: (examId: string) => api.get<{ success: boolean; data: StudentRanking[] }>(`/examinations/${examId}/rankings`).then(res => res.data.data),
  getReportCard: (examId: string, studentId: string) => api.get<{ success: boolean; data: any }>(`/examinations/${examId}/report-card/${studentId}`).then(res => res.data.data),

  // Analytics
  getAnalyticsOverview: (params?: { sessionId?: string; classId?: string }) => api.get<{ success: boolean; data: any }>('/examinations/analytics/overview', { params }).then(res => res.data.data),
  getStudentAnalytics: (studentId: string) => api.get<{ success: boolean; data: any }>(`/examinations/analytics/student/${studentId}`).then(res => res.data.data),
};
