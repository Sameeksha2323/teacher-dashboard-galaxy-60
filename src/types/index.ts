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
  assistance_required: string;
  any_behavioral_issues: string;
  preparedness: string;
  punctuality: string;
  parental_support: string;
  created_at?: string;
  updated_at?: string;
}

export interface WeeklyReport {
  id?: string;
  student_id: string;
  quarter: string;
  // Weekly data is stored in columns like 1_description, 1_score, etc.
  [key: string]: any;
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
