'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FinancialReports } from '@/components/reports/FinancialReports';

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <FinancialReports />
    </DashboardLayout>
  );
}