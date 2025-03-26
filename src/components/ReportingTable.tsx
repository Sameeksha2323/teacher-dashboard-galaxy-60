
import React, { useState } from 'react';
import { QuarterlyReport, WeeklyReport, TableColumn } from '@/types';
import EditableTable from './EditableTable';
import { updateQuarterlyReporting, updateWeeklyReporting } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Pencil, Save, X, Plus } from 'lucide-react';

interface ReportingTableProps {
  data: QuarterlyReport[] | WeeklyReport[];
  type: 'quarterly' | 'weekly';
  studentId: string;
  year: number;
  quarter: number;
  onDataUpdate: (data: any[]) => void;
}

interface QuarterlyDisplayData {
  parameter: string;
  value: string;
  original: string;
}

interface WeeklyDisplayData {
  week: number;
  description: string;
  score: number;
}

type DisplayData = QuarterlyDisplayData | WeeklyDisplayData;

const ReportingTable: React.FC<ReportingTableProps> = ({
  data,
  type,
  studentId,
  year,
  quarter,
  onDataUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any[]>([]);

  const quarterlyColumns: TableColumn<QuarterlyDisplayData>[] = [
    { header: 'Parameter', accessorKey: 'parameter' as any, cell: (info) => {
      const param = info.row.original.parameter;
      return <span className="font-medium">{param}</span>;
    }},
    { header: 'Observation', accessorKey: 'value' as any },
  ];

  const weeklyColumns: TableColumn<WeeklyDisplayData>[] = [
    { header: 'Week', accessorKey: 'week' as any, cell: (info) => {
      return <span className="font-medium">Week {info.row.original.week}</span>;
    }},
    { header: 'Description', accessorKey: 'description' as any },
    { header: 'Score', accessorKey: 'score' as any },
  ];

  const handleStartEditing = () => {
    if (type === 'quarterly') {
      const quarterlyData = data.length > 0 ? data[0] as QuarterlyReport : createEmptyQuarterlyReport();
      const transformedData = [
        { parameter: 'Assistance Required', value: quarterlyData.assistance_required || '', original: 'assistance_required' },
        { parameter: 'Preparedness', value: quarterlyData.preparedness || '', original: 'preparedness' },
        { parameter: 'Punctuality', value: quarterlyData.punctuality || '', original: 'punctuality' },
        { parameter: 'Parental Support', value: quarterlyData.parental_support || '', original: 'parental_support' }
      ];
      setEditedData(transformedData);
    } else {
      const weeklyData = data as WeeklyReport[];
      const transformedData = [];

      if (weeklyData.length > 0) {
        // Get all week numbers that have either a description or score
        const weekNumbers = Object.keys(weeklyData[0])
          .filter(key => key.endsWith('_description') || key.endsWith('_score'))
          .map(key => parseInt(key.split('_')[0]))
          .filter((value, index, self) => self.indexOf(value) === index) // Unique values
          .sort((a, b) => a - b);
        
        for (const weekNum of weekNumbers) {
          const description = weeklyData[0][`${weekNum}_description`];
          const score = weeklyData[0][`${weekNum}_score`];
          
          // Only add weeks that have either a description or a score
          if (description?.trim() || typeof score === 'number') {
            transformedData.push({
              week: weekNum,
              description: description || '',
              score: typeof score === 'number' ? score : 0
            });
          }
        }
      } else {
        // Default to showing 4 weeks if no data exists
        for (let weekNum = 1; weekNum <= 4; weekNum++) {
          transformedData.push({
            week: weekNum,
            description: '',
            score: 0
          });
        }
      }
      
      setEditedData(transformedData);
    }
    
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
  };

  const handleDataChange = (newData: any[]) => {
    setEditedData(newData);
  };

  const getQuarterLabel = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    let startMonth, endMonth;
    
    if (quarter === 1) {
      startMonth = 0; // January
      endMonth = 2;  // March
    } else if (quarter === 2) {
      startMonth = 3; // April
      endMonth = 5;  // June
    } else if (quarter === 3) {
      startMonth = 6; // July
      endMonth = 8;  // September
    } else {
      startMonth = 9;  // October
      endMonth = 11;   // December
    }
    
    return `${monthNames[startMonth]} ${year} - ${monthNames[endMonth]} ${year}`;
  };

  const handleSave = async () => {
    try {
      if (type === 'quarterly') {
        const quarterlyReport: QuarterlyReport = {
          student_id: studentId,
          quarter: getQuarterLabel(),
          assistance_required: '',
          any_behavioral_issues: '',
          preparedness: '',
          punctuality: '',
          parental_support: ''
        };
        
        (editedData as QuarterlyDisplayData[]).forEach(item => {
          quarterlyReport[item.original as keyof QuarterlyReport] = item.value;
        });
        
        if (data.length > 0 && (data[0] as QuarterlyReport).id) {
          quarterlyReport.id = (data[0] as QuarterlyReport).id;
        }
        
        const updatedData = await updateQuarterlyReporting([quarterlyReport]);
        if (updatedData) {
          onDataUpdate(updatedData);
        }
      } else {
        // Get existing report data for reference
        const existingWeeklyReport = data.length > 0 ? data[0] as WeeklyReport : null;
        
        // Filter out empty items and ensure valid data format
        const weeklyItems = (editedData as WeeklyDisplayData[])
          .filter(item => item.description?.trim() || (typeof item.score === 'number' && item.score !== 0))
          .map(item => ({
            week: item.week,
            description: item.description?.trim() || '',
            score: typeof item.score === 'number' ? item.score : 0
          }));
        
        if (weeklyItems.length === 0) {
          console.error('No valid data to save');
          return;
        }
        
        // Create weekly data with proper metadata
        const weeklyData = {
          student_id: studentId,
          quarter: getQuarterLabel(),
          id: existingWeeklyReport?.id,
          program_id: existingWeeklyReport?.program_id || 1,
          educator_employee_id: existingWeeklyReport?.educator_employee_id || 61,
          weeks: weeklyItems
        };
        
        console.log('Sending weekly data to update function:', weeklyData);
        
        const updatedData = await updateWeeklyReporting(weeklyData);
        if (updatedData) {
          console.log('Weekly data updated successfully:', updatedData);
          onDataUpdate(updatedData);
        } else {
          console.error('Failed to update weekly data');
        }
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const createEmptyQuarterlyReport = (): QuarterlyReport => ({
    student_id: studentId,
    quarter: getQuarterLabel(),
    assistance_required: '',
    any_behavioral_issues: '',
    preparedness: '',
    punctuality: '',
    parental_support: ''
  });

  const handleAddWeek = () => {
    if (type === 'weekly') {
      const highestWeek = Math.max(...(editedData as WeeklyDisplayData[]).map(d => d.week), 0);
      const newWeek = {
        week: highestWeek + 1,
        description: '',
        score: 0
      };
      setEditedData([...(editedData as WeeklyDisplayData[]), newWeek]);
    }
  };

  const getDisplayData = () => {
    if (type === 'quarterly') {
      if (data.length === 0) return [];
      
      const quarterlyData = data[0] as QuarterlyReport;
      return [
        { parameter: 'Assistance Required', value: quarterlyData.assistance_required || '', original: 'assistance_required' },
        { parameter: 'Preparedness', value: quarterlyData.preparedness || '', original: 'preparedness' },
        { parameter: 'Punctuality', value: quarterlyData.punctuality || '', original: 'punctuality' },
        { parameter: 'Parental Support', value: quarterlyData.parental_support || '', original: 'parental_support' }
      ] as QuarterlyDisplayData[];
    } else {
      if (data.length === 0) return [];
      
      const weeklyData = data[0] as WeeklyReport;
      const transformedData = [];
      
      // Get all week numbers that have either a description or score
      const weekNumbers = Object.keys(weeklyData)
        .filter(key => key.endsWith('_score') || key.endsWith('_description'))
        .map(key => parseInt(key.split('_')[0]))
        .filter((value, index, self) => self.indexOf(value) === index) // Unique values
        .sort((a, b) => a - b);
      
      for (const weekNum of weekNumbers) {
        const description = weeklyData[`${weekNum}_description`];
        const score = weeklyData[`${weekNum}_score`];
        
        // Only add weeks that have either a description or a score
        if (description?.trim() || typeof score === 'number') {
          transformedData.push({
            week: weekNum,
            description: description || '',
            score: typeof score === 'number' ? score : 0
          });
        }
      }
      
      return transformedData as WeeklyDisplayData[];
    }
  };

  const isEmpty = data.length === 0;
  const displayData = !isEditing ? getDisplayData() : editedData;

  const getColumnsForType = (): TableColumn<any>[] => {
    return type === 'quarterly' ? quarterlyColumns : weeklyColumns;
  };

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
                <Plus className="h-4 w-4" />
                Add Week
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
        <EditableTable
          data={displayData}
          columns={getColumnsForType()}
          isEditing={isEditing}
          onDataChange={handleDataChange}
        />
      )}
    </div>
  );
};

export default ReportingTable;
