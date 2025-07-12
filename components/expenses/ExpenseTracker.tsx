'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseList } from './ExpenseList';
import { ReceiptUpload } from './ReceiptUpload';

export function ExpenseTracker() {
  const [activeTab, setActiveTab] = useState('list');
  const [editingExpense, setEditingExpense] = useState(null);

  const handleCreateNew = () => {
    setEditingExpense(null);
    setActiveTab('manual');
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setActiveTab('manual');
  };

  const handleSaved = () => {
    setActiveTab('list');
    setEditingExpense(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Expense Tracking</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track business expenses and upload receipts
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          New Expense
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Expense List</TabsTrigger>
          <TabsTrigger value="upload">Upload Receipt</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Expenses</CardTitle>
              <CardDescription>
                View and manage all your business expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseList onEdit={handleEdit} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Receipt</CardTitle>
              <CardDescription>
                Upload a receipt and let AI extract the expense details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReceiptUpload onSaved={handleSaved} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingExpense ? 'Edit Expense' : 'Manual Expense Entry'}
              </CardTitle>
              <CardDescription>
                {editingExpense 
                  ? 'Update expense details'
                  : 'Manually enter expense details'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseForm 
                expense={editingExpense} 
                onSaved={handleSaved}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}