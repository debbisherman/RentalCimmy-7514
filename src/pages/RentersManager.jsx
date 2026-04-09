import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { supabase } from '../supabase/supabase';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiMail, FiMapPin, FiSearch, FiAlertCircle, FiLock, FiShield, FiTrash2, FiSend } = FiIcons;

const RentersManager = () => {
  const { renters, addRenter, deleteRenter, role, signOut } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountModal, setAccountModal] = useState({ isOpen: false, renter: null, password: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, renter: null });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', address: '', phone: '', email: '' });

  const isSuperAdmin = role === 'super_admin';
  const filteredRenters = renters.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await addRenter(formData);
    if (!error) {
      setIsModalOpen(false);
      setFormData({ name: '', address: '', phone: '', email: '' });
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirm.renter) return;
    setLoading(true);
    const { error } = await deleteRenter(deleteConfirm.renter.id);
    if (error) alert(error.message);
    setDeleteConfirm({ isOpen: false, renter: null });
    setLoading(false);
  };

  const handleManualSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signOut();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: accountModal.renter.email,
        password: accountModal.password,
        options: { data: { full_name: accountModal.renter.name } }
      });
      if (authError) throw authError;
      if (authData.user) {
        await supabase.from('profiles_20240520').insert([{ id: authData.user.id, role: 'renter', full_name: accountModal.renter.name, email: accountModal.renter.email }]);
      }
      await supabase.auth.signOut();
      window.location.reload();
    } catch (err) {
      alert(err.message);
      setLoading(false);
    }
  };

  const handleInvite = (renter) => {
    const subject = encodeURIComponent("Access your PropTrack Tenant Dashboard");
    const body = encodeURIComponent(`Hello ${renter.name},\n\nYour tenant profile has been created for ${renter.address}.\n\nPlease register here: ${window.location.origin}\n\nUse this email: ${renter.email}`);
    window.location.href = `mailto:${renter.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-gray-900">Renters Directory</h2>
            {isSuperAdmin && <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">Global Access</span>}
          </div>
          <p className="text-gray-500 font-medium mt-1">Manage active tenant profiles and property assignments.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 active:scale-95 transition-all">
          <SafeIcon icon={FiPlus} className="text-xl" /> Add New Renter
        </button>
      </div>

      <div className="relative group">
        <SafeIcon icon={FiSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        <input type="text" placeholder="Search by name, email, or address..." className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRenters.map(renter => (
          <div key={renter.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 hover:shadow-xl transition-all group relative flex flex-col">
            {isSuperAdmin && (
              <button 
                onClick={() => setDeleteConfirm({ isOpen: true, renter })}
                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <SafeIcon icon={FiTrash2} />
              </button>
            )}
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl mb-6 shadow-lg shadow-blue-200">
              {renter.name.charAt(0)}
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-6 truncate">{renter.name}</h3>
            <div className="space-y-4 flex-1">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><SafeIcon icon={FiMapPin} /></div>
                <span className="text-sm font-bold text-gray-600 truncate">{renter.address}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400 text-sm"><SafeIcon icon={FiMail} /></div>
                <span className="text-sm font-bold text-blue-600 truncate">{renter.email}</span>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center gap-2">
              <button onClick={() => handleInvite(renter)} className="flex-1 py-2.5 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Invite</button>
              <button onClick={() => setAccountModal({ isOpen: true, renter, password: '' })} className="flex-1 py-2.5 bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Setup Login</button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiTrash2} className="text-3xl" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Delete Renter?</h3>
            <p className="text-gray-500 text-sm mt-2 mb-8">This will permanently remove <b>{deleteConfirm.renter.name}</b> and all their payment history. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm({ isOpen: false, renter: null })} className="flex-1 py-3 text-gray-500 font-bold">Cancel</button>
              <button onClick={handleDelete} disabled={loading} className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-100 disabled:opacity-50">
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Setup Modal */}
      {accountModal.isOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center bg-emerald-600 text-white">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4"><SafeIcon icon={FiShield} className="text-3xl" /></div>
              <h3 className="text-2xl font-black">Manual Account Setup</h3>
              <p className="text-emerald-100 text-sm mt-1">Creating account for {accountModal.renter.name}</p>
            </div>
            <form onSubmit={handleManualSignup} className="p-8 space-y-6">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700 text-xs font-bold leading-relaxed flex gap-3">
                <SafeIcon icon={FiAlertCircle} className="text-xl shrink-0" />
                Note: This will log you out to initialize the tenant's security session.
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Set Password</label>
                <input required type="text" placeholder="Enter password..." className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold" value={accountModal.password} onChange={e => setAccountModal({ ...accountModal, password: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setAccountModal({ isOpen: false, renter: null, password: '' })} className="flex-1 py-4 text-gray-500 font-bold">Cancel</button>
                <button type="submit" disabled={loading} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-100 disabled:opacity-50">{loading ? 'Creating...' : 'Create & Logout'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Renter Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-10 py-8 border-b border-gray-50 bg-blue-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black">Register New Renter</h3>
                <p className="text-blue-100 text-sm font-medium mt-1">Create a tenant profile for the property ledger.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><SafeIcon icon={FiPlus} className="rotate-45 text-2xl" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Full Name</label>
                  <input required type="text" placeholder="Jane Smith" className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Property Address</label>
                  <input required type="text" placeholder="123 Luxury Lane" className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Email</label>
                    <input required type="email" placeholder="jane@example.com" className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Phone</label>
                    <input type="tel" placeholder="(555) 000-0000" className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-gray-500 font-bold">Cancel</button>
                <button type="submit" disabled={loading} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100">{loading ? 'Adding...' : 'Save Tenant'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentersManager;