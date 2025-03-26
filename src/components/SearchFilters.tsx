
import React, { useEffect, useState } from 'react';
import { fetchProgramsList } from '@/lib/supabase';
import { Program } from '@/types';
import { Search } from 'lucide-react';

interface SearchFiltersProps {
  onSearchChange: (value: string) => void;
  onProgramFilterChange: (value: string) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ 
  onSearchChange, 
  onProgramFilterChange 
}) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPrograms() {
      setIsLoading(true);
      const programsData = await fetchProgramsList();
      setPrograms(programsData);
      setIsLoading(false);
    }

    loadPrograms();
  }, []);

  return (
    <div className="w-full bg-white shadow-sm border border-ishanya-border rounded-lg p-4 mb-6 animate-slide-up">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="search"
            className="ishanya-input w-full pl-10"
            placeholder="Search students by name..."
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-64">
          <select
            className="ishanya-input w-full appearance-none"
            onChange={(e) => onProgramFilterChange(e.target.value)}
            disabled={isLoading}
          >
            <option value="">All Programs</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
