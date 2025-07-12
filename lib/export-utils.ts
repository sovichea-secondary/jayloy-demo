import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportData {
  invoices: any[];
  expenses: any[];
  period: string;
  startDate: Date;
  endDate: Date;
}

export interface ReportMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  outstandingInvoices: number;
  outstandingAmount: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportInvoicesToCSV(invoices: any[], period: string) {
  const csvData = invoices.map(inv => ({
    'Invoice Number': inv.invoiceNumber,
    'Customer Name': inv.customerName,
    'Customer Email': inv.customerEmail,
    'Issue Date': inv.issueDate,
    'Due Date': inv.dueDate,
    'Status': inv.status,
    'Subtotal': inv.subtotal,
    'Tax': inv.tax,
    'Total': inv.total,
    'Currency': inv.currency,
    'Notes': inv.notes || ''
  }));

  exportToCSV(csvData, `invoices_${period.replace('-', '_')}`);
}

export function exportExpensesToCSV(expenses: any[], period: string) {
  const csvData = expenses.map(exp => ({
    'Vendor': exp.vendor,
    'Date': exp.date,
    'Description': exp.description,
    'Category': exp.category,
    'Type': exp.type,
    'Amount': exp.amount,
    'Tax': exp.tax,
    'Currency': exp.currency
  }));

  exportToCSV(csvData, `expenses_${period.replace('-', '_')}`);
}

export function exportProfitLossToCSV(monthlyData: MonthlyData[], metrics: ReportMetrics, period: string) {
  const csvData = [
    {
      'Report Type': 'Profit & Loss Statement',
      'Period': period,
      'Total Revenue': metrics.totalRevenue,
      'Total Expenses': metrics.totalExpenses,
      'Net Profit': metrics.netProfit,
      'Profit Margin %': metrics.profitMargin
    },
    {},
    {
      'Month': 'Monthly Breakdown',
      'Revenue': '',
      'Expenses': '',
      'Profit': ''
    },
    ...monthlyData.map(data => ({
      'Month': data.month,
      'Revenue': data.revenue,
      'Expenses': data.expenses,
      'Profit': data.profit
    }))
  ];

  exportToCSV(csvData, `profit_loss_${period.replace('-', '_')}`);
}

export async function exportToPDF(elementId: string, filename: string, title?: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for PDF export');
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

export function generatePDFContent(
  reportType: string,
  metrics: ReportMetrics,
  monthlyData: MonthlyData[],
  categoryData: CategoryData[],
  period: string
): string {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  let content = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px;">
      <h1 style="color: #1f2937; margin-bottom: 10px;">${reportType}</h1>
      <p style="color: #6b7280; margin-bottom: 30px;">Period: ${period}</p>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px;">
        <div style="background: #dbeafe; padding: 15px; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">Total Revenue</h3>
          <p style="font-size: 24px; font-weight: bold; margin: 0; color: #1e40af;">${formatCurrency(metrics.totalRevenue)}</p>
        </div>
        <div style="background: #fee2e2; padding: 15px; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0; color: #dc2626;">Total Expenses</h3>
          <p style="font-size: 24px; font-weight: bold; margin: 0; color: #dc2626;">${formatCurrency(metrics.totalExpenses)}</p>
        </div>
        <div style="background: ${metrics.netProfit >= 0 ? '#d1fae5' : '#fee2e2'}; padding: 15px; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0; color: ${metrics.netProfit >= 0 ? '#059669' : '#dc2626'};">Net ${metrics.netProfit >= 0 ? 'Profit' : 'Loss'}</h3>
          <p style="font-size: 24px; font-weight: bold; margin: 0; color: ${metrics.netProfit >= 0 ? '#059669' : '#dc2626'};">${formatCurrency(Math.abs(metrics.netProfit))}</p>
        </div>
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0; color: #d97706;">Profit Margin</h3>
          <p style="font-size: 24px; font-weight: bold; margin: 0; color: #d97706;">${formatPercentage(metrics.profitMargin)}</p>
        </div>
      </div>

      <h2 style="color: #1f2937; margin-bottom: 15px;">Monthly Breakdown</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #d1d5db;">Month</th>
            <th style="padding: 12px; text-align: right; border-bottom: 1px solid #d1d5db;">Revenue</th>
            <th style="padding: 12px; text-align: right; border-bottom: 1px solid #d1d5db;">Expenses</th>
            <th style="padding: 12px; text-align: right; border-bottom: 1px solid #d1d5db;">Profit</th>
          </tr>
        </thead>
        <tbody>
          ${monthlyData.map(data => `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${data.month}</td>
              <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatCurrency(data.revenue)}</td>
              <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatCurrency(data.expenses)}</td>
              <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; color: ${data.profit >= 0 ? '#059669' : '#dc2626'};">${formatCurrency(data.profit)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${categoryData.length > 0 ? `
        <h2 style="color: #1f2937; margin-bottom: 15px;">Expense Categories</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 12px; text-align: left; border-bottom: 1px solid #d1d5db;">Category</th>
              <th style="padding: 12px; text-align: right; border-bottom: 1px solid #d1d5db;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${categoryData.map(data => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${data.name}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatCurrency(data.value)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}
    </div>
  `;

  return content;
}

export function createPDFElement(content: string, elementId: string) {
  const existingElement = document.getElementById(elementId);
  if (existingElement) {
    existingElement.remove();
  }

  const element = document.createElement('div');
  element.id = elementId;
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  element.style.top = '0';
  element.innerHTML = content;
  document.body.appendChild(element);

  return element;
} 