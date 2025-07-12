'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, Check, X, AlertCircle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export function BankReconciliation() {
  const { bankTransactions, addBankTransaction, updateBankTransaction, invoices, expenses } = useData();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Simulate CSV parsing and add mock transactions
      simulateCSVImport();
    }
  };

  const simulateCSVImport = () => {
    // Add some mock bank transactions
    const mockTransactions = [
      {
        date: '2024-01-15',
        description: 'Payment from ABC Corp',
        amount: 5000,
        type: 'credit' as const,
        balance: 15000,
        reconciled: false,
      },
      {
        date: '2024-01-14',
        description: 'Office supplies - Office Depot',
        amount: -250,
        type: 'debit' as const,
        balance: 10000,
        reconciled: false,
      },
      {
        date: '2024-01-13',
        description: 'Fuel expense - Shell',
        amount: -75,
        type: 'debit' as const,
        balance: 10250,
        reconciled: false,
      },
    ];

    mockTransactions.forEach(transaction => {
      addBankTransaction(transaction);
    });
  };

  const handleMatch = (transactionId: string, matchType: 'invoice' | 'expense', matchId: string) => {
    const updateData = matchType === 'invoice' 
      ? { reconciled: true, matchedInvoiceId: matchId }
      : { reconciled: true, matchedExpenseId: matchId };
    
    updateBankTransaction(transactionId, updateData);
  };

  const reconciledTransactions = bankTransactions.filter(t => t.reconciled);
  const unreconciledTransactions = bankTransactions.filter(t => !t.reconciled);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bank Reconciliation</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Upload bank statements and match transactions
        </p>
      </div>

      <Tabs defaultValue="upload">
        <TabsList>
          <TabsTrigger value="upload">Upload Statement</TabsTrigger>
          <TabsTrigger value="unreconciled">
            Unreconciled ({unreconciledTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="reconciled">
            Reconciled ({reconciledTransactions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Bank Statement</CardTitle>
              <CardDescription>
                Upload a CSV file from your bank to import transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Upload CSV Statement</p>
                  <p className="text-gray-500">Drag and drop or click to select</p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="mt-4"
                />
              </div>
              
              {uploadedFile && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">
                      File uploaded: {uploadedFile.name}
                    </span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                    {bankTransactions.length} transactions imported
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unreconciled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Unreconciled Transactions</CardTitle>
              <CardDescription>
                Match these bank transactions with your invoices and expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unreconciledTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No unreconciled transactions
                </div>
              ) : (
                <div className="space-y-4">
                  {unreconciledTransactions.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      invoices={invoices}
                      expenses={expenses}
                      onMatch={handleMatch}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reconciled Transactions</CardTitle>
              <CardDescription>
                Successfully matched transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reconciledTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No reconciled transactions yet
                </div>
              ) : (
                <div className="space-y-4">
                  {reconciledTransactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(transaction.date), 'MMM dd, yyyy')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${
                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            <Check className="w-3 h-3 mr-1" />
                            Reconciled
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TransactionCard({ transaction, invoices, expenses, onMatch }: any) {
  const [showMatches, setShowMatches] = useState(false);

  // Find potential matches
  const potentialInvoiceMatches = invoices.filter((invoice: any) => 
    Math.abs(invoice.total - Math.abs(transaction.amount)) < 1 && transaction.type === 'credit'
  );

  const potentialExpenseMatches = expenses.filter((expense: any) => 
    Math.abs(expense.amount - Math.abs(transaction.amount)) < 1 && transaction.type === 'debit'
  );

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-medium">{transaction.description}</div>
          <div className="text-sm text-gray-500">
            {format(new Date(transaction.date), 'MMM dd, yyyy')}
          </div>
        </div>
        <div className="text-right">
          <div className={`font-semibold ${
            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
          }`}>
            {transaction.type === 'credit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
          </div>
          <Badge variant="outline">
            <AlertCircle className="w-3 h-3 mr-1" />
            Unreconciled
          </Badge>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMatches(!showMatches)}
        >
          Find Matches
        </Button>
      </div>

      {showMatches && (
        <div className="mt-4 space-y-3">
          {potentialInvoiceMatches.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Potential Invoice Matches:</h4>
              {potentialInvoiceMatches.map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <span className="text-sm">
                    {invoice.invoiceNumber} - {invoice.customerName} (${invoice.total})
                  </span>
                  <Button
                    size="sm"
                    onClick={() => onMatch(transaction.id, 'invoice', invoice.id)}
                  >
                    Match
                  </Button>
                </div>
              ))}
            </div>
          )}

          {potentialExpenseMatches.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Potential Expense Matches:</h4>
              {potentialExpenseMatches.map((expense: any) => (
                <div key={expense.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <span className="text-sm">
                    {expense.vendor} - {expense.description} (${expense.amount})
                  </span>
                  <Button
                    size="sm"
                    onClick={() => onMatch(transaction.id, 'expense', expense.id)}
                  >
                    Match
                  </Button>
                </div>
              ))}
            </div>
          )}

          {potentialInvoiceMatches.length === 0 && potentialExpenseMatches.length === 0 && (
            <div className="text-sm text-gray-500 p-2 bg-gray-50 dark:bg-gray-800 rounded">
              No potential matches found
            </div>
          )}
        </div>
      )}
    </div>
  );
}