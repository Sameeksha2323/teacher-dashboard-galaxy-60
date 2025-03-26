
import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import { fetchStudentById } from '@/lib/supabase';
import { Student, QuarterInfo } from '@/types';
import { ArrowLeft, User } from 'lucide-react';
import QuarterCard from '@/components/QuarterCard';
import { Button } from '@/components/ui/button';

const quarters: QuarterInfo[] = [
  { id: 1, name: 'Q1', startMonth: 1, endMonth: 3 },
  { id: 2, name: 'Q2', startMonth: 4, endMonth: 6 },
  { id: 3, name: 'Q3', startMonth: 7, endMonth: 9 },
  { id: 4, name: 'Q4', startMonth: 10, endMonth: 12 },
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear + i - 1);

const StudentDetail = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [searchParams] = useSearchParams();
  
  // =========================================================
  // IMPORTANT: BEFORE DEPLOYMENT
  // Remove the hardcoded '61' below and use only the commented line
  // to get the educator_employee_id from URL parameters when this
  // application is embedded or linked from another site.
  // =========================================================
  // const educatorId = searchParams.get('educator_employee_id') || '';
  const educatorId = searchParams.get('educator_employee_id') || '61';
  // =========================================================
  
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [expandedQuarter, setExpandedQuarter] = useState<number | null>(null);

  useEffect(() => {
    loadStudentData();
  }, [studentId, educatorId]);

  const loadStudentData = async () => {
    if (!studentId) return;
    
    setIsLoading(true);
    try {
      // Use the new fetchStudentById function with educator ID
      const studentData = await fetchStudentById(studentId, educatorId);
      
      if (studentData) {
        setStudent(studentData);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const toggleQuarterExpand = (quarterId: number) => {
    if (expandedQuarter === quarterId) {
      setExpandedQuarter(null);
    } else {
      setExpandedQuarter(quarterId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ishanya-gray">
        <Header title="Ishanya Teacher Reporting Dashboard" />
        <main className="container mx-auto py-8 px-4">
          <div className="ishanya-card h-40 animate-pulse-slow"></div>
        </main>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-ishanya-gray">
        <Header title="Ishanya Teacher Reporting Dashboard" />
        <main className="container mx-auto py-8 px-4">
          <div className="ishanya-card text-center py-12">
            <p className="text-lg font-medium">Student not found</p>
            <Link to="/" className="mt-4 inline-block text-ishanya-green hover:underline">
              Return to dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ishanya-gray">
      <Header title="Ishanya Teacher Reporting Dashboard" />
      
      <main className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-ishanya-green hover:text-ishanya-hover transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>
        
        {isLoading ? (
          <div className="ishanya-card h-40 animate-pulse-slow"></div>
        ) : !student ? (
          <div className="ishanya-card text-center py-12">
            <p className="text-lg font-medium">Student not found</p>
            <Link to="/" className="mt-4 inline-block text-ishanya-green hover:underline">
              Return to dashboard
            </Link>
          </div>
        ) : (
          <>
            <div className="ishanya-card mb-6 animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-ishanya-light-green flex items-center justify-center text-ishanya-green">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {student.first_name} {student.last_name}
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="ishanya-tag">ID: {student.student_id}</span>
                    <span className="ishanya-tag">{student.gender}</span>
                    <span className="ishanya-tag">Program: {student.program_id}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6 flex items-center justify-between animate-slide-up">
              <h2 className="text-xl font-semibold text-gray-900">Quarterly Reports</h2>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Select Year:</span>
                <div className="flex space-x-1">
                  {yearOptions.map((year) => (
                    <Button
                      key={year}
                      variant={selectedYear === year ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleYearChange(year)}
                      className={selectedYear === year ? "bg-ishanya-green hover:bg-ishanya-hover" : ""}
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 animate-slide-up">
              {quarters.map((quarter) => (
                <QuarterCard
                  key={quarter.id}
                  year={selectedYear}
                  quarter={quarter}
                  studentId={student.student_id}
                  expanded={expandedQuarter === quarter.id}
                  toggleExpand={() => toggleQuarterExpand(quarter.id)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default StudentDetail;
