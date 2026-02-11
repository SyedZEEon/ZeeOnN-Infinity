import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDb';
import { Invoice, InvoiceStatus, Product, Role } from '../types';
import { Button } from '../components/Button';
import { PackageCheck, AlertTriangle } from 'lucide-react';

export const StockView: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => {
      setInvoices(db.getInvoices());
      setProducts(db.getProducts());
  };

  const handleApprove = (id: string) => {
    try {
      setError(null);
      db.approveInvoice(id, Role.STOCK, 'Steve StockManager');
      refresh();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const pendingInvoices = invoices.filter(i => 
    (i.status === InvoiceStatus.PENDING_APPROVAL || 
    (i.status === InvoiceStatus.APPROVED_ACCOUNTS && !i.approvals.stock?.approved))
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">Stock Management</h2>
           <p className="text-gray-500">Inventory tracking and fulfillment approvals.</p>
        </div>
        {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md border border-red-200 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {error}
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 font-semibold">Current Inventory</div>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {products.map(p => (
                        <tr key={p.id}>
                            <td className="px-4 py-3">{p.name}</td>
                            <td className="px-4 py-3 font-mono">{p.stock}</td>
                            <td className="px-4 py-3">
                                {p.stock <= p.reorderLevel ? (
                                    <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold flex items-center w-fit">
                                        Low Stock
                                    </span>
                                ) : (
                                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">OK</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Pending Approvals */}
        <div className="space-y-4">
             <div className="font-semibold text-lg flex items-center">
                <PackageCheck className="w-5 h-5 mr-2 text-indigo-600" />
                Fulfillment Requests
             </div>
             {pendingInvoices.length === 0 ? (
                 <div className="text-gray-500 bg-white p-6 rounded border text-center">No pending stock requests.</div>
             ) : (
                 pendingInvoices.map(invoice => {
                     // Check availability for this invoice
                     const canFulfill = invoice.items.every(item => {
                         const p = products.find(prod => prod.id === item.productId);
                         return p && p.stock >= item.quantity;
                     });

                     return (
                        <div key={invoice.id} className="bg-white p-5 rounded-lg border shadow-sm relative overflow-hidden">
                            {!canFulfill && <div className="absolute top-0 left-0 w-1 bg-red-500 h-full"></div>}
                            <div className="flex justify-between mb-3">
                                <h4 className="font-bold">{invoice.schoolName}</h4>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{invoice.id}</span>
                            </div>
                            <div className="space-y-2 mb-4">
                                {invoice.items.map(item => {
                                    const p = products.find(prod => prod.id === item.productId);
                                    const isShort = (p?.stock || 0) < item.quantity;
                                    return (
                                        <div key={item.productId} className="flex justify-between text-sm">
                                            <span>{item.productName} (x{item.quantity})</span>
                                            <span className={isShort ? "text-red-600 font-bold" : "text-gray-600"}>
                                                Avail: {p?.stock}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                            <Button 
                                variant="primary" 
                                className="w-full" 
                                disabled={!canFulfill}
                                onClick={() => handleApprove(invoice.id)}
                            >
                                {canFulfill ? "Confirm Stock & Sign" : "Insufficient Stock"}
                            </Button>
                        </div>
                     )
                 })
             )}
        </div>
      </div>
    </div>
  );
};