import React from 'react';
import { LayoutDashboard, ShoppingCart, FileText, Package, PieChart, LogOut, Settings } from 'lucide-react';
import { Role, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, currentView, onNavigate }) => {
  const getNavItems = () => {
    const common = [];
    
    if (user.role === Role.CEO) {
      common.push({ id: 'dashboard', label: 'CEO Dashboard', icon: LayoutDashboard });
      common.push({ id: 'finance', label: 'Financial Reports', icon: PieChart });
    }
    
    if (user.role === Role.SALES || user.role === Role.CEO) {
      common.push({ id: 'sales', label: 'Sales & Orders', icon: ShoppingCart });
    }
    
    if (user.role === Role.ACCOUNTS || user.role === Role.CEO) {
      common.push({ id: 'accounts', label: 'Invoices & Ledger', icon: FileText });
    }
    
    if (user.role === Role.STOCK || user.role === Role.CEO) {
      common.push({ id: 'stock', label: 'Inventory Management', icon: Package });
    }

    return common;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">LuminateERP</h1>
          <p className="text-xs text-slate-400 mt-1">AI-Powered Enterprise</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {getNavItems().map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                currentView === item.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-slate-400">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
};