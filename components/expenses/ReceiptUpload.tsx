'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExpenseForm } from './ExpenseForm';
import { parseReceiptWithAI } from '@/lib/ai-parser';

interface ReceiptUploadProps {
  onSaved: () => void;
}

export function ReceiptUpload({ onSaved }: ReceiptUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      setParsedData(null);
      setFileUrl(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleProcessReceipt = async () => {
    if (!file) return;

    try {
      setParsing(true);
      
      // Create a mock file URL for demo
      const mockUrl = URL.createObjectURL(file);
      setFileUrl(mockUrl);
      
      // Parse receipt with AI
      const extractedData = await parseReceiptWithAI(file);
      setParsedData(extractedData);
      
    } catch (error) {
      console.error('Error processing receipt:', error);
      alert('Failed to process receipt. Please try again.');
    } finally {
      setParsing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedData(null);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
  };

  if (parsedData && fileUrl) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">Receipt processed successfully</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <X className="w-4 h-4 mr-2" />
            Upload New Receipt
          </Button>
        </div>
        
        <ExpenseForm 
          initialData={parsedData}
          receiptUrl={fileUrl}
          onSaved={() => {
            onSaved();
            handleReset();
          }}
        />
      </div>
    );
  }

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
          <input {...getInputProps()} />
          
          {file ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full">
                {file.type.startsWith('image/') ? (
                  <Image className="w-8 h-8 text-blue-600" />
                ) : (
                  <FileText className="w-8 h-8 text-blue-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Badge variant="secondary">Ready to process</Badge>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full">
                <Upload className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {isDragActive ? 'Drop your receipt here' : 'Upload receipt'}
                </p>
                <p className="text-sm text-gray-500">
                  Drag & drop or click to select • PNG, JPG, PDF up to 10MB
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {file && (
        <div className="flex justify-center">
          <Button 
            onClick={handleProcessReceipt}
            disabled={parsing}
            size="lg"
            className="min-w-[200px]"
          >
            {parsing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {parsing ? 'Processing with AI...' : 'Process Receipt'}
          </Button>
        </div>
      )}
    </div>
  );
}