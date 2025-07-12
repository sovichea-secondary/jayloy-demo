'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/DataContext';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  position: z.string().min(1, 'Position is required'),
  baseSalary: z.number().min(1, 'Base salary must be greater than 0'),
  allowances: z.number().min(0, 'Allowances must be 0 or greater'),
  startDate: z.string().min(1, 'Start date is required'),
  status: z.enum(['active', 'inactive']),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employee?: any;
  onSaved: () => void;
}

export function EmployeeForm({ employee, onSaved }: EmployeeFormProps) {
  const { addEmployee, updateEmployee } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: employee?.name || '',
      position: employee?.position || '',
      baseSalary: employee?.baseSalary || 0,
      allowances: employee?.allowances || 0,
      startDate: employee?.startDate || new Date().toISOString().split('T')[0],
      status: employee?.status || 'active',
    },
  });

  const watchedSalary = form.watch('baseSalary');
  const watchedAllowances = form.watch('allowances');

  // Calculate deductions (Cambodia rates)
  const grossSalary = watchedSalary + watchedAllowances;
  const nssfDeduction = Math.min(grossSalary * 0.04, 200); // 4% capped at $200
  const taxableIncome = grossSalary - nssfDeduction;
  const taxDeduction = taxableIncome > 1300 ? (taxableIncome - 1300) * 0.1 : 0; // 10% on income above $1300
  const netSalary = grossSalary - nssfDeduction - taxDeduction;

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      setIsSubmitting(true);
      
      const employeeData = {
        ...data,
        nssfDeduction,
        taxDeduction,
        netSalary,
      };

      if (employee) {
        updateEmployee(employee.id, employeeData);
      } else {
        addEmployee(employeeData);
      }

      onSaved();
    } catch (error) {
      console.error('Error saving employee:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter employee name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <Input placeholder="Enter position/title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="baseSalary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Salary (USD)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allowances"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Allowances (USD)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Salary Calculation Preview */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h3 className="font-semibold text-lg mb-4">Salary Calculation Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Base Salary:</span>
                <span className="font-medium">${watchedSalary.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Allowances:</span>
                <span className="font-medium">${watchedAllowances.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Gross Salary:</span>
                <span>${grossSalary.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-red-600">
                <span>NSSF (4%, max $200):</span>
                <span>-${nssfDeduction.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Tax (10% above $1300):</span>
                <span>-${taxDeduction.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-green-600 border-t pt-2">
                <span>Net Salary:</span>
                <span>${netSalary.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {employee ? 'Update Employee' : 'Add Employee'}
          </Button>
        </div>
      </form>
    </Form>
  );
}