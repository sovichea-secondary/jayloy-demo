'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PayrollManager } from '@/components/payroll/PayrollManager';

export default function PayrollPage() {
  return (
    <DashboardLayout>
      <PayrollManager />
    </DashboardLayout>
  );
}