import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDb';
import { analyzeBusinessData, detectAnomalies } from '../services/geminiService';
import { Invoice, InvoiceStatus, LedgerEntry, Product } from '../types';
import { Button } from '../components/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Sparkles, TrendingUp, AlertOctagon, Search } from 'lucide-react';

export const CeoView: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // AI State
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [anomalies, setAnomalies] = useState<{id: string, reason: string}[]>([]);

  useEffect(() => {
    const inv = db.getInvoices();
    const leg = db.getLedger();
    const prod = db.getProducts();
    setInvoices(inv);
    setLedger(leg);
    setProducts(prod);
    
    // Auto-run anomaly detection
    detectAnomalies(inv).then(setAnomalies);
  }, []);

  const handleAskAI = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!query) return;
      
      setIsLoadingAi(true);
      const result = await analyzeBusinessData(query, invoices, products, ledger);
      setAiResponse(result.text);
      setIsLoadingAi(false);
  };

  // KPI Calculations
  const totalRevenue = ledger.filter(l => l.type === 'REVENUE').reduce((a, b) => a + b.credit, 0);
  const pendingRevenue = invoices.filter(i => i.status !== InvoiceStatus.FINALIZED).reduce((a, b) => a + b.netRevenue, 0);
  const lowStockCount = products.filter(p => p.stock <= p.reorderLevel).length;

  // Chart Data Preparation
  const revenueData = invoices
    .filter(i => i.status === InvoiceStatus.FINALIZED)
    .reduce((acc: any[], inv) => {
        const date = inv.date;
        const existing = acc.find(a => a.date === date);
        if (existing) {
            existing.amount += inv.netRevenue;
        } else {
            acc.push({ date, amount: inv.netRevenue });
        }
        return acc;
    }, [])
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-bold text-gray-900">Executive Dashboard</h2>
           <p className="text-gray-500">Real-time insights and AI-powered forecasting.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm font-medium uppercase">Total Net Revenue</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">${totalRevenue.toLocaleString()}</div>
            <div className="text-green-600 text-sm mt-1 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" /> +12% from last month
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm font-medium uppercase">Pipeline (Pending)</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">${pendingRevenue.toLocaleString()}</div>
            <div className="text-blue-600 text-sm mt-1">
                {invoices.filter(i => i.status !== InvoiceStatus.FINALIZED).length} invoices pending
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm font-medium uppercase">Inventory Health</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{products.length} Products</div>
            <div className={`${lowStockCount > 0 ? 'text-red-600' : 'text-green-600'} text-sm mt-1 font-bold`}>
                {lowStockCount} items low on stock
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-6">Revenue Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="amount" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
              </div>
          </div>

          {/* AI Anomalies */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-indigo-900">
                  <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
                  AI Anomaly Detection
              </h3>
              <div className="space-y-3">
                  {anomalies.length === 0 ? (
                      <p className="text-gray-400 text-sm italic">No anomalies detected in recent transactions.</p>
                  ) : (
                      anomalies.map((a, i) => (
                          <div key={i} className="bg-orange-50 p-3 rounded-md border border-orange-100">
                              <div className="flex items-start">
                                  <AlertOctagon className="w-4 h-4 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
                                  <div>
                                      <div className="text-xs font-bold text-orange-800">{a.id}</div>
                                      <p className="text-xs text-orange-700 mt-1">{a.reason}</p>
                                  </div>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>

      {/* AI Query Interface */}
      <div className="bg-gradient-to-r from-indigo-900 to-blue-900 rounded-xl shadow-lg p-8 text-white">
          <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold mb-2 flex items-center">
                  <Sparkles className="w-6 h-6 mr-2 text-yellow-300" />
                  Ask Gemini AI
              </h3>
              <p className="text-blue-200 mb-6">Ask natural language questions about your business data, forecasts, or stock requirements.</p>
              
              <form onSubmit={handleAskAI} className="relative">
                  <input 
                    type="text" 
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-4 pl-4 pr-32 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 backdrop-blur-sm"
                    placeholder="e.g., 'Forecast sales for next month based on current trends' or 'Which product has the highest royalty?'"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <div className="absolute right-2 top-2">
                      <Button type="submit" disabled={isLoadingAi || !query} className="bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-bold border-none">
                          {isLoadingAi ? 'Thinking...' : 'Analyze'}
                      </Button>
                  </div>
              </form>

              {aiResponse && (
                  <div className="mt-6 bg-white/10 rounded-lg p-6 border border-white/10 backdrop-blur-md animate-fade-in">
                      <h4 className="text-sm font-bold text-yellow-300 uppercase tracking-wider mb-2">AI Analysis Result</h4>
                      <p className="leading-relaxed text-blue-50">{aiResponse}</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};