import React from 'react';
import { Home, History } from 'lucide-react';
import { ViewState } from '../types';

interface NavBarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ currentView, onChangeView }) => {
  // If we are in 'result' view, we highlight 'home' or 'history' depending on context? 
  // For simplicity, let's treat result as a detail view that sits on top, but the nav 
  // lets you jump back to main tabs.
  const activeTab = currentView === 'history' ? 'history' : 'home';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <button
          onClick={() => onChangeView('home')}
          className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
            activeTab === 'home' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          <span className="text-xs font-medium">Scan</span>
        </button>

        <button
          onClick={() => onChangeView('history')}
          className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
            activeTab === 'history' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <History size={24} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
          <span className="text-xs font-medium">History</span>
        </button>
      </div>
    </nav>
  );
};