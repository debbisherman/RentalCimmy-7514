import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { supabase } from '../supabase/supabase';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiMail, FiPhone, FiMapPin, FiSearch, FiEdit2, FiTrash2, FiHome, FiAlertCircle, FiLock, FiCheckCircle } = FiIcons;

const RentersManager = () => {
  const { renters = [], properties = [], addRenter, updateRenter, deleteRenter, refreshData } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRenter, setEditingRenter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', address: '', phone: '', email: '', password: '', 
    co_tenants: '', additional_phones: '', property_id: ''
  });

  const filteredRenters = renters.filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (!editingRenter) {
        // 1. Mandatory Password check for new users
        if (!formData.password || formData.password.length < 6) {
          throw new Error("A valid password (min 6 chars) is required for new accounts.");
        }

        // 2. Create AUTH Account + PROFILE via RPC (This is the key fix)
        const { data: rpcRes, error: rpcError } = await supabase.rpc('admin_create_tenant_account', {
          target_email: formData.email.trim(),
          target_password: formData.password,
          target_name: formData.name.trim()
        });

        if (rpcError) throw rpcError;
        if (rpcRes.status === 'error') throw new Error(rpcRes.message);
      }

      // 3. Save Renter Directory Data
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        co_tenants: formData.co_tenants.trim(),
        additional_phones: formData.additional_phones.trim(),
        property_id: formData.property_id || null
      };

      const { error: apiError } = editingRenter 
        ? await updateRenter(editingRenter.id, payload) 
        : await addRenter(payload);

      if (apiError) throw apiError;

      setSuccessMsg(editingRenter ? "Profile updated!" : "Account & Renter created successfully!");
      setTimeout(() => closeModal(), 1500);
      refreshData();
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyChange = (propId) => {
    const selectedProp = properties.find(p => p.id === propId);
    setFormData({ ...formData, property_id: propId, address: selectedProp ? selectedProp.address : formData.address });
  };

  const openEdit = (renter) => {
    setEditingRenter(renter);
    setFormData({
      name: renter.name || '', address: renter.address || '', phone: renter.phone || '',
      email: renter.email || '', password: '', co_tenants: renter.co_tenants || '',
      additional_phones: renter.additional_phones || '', property_id: renter.property_id || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRenter(null);
    setError('');
    setSuccessMsg('');
    setFormData({ name: '', address: '', phone: '', email: '', password: '', co_tenants: '', additional_phones: '', property_id: '' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Tenants Directory</h2>
          <p className="text-gray-500 font-medium">Manage active leaseholders and their login access</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-blue-700 transition-all">
          <SafeIcon icon={FiPlus} /> Add Renter
        </button>
      </div>

      <div className="relative">
        <SafeIcon icon={FiSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search by name or email..." className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRenters.map(renter => {
          const property = properties.find(p => p.id === renter.property_id);
          return (
            <div key={renter.id} className="bg-white rounded-[32px] p-8 border border-gray-50 shadow-sm hover:shadow-xl transition-all group relative">
              <div className="absolute top-6 right-6 flex gap-2">
                <button onClick={() => openEdit(renter)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl"><SafeIcon icon={FiEdit2} /></button>
                <button onClick={() => deleteRenter(renter.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><SafeIcon icon={FiTrash2} /></button>
              </div>
              <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black mb-6 shadow-lg">
                {(renter.name || 'U').charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-4 truncate pr-16">{renter.name}</h3>
              <div className="space-y-3 text-sm font-bold text-gray-500">
                <div className="flex items-start gap-3"><SafeIcon icon={FiMapPin} className="text-blue-600 shrink-0 mt-1" /> <span>{renter.address}</span></div>
                <div className="flex items-center gap-3 text-blue-600"><SafeIcon icon={FiMail} /> <span>{renter.email}</span></div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden">
            <div className="p-8 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="text-xl font-black">{editingRenter ? 'Edit Tenant' : 'New Tenant & Account'}</h3>
              <button onClick={closeModal}><SafeIcon icon={FiPlus} className="rotate-45 text-2xl" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto space-y-6">
              {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2"><SafeIcon icon={FiAlertCircle} /> {error}</div>}
              {successMsg && <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-bold flex items-center gap-2"><SafeIcon icon={FiCheckCircle} /> {successMsg}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">Full Name</label>
                  <input required className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-3 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">Phone</label>
                  <input required className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-3 font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(555) 000-0000" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">Email Address (Login ID)</label>
                <input required type="email" className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-3 font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="tenant@example.com" />
              </div>

              {!editingRenter && (
                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                  <label className="block text-[10px] font-black text-blue-600 uppercase mb-2 ml-1 tracking-widest flex items-center gap-2">
                    <SafeIcon icon={FiLock} /> Set Login Password
                  </label>
                  <input required type="text" className="w-full bg-white border-0 rounded-xl px-5 py-3 font-bold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Initial Password (min 6 chars)" />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">Property Assignment</label>
                <select className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-3 font-bold appearance-none" value={formData.property_id} onChange={(e) => handlePropertyChange(e.target.value)}>
                  <option value="">No Building (Manual Address)</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <button disabled={loading} type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50">
                {loading ? 'Processing...' : editingRenter ? 'Update Profile' : 'Create Account & Save'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentersManager;