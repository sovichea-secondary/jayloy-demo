'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InventoryManager } from '@/components/inventory/InventoryManager';

export default function InventoryPage() {
  return (
    <DashboardLayout>
      <InventoryManager />
    </DashboardLayout>
  );
}