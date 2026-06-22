export type ExamType = 'UNIT_TEST' | 'MONTHLY_TEST' | 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUAL' | 'PRE_BOARD' | 'BOARD' | 'PRACTICAL' | 'VIVA' | 'INTERNAL';
export type ExamStatus = 'DRAFT' | 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'PUBLISHED';
export type ExamSubjectType = 'THEORY' | 'PRACTICAL' | 'BOTH' | 'VIVA';
export type BoardType = 'CBSE' | 'ICSE' | 'STATE_BOARD' | 'INTERNATIONAL' | 'CUSTOM';
export type GradeSystemType = 'PERCENTAGE' | 'GRADE' | 'GPA' | 'CGPA' | 'CUSTOM';
export type MarksEntryStatus = 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'LOCKED';
export type RankBasis = 'PERCENTAGE' | 'TOTAL_MARKS' | 'GRADE_POINTS';

export interface AcademicSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  terms?: ExamTerm[];
  school?: { name: string };
}

export interface ExamTerm {
  id: string;
  sessionId: string;
  name: string;
  startDate: string;
  endDate: string;
  weightagePercent: number;
  session?: { name: string };
}

export interface ExamSubject {
  id: string;
  code: string;
  name: string;
  subjectType: ExamSubjectType;
  theoryMaxMarks: number;
  practicalMaxMarks: number;
  totalMaxMarks: number;
  theoryPassMarks: number;
  practicalPassMarks: number;
  boardType: BoardType;
  isElective: boolean;
  isOptional: boolean;
  isActive: boolean;
}

export interface Exam {
  id: string;
  sessionId: string;
  termId?: string;
  classId: string;
  name: string;
  examType: ExamType;
  status: ExamStatus;
  startDate: string;
  endDate: string;
  weightage: number;
  passingCriteria: number;
  boardType: BoardType;
  gradeSystem: GradeSystemType;
  publishedAt?: string;
  remarks?: string;
  session?: { name: string };
  term?: { name: string };
  class?: { name: string; section?: string };
  schedules?: ExamSubjectSchedule[];
  _count?: { marksEntries: number; studentResults: number; reportCards?: number };
}

export interface ExamSubjectSchedule {
  id: string;
  examId: string;
  subjectId: string;
  examDate: string;
  startTime?: string;
  endTime?: string;
  maxMarks: number;
  passingMarks: number;
  practicalMaxMarks: number;
  subject?: ExamSubject;
}

export interface MarksEntry {
  id: string;
  examId: string;
  subjectId: string;
  studentId: string;
  theoryMarks?: number;
  practicalMarks?: number;
  totalMarks?: number;
  isAbsent: boolean;
  grade?: string;
  gradePoint?: number;
  remarks?: string;
  entryStatus: MarksEntryStatus;
  student?: { id: string; firstName: string; lastName: string; admission?: { admissionNumber: string } };
  subject?: ExamSubject;
}

export interface GradeRule {
  id: string;
  configId: string;
  label: string;
  minPercent: number;
  maxPercent: number;
  gradePoint: number;
  description?: string;
  isPassing: boolean;
}

export interface GradeConfig {
  id: string;
  name: string;
  boardType: BoardType;
  systemType: GradeSystemType;
  isDefault: boolean;
  isActive: boolean;
  rules?: GradeRule[];
}

export interface StudentResult {
  id: string;
  examId: string;
  studentId: string;
  subjectId?: string;
  totalMarksObtained: number;
  totalMaxMarks: number;
  percentage: number;
  grade?: string;
  gradePoint?: number;
  cgpa?: number;
  isPassed: boolean;
  isAbsent: boolean;
  failedSubjects: number;
  classRank?: number;
  student?: { id: string; firstName: string; lastName: string; admission?: { admissionNumber: string } };
}

export interface StudentRanking {
  id: string;
  examId: string;
  studentId: string;
  classRank?: number;
  percentage: number;
  rankBasis: RankBasis;
  student?: { id: string; firstName: string; lastName: string; admission?: { admissionNumber: string } };
}

export interface DashboardStats {
  totalExams: number;
  publishedExams: number;
  pendingMarks: number;
  totalResults: number;
}
