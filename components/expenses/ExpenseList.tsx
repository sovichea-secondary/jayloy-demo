'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useData } from '@/contexts/DataContext';
import { Edit, Eye, Trash2, FileText, Image, ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface ExpenseListProps {
  onEdit: (expense: any) => void;
}

export function ExpenseList({ onEdit }: ExpenseListProps) {
  const { expenses, deleteExpense } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const filteredExpenses = sortedExpenses.filter(expense => {
    const matchesSearch = expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesType = typeFilter === 'all' || expense.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  const getTypeColor = (type: string) => {
    return type === 'income' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id);
    }
  };

  const toggleExpanded = (expenseId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(expenseId)) {
      newExpanded.delete(expenseId);
    } else {
      newExpanded.add(expenseId);
    }
    setExpandedItems(newExpanded);
  };

  const categories = ['Office Supplies', 'Travel', 'Marketing', 'Utilities', 'Equipment', 'Professional Services', 'Meals & Entertainment', 'Software & Subscriptions', 'Other'];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="sm:max-w-xs">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="sm:max-w-xs">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="expense">Expenses</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Expense List */}
      {filteredExpenses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all'
                ? 'No expenses match your filters' 
                : 'No expenses recorded yet'
              }
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredExpenses.map((expense) => (
            <Card key={expense.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* Top row: details (left) and utilities (right) */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{expense.vendor}</h3>
                      <Badge className={getTypeColor(expense.type)}>
                        {expense.type.charAt(0).toUpperCase() + expense.type.slice(1)}
                      </Badge>
                      {expense.receiptUrl && (
                        <Badge variant="secondary" className="text-xs">
                          <FileText className="w-3 h-3 mr-1" />
                          Receipt
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{expense.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <span className="font-medium">Category:</span> {expense.category}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {format(new Date(expense.date), 'MMM dd, yyyy')}
                      </div>
                      <div>
                        <span className="font-medium">Currency:</span> {expense.currency}
                      </div>
                      {expense.tax > 0 && (
                        <div>
                          <span className="font-medium">Tax:</span> {expense.currency} {expense?.tax?.toFixed(2)}
                        </div>
                      )}
                      {expense.items && expense.items.length > 0 && (
                        <div className="lg:col-span-4">
                          <span className="font-medium">Items:</span> {expense.items.length} items
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Utilities and Total - always right aligned and visible */}
                  <div className="flex flex-col items-end gap-2 min-w-[160px]">
                    <div className={`text-lg font-semibold ${
                      expense.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {expense.type === 'income' ? '+' : '-'}{expense.currency} {expense?.amount?.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(expense.createdAt), 'MMM dd, HH:mm')}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {expense.receiptUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(expense.receiptUrl!, '_blank')}
                          title="View Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(expense)}
                        title="Edit Expense"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Items collapsible: always full width, below the top row */}
                {expense.items && expense.items.length > 0 && (
                  <div className="mt-4 -mx-6">
                    <Collapsible 
                      open={expandedItems.has(expense.id)}
                      onOpenChange={() => toggleExpanded(expense.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-0 h-auto ml-6">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            {expandedItems.has(expense.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            <span>View {expense.items.length} items</span>
                          </div>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3 px-6">
                        <div className="space-y-2 w-full">
                          {expense.items.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded border w-full">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{item.name}</div>
                                {item.description && item.description !== item.name && (
                                  <div className="text-xs text-gray-500 truncate">{item.description}</div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-sm whitespace-nowrap">{item.currency} {item?.amount?.toFixed(2)}</div>
                                {item.category && (
                                  <Badge variant="outline" className="text-xs whitespace-nowrap">{item.category}</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}