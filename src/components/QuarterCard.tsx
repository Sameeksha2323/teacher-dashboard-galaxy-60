
import React, { useState, useEffect } from 'react';
import { QuarterCardProps, QuarterlyReport, WeeklyReport } from '@/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { fetchQuarterlyReporting, fetchWeeklyReporting } from '@/lib/supabase';
import ReportingTable from './ReportingTable';

const QuarterCard: React.FC<QuarterCardProps> = ({ 
  year, 
  quarter, 
  studentId, 
  expanded, 
  toggleExpand 
}) => {
  const [quarterlyReports, setQuarterlyReports] = useState<QuarterlyReport[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const startMonth = monthNames[quarter.startMonth - 1];
  const endMonth = monthNames[quarter.endMonth - 1];
  const title = `${startMonth} ${year} - ${endMonth} ${year}`;

  useEffect(() => {
    if (expanded) {
      loadReportData();
    }
  }, [expanded, year, quarter.id, studentId]);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      const quarterlyData = await fetchQuarterlyReporting(studentId, year, quarter.id);
      const weeklyData = await fetchWeeklyReporting(studentId, year, quarter.id);
      
      setQuarterlyReports(quarterlyData);
      setWeeklyReports(weeklyData);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuarterlyDataUpdate = (updatedData: QuarterlyReport[]) => {
    setQuarterlyReports(updatedData);
  };

  const handleWeeklyDataUpdate = (updatedData: WeeklyReport[]) => {
    setWeeklyReports(updatedData);
  };

  return (
    <div className={`ishanya-card transition-all duration-300 ease-in-out overflow-hidden ${expanded ? 'border-ishanya-green' : ''}`}>
      <div 
        className="flex items-center justify-between cursor-pointer p-2"
        onClick={toggleExpand}
      >
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Quarter {quarter.id}</span>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-ishanya-green" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 animate-fade-in">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse-slow h-20 w-full bg-gray-100 rounded"></div>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <h4 className="ishanya-section-title">Quarterly Reporting</h4>
                <ReportingTable 
                  data={quarterlyReports}
                  type="quarterly"
                  studentId={studentId}
                  year={year}
                  quarter={quarter.id}
                  onDataUpdate={handleQuarterlyDataUpdate}
                />
              </div>

              <div>
                <h4 className="ishanya-section-title">Weekly Reporting</h4>
                <ReportingTable 
                  data={weeklyReports}
                  type="weekly"
                  studentId={studentId}
                  year={year}
                  quarter={quarter.id}
                  onDataUpdate={handleWeeklyDataUpdate}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuarterCard;
