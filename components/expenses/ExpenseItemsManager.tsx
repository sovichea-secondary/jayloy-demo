'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Edit, Trash2, Plus, Save, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { ExpenseItem } from '@/contexts/DataContext';

interface ExpenseItemsManagerProps {
  expenseId: string;
  items: ExpenseItem[];
  currency: string;
}

export function ExpenseItemsManager({ expenseId, items, currency }: ExpenseItemsManagerProps) {
  const { updateExpenseItem, deleteExpenseItem, addExpenseItem } = useData();
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ExpenseItem>>({
    name: '',
    amount: 0,
    category: 'Other',
    description: '',
    currency: currency,
  });

  const categories = [
    'Office Supplies',
    'Travel',
    'Marketing',
    'Utilities',
    'Equipment',
    'Professional Services',
    'Meals & Entertainment',
    'Software & Subscriptions',
    'Other'
  ];

  const handleEdit = (itemId: string) => {
    setEditingItem(itemId);
  };

  const handleSave = (itemId: string, updatedData: Partial<ExpenseItem>) => {
    updateExpenseItem(expenseId, itemId, updatedData);
    setEditingItem(null);
  };

  const handleCancel = () => {
    setEditingItem(null);
    setShowAddForm(false);
  };

  const handleDelete = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteExpenseItem(expenseId, itemId);
    }
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.amount) {
      addExpenseItem(expenseId, {
        name: newItem.name,
        amount: newItem.amount,
        category: newItem.category || 'Other',
        description: newItem.description || newItem.name,
        currency: newItem.currency || currency,
      });
      setNewItem({
        name: '',
        amount: 0,
        category: 'Other',
        description: '',
        currency: currency,
      });
      setShowAddForm(false);
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Expense Items</CardTitle>
            <CardDescription>
              Manage individual items in this expense record
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {items.length} items
            </Badge>
            <Badge variant="outline">
              Total: {currency} {totalAmount.toFixed(2)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Item Section */}
        <Collapsible open={showAddForm} onOpenChange={setShowAddForm}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add New Item
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border">
              <Input
                placeholder="Item name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={newItem.amount}
                onChange={(e) => setNewItem({ ...newItem, amount: parseFloat(e.target.value) || 0 })}
              />
              <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
              <div className="flex gap-2">
                <Button onClick={handleAddItem} size="sm" className="flex-1">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
                <Button onClick={handleCancel} size="sm" variant="outline">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Items List */}
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="border rounded-lg overflow-hidden">
              {editingItem === item.id ? (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input
                      value={item.name}
                      onChange={(e) => handleSave(item.id, { name: e.target.value })}
                      placeholder="Item name"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      value={item.amount}
                      onChange={(e) => handleSave(item.id, { amount: parseFloat(e.target.value) || 0 })}
                      placeholder="Amount"
                    />
                    <Select 
                      value={item.category} 
                      onValueChange={(value) => handleSave(item.id, { category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleCancel} variant="outline">
                        <X className="w-4 h-4" />
                      </Button>
                      <Button size="sm" onClick={() => handleDelete(item.id)} variant="destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                      {item.description && item.description !== item.name && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {item.currency} {item.amount.toFixed(2)}
                        </div>
                        {item.category && (
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(item.id)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-lg font-medium mb-2">No items added yet</div>
            <div className="text-sm">Click &quot;Add New Item&quot; to start adding items to this expense.</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 