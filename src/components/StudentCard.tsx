
import React from 'react';
import { Student } from '@/types';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

interface StudentCardProps {
  student: Student;
}

const StudentCard: React.FC<StudentCardProps> = ({ student }) => {
  return (
    <Link 
      to={`/student/${student.student_id}`}
      className="block w-full animate-slide-up delay-100"
    >
      <div className="ishanya-card hover:border-ishanya-green group">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-ishanya-light-green flex items-center justify-center text-ishanya-green">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 group-hover:text-ishanya-green">
                {student.first_name} {student.last_name}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="ishanya-tag">ID: {student.student_id}</span>
                <span className="text-xs text-gray-500">{student.gender}</span>
              </div>
            </div>
          </div>
          <div>
            <span className="ishanya-tag">
              Program: {student.program_id}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StudentCard;
