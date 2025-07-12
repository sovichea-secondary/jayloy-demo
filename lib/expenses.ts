import { supabase } from './supabase';

export interface ExpenseData {
  vendor: string;
  amount: number;
  date: string;
  description: string;
  tax: number;
  receipt_url: string | null;
}

export async function saveExpense(data: ExpenseData) {
  const { error } = await supabase
    .from('expenses')
    .insert([data]);

  if (error) {
    throw new Error(`Failed to save expense: ${error.message}`);
  }
}

export async function getExpenses() {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch expenses: ${error.message}`);
  }

  return data || [];
}

export async function deleteExpense(id: string) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete expense: ${error.message}`);
  }
}