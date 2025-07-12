'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ExpenseTracker } from '@/components/expenses/ExpenseTracker';

export default function ExpensesPage() {
  return (
    <DashboardLayout>
      <ExpenseTracker />
    </DashboardLayout>
  );
}