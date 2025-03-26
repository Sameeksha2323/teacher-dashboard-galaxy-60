
import React from 'react';
import { TableColumn } from '@/types';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EditableTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  isEditing: boolean;
  onDataChange: (data: T[]) => void;
}

const EditableTable = <T extends Record<string, any>>({
  data,
  columns,
  isEditing,
  onDataChange,
}: EditableTableProps<T>) => {
  
  const handleCellChange = (rowIndex: number, columnKey: keyof T, value: any) => {
    const newData = [...data];
    newData[rowIndex] = {
      ...newData[rowIndex],
      [columnKey]: value,
    };
    onDataChange(newData);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={String(column.accessorKey)}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center h-24">
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => {
                  const value = row[column.accessorKey];
                  return (
                    <TableCell key={String(column.accessorKey)}>
                      {isEditing ? (
                        typeof value === 'number' ? (
                          <Input
                            type="number"
                            value={value}
                            onChange={(e) => 
                              handleCellChange(
                                rowIndex, 
                                column.accessorKey, 
                                e.target.type === 'number' ? Number(e.target.value) : e.target.value
                              )
                            }
                            className="ishanya-input"
                          />
                        ) : (
                          column.accessorKey.toString().includes('notes') || 
                          column.accessorKey.toString().includes('comments') ? (
                            <textarea
                              rows={3}
                              value={value || ''}
                              onChange={(e) => 
                                handleCellChange(rowIndex, column.accessorKey, e.target.value)
                              }
                              className="ishanya-input w-full"
                            />
                          ) : (
                            <Input
                              value={value || ''}
                              onChange={(e) => 
                                handleCellChange(rowIndex, column.accessorKey, e.target.value)
                              }
                              className="ishanya-input"
                            />
                          )
                        )
                      ) : column.cell ? (
                        column.cell({ row: { original: row } })
                      ) : (
                        String(value || '')
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default EditableTable;
