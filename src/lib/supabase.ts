import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabaseUrl = 'https://nizvcdssajfpjtncbojx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5penZjZHNzYWpmcGp0bmNib2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTU0ODksImV4cCI6MjA1ODE5MTQ4OX0.5b2Yzfzzzz-C8S6iqhG3SinKszlgjdd4NUxogWIxCLc';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchStudentsByTeacher(educatorId: string, searchQuery = '', programId = '') {
  try {
    let query = supabase
      .from('students')
      .select('*');
      
    // Only apply the educator filter if it's provided
    if (educatorId) {
      query = query.eq('educator_employee_id', educatorId);
    }

    if (searchQuery) {
      query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`);
    }

    if (programId) {
      query = query.eq('program_id', programId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchStudentsByTeacher:', error);
    toast.error('An unexpected error occurred');
    return [];
  }
}

export async function fetchStudentById(studentId: string, educatorId = '61') {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', studentId)
      .eq('educator_employee_id', educatorId)
      .single();

    if (error) {
      console.error('Error fetching student details:', error);
      toast.error('Failed to fetch student details');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchStudentById:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
}

export async function fetchProgramsList() {
  try {
    const { data, error } = await supabase
      .from('programs')
      .select('id, name');

    if (error) {
      console.error('Error fetching programs:', error);
      toast.error('Failed to fetch programs');
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchProgramsList:', error);
    toast.error('An unexpected error occurred');
    return [];
  }
}

export async function fetchQuarterlyReporting(studentId: string, year: number, quarter: number) {
  try {
    const { data, error } = await supabase
      .from('general_reporting')
      .select('*')
      .eq('student_id', studentId)
      .eq('quarter', `Quarter ${quarter}`);

    if (error) {
      console.error('Error fetching quarterly reporting:', error);
      toast.error('Failed to fetch quarterly reporting');
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchQuarterlyReporting:', error);
    toast.error('An unexpected error occurred');
    return [];
  }
}

export async function fetchWeeklyReporting(studentId: string, year: number, quarter: number) {
  try {
    const { data, error } = await supabase
      .from('performance_records')
      .select('*')
      .eq('student_id', studentId)
      .eq('quarter', `Quarter ${quarter}`);

    if (error) {
      console.error('Error fetching weekly reporting:', error);
      toast.error('Failed to fetch weekly reporting');
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchWeeklyReporting:', error);
    toast.error('An unexpected error occurred');
    return [];
  }
}

export async function updateQuarterlyReporting(reportData: any) {
  try {
    // Ensure we're only sending relevant fields to the general_reporting table
    const cleanedData = reportData.map((item: any) => ({
      id: item.id, // Include ID if it exists for updates
      student_id: item.student_id,
      quarter: item.quarter,
      assistance_required: item.assistance_required,
      any_behavioral_issues: item.any_behavioral_issues,
      preparedness: item.preparedness,
      punctuality: item.punctuality,
      parental_support: item.parental_support,
      // Add any additional required fields
      program_id: item.program_id || 1, // Default value if not provided
      educator_employee_id: item.educator_employee_id || 61 // Default value if not provided
    }));

    const { data, error } = await supabase
      .from('general_reporting')
      .upsert(cleanedData)
      .select();

    if (error) {
      console.error('Error updating quarterly reporting:', error);
      toast.error('Failed to update quarterly reporting');
      return null;
    }

    toast.success('Quarterly reporting updated successfully');
    return data;
  } catch (error) {
    console.error('Error in updateQuarterlyReporting:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
}

export async function updateWeeklyReporting(reportData: any) {
  try {
    // For weekly reporting, we need to ensure we're updating the performance_records table correctly
    const { data, error } = await supabase
      .from('performance_records')
      .upsert(reportData)
      .select();

    if (error) {
      console.error('Error updating weekly reporting:', error);
      toast.error('Failed to update weekly reporting');
      return null;
    }

    toast.success('Weekly reporting updated successfully');
    return data;
  } catch (error) {
    console.error('Error in updateWeeklyReporting:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
}

export default supabase;
