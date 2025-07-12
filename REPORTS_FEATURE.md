# Financial Reports Feature

## Overview

The Financial Reports feature provides comprehensive financial analysis and reporting capabilities for the JayLoy accounting system. It includes multiple report types, data filtering, and export functionality.

## Features

### 1. Report Types

#### Profit & Loss Statement
- **Revenue Analysis**: Tracks total revenue from paid invoices
- **Expense Breakdown**: Categorizes and analyzes expenses
- **Profit Calculation**: Calculates net profit and profit margin
- **Monthly Trends**: Line chart showing revenue, expenses, and profit over time
- **Expense Categories**: Pie chart showing expense distribution by category

#### Balance Sheet
- **Assets**: Cash & Bank, Accounts Receivable
- **Liabilities & Equity**: Accounts Payable, Owner's Equity
- **Real-time Calculations**: Automatically calculates totals based on current data

#### Cash Flow Statement
- **Cash Inflows**: Revenue from paid invoices
- **Cash Outflows**: Expenses and payments
- **Net Cash Flow**: Difference between inflows and outflows
- **Monthly Bar Chart**: Visual representation of cash flow trends

#### Tax Summary
- **VAT Output**: Sales tax calculations (10% VAT)
- **VAT Input**: Purchase tax calculations
- **Net VAT Due**: Tax obligations for the selected period

### 2. Data Filtering

#### Period Selection
- **Current Month**: Data from the current month
- **Last Month**: Data from the previous month
- **Last 3 Months**: Data from the last 3 months
- **Year to Date**: Data from January 1st to current date

#### Data Sources
- **Invoices**: Revenue data from customer invoices
- **Expenses**: Expense data from vendor receipts and transactions
- **Real-time Updates**: Data updates automatically as new records are added

### 3. Export Functionality

#### CSV Export
- **Invoice Data**: Complete invoice details with customer information
- **Expense Data**: Vendor, amount, category, and tax information
- **Profit & Loss**: Summary metrics and monthly breakdown
- **Automatic Download**: Files are automatically downloaded to the user's device

#### PDF Export
- **Professional Formatting**: Clean, professional PDF layout
- **Charts and Graphs**: Includes visual representations of data
- **Summary Tables**: Detailed breakdowns of financial metrics
- **Multiple Pages**: Handles large datasets with automatic pagination

### 4. Sample Data Generation

For testing and demonstration purposes, the system includes a "Generate Sample Data" button that creates:
- **30 Sample Invoices**: Various statuses (draft, sent, paid, overdue)
- **50 Sample Expenses**: Different categories and vendors
- **Realistic Data**: Based on Cambodian business context
- **Date Distribution**: Spread across the last 6 months

## Technical Implementation

### Key Components

#### `FinancialReports.tsx`
Main component that orchestrates the entire reports feature:
- Data filtering and calculations
- Chart rendering with Recharts
- Export functionality integration
- Period selection and state management

#### `export-utils.ts`
Utility functions for data export:
- CSV generation with proper escaping
- PDF generation using jsPDF and html2canvas
- Data formatting and structure

#### `sample-data.ts`
Sample data generation for testing:
- Realistic invoice data with Cambodian context
- Varied expense categories and vendors
- Proper date distribution for trend analysis

### Data Flow

1. **Data Source**: Uses `useData()` hook to access invoices and expenses
2. **Filtering**: Filters data based on selected period using date-fns
3. **Calculations**: Computes metrics like revenue, expenses, profit, etc.
4. **Visualization**: Renders charts using Recharts library
5. **Export**: Generates CSV/PDF files using utility functions

### Key Metrics Calculated

- **Total Revenue**: Sum of all paid invoices
- **Total Expenses**: Sum of all expense transactions
- **Net Profit**: Revenue minus expenses
- **Profit Margin**: (Net Profit / Total Revenue) × 100
- **Outstanding Amount**: Sum of unpaid invoices
- **VAT Calculations**: 10% VAT on sales and purchases

## Usage Instructions

### Accessing Reports
1. Navigate to the Reports section in the sidebar
2. Select the desired time period from the dropdown
3. View different report types using the tabs

### Generating Sample Data
1. Click the "Generate Sample Data" button
2. Wait for the confirmation message
3. The reports will automatically update with sample data

### Exporting Reports
1. Navigate to the desired report tab
2. Click "Export CSV" for spreadsheet format
3. Click "Export PDF" for document format
4. Files will be automatically downloaded

### Interpreting Charts

#### Line Chart (Monthly Trends)
- **Blue Line**: Revenue trend
- **Red Line**: Expense trend  
- **Green Line**: Profit trend
- **X-axis**: Months (last 6 months)
- **Y-axis**: Amount in USD

#### Pie Chart (Expense Categories)
- **Colors**: Different colors for each category
- **Labels**: Category name and percentage
- **Tooltip**: Hover for exact amounts

#### Bar Chart (Cash Flow)
- **Blue Bars**: Cash inflows (revenue)
- **Red Bars**: Cash outflows (expenses)
- **X-axis**: Months
- **Y-axis**: Amount in USD

## File Structure

```
components/reports/
├── FinancialReports.tsx    # Main reports component

lib/
├── export-utils.ts         # Export functionality
├── sample-data.ts          # Sample data generation

contexts/
├── DataContext.tsx         # Data management and state
```

## Dependencies

- **Recharts**: Chart rendering and visualization
- **jsPDF**: PDF generation
- **html2canvas**: HTML to canvas conversion for PDF
- **date-fns**: Date manipulation and formatting
- **Lucide React**: Icons for UI elements

## Future Enhancements

### Planned Features
- **Custom Date Ranges**: User-defined start and end dates
- **Advanced Filtering**: Filter by customer, vendor, or category
- **Comparative Reports**: Year-over-year or month-over-month comparisons
- **Scheduled Reports**: Automated report generation and email delivery
- **Drill-down Capability**: Click on chart elements for detailed views
- **Report Templates**: Customizable report layouts
- **Multi-currency Support**: Support for KHR and other currencies
- **Audit Trail**: Track changes and modifications to reports

### Technical Improvements
- **Performance Optimization**: Lazy loading for large datasets
- **Caching**: Cache calculated metrics for better performance
- **Real-time Updates**: WebSocket integration for live data updates
- **Mobile Responsiveness**: Better mobile experience
- **Accessibility**: Screen reader support and keyboard navigation

## Troubleshooting

### Common Issues

1. **No Data Displayed**
   - Check if sample data has been generated
   - Verify that invoices and expenses exist for the selected period
   - Ensure data has proper date formatting

2. **Export Not Working**
   - Check browser download settings
   - Ensure sufficient disk space
   - Try refreshing the page and retrying

3. **Charts Not Rendering**
   - Check if Recharts library is properly installed
   - Verify data format and structure
   - Check browser console for JavaScript errors

### Data Requirements

- **Invoices**: Must have `issueDate`, `status`, and `total` fields
- **Expenses**: Must have `date`, `type`, and `amount` fields
- **Date Format**: ISO date strings (YYYY-MM-DD)
- **Currency**: Currently supports USD (KHR support planned)

## Support

For technical support or feature requests, please refer to the main project documentation or contact the development team. 