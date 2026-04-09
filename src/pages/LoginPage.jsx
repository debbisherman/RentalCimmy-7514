import React, { useState } from 'react';
import { supabase } from '../supabase/supabase';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiMail, FiLock, FiHome, FiUser } = FiIcons;

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('landlord');
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      } else {
        // Special logic for Super Admin registration
        let userRole = role;
        if (email === 'info@cimmeronstudios.com') {
          userRole = 'super_admin';
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles_20240520')
            .insert([{
              id: authData.user.id,
              role: userRole,
              full_name: fullName,
              email
            }]);

          if (profileError) throw profileError;
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8 text-center bg-blue-600 text-white">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <SafeIcon icon={FiHome} className="text-3xl" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">PropTrack</h1>
          <p className="text-blue-100 text-sm mt-1">Property Management Made Simple</p>
        </div>

        <div className="p-8">
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                isLogin ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                !isLogin ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
                {error}
              </div>
            )}

            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
                  <div className="relative">
                    <SafeIcon icon={FiUser} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      required
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">I am a...</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="landlord">Landlord</option>
                    <option value="renter">Renter</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
              <div className="relative">
                <SafeIcon icon={FiMail} className="absolute left-3 top-3 text-gray-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Password</label>
              <div className="relative">
                <SafeIcon icon={FiLock} className="absolute left-3 top-3 text-gray-400" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          
          {isLogin && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Super Admin Access</p>
              <p className="text-xs text-gray-600">Email: info@cimmeronstudios.com</p>
              <p className="text-xs text-gray-600">Pass: crm123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;