'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { EmployeeForm } from './EmployeeForm';
import { EmployeeList } from './EmployeeList';
import { PayrollCalculation } from './PayrollCalculation';

export function PayrollManager() {
  const [activeTab, setActiveTab] = useState('employees');
  const [editingEmployee, setEditingEmployee] = useState(null);

  const handleCreateNew = () => {
    setEditingEmployee(null);
    setActiveTab('add-employee');
  };

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    setActiveTab('add-employee');
  };

  const handleSaved = () => {
    setActiveTab('employees');
    setEditingEmployee(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payroll Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage employees and calculate payroll with NSSF and tax deductions
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="payroll">Payroll Calculation</TabsTrigger>
          <TabsTrigger value="add-employee">
            {editingEmployee ? 'Edit Employee' : 'Add Employee'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee List</CardTitle>
              <CardDescription>
                Manage your employees and their salary information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmployeeList onEdit={handleEdit} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Payroll Calculation</CardTitle>
              <CardDescription>
                Calculate monthly salaries with NSSF and tax deductions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PayrollCalculation />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-employee" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </CardTitle>
              <CardDescription>
                {editingEmployee 
                  ? 'Update employee information and salary details'
                  : 'Enter employee information and salary details'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmployeeForm 
                employee={editingEmployee} 
                onSaved={handleSaved}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}