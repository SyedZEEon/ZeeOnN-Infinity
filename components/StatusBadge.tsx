import React from 'react';
import { InvoiceStatus } from '../types';

export const StatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
  const styles = {
    [InvoiceStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    [InvoiceStatus.PENDING_APPROVAL]: 'bg-yellow-100 text-yellow-800',
    [InvoiceStatus.APPROVED_ACCOUNTS]: 'bg-blue-100 text-blue-800',
    [InvoiceStatus.APPROVED_STOCK]: 'bg-indigo-100 text-indigo-800',
    [InvoiceStatus.FINALIZED]: 'bg-green-100 text-green-800',
    [InvoiceStatus.REJECTED]: 'bg-red-100 text-red-800',
  };

  const labels = {
    [InvoiceStatus.DRAFT]: 'Draft',
    [InvoiceStatus.PENDING_APPROVAL]: 'Pending Approval',
    [InvoiceStatus.APPROVED_ACCOUNTS]: 'Accts Approved',
    [InvoiceStatus.APPROVED_STOCK]: 'Stock Approved',
    [InvoiceStatus.FINALIZED]: 'Finalized',
    [InvoiceStatus.REJECTED]: 'Rejected',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};