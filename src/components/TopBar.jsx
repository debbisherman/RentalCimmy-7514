import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useApp } from '../store/AppContext';

const { FiBell } = FiIcons;

const TopBar = () => {
  const { role, profile, user } = useApp();
  
  const isAdmin = role === 'landlord' || role === 'super_admin';
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
          {role?.replace('_', ' ')}
        </h2>
      </div>
      
      <div className="flex items-center gap-6">
        <button className="text-gray-400 hover:text-blue-600 transition-colors">
          <SafeIcon icon={FiBell} className="text-xl" />
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-gray-900 leading-none">{displayName}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Status Active</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-100">
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;