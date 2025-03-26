
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

// Define custom interface for display data with parameter property
interface QuarterlyDisplayData {
  parameter: string;
  value: string;
  original: string;
}

// Define custom interface for weekly display data
interface WeeklyDisplayData {
  week: number;
  description: string;
  score: number;
}

// Create a union type that can be either quarterly or weekly display data
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
    // Transform data for editing based on type
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
      // Transform weekly data for editing
      const weeklyData = data as WeeklyReport[];
      const transformedData = [];

      // Maximum week number to display (find highest week in data or default to 4)
      const maxWeek = weeklyData.length > 0 
        ? Math.max(...Object.keys(weeklyData[0])
            .filter(key => key.endsWith('_score'))
            .map(key => parseInt(key.split('_')[0]))
          )
        : 4;

      for (let weekNum = 1; weekNum <= maxWeek; weekNum++) {
        transformedData.push({
          week: weekNum,
          description: weeklyData.length > 0 ? weeklyData[0][`${weekNum}_description`] || '' : '',
          score: weeklyData.length > 0 ? weeklyData[0][`${weekNum}_score`] || 0 : 0,
        });
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

  // Get quarter label (e.g., "January 2025 - March 2025")
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
        // Transform back to database format for quarterly report
        const quarterlyReport: QuarterlyReport = {
          student_id: studentId,
          quarter: getQuarterLabel(), // Use the quarter label instead of "Quarter X"
          assistance_required: '',
          any_behavioral_issues: '',
          preparedness: '',
          punctuality: '',
          parental_support: ''
        };
        
        // Map the edited data back to the correct fields
        (editedData as QuarterlyDisplayData[]).forEach(item => {
          quarterlyReport[item.original as keyof QuarterlyReport] = item.value;
        });
        
        // If we have an ID from original data, include it
        if (data.length > 0 && (data[0] as QuarterlyReport).id) {
          quarterlyReport.id = (data[0] as QuarterlyReport).id;
        }
        
        const updatedData = await updateQuarterlyReporting([quarterlyReport]);
        if (updatedData) {
          onDataUpdate(updatedData);
        }
      } else {
        // Transform back to database format for weekly report
        const weeklyReport: WeeklyReport = {
          student_id: studentId,
          quarter: getQuarterLabel(), // Use the quarter label instead of "Quarter X"
        };
        
        // Map the week data back to the 1_description, 1_score format
        (editedData as WeeklyDisplayData[]).forEach(item => {
          weeklyReport[`${item.week}_description`] = item.description;
          weeklyReport[`${item.week}_score`] = Number(item.score);
        });
        
        // If we have an ID from original data, include it
        if (data.length > 0 && (data[0] as WeeklyReport).id) {
          weeklyReport.id = (data[0] as WeeklyReport).id;
        }
        
        const updatedData = await updateWeeklyReporting([weeklyReport]);
        if (updatedData) {
          onDataUpdate(updatedData);
        }
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const createEmptyQuarterlyReport = (): QuarterlyReport => ({
    student_id: studentId,
    quarter: getQuarterLabel(), // Use the quarter label instead of "Quarter X"
    assistance_required: '',
    any_behavioral_issues: '',
    preparedness: '',
    punctuality: '',
    parental_support: ''
  });

  const handleAddWeek = () => {
    if (type === 'weekly') {
      // Find the highest week number and add a new week
      const highestWeek = Math.max(...(editedData as WeeklyDisplayData[]).map(d => d.week), 0);
      const newWeek = {
        week: highestWeek + 1,
        description: '',
        score: 0
      };
      setEditedData([...(editedData as WeeklyDisplayData[]), newWeek]);
    }
  };

  // Transform data for display
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
      // Transform weekly data for display
      if (data.length === 0) return [];
      
      const weeklyData = data[0] as WeeklyReport;
      const transformedData = [];
      
      // Find all week numbers in the data
      const weekNumbers = Object.keys(weeklyData)
        .filter(key => key.endsWith('_score'))
        .map(key => parseInt(key.split('_')[0]))
        .sort((a, b) => a - b);
      
      for (const weekNum of weekNumbers) {
        transformedData.push({
          week: weekNum,
          description: weeklyData[`${weekNum}_description`] || '',
          score: weeklyData[`${weekNum}_score`] || 0
        });
      }
      
      return transformedData as WeeklyDisplayData[];
    }
  };

  const isEmpty = data.length === 0;
  const displayData = !isEditing ? getDisplayData() : editedData;

  // Use generic type for columns that accepts our union type
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
