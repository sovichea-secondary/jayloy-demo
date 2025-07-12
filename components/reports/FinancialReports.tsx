'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/DataContext';
import { Download, TrendingUp, TrendingDown, DollarSign, FileText, FileSpreadsheet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';
import { 
  exportToPDF, 
  exportInvoicesToCSV, 
  exportExpensesToCSV, 
  exportProfitLossToCSV,
  generatePDFContent,
  createPDFElement,
  type ReportMetrics,
  type MonthlyData,
  type CategoryData
} from '@/lib/export-utils';
import { generateSampleData } from '@/lib/sample-data';
import { calculateFinanceMetrics } from '@/lib/finance-metrics';

export function FinancialReports() {
  const { invoices, expenses, setExpenses, setInvoices } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [isExporting, setIsExporting] = useState(false);

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
  const metrics = calculateFinanceMetrics(invoices, expenses, { start, end, months: 6 });

  const monthlyData: MonthlyData[] = [];
  for (let i = 5; i >= 0; i--) {
    const month = subMonths(new Date(), i);
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthRevenue = invoices
      .filter(inv => {
        const date = parseISO(inv.issueDate);
        return date >= monthStart && date <= monthEnd && inv.status === 'paid';
      })
      .reduce((sum, inv) => sum + inv.total, 0);

    const monthExpenses = expenses
      .filter(exp => {
        const date = parseISO(exp.date);
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

  const expenseCategories = expenses
    .filter(exp => exp.type === 'expense')
    .reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

  const categoryData: CategoryData[] = Object.entries(expenseCategories).map(([name, value], index) => ({
    name,
    value,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][index % 6],
  }));

  const handleExportPDF = async (reportType: string) => {
    setIsExporting(true);
    try {
      const content = generatePDFContent(
        reportType,
        metrics,
        monthlyData,
        categoryData,
        selectedPeriod
      );
      
      const elementId = `pdf-export-${Date.now()}`;
      createPDFElement(content, elementId);
      
      await exportToPDF(elementId, `${reportType.toLowerCase().replace(/\s+/g, '_')}_${selectedPeriod.replace('-', '_')}`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = (reportType: string) => {
    try {
      switch (reportType) {
        case 'invoices':
          exportInvoicesToCSV(invoices, selectedPeriod);
          break;
        case 'expenses':
          exportExpensesToCSV(expenses, selectedPeriod);
          break;
        case 'profit-loss':
          exportProfitLossToCSV(monthlyData, metrics, selectedPeriod);
          break;
        default:
          console.error('Unknown report type for CSV export');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const getPeriodDisplayName = () => {
    switch (selectedPeriod) {
      case 'current-month':
        return 'Current Month';
      case 'last-month':
        return 'Last Month';
      case 'last-3-months':
        return 'Last 3 Months';
      case 'ytd':
        return 'Year to Date';
      default:
        return 'Current Month';
    }
  };

  const handleGenerateSampleData = () => {
    const sampleData = generateSampleData();
    setExpenses(sampleData.expenses);
    setInvoices(sampleData.invoices);
    alert('Sample data generated! You can now test the reports with real data.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive financial analysis and reporting for {getPeriodDisplayName()}
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* <Button 
            variant="outline" 
            onClick={handleGenerateSampleData}
            className="text-sm"
          >
            Generate Sample Data
          </Button> */}
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
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              From {invoices.filter(inv => inv.status === 'paid').length} paid invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 mr-1" />
              From {expenses.filter(exp => exp.type === 'expense').length} expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${metrics.netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.profitMargin.toFixed(1)}% profit margin
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
              ${metrics.outstandingAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.outstandingInvoices} pending invoices
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
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleExportCSV('profit-loss')}
                  disabled={isExporting}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button 
                  onClick={() => handleExportPDF('Profit & Loss')}
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export PDF'}
                </Button>
              </div>
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
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                      <Line dataKey="revenue" stroke="#3B82F6" name="Revenue" strokeWidth={2} />
                      <Line dataKey="expenses" stroke="#EF4444" name="Expenses" strokeWidth={2} />
                      <Line dataKey="profit" stroke="#10B981" name="Profit" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Expense Breakdown</h3>
                  {categoryData.length > 0 ? (
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
                        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-gray-500">
                      No expense data available for the selected period
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-4">Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-blue-600 dark:text-blue-400">Total Revenue</div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      ${metrics.totalRevenue.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-sm text-red-600 dark:text-red-400">Total Expenses</div>
                    <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                      ${metrics.totalExpenses.toLocaleString()}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${
                    metrics.netProfit >= 0 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : 'bg-red-50 dark:bg-red-900/20'
                  }`}>
                    <div className={`text-sm ${
                      metrics.netProfit >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      Net {metrics.netProfit >= 0 ? 'Profit' : 'Loss'}
                    </div>
                    <div className={`text-2xl font-bold ${
                      metrics.netProfit >= 0 
                        ? 'text-green-900 dark:text-green-100' 
                        : 'text-red-900 dark:text-red-100'
                    }`}>
                      ${Math.abs(metrics.netProfit).toLocaleString()}
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
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleExportCSV('invoices')}
                  disabled={isExporting}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button 
                  onClick={() => handleExportPDF('Balance Sheet')}
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export PDF'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Assets</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Cash & Bank</span>
                      <span className="font-medium">${(metrics.totalRevenue - metrics.totalExpenses).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accounts Receivable</span>
                      <span className="font-medium">
                        ${metrics.outstandingAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <span>Total Assets</span>
                      <span>
                        ${(metrics.totalRevenue - metrics.totalExpenses + metrics.outstandingAmount).toLocaleString()}
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
                      <span>Owner&apos;s Equity</span>
                      <span className="font-medium">
                        ${(metrics.totalRevenue - metrics.totalExpenses + metrics.outstandingAmount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <span>Total Liabilities & Equity</span>
                      <span>
                        ${(metrics.totalRevenue - metrics.totalExpenses + metrics.outstandingAmount).toLocaleString()}
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
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleExportCSV('expenses')}
                  disabled={isExporting}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button 
                  onClick={() => handleExportPDF('Cash Flow')}
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export PDF'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                  <Bar dataKey="revenue" fill="#3B82F6" name="Cash Inflow" />
                  <Bar dataKey="expenses" fill="#EF4444" name="Cash Outflow" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm text-blue-600 dark:text-blue-400">Cash Inflow</div>
                  <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                    ${metrics.totalRevenue.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-sm text-red-600 dark:text-red-400">Cash Outflow</div>
                  <div className="text-xl font-bold text-red-900 dark:text-red-100">
                    ${metrics.totalExpenses.toLocaleString()}
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${
                  metrics.netProfit >= 0 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <div className={`text-sm ${
                    metrics.netProfit >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    Net Cash Flow
                  </div>
                  <div className={`text-xl font-bold ${
                    metrics.netProfit >= 0 
                      ? 'text-green-900 dark:text-green-100' 
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    ${metrics.netProfit.toLocaleString()}
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
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleExportCSV('expenses')}
                  disabled={isExporting}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button 
                  onClick={() => handleExportPDF('Tax Summary')}
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export PDF'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-lg mb-4">VAT Output (Sales)</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Sales</span>
                      <span className="font-medium">${metrics.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT Output (10%)</span>
                      <span className="font-medium">${(metrics.totalRevenue * 0.1).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">VAT Input (Purchases)</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Purchases</span>
                      <span className="font-medium">${metrics.totalExpenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT Input (10%)</span>
                      <span className="font-medium">${(metrics.totalExpenses * 0.1).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h3 className="font-semibold text-lg mb-4">VAT Payable</h3>
                <div className="flex justify-between text-xl font-bold">
                  <span>Net VAT Due:</span>
                  <span className="text-yellow-800 dark:text-yellow-200">
                    ${((metrics.totalRevenue - metrics.totalExpenses) * 0.1).toLocaleString()}
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