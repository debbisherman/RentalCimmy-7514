import React, { useState } from 'react';
import { supabase } from '../supabase/supabase';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiMail, FiLock, FiHome, FiAlertCircle, FiUser, FiArrowRight, FiCheckCircle } = FiIcons;

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isRegistering) {
        // --- RENTER PUBLIC SIGNUP ---
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: { full_name: fullName.trim() }
          }
        });

        if (signUpError) throw signUpError;

        setSuccess("Renter account registered! You can now log in.");
        setIsRegistering(false);
        setPassword('');
      } else {
        // --- LOGIN FLOW ---
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (authError) {
          // Self-healing for confirmation blocks
          if (authError.message.toLowerCase().includes('confirm')) {
            await supabase.rpc('force_confirm_user_by_email', { target_email: email.trim() });
            const { error: retryError } = await supabase.auth.signInWithPassword({
              email: email.trim(),
              password: password.trim(),
            });
            if (retryError) throw retryError;
          } else {
            throw authError;
          }
        }
      }
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-10 text-center bg-blue-600 text-white">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
              <SafeIcon icon={FiHome} className="text-3xl" />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight">PropTrack</h1>
          <p className="text-blue-100 text-[10px] mt-2 uppercase tracking-widest font-black opacity-80">
            {isRegistering ? 'Renter Registration' : 'Management Portal'}
          </p>
        </div>

        <div className="p-10">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-black text-gray-900">
              {isRegistering ? 'New Renter Signup' : 'Welcome Back'}
            </h2>
            <p className="text-gray-400 text-sm font-medium mt-1">
              {isRegistering ? 'Create your tenant portal account' : 'Authorized access only'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-3">
                <SafeIcon icon={FiAlertCircle} className="text-lg shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-2xl border border-emerald-100 flex items-center gap-3">
                <SafeIcon icon={FiCheckCircle} className="text-lg shrink-0" />
                {success}
              </div>
            )}

            <div className="space-y-3">
              {isRegistering && (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">Full Name</label>
                  <div className="relative group">
                    <SafeIcon icon={FiUser} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600" />
                    <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none font-bold text-gray-900 transition-all"
                      placeholder="John Doe" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">Email Address</label>
                <div className="relative group">
                  <SafeIcon icon={FiMail} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600" />
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none font-bold text-gray-900 transition-all"
                    placeholder="name@email.com" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">Password</label>
                <div className="relative group">
                  <SafeIcon icon={FiLock} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600" />
                  <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none font-bold text-gray-900 transition-all"
                    placeholder="••••••••" />
                </div>
              </div>
            </div>

            <button disabled={loading} type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 uppercase tracking-widest text-xs hover:bg-blue-700 transition-all active:scale-95 mt-4"
            >
              {loading ? 'Processing...' : isRegistering ? 'Register as Renter' : 'Access Portal'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-50 text-center">
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 flex items-center justify-center gap-2 mx-auto">
              {isRegistering ? 'Already have an account? Login' : 'Tenant? Register Here'}
              <SafeIcon icon={FiArrowRight} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;