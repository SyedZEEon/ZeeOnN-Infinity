import { Invoice, InvoiceStatus, Product, LedgerEntry, Role } from '../types';

// Initial Mock Data
const INITIAL_PRODUCTS: Product[] = [
  { id: 'P001', name: 'Mathematics Textbook Gr 10', price: 45.00, stock: 500, reorderLevel: 100, category: 'Books' },
  { id: 'P002', name: 'Science Lab Kit', price: 120.00, stock: 50, reorderLevel: 20, category: 'Equipment' },
  { id: 'P003', name: 'School Uniform Set', price: 85.00, stock: 200, reorderLevel: 50, category: 'Apparel' },
  { id: 'P004', name: 'Luminate Tablet', price: 350.00, stock: 15, reorderLevel: 25, category: 'Electronics' },
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-2023-001',
    schoolName: 'Lincoln High',
    date: '2023-10-15',
    items: [{ productId: 'P001', productName: 'Mathematics Textbook Gr 10', quantity: 100, unitPrice: 45.00, total: 4500 }],
    totalAmount: 4500,
    royaltyFee: 675,
    netRevenue: 3825,
    status: InvoiceStatus.FINALIZED,
    approvals: {
      accounts: { approved: true, by: 'Alice Accountant', date: '2023-10-16', signature: 'digi_sig_alice_x89' },
      stock: { approved: true, by: 'Steve Stock', date: '2023-10-16', signature: 'digi_sig_steve_p22' }
    },
    luminateSyncStatus: 'SYNCED'
  }
];

class MockDB {
  private products: Product[] = [...INITIAL_PRODUCTS];
  private invoices: Invoice[] = [...INITIAL_INVOICES];
  private ledger: LedgerEntry[] = [];

  constructor() {
    // Load from local storage if available, otherwise use defaults
    const storedInvoices = localStorage.getItem('erp_invoices');
    const storedProducts = localStorage.getItem('erp_products');
    const storedLedger = localStorage.getItem('erp_ledger');

    if (storedInvoices) this.invoices = JSON.parse(storedInvoices);
    if (storedProducts) this.products = JSON.parse(storedProducts);
    if (storedLedger) this.ledger = JSON.parse(storedLedger);

    // If ledger is empty but invoices exist, reconstruct ledger for finalized invoices
    if (this.ledger.length === 0 && this.invoices.length > 0) {
        this.invoices.forEach(inv => {
            if (inv.status === InvoiceStatus.FINALIZED) {
                this.addToLedger(inv);
            }
        })
    }
  }

  private save() {
    localStorage.setItem('erp_invoices', JSON.stringify(this.invoices));
    localStorage.setItem('erp_products', JSON.stringify(this.products));
    localStorage.setItem('erp_ledger', JSON.stringify(this.ledger));
  }

  getProducts() { return this.products; }
  getInvoices() { return this.invoices; }
  getLedger() { return this.ledger; }

  createInvoice(schoolName: string, items: { product: Product, qty: number }[]): Invoice {
    const totalAmount = items.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
    const royaltyFee = totalAmount * 0.15;
    const netRevenue = totalAmount - royaltyFee;

    const newInvoice: Invoice = {
      id: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      schoolName,
      date: new Date().toISOString().split('T')[0],
      items: items.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        quantity: i.qty,
        unitPrice: i.product.price,
        total: i.product.price * i.qty
      })),
      totalAmount,
      royaltyFee,
      netRevenue,
      status: InvoiceStatus.PENDING_APPROVAL,
      approvals: {}
    };

    this.invoices.unshift(newInvoice);
    this.save();
    return newInvoice;
  }

  approveInvoice(id: string, role: Role.ACCOUNTS | Role.STOCK, approverName: string) {
    const invoice = this.invoices.find(i => i.id === id);
    if (!invoice) throw new Error("Invoice not found");

    const signature = `sig_${role.toLowerCase()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    if (role === Role.ACCOUNTS) {
      invoice.approvals.accounts = { approved: true, by: approverName, date: now, signature };
    } else if (role === Role.STOCK) {
      // Validate stock first
      const sufficientStock = invoice.items.every(item => {
        const product = this.products.find(p => p.id === item.productId);
        return product && product.stock >= item.quantity;
      });

      if (!sufficientStock) throw new Error("Insufficient stock to approve");

      invoice.approvals.stock = { approved: true, by: approverName, date: now, signature };
    }

    // Check if both approved
    if (invoice.approvals.accounts?.approved && invoice.approvals.stock?.approved) {
      this.finalizeInvoice(invoice);
    } else if (invoice.approvals.accounts?.approved) {
        invoice.status = InvoiceStatus.APPROVED_ACCOUNTS;
    } else if (invoice.approvals.stock?.approved) {
        invoice.status = InvoiceStatus.APPROVED_STOCK;
    }

    this.save();
    return invoice;
  }

  private finalizeInvoice(invoice: Invoice) {
    invoice.status = InvoiceStatus.FINALIZED;
    
    // Deduct Stock
    invoice.items.forEach(item => {
      const product = this.products.find(p => p.id === item.productId);
      if (product) {
        product.stock -= item.quantity;
      }
    });

    // Add to Ledger
    this.addToLedger(invoice);
    
    // Simulate Luminate Sync
    setTimeout(() => {
        invoice.luminateSyncStatus = 'SYNCED';
        this.save();
    }, 2000);
  }

  private addToLedger(invoice: Invoice) {
    // Simple double-entry simulation
    // Debit Accounts Receivable (Total)
    // Credit Revenue (Net)
    // Credit Royalty Payable (Royalty)
    
    this.ledger.push({
      id: `LED-${Date.now()}-1`,
      date: invoice.date,
      invoiceId: invoice.id,
      description: `Invoice Revenue - ${invoice.schoolName}`,
      debit: 0,
      credit: invoice.netRevenue,
      type: 'REVENUE'
    });

    this.ledger.push({
      id: `LED-${Date.now()}-2`,
      date: invoice.date,
      invoiceId: invoice.id,
      description: `Royalty Fee 15% - ${invoice.schoolName}`,
      debit: 0,
      credit: invoice.royaltyFee,
      type: 'ROYALTY'
    });
  }
}

export const db = new MockDB();