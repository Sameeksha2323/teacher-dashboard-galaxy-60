
import React, { useState } from 'react';
import { QuarterlyReport, WeeklyReport, TableColumn, ReportType } from '@/types';
import EditableTable from './EditableTable';
import { updateQuarterlyReporting, updateWeeklyReporting } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Pencil, Save, X } from 'lucide-react';

interface ReportingTableProps {
  data: QuarterlyReport[] | WeeklyReport[];
  type: 'quarterly' | 'weekly';
  studentId: string;
  year: number;
  quarter: number;
  onDataUpdate: (data: any[]) => void;
}

const ReportingTable: React.FC<ReportingTableProps> = ({
  data,
  type,
  studentId,
  year,
  quarter,
  onDataUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<QuarterlyReport[] | WeeklyReport[]>([]);

  const quarterlyColumns: TableColumn<QuarterlyReport>[] = [
    { header: 'Academic Progress', accessorKey: 'academic_progress' },
    { header: 'Behavioral Notes', accessorKey: 'behavioral_notes' },
    { header: 'Attendance Summary', accessorKey: 'attendance_summary' },
    { header: 'Goals Achieved', accessorKey: 'goals_achieved' },
    { header: 'Areas for Improvement', accessorKey: 'areas_for_improvement' },
    { header: 'Teacher Comments', accessorKey: 'teacher_comments' },
  ];

  const weeklyColumns: TableColumn<WeeklyReport>[] = [
    { header: 'Week', accessorKey: 'week_number' },
    { header: 'Performance Score', accessorKey: 'performance_score' },
    { header: 'Attendance', accessorKey: 'attendance' },
    { header: 'Participation', accessorKey: 'participation' },
    { header: 'Homework Completion', accessorKey: 'homework_completion' },
    { header: 'Test Results', accessorKey: 'test_results' },
    { header: 'Notes', accessorKey: 'notes' },
  ];

  const handleStartEditing = () => {
    setEditedData(data);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
  };

  const handleDataChange = (newData: QuarterlyReport[] | WeeklyReport[]) => {
    setEditedData(newData);
  };

  const handleSave = async () => {
    try {
      // Create new record if data is empty
      if (editedData.length === 0 && type === 'quarterly') {
        const newReport: QuarterlyReport = {
          student_id: studentId,
          quarter: `Quarter ${quarter}`,
          academic_progress: '',
          behavioral_notes: '',
          attendance_summary: '',
          goals_achieved: '',
          areas_for_improvement: '',
          teacher_comments: '',
        };
        setEditedData([newReport]);
      }

      const dataToSave = editedData.map(item => ({
        ...item,
        student_id: studentId,
        quarter: `Quarter ${quarter}`
      }));

      let updatedData;
      if (type === 'quarterly') {
        updatedData = await updateQuarterlyReporting(dataToSave as QuarterlyReport[]);
      } else {
        updatedData = await updateWeeklyReporting(dataToSave as WeeklyReport[]);
      }

      if (updatedData) {
        onDataUpdate(updatedData);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const createEmptyWeeklyRecord = (weekNumber: number) => ({
    student_id: studentId,
    quarter: `Quarter ${quarter}`,
    week_number: weekNumber,
    performance_score: 0,
    attendance: '',
    participation: '',
    homework_completion: '',
    test_results: '',
    notes: '',
  });

  const handleAddWeek = () => {
    if (type === 'weekly') {
      // Find the highest week number and add a new week
      const highestWeek = Math.max(...(editedData as WeeklyReport[]).map(d => d.week_number), 0);
      const newWeek = createEmptyWeeklyRecord(highestWeek + 1);
      setEditedData([...(editedData as WeeklyReport[]), newWeek]);
    }
  };

  const isEmpty = data.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        {isEditing ? (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCancelEditing}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              className="bg-ishanya-green hover:bg-ishanya-hover flex items-center gap-1"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
            {type === 'weekly' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddWeek}
                className="flex items-center gap-1"
              >
                + Add Week
              </Button>
            )}
          </>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleStartEditing}
            className="flex items-center gap-1"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      {isEmpty && !isEditing ? (
        <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed border-gray-300">
          <p className="text-gray-500">No data available for this {type} report.</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleStartEditing}
            className="mt-2"
          >
            Add Data
          </Button>
        </div>
      ) : (
        type === 'quarterly' ? (
          <EditableTable
            data={isEditing ? editedData as QuarterlyReport[] : data as QuarterlyReport[]}
            columns={quarterlyColumns}
            isEditing={isEditing}
            onDataChange={handleDataChange as (data: QuarterlyReport[]) => void}
          />
        ) : (
          <EditableTable
            data={isEditing ? editedData as WeeklyReport[] : data as WeeklyReport[]}
            columns={weeklyColumns}
            isEditing={isEditing}
            onDataChange={handleDataChange as (data: WeeklyReport[]) => void}
          />
        )
      )}
    </div>
  );
};

export default ReportingTable;
