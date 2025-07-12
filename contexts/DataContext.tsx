'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Expense {
  id: string;
  vendor: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  tax: number;
  receiptUrl?: string;
  receiptData?: any;
  type: 'expense' | 'income';
  currency: string;
  createdAt: string;
}

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  balance: number;
  reconciled: boolean;
  matchedInvoiceId?: string;
  matchedExpenseId?: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  baseSalary: number;
  allowances: number;
  nssfDeduction: number;
  taxDeduction: number;
  netSalary: number;
  startDate: string;
  status: 'active' | 'inactive';
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  reorderLevel: number;
  category: string;
  unit: string;
}

interface DataContextType {
  invoices: Invoice[];
  expenses: Expense[];
  bankTransactions: BankTransaction[];
  employees: Employee[];
  products: Product[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addBankTransaction: (transaction: Omit<BankTransaction, 'id'>) => void;
  updateBankTransaction: (id: string, transaction: Partial<BankTransaction>) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('jayloy_invoices', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('jayloy_expenses', []);
  const [bankTransactions, setBankTransactions] = useLocalStorage<BankTransaction[]>('jayloy_bank_transactions', []);
  const [employees, setEmployees] = useLocalStorage<Employee[]>('jayloy_employees', []);
  const [products, setProducts] = useLocalStorage<Product[]>('jayloy_products', []);

  const addInvoice = (invoice: Omit<Invoice, 'id' | 'createdAt'>) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setInvoices(prev => [...prev, newInvoice]);
  };

  const updateInvoice = (id: string, invoice: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...invoice } : inv));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setExpenses(prev => [...prev, newExpense]);
  };

  const updateExpense = (id: string, expense: Partial<Expense>) => {
    setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, ...expense } : exp));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  const addBankTransaction = (transaction: Omit<BankTransaction, 'id'>) => {
    const newTransaction: BankTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setBankTransactions(prev => [...prev, newTransaction]);
  };

  const updateBankTransaction = (id: string, transaction: Partial<BankTransaction>) => {
    setBankTransactions(prev => prev.map(trans => trans.id === id ? { ...trans, ...transaction } : trans));
  };

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: Date.now().toString(),
    };
    setEmployees(prev => [...prev, newEmployee]);
  };

  const updateEmployee = (id: string, employee: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...employee } : emp));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, product: Partial<Product>) => {
    setProducts(prev => prev.map(prod => prod.id === id ? { ...prod, ...product } : prod));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(prod => prod.id !== id));
  };

  return (
    <DataContext.Provider value={{
      invoices,
      expenses,
      bankTransactions,
      employees,
      products,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      addExpense,
      updateExpense,
      deleteExpense,
      addBankTransaction,
      updateBankTransaction,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      addProduct,
      updateProduct,
      deleteProduct,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}