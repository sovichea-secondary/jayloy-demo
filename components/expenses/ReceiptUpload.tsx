'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExpenseForm } from './ExpenseForm';
import { ReceiptInspection } from './ReceiptInspection';
import { parseReceiptWithAI } from '@/lib/ai-parser';
import { Expense, useData } from '@/contexts/DataContext';

interface ReceiptUploadProps {
  onSaved: () => void;
}

type ReceiptState = {
  file: File;
  url: string;
  status: 'pending' | 'processing' | 'processed' | 'error' | 'skipped';
  parsedData?: any;
  error?: string;
  showInspection?: boolean;
  showForm?: boolean;
};

export function ReceiptUpload({ onSaved }: ReceiptUploadProps) {
  const { addExpense, setExpenses, expenses } = useData();
  const [receipts, setReceipts] = useState<ReceiptState[]>([]);
  const [parsing, setParsing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newReceipts: ReceiptState[] = acceptedFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      status: 'pending',
    }));
    setReceipts(prev => [...prev, ...newReceipts]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleProcessAll = async () => {
    setParsing(true);
    setReceipts(prev => prev.map(r => r.status === 'pending' ? { ...r, status: 'processing' } : r));
    const results: ReceiptState[] = await Promise.all(
      receipts.map(async (receipt, idx) => {
        if (receipt.status !== 'pending') return receipt;
        try {
          const parsedData = await parseReceiptWithAI(receipt.file);
          return {
            ...receipt,
            parsedData,
            status: 'processed' as const,
            showInspection: true,
            showForm: false,
          };
        } catch (error: any) {
          return {
            ...receipt,
            status: 'error' as const,
            error: error.message || 'Failed to process',
          };
        }
      })
    );
    setReceipts(results);
    setParsing(false);
  };

  const handleRemove = (idx: number) => {
    setReceipts(prev => {
      const toRemove = prev[idx];
      if (toRemove && toRemove.url) URL.revokeObjectURL(toRemove.url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSkip = (idx: number) => {
    setReceipts(prev => prev.map((r, i) => i === idx ? { ...r, status: 'skipped' } : r));
  };

  const handleConfirmInspection = (idx: number) => {
    setReceipts(prev => prev.map((r, i) => i === idx ? { ...r, showInspection: false, showForm: true } : r));
  };

  const handleEditInspection = (idx: number) => {
    setReceipts(prev => prev.map((r, i) => i === idx ? { ...r, showInspection: false, showForm: true } : r));
  };

  const handleRejectInspection = (idx: number) => {
    handleRemove(idx);
  };

  const handleFormSaved = (idx: number) => {
    setReceipts(prev => prev.filter((_, i) => i !== idx));
    onSaved();
  };

  const handleRemoveAll = () => {
    setReceipts(prev => {
      prev.forEach(r => { if (r.url) URL.revokeObjectURL(r.url); });
      return [];
    });
  };

  const handleConfirmAll = () => {
    setReceipts(prev => prev.map(r =>
      r.status === 'processed' ? { ...r, showInspection: false, showForm: true } : r
    ));
  };

  const handleSaveAll = () => {
    const toSave = receipts.filter(r => r.status === 'processed' && r.showForm);
    const now = Date.now();
    const newExpenses = toSave.map((r, idx) => {
      const parsed = r.parsedData || {};
      return {
        id: (now + idx).toString() + Math.random().toString(36).slice(2),
        vendor: parsed.vendor || 'Unknown Vendor',
        amount: Number(parsed.amount ?? parsed.total_amount ?? 0),
        date: parsed.date || new Date().toISOString().slice(0, 10),
        description: parsed.description || '',
        category: parsed.category || 'Uncategorized',
        tax: Number(parsed.tax ?? 0),
        receiptUrl: r.url,
        receiptData: parsed,
        type: parsed.type || 'expense',
        currency: parsed.currency || 'USD',
        items: parsed.items || [],
        createdAt: new Date().toISOString(),
      };
    });
    setExpenses([...expenses, ...newExpenses]);
    setReceipts(prev => prev.filter(r => !(r.status === 'processed' && r.showForm)));
    onSaved();
  };

  return (
    <div className="space-y-6">
      <Card 
        {...getRootProps()}
        className={`cursor-pointer transition-colors border-2 border-dashed ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <input {...getInputProps()} multiple />
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full">
              <Upload className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {isDragActive ? 'Drop your receipts here' : 'Upload receipts'}
              </p>
              <p className="text-sm text-gray-500">
                Drag & drop or click to select • PNG, JPG, PDF up to 10MB each
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {receipts.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="font-medium text-gray-700 dark:text-gray-200">
              {receipts.length} receipt{receipts.length > 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={handleProcessAll}
                disabled={parsing || receipts.every(r => r.status !== 'pending')}
                size="sm"
              >
                {parsing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {parsing ? 'Processing Receipts...' : 'Process Receipts'}
              </Button>
              <Button 
                onClick={handleConfirmAll}
                disabled={receipts.every(r => r.status !== 'processed')}
                size="sm"
                variant="outline"
              >
                Confirm All
              </Button>
              <Button 
                onClick={handleSaveAll}
                disabled={receipts.every(r => !(r.status === 'processed' && r.showForm))}
                size="sm"
                variant="default"
              >
                Save All
              </Button>
              <Button 
                onClick={handleRemoveAll}
                size="sm"
                variant="destructive"
              >
                Remove All
              </Button>
            </div>
          </div>

          {receipts.map((receipt, idx) => (
            <div key={idx} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 relative">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-16 h-16 flex items-center justify-center bg-white dark:bg-gray-900 rounded-lg border overflow-hidden">
                  {receipt.file.type.startsWith('image/') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={receipt.url} alt={receipt.file.name} className="w-full h-full object-contain" />
                  ) : (
                    <FileText className="w-8 h-8 text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{receipt.file.name}</div>
                  <div className="text-xs text-gray-500">{(receipt.file.size / 1024 / 1024).toFixed(2)} MB</div>
                  <div className="text-xs text-gray-500">Status: {receipt.status}</div>
                  {receipt.error && <div className="text-xs text-red-600">{receipt.error}</div>}
                </div>
                <div className="flex gap-2">
                  {receipt.status === 'pending' && (
                    <Button variant="outline" size="sm" onClick={() => handleRemove(idx)}>
                      <X className="w-4 h-4" /> Remove
                    </Button>
                  )}
                  {receipt.status === 'processed' && (
                    <Button variant="outline" size="sm" onClick={() => handleSkip(idx)}>
                      <X className="w-4 h-4" /> Skip
                    </Button>
                  )}
                </div>
              </div>

              {/* Inspection and Form for processed receipts */}
              {receipt.status === 'processed' && receipt.showInspection && receipt.parsedData && (
                <ReceiptInspection
                  receiptUrl={receipt.url}
                  extractedData={receipt.parsedData}
                  onConfirm={() => handleConfirmInspection(idx)}
                  onEdit={() => handleEditInspection(idx)}
                  onReject={() => handleRejectInspection(idx)}
                />
              )}
              {receipt.status === 'processed' && receipt.showForm && receipt.parsedData && (
                <div className="space-y-6 mt-4">
                  <ExpenseForm 
                    initialData={receipt.parsedData}
                    receiptUrl={receipt.url}
                    onSaved={() => handleFormSaved(idx)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}