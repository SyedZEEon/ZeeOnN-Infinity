import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { SalesView } from './views/SalesView';
import { AccountsView } from './views/AccountsView';
import { StockView } from './views/StockView';
import { CeoView } from './views/CeoView';
import { Role, User } from './types';
import { Button } from './components/Button';

// Mock Users
const USERS: User[] = [
  { id: '1', name: 'Cassandra CEO', role: Role.CEO, avatar: '' },
  { id: '2', name: 'Sam Sales', role: Role.SALES, avatar: '' },
  { id: '3', name: 'Alice Accountant', role: Role.ACCOUNTS, avatar: '' },
  { id: '4', name: 'Steve Stock', role: Role.STOCK, avatar: '' },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Set default view based on role
    if (user.role === Role.SALES) setCurrentView('sales');
    else if (user.role === Role.ACCOUNTS) setCurrentView('accounts');
    else if (user.role === Role.STOCK) setCurrentView('stock');
    else setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <CeoView />;
      case 'finance': return <AccountsView />; // Reusing accounts view for simplicity in report view
      case 'sales': return <SalesView />;
      case 'accounts': return <AccountsView />;
      case 'stock': return <StockView />;
      default: return <div className="p-8">View not found</div>;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">LuminateERP</h1>
            <p className="text-slate-500 mt-2">Select a role to simulate the system.</p>
          </div>
          
          <div className="space-y-3">
            {USERS.map(user => (
              <button
                key={user.id}
                onClick={() => handleLogin(user)}
                className="w-full flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  {user.name.charAt(0)}
                </div>
                <div className="ml-4 text-left">
                  <div className="font-semibold text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.role}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 text-center text-xs text-gray-400">
            Powered by React, Tailwind & Gemini AI
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={currentUser} 
      onLogout={handleLogout}
      currentView={currentView}
      onNavigate={setCurrentView}
    >
      {renderView()}
    </Layout>
  );
};

export default App;