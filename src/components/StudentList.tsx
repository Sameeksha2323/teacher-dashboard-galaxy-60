
import React from 'react';
import { Student } from '@/types';
import StudentCard from './StudentCard';

interface StudentListProps {
  students: Student[];
  isLoading: boolean;
}

const StudentList: React.FC<StudentListProps> = ({ students, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[...Array(3)].map((_, index) => (
          <div 
            key={index} 
            className="ishanya-card animate-pulse-slow h-24"
          ></div>
        ))}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="ishanya-card flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-gray-900">No students found</p>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {students.map((student) => (
        <StudentCard key={student.student_id} student={student} />
      ))}
    </div>
  );
};

export default StudentList;
