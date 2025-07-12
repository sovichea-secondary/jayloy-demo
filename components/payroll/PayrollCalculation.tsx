'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/DataContext';
import { Download, Calculator } from 'lucide-react';
import { format } from 'date-fns';

export function PayrollCalculation() {
  const { employees } = useData();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const activeEmployees = employees.filter(emp => emp.status === 'active');

  const totalGrossSalary = activeEmployees.reduce((sum, emp) => sum + emp.baseSalary + emp.allowances, 0);
  const totalNSSF = activeEmployees.reduce((sum, emp) => sum + emp.nssfDeduction, 0);
  const totalTax = activeEmployees.reduce((sum, emp) => sum + emp.taxDeduction, 0);
  const totalNetSalary = activeEmployees.reduce((sum, emp) => sum + emp.netSalary, 0);

  const handleExportPayroll = () => {
    alert('Payroll export functionality would be implemented here');
  };

  const handleProcessPayroll = () => {
    alert('Payroll processing functionality would be implemented here');
  };

  return (
    <div className="space-y-6">
      {/* Month Selection */}
      <div className="flex items-center gap-4">
        <label className="font-medium">Payroll Month:</label>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const value = format(date, 'yyyy-MM');
              const label = format(date, 'MMMM yyyy');
              return (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees.length}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Salary</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalGrossSalary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Before deductions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalNSSF + totalTax).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">NSSF + Tax</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Payroll</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalNetSalary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total to pay</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payroll Breakdown</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPayroll}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleProcessPayroll}>
              Process Payroll
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeEmployees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active employees to calculate payroll
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Employee</th>
                    <th className="text-left p-2">Position</th>
                    <th className="text-right p-2">Base Salary</th>
                    <th className="text-right p-2">Allowances</th>
                    <th className="text-right p-2">Gross</th>
                    <th className="text-right p-2">NSSF</th>
                    <th className="text-right p-2">Tax</th>
                    <th className="text-right p-2">Net Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {activeEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-2 font-medium">{employee.name}</td>
                      <td className="p-2 text-gray-600 dark:text-gray-400">{employee.position}</td>
                      <td className="p-2 text-right">${employee.baseSalary.toFixed(2)}</td>
                      <td className="p-2 text-right">${employee.allowances.toFixed(2)}</td>
                      <td className="p-2 text-right font-medium">
                        ${(employee.baseSalary + employee.allowances).toFixed(2)}
                      </td>
                      <td className="p-2 text-right text-red-600">
                        -${employee.nssfDeduction.toFixed(2)}
                      </td>
                      <td className="p-2 text-right text-red-600">
                        -${employee.taxDeduction.toFixed(2)}
                      </td>
                      <td className="p-2 text-right font-semibold text-green-600">
                        ${employee.netSalary.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-semibold">
                    <td className="p-2" colSpan={4}>Total</td>
                    <td className="p-2 text-right">${totalGrossSalary.toFixed(2)}</td>
                    <td className="p-2 text-right text-red-600">-${totalNSSF.toFixed(2)}</td>
                    <td className="p-2 text-right text-red-600">-${totalTax.toFixed(2)}</td>
                    <td className="p-2 text-right text-green-600">${totalNetSalary.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deduction Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>NSSF Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Employee Contribution (4%):</span>
                <span className="font-medium">${totalNSSF.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Employer Contribution (4%):</span>
                <span className="font-medium">${totalNSSF.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total NSSF:</span>
                <span>${(totalNSSF * 2).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Withholding Tax:</span>
                <span className="font-medium">${totalTax.toFixed(2)}</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                10% on income above $1,300 per employee
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}