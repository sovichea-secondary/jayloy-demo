'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/DataContext';
import { Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export function FinancialReports() {
  const { invoices, expenses } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  // Calculate date range based on selected period
  const getDateRange = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'current-month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case 'last-3-months':
        return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) };
      case 'ytd':
        return { start: new Date(now.getFullYear(), 0, 1), end: now };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const { start, end } = getDateRange();

  // Filter data by date range
  const filteredInvoices = invoices.filter(inv => {
    const date = new Date(inv.issueDate);
    return date >= start && date <= end;
  });

  const filteredExpenses = expenses.filter(exp => {
    const date = new Date(exp.date);
    return date >= start && date <= end;
  });

  // Calculate metrics
  const totalRevenue = filteredInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const totalExpenses = filteredExpenses
    .filter(exp => exp.type === 'expense')
    .reduce((sum, exp) => sum + exp.amount, 0);

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Prepare chart data
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const month = subMonths(new Date(), i);
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthRevenue = invoices
      .filter(inv => {
        const date = new Date(inv.issueDate);
        return date >= monthStart && date <= monthEnd && inv.status === 'paid';
      })
      .reduce((sum, inv) => sum + inv.total, 0);

    const monthExpenses = expenses
      .filter(exp => {
        const date = new Date(exp.date);
        return date >= monthStart && date <= monthEnd && exp.type === 'expense';
      })
      .reduce((sum, exp) => sum + exp.amount, 0);

    monthlyData.push({
      month: format(month, 'MMM yyyy'),
      revenue: monthRevenue,
      expenses: monthExpenses,
      profit: monthRevenue - monthExpenses,
    });
  }

  // Expense categories for pie chart
  const expenseCategories = filteredExpenses
    .filter(exp => exp.type === 'expense')
    .reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(expenseCategories).map(([name, value], index) => ({
    name,
    value,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][index % 6],
  }));

  const handleExportPDF = (reportType: string) => {
    alert(`Exporting ${reportType} report as PDF...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive financial analysis and reporting
          </p>
        </div>
        
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current-month">Current Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="last-3-months">Last 3 Months</SelectItem>
            <SelectItem value="ytd">Year to Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              From {filteredInvoices.length} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 mr-1" />
              From {filteredExpenses.length} expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {profitMargin.toFixed(1)}% profit margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter(inv => inv.status === 'sent').length} pending invoices
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profit-loss">
        <TabsList>
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="tax-summary">Tax Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="profit-loss" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Profit & Loss Statement</CardTitle>
                <CardDescription>
                  Revenue, expenses, and profit analysis over time
                </CardDescription>
              </div>
              <Button onClick={() => handleExportPDF('Profit & Loss')}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Monthly Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line dataKey="revenue" stroke="#3B82F6" name="Revenue" strokeWidth={2} />
                      <Line dataKey="expenses" stroke="#EF4444" name="Expenses" strokeWidth={2} />
                      <Line dataKey="profit" stroke="#10B981" name="Profit" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Expense Breakdown</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-4">Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-blue-600 dark:text-blue-400">Total Revenue</div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      ${totalRevenue.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-sm text-red-600 dark:text-red-400">Total Expenses</div>
                    <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                      ${totalExpenses.toLocaleString()}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${
                    netProfit >= 0 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : 'bg-red-50 dark:bg-red-900/20'
                  }`}>
                    <div className={`text-sm ${
                      netProfit >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      Net {netProfit >= 0 ? 'Profit' : 'Loss'}
                    </div>
                    <div className={`text-2xl font-bold ${
                      netProfit >= 0 
                        ? 'text-green-900 dark:text-green-100' 
                        : 'text-red-900 dark:text-red-100'
                    }`}>
                      ${Math.abs(netProfit).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance-sheet" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Balance Sheet</CardTitle>
                <CardDescription>
                  Assets, liabilities, and equity overview
                </CardDescription>
              </div>
              <Button onClick={() => handleExportPDF('Balance Sheet')}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Assets</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Cash & Bank</span>
                      <span className="font-medium">${(totalRevenue - totalExpenses).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accounts Receivable</span>
                      <span className="font-medium">
                        ${invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <span>Total Assets</span>
                      <span>
                        ${(totalRevenue - totalExpenses + invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.total, 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">Liabilities & Equity</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Accounts Payable</span>
                      <span className="font-medium">$0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Owner's Equity</span>
                      <span className="font-medium">
                        ${(totalRevenue - totalExpenses + invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.total, 0)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <span>Total Liabilities & Equity</span>
                      <span>
                        ${(totalRevenue - totalExpenses + invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.total, 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cash Flow Statement</CardTitle>
                <CardDescription>
                  Cash inflows and outflows analysis
                </CardDescription>
              </div>
              <Button onClick={() => handleExportPDF('Cash Flow')}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#3B82F6" name="Cash Inflow" />
                  <Bar dataKey="expenses" fill="#EF4444" name="Cash Outflow" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm text-blue-600 dark:text-blue-400">Cash Inflow</div>
                  <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                    ${totalRevenue.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-sm text-red-600 dark:text-red-400">Cash Outflow</div>
                  <div className="text-xl font-bold text-red-900 dark:text-red-100">
                    ${totalExpenses.toLocaleString()}
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${
                  netProfit >= 0 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <div className={`text-sm ${
                    netProfit >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    Net Cash Flow
                  </div>
                  <div className={`text-xl font-bold ${
                    netProfit >= 0 
                      ? 'text-green-900 dark:text-green-100' 
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    ${netProfit.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax-summary" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tax Summary</CardTitle>
                <CardDescription>
                  VAT and tax obligations overview
                </CardDescription>
              </div>
              <Button onClick={() => handleExportPDF('Tax Summary')}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-lg mb-4">VAT Output (Sales)</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Sales</span>
                      <span className="font-medium">${totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT Output (10%)</span>
                      <span className="font-medium">${(totalRevenue * 0.1).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">VAT Input (Purchases)</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Purchases</span>
                      <span className="font-medium">${totalExpenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT Input (10%)</span>
                      <span className="font-medium">${(totalExpenses * 0.1).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h3 className="font-semibold text-lg mb-4">VAT Payable</h3>
                <div className="flex justify-between text-xl font-bold">
                  <span>Net VAT Due:</span>
                  <span className="text-yellow-800 dark:text-yellow-200">
                    ${((totalRevenue - totalExpenses) * 0.1).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                  VAT Output minus VAT Input for the selected period
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}