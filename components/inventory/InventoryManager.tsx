'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { ProductForm } from './ProductForm';
import { ProductList } from './ProductList';
import { InventoryReports } from './InventoryReports';

export function InventoryManager() {
  const [activeTab, setActiveTab] = useState('products');
  const [editingProduct, setEditingProduct] = useState(null);

  const handleCreateNew = () => {
    setEditingProduct(null);
    setActiveTab('add-product');
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setActiveTab('add-product');
  };

  const handleSaved = () => {
    setActiveTab('products');
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage products, track stock levels, and monitor COGS
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="reports">Inventory Reports</TabsTrigger>
          <TabsTrigger value="add-product">
            {editingProduct ? 'Edit Product' : 'Add Product'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Inventory</CardTitle>
              <CardDescription>
                Manage your product catalog and stock levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductList onEdit={handleEdit} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Reports</CardTitle>
              <CardDescription>
                Stock levels, valuation, and reorder alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryReports />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-product" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </CardTitle>
              <CardDescription>
                {editingProduct 
                  ? 'Update product information and pricing'
                  : 'Enter product details, pricing, and stock information'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductForm 
                product={editingProduct} 
                onSaved={handleSaved}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}