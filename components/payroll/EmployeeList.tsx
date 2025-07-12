'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { Edit, Trash2, User } from 'lucide-react';
import { format } from 'date-fns';

interface EmployeeListProps {
  onEdit: (employee: any) => void;
}

export function EmployeeList({ onEdit }: EmployeeListProps) {
  const { employees, deleteEmployee } = useData();

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee(id);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  return (
    <div className="space-y-4">
      {employees.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No employees yet</h3>
            <p className="text-gray-500">Start by adding your first employee.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {employees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{employee.name}</h3>
                      <Badge className={getStatusColor(employee.status)}>
                        {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <span className="font-medium">Position:</span> {employee.position}
                      </div>
                      <div>
                        <span className="font-medium">Start Date:</span> {format(new Date(employee.startDate), 'MMM dd, yyyy')}
                      </div>
                      <div>
                        <span className="font-medium">Base Salary:</span> ${employee.baseSalary.toFixed(2)}
                      </div>
                      <div>
                        <span className="font-medium">Net Salary:</span> ${employee.netSalary.toFixed(2)}
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Deductions:</span> 
                      NSSF: ${employee.nssfDeduction.toFixed(2)} | 
                      Tax: ${employee.taxDeduction.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(employee)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(employee.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}