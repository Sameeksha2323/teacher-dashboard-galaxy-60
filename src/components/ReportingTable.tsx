
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
    { header: 'Parameter', accessorKey: 'parameter' as any, cell: (info) => {
      const param = info.row.original.parameter as string;
      return <span className="font-medium">{param}</span>;
    }},
    { header: 'Observation', accessorKey: 'value' as any },
  ];

  const weeklyColumns: TableColumn<WeeklyReport>[] = [
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
      setEditedData(transformedData as any);
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
      
      setEditedData(transformedData as any);
    }
    
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
  };

  const handleDataChange = (newData: any[]) => {
    setEditedData(newData);
  };

  const handleSave = async () => {
    try {
      if (type === 'quarterly') {
        // Transform back to database format for quarterly report
        const quarterlyReport: QuarterlyReport = {
          student_id: studentId,
          quarter: `Quarter ${quarter}`,
          assistance_required: '',
          any_behavioral_issues: '',
          preparedness: '',
          punctuality: '',
          parental_support: ''
        };
        
        // Map the edited data back to the correct fields
        (editedData as any[]).forEach(item => {
          quarterlyReport[item.original] = item.value;
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
          quarter: `Quarter ${quarter}`,
        };
        
        // Map the week data back to the 1_description, 1_score format
        (editedData as any[]).forEach(item => {
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
    quarter: `Quarter ${quarter}`,
    assistance_required: '',
    any_behavioral_issues: '',
    preparedness: '',
    punctuality: '',
    parental_support: ''
  });

  const handleAddWeek = () => {
    if (type === 'weekly') {
      // Find the highest week number and add a new week
      const highestWeek = Math.max(...(editedData as any[]).map(d => d.week), 0);
      const newWeek = {
        week: highestWeek + 1,
        description: '',
        score: 0
      };
      setEditedData([...(editedData as any[]), newWeek]);
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
      ];
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
      
      return transformedData;
    }
  };

  const isEmpty = data.length === 0;
  const displayData = !isEditing ? getDisplayData() : editedData;

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
          data={displayData as any[]}
          columns={type === 'quarterly' ? quarterlyColumns : weeklyColumns}
          isEditing={isEditing}
          onDataChange={handleDataChange}
        />
      )}
    </div>
  );
};

export default ReportingTable;
