
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchStudentsByTeacher } from '@/lib/supabase';
import Header from '@/components/Header';
import SearchFilters from '@/components/SearchFilters';
import StudentList from '@/components/StudentList';
import { Student } from '@/types';
import { toast } from 'sonner';

const Index = () => {
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
  
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!educatorId) {
      toast.error('Educator ID is required');
      setIsLoading(false);
      return;
    }
    
    loadStudents();
  }, [educatorId]);

  useEffect(() => {
    filterStudents();
  }, [students, searchQuery, programFilter]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const data = await fetchStudentsByTeacher(educatorId);
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        student => 
          student.first_name.toLowerCase().includes(query) || 
          student.last_name.toLowerCase().includes(query)
      );
    }
    
    if (programFilter) {
      filtered = filtered.filter(student => student.program_id === programFilter);
    }
    
    setFilteredStudents(filtered);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleProgramFilterChange = (value: string) => {
    setProgramFilter(value);
  };

  return (
    <div className="min-h-screen bg-ishanya-gray">
      <Header title="Ishanya Teacher Reporting Dashboard" />
      
      <main className="container mx-auto py-8 px-4">
        {/* 
          DEPLOYMENT NOTE: You can add a visible indicator here to show which
          educator is currently logged in, using something like:
          <div className="mb-4 p-2 bg-yellow-100 rounded">
            Educator ID: {educatorId}
          </div>
        */}
        <SearchFilters
          onSearchChange={handleSearchChange}
          onProgramFilterChange={handleProgramFilterChange}
        />
        
        <StudentList 
          students={filteredStudents}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
};

export default Index;
