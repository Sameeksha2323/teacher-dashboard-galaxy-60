
export interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  gender: string;
  program_id: string;
  educator_employee_id: string;
  created_at?: string;
}

export interface Program {
  id: string;
  name: string;
}

export interface QuarterlyReport {
  id?: string;
  student_id: string;
  quarter: string;
  academic_progress: string;
  behavioral_notes: string;
  attendance_summary: string;
  goals_achieved: string;
  areas_for_improvement: string;
  teacher_comments: string;
  created_at?: string;
  updated_at?: string;
}

export interface WeeklyReport {
  id?: string;
  student_id: string;
  quarter: string;
  week_number: number;
  performance_score: number;
  attendance: string;
  participation: string;
  homework_completion: string;
  test_results: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

export interface QuarterInfo {
  id: number;
  name: string;
  startMonth: number;
  endMonth: number;
}

export interface QuarterCardProps {
  year: number;
  quarter: QuarterInfo;
  studentId: string;
  expanded: boolean;
  toggleExpand: () => void;
}

export interface TableColumn<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (info: { row: { original: T } }) => React.ReactNode;
}

// Create a union type for reports
export type ReportType = QuarterlyReport | WeeklyReport;
