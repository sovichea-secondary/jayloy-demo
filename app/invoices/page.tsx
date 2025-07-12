'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InvoiceManager } from '@/components/invoices/InvoiceManager';

export default function InvoicesPage() {
  return (
    <DashboardLayout>
      <InvoiceManager />
    </DashboardLayout>
  );
}