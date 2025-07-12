'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { InvoiceForm } from './InvoiceForm';
import { InvoiceList } from './InvoiceList';
import { useData } from '@/contexts/DataContext';

export function InvoiceManager() {
  const [activeTab, setActiveTab] = useState('list');
  const [editingInvoice, setEditingInvoice] = useState(null);
  const { invoices } = useData();

  const handleCreateNew = () => {
    setEditingInvoice(null);
    setActiveTab('create');
  };

  const handleEdit = (invoice: any) => {
    setEditingInvoice(invoice);
    setActiveTab('create');
  };

  const handleSaved = () => {
    setActiveTab('list');
    setEditingInvoice(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create and manage customer invoices
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Invoice List</TabsTrigger>
          <TabsTrigger value="create">
            {editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>
                Manage your customer invoices and track payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceList onEdit={handleEdit} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
              </CardTitle>
              <CardDescription>
                {editingInvoice 
                  ? 'Update invoice details and items'
                  : 'Fill in the details to create a new invoice'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceForm 
                invoice={editingInvoice} 
                onSaved={handleSaved}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}