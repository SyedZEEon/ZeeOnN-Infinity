import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDb';
import { Product, Invoice } from '../types';
import { Button } from '../components/Button';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const SalesView: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [schoolName, setSchoolName] = useState('');
  const [cart, setCart] = useState<{ productId: string; qty: number }[]>([]);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setInvoices(db.getInvoices());
    setProducts(db.getProducts());
  };

  const addToCart = (productId: string) => {
    const existing = cart.find(i => i.productId === productId);
    if (existing) {
      setCart(cart.map(i => i.productId === productId ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { productId, qty: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(i => i.productId !== productId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName || cart.length === 0) return;

    const items = cart.map(item => ({
      product: products.find(p => p.id === item.productId)!,
      qty: item.qty
    }));

    db.createInvoice(schoolName, items);
    refreshData();
    setShowForm(false);
    setSchoolName('');
    setCart([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Order Management</h2>
          <p className="text-gray-500">Create new orders and track invoice status.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel Order' : 'New Sales Order'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">New Order Form</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">School Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Enter school name..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Select Products</label>
                <div className="border rounded-md max-h-60 overflow-y-auto">
                  {products.map(product => (
                    <div key={product.id} className="flex justify-between items-center p-3 border-b hover:bg-gray-50">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">${product.price} | Stock: {product.stock}</div>
                      </div>
                      <Button type="button" size="sm" variant="secondary" onClick={() => addToCart(product.id)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Order Cart</label>
                <div className="bg-gray-50 rounded-md p-4 min-h-[200px]">
                  {cart.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">Cart is empty</div>
                  ) : (
                    cart.map(item => {
                      const product = products.find(p => p.id === item.productId);
                      return (
                        <div key={item.productId} className="flex justify-between items-center py-2">
                          <span className="text-sm">{product?.name}</span>
                          <div className="flex items-center space-x-3">
                            <input 
                              type="number" 
                              min="1"
                              className="w-16 border rounded p-1 text-center"
                              value={item.qty}
                              onChange={(e) => {
                                const newQty = parseInt(e.target.value) || 1;
                                setCart(cart.map(c => c.productId === item.productId ? {...c, qty: newQty} : c));
                              }}
                            />
                            <button type="button" onClick={() => removeFromCart(item.productId)} className="text-red-500 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
                {cart.length > 0 && (
                   <div className="pt-2 text-right font-bold">
                     Total: ${cart.reduce((sum, item) => sum + (item.qty * (products.find(p => p.id === item.productId)?.price || 0)), 0).toFixed(2)}
                   </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={cart.length === 0}>
                Generate Invoice ID & Submit
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sync</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">{invoice.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{invoice.schoolName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{invoice.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">${invoice.totalAmount.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={invoice.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    {invoice.luminateSyncStatus === 'SYNCED' ? (
                        <span className="flex items-center text-green-600 text-xs font-bold">
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span> Synced
                        </span>
                    ) : (
                        <span className="text-gray-400 text-xs">-</span>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};