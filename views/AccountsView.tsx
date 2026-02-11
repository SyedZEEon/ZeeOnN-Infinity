import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDb';
import { Invoice, InvoiceStatus, Role } from '../types';
import { Button } from '../components/Button';
import { CheckCircle, XCircle, FileCheck } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const AccountsView: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [ledger, setLedger] = useState(db.getLedger());

  useEffect(() => {
    setInvoices(db.getInvoices());
    setLedger(db.getLedger());
  }, []);

  const handleApprove = (id: string) => {
    try {
      db.approveInvoice(id, Role.ACCOUNTS, 'Alice Accountant');
      setInvoices(db.getInvoices());
      setLedger(db.getLedger());
    } catch (e) {
      alert("Error approving invoice");
    }
  };

  const pendingInvoices = invoices.filter(i => 
    i.status === InvoiceStatus.PENDING_APPROVAL || 
    (i.status === InvoiceStatus.APPROVED_STOCK && !i.approvals.accounts?.approved)
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Accounts Department</h2>
        <p className="text-gray-500">Review invoices and monitor financial ledger.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Approvals */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-semibold flex items-center">
            <FileCheck className="w-5 h-5 mr-2 text-blue-600" />
            Pending Approvals
          </h3>
          
          {pendingInvoices.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border text-center text-gray-500">
              No invoices pending Accounts approval.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingInvoices.map(invoice => (
                <div key={invoice.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg">{invoice.schoolName}</h4>
                      <div className="text-sm text-gray-500">ID: {invoice.id} • Date: {invoice.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">${invoice.totalAmount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Royalty (15%): ${invoice.royaltyFee.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded text-sm mb-4">
                     <p className="font-medium mb-1">Items:</p>
                     <ul className="list-disc list-inside text-gray-600">
                        {invoice.items.map((item, idx) => (
                            <li key={idx}>{item.quantity}x {item.productName}</li>
                        ))}
                     </ul>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="text-sm text-gray-500">
                        Stock Approval: 
                        {invoice.approvals.stock?.approved ? 
                            <span className="text-green-600 ml-1 font-medium">Verified</span> : 
                            <span className="text-yellow-600 ml-1 font-medium">Pending</span>
                        }
                    </div>
                    <div className="space-x-2">
                        <Button variant="danger" size="sm" onClick={() => alert("Rejection logic placeholder")}>Reject</Button>
                        <Button variant="success" size="sm" onClick={() => handleApprove(invoice.id)}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Sign & Approve
                        </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ledger Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
            <h3 className="text-lg font-semibold mb-4">Financial Ledger</h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {ledger.length === 0 && <p className="text-gray-400 text-sm">No entries yet.</p>}
                {[...ledger].reverse().map(entry => (
                    <div key={entry.id} className="text-sm border-b pb-3 last:border-0">
                        <div className="flex justify-between text-gray-500 text-xs mb-1">
                            <span>{entry.date}</span>
                            <span>{entry.type}</span>
                        </div>
                        <div className="font-medium text-gray-800">{entry.description}</div>
                        <div className="flex justify-between mt-1">
                            {entry.credit > 0 ? (
                                <span className="text-green-600 font-bold">+${entry.credit.toLocaleString()}</span>
                            ) : (
                                <span className="text-red-600 font-bold">-${entry.debit.toLocaleString()}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};