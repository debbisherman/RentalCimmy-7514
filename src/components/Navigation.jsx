import React from 'react';
import { NavLink } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useApp } from '../store/AppContext';

const { FiHome, FiUsers, FiDollarSign, FiLogOut } = FiIcons;

const Navigation = () => {
  const { role, signOut, profile, user } = useApp();

  // Safety check: if email matches info@cimmeronstudios.com, force super_admin status locally
  const activeRole = user?.email === 'info@cimmeronstudios.com' ? 'super_admin' : role;
  
  const isAdmin = activeRole === 'landlord' || activeRole === 'super_admin';
  const isSuperAdmin = activeRole === 'super_admin';

  const navItems = isAdmin 
    ? [
        { path: '/', label: 'Overview', icon: FiHome },
        { path: '/renters', label: 'Renters', icon: FiUsers },
        { path: '/payments', label: 'Payments', icon: FiDollarSign },
      ] 
    : [
        { path: '/', label: 'My Dashboard', icon: FiHome },
        { path: '/my-payments', label: 'My Payments', icon: FiDollarSign },
      ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 text-blue-700">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <SafeIcon icon={FiHome} className="text-xl" />
          </div>
          <h1 className="font-black text-xl tracking-tight text-gray-900">PropTrack</h1>
        </div>
      </div>

      <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
        <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Main Menu</p>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-semibold'
              }`
            }
          >
            <SafeIcon icon={item.icon} className="text-xl" />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-gray-100 space-y-4">
        <div className="px-4 py-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Identity</p>
            {isSuperAdmin && (
              <span className="bg-purple-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                Super Admin
              </span>
            )}
          </div>
          <p className="text-sm font-black text-gray-900 truncate">{profile?.full_name || 'User'}</p>
          <p className="text-[10px] text-blue-600 font-bold truncate mt-0.5">{user?.email}</p>
        </div>

        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold group"
        >
          <div className="p-2 rounded-lg bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
            <SafeIcon icon={FiLogOut} className="text-lg" />
          </div>
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Navigation;