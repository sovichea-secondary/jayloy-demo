'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, X, Eye, Edit } from 'lucide-react';
import { format } from 'date-fns';

interface ReceiptInspectionProps {
  receiptUrl: string;
  extractedData: any;
  onConfirm: () => void;
  onEdit: () => void;
  onReject: () => void;
}

export function ReceiptInspection({ 
  receiptUrl, 
  extractedData, 
  onConfirm, 
  onEdit, 
  onReject 
}: ReceiptInspectionProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'income' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-600">Receipt processed successfully</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          <Eye className="w-3 h-3 mr-1" />
          Review Mode
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receipt Image */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Uploaded Receipt</CardTitle>
            <CardDescription>Review the original receipt image</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <img 
                src={receiptUrl} 
                alt="Uploaded receipt" 
                className="w-full h-auto max-h-96 object-contain rounded-lg border"
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => window.open(receiptUrl, '_blank')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Full Size
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Extracted Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Extracted Data</CardTitle>
            <CardDescription>Review and verify the extracted information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Transaction Type:</span>
                <Badge className={getTypeColor(extractedData.type)}>
                  {extractedData.type.charAt(0).toUpperCase() + extractedData.type.slice(1)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Amount:</span>
                <span className="text-lg font-semibold">
                  {extractedData.currency} {extractedData.total_amount.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Date:</span>
                <span>{format(new Date(extractedData.date), 'MMM dd, yyyy')}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Currency:</span>
                <span>{extractedData.currency}</span>
              </div>
            </div>

            <Separator />

            {/* Items List */}
            <div>
              <h4 className="font-medium mb-3">Individual Items ({extractedData.items.length})</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {extractedData.items.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between text-sm p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.description && item.description !== item.name ? item.description : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {item.currency} {item.amount.toFixed(2)}
                      </div>
                      {item.category && (
                        <Badge variant="outline" className="text-xs mt-1">{item.category}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleConfirm}
                disabled={isConfirming}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                Confirm & Save
              </Button>
              
              <Button 
                variant="outline" 
                onClick={onEdit}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Data
              </Button>
              
              <Button 
                variant="outline" 
                onClick={onReject}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 