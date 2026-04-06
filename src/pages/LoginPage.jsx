import React, { useState } from 'react';
import { supabase } from '../supabase/supabase';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiMail, FiLock, FiHome, FiAlertCircle } = FiIcons;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) throw authError;
    } catch (err) {
      setError(err.message || "Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
        {/* Header Section */}
        <div className="p-12 text-center bg-blue-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="flex justify-center mb-6 relative z-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[24px] flex items-center justify-center shadow-inner">
              <SafeIcon icon={FiHome} className="text-4xl" />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight relative z-10">PropTrack</h1>
          <p className="text-blue-100 text-[10px] mt-2 uppercase tracking-[0.2em] font-black opacity-80 relative z-10">
            Secure Management Portal
          </p>
        </div>

        {/* Form Section */}
        <div className="p-12">
          <div className="mb-10 text-center">
            <h2 className="text-xl font-black text-gray-900">Welcome Back</h2>
            <p className="text-gray-400 text-sm font-medium mt-1">Authorized access only</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <SafeIcon icon={FiAlertCircle} className="text-lg shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">
                  Email Address
                </label>
                <div className="relative group">
                  <SafeIcon icon={FiMail} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    required 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] focus:bg-white focus:border-blue-600 focus:ring-0 outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300" 
                    placeholder="name@email.com" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">
                  Secure Password
                </label>
                <div className="relative group">
                  <SafeIcon icon={FiLock} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    required 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] focus:bg-white focus:border-blue-600 focus:ring-0 outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>
            </div>

            <button 
              disabled={loading} 
              type="submit" 
              className="w-full py-5 bg-blue-600 text-white rounded-[20px] font-black shadow-xl shadow-blue-100 disabled:opacity-50 uppercase tracking-widest text-sm hover:bg-blue-700 hover:shadow-blue-200 transition-all active:scale-[0.98] mt-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </span>
              ) : 'Access Portal'}
            </button>
          </form>

          <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-10">
            Internal Property Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;