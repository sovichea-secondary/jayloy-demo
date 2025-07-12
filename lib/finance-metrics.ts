import { Invoice, Expense } from '@/contexts/DataContext';
import { startOfMonth, endOfMonth, subMonths, format, parseISO } from 'date-fns';

export interface FinanceMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  outstandingInvoices: number;
  outstandingAmount: number;
  monthlyData: { month: string; revenue: number; expenses: number; profit: number }[];
  expenseCategories: { name: string; value: number; color: string }[];
}

const categoryColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#F472B6', '#FBBF24'];

export function calculateFinanceMetrics(
  invoices: Invoice[],
  expenses: Expense[],
  options?: { months?: number; start?: Date; end?: Date }
): FinanceMetrics {
  const now = new Date();
  const months = options?.months ?? 6;
  const start = options?.start ?? startOfMonth(subMonths(now, months - 1));
  const end = options?.end ?? endOfMonth(now);

  const filteredInvoices = invoices.filter(inv => {
    const date = parseISO(inv.issueDate);
    return date >= start && date <= end;
  });
  const filteredExpenses = expenses.filter(exp => {
    const date = parseISO(exp.date);
    return date >= start && date <= end;
  });

  const totalRevenue = filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
  const totalExpenses = filteredExpenses.filter(exp => exp.type === 'expense').reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const outstandingInvoices = filteredInvoices.filter(inv => inv.status === 'sent');
  const outstandingAmount = outstandingInvoices.reduce((sum, inv) => sum + inv.total, 0);

  const monthlyData = [];
  for (let i = months - 1; i >= 0; i--) {
    const month = subMonths(end, i);
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

  const expenseCategoryMap = filteredExpenses
    .filter(exp => exp.type === 'expense')
    .reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);
  const expenseCategories = Object.entries(expenseCategoryMap).map(([name, value], index) => ({
    name,
    value,
    color: categoryColors[index % categoryColors.length],
  }));

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    outstandingInvoices: outstandingInvoices.length,
    outstandingAmount,
    monthlyData,
    expenseCategories,
  };
} 