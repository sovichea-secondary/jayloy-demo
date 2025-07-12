'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BankReconciliation } from '@/components/reconciliation/BankReconciliation';

export default function ReconciliationPage() {
  return (
    <DashboardLayout>
      <BankReconciliation />
    </DashboardLayout>
  );
}