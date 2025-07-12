import { Invoice, Expense } from '@/contexts/DataContext';
import { subDays, subMonths, format } from 'date-fns';

export function generateSampleInvoices(): Invoice[] {
  const customers = [
    'ABC Corporation',
    'XYZ Solutions',
    'TechStart Inc',
    'Global Services Ltd',
    'Digital Innovations',
    'Cambodia Tech',
    'Phnom Penh Solutions',
    'Siem Reap Digital',
    'Battambang Systems',
    'Kampot Technologies'
  ];

  const services = [
    'Web Development',
    'Mobile App Development',
    'IT Consulting',
    'System Integration',
    'Cloud Migration',
    'Data Analytics',
    'Cybersecurity Audit',
    'Network Setup',
    'Software Training',
    'Technical Support'
  ];

  const invoices: Invoice[] = [];
  const now = new Date();

  for (let i = 0; i < 30; i++) {
    const issueDate = subDays(now, Math.floor(Math.random() * 180));
    const dueDate = new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const subtotal = Math.round((Math.random() * 5000 + 500) * 100) / 100;
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const statuses: ('draft' | 'sent' | 'paid' | 'overdue')[] = ['draft', 'sent', 'paid', 'overdue'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const items = [
      {
        id: `item-${i}-1`,
        description: services[Math.floor(Math.random() * services.length)],
        quantity: Math.floor(Math.random() * 5) + 1,
        rate: Math.round((Math.random() * 200 + 50) * 100) / 100,
        amount: subtotal
      }
    ];

    invoices.push({
      id: `inv-${i + 1}`,
      invoiceNumber: `INV-${String(i + 1).padStart(4, '0')}`,
      customerName: customers[Math.floor(Math.random() * customers.length)],
      customerEmail: `customer${i + 1}@example.com`,
      customerAddress: `${Math.floor(Math.random() * 999) + 1} Street, Phnom Penh, Cambodia`,
      issueDate: format(issueDate, 'yyyy-MM-dd'),
      dueDate: format(dueDate, 'yyyy-MM-dd'),
      items,
      subtotal,
      tax,
      total,
      currency: 'USD',
      status,
      notes: Math.random() > 0.7 ? 'Special discount applied' : undefined,
      createdAt: format(issueDate, 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx')
    });
  }

  return invoices;
}

export function generateSampleExpenses(): Expense[] {
  const vendors = [
    'Office Depot',
    'Starbucks Coffee',
    'Shell Gas Station',
    'Amazon Business',
    'FedEx Office',
    'Restaurant Cambodia',
    'Khmer Market',
    'Phnom Penh Hotel',
    'Lucky Supermarket',
    'Brown Coffee',
    'Microsoft Office',
    'Adobe Creative Suite',
    'Zoom Pro',
    'Slack Premium',
    'Dropbox Business'
  ];

  const categories = [
    'Office Supplies',
    'Travel',
    'Marketing',
    'Utilities',
    'Equipment',
    'Professional Services',
    'Meals & Entertainment',
    'Software & Subscriptions',
    'Other'
  ];

  const descriptions = [
    'Business meeting refreshments',
    'Office supplies purchase',
    'Business travel fuel',
    'Equipment and supplies',
    'Document printing services',
    'Client dinner meeting',
    'Office snacks and beverages',
    'Business accommodation',
    'Monthly grocery supplies',
    'Team coffee meeting',
    'Software license renewal',
    'Cloud storage subscription',
    'Professional development',
    'Marketing materials',
    'Equipment maintenance'
  ];

  const expenses: Expense[] = [];
  const now = new Date();

  // Generate expenses for the last 6 months
  for (let i = 0; i < 50; i++) {
    const date = subDays(now, Math.floor(Math.random() * 180));
    const amount = Math.round((Math.random() * 500 + 10) * 100) / 100;
    const tax = amount * 0.1;

    const items = [
      {
        id: `exp-item-${i}-1`,
        name: descriptions[Math.floor(Math.random() * descriptions.length)],
        amount: amount,
        currency: 'USD',
        category: categories[Math.floor(Math.random() * categories.length)],
        description: descriptions[Math.floor(Math.random() * descriptions.length)]
      }
    ];

    expenses.push({
      id: `exp-${i + 1}`,
      vendor: vendors[Math.floor(Math.random() * vendors.length)],
      amount,
      date: format(date, 'yyyy-MM-dd'),
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      tax,
      type: Math.random() > 0.1 ? 'expense' : 'income',
      currency: 'USD',
      items,
      createdAt: format(date, 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx')
    });
  }

  return expenses;
}

export function generateSampleData() {
  return {
    invoices: generateSampleInvoices(),
    expenses: generateSampleExpenses()
  };
} 