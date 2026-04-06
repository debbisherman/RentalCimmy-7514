import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiMail, FiPhone, FiMapPin, FiSearch, FiEdit2, FiTrash2, FiHome, FiAlertCircle, FiUsers } = FiIcons;

const RentersManager = () => {
  const { renters = [], properties = [], addRenter, updateRenter, deleteRenter, role } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRenter, setEditingRenter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    co_tenants: '',
    additional_phones: '',
    property_id: ''
  });

  const isSuperAdmin = role === 'super_admin';

  // Defensive filtering to prevent crashes on null/undefined names
  const filteredRenters = (renters || []).filter(r => {
    const nameMatch = (r.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = (r.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || emailMatch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      co_tenants: formData.co_tenants.trim() || '',
      additional_phones: formData.additional_phones.trim() || '',
      property_id: formData.property_id || null
    };

    try {
      const { error: apiError } = editingRenter 
        ? await updateRenter(editingRenter.id, payload) 
        : await addRenter(payload);

      if (apiError) {
        setError(apiError.message);
      } else {
        closeModal();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyChange = (propId) => {
    const selectedProp = properties.find(p => p.id === propId);
    setFormData({
      ...formData,
      property_id: propId,
      address: selectedProp ? selectedProp.address : formData.address
    });
  };

  const handleDelete = async (renter) => {
    if (renter.property_id) {
      alert("This renter is currently assigned to a property. Unassign them first.");
      return;
    }
    if (window.confirm(`Remove ${renter.name}?`)) {
      setLoading(true);
      await deleteRenter(renter.id);
      setLoading(false);
    }
  };

  const openEdit = (renter) => {
    setEditingRenter(renter);
    setFormData({
      name: renter.name || '',
      address: renter.address || '',
      phone: renter.phone || '',
      email: renter.email || '',
      co_tenants: renter.co_tenants || '',
      additional_phones: renter.additional_phones || '',
      property_id: renter.property_id || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRenter(null);
    setError('');
    setFormData({ name: '', address: '', phone: '', email: '', co_tenants: '', additional_phones: '', property_id: '' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Tenants Directory</h2>
          <p className="text-gray-500 font-medium">Active leaseholders and property assignments</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
        >
          <SafeIcon icon={FiPlus} /> Add Renter
        </button>
      </div>

      <div className="relative">
        <SafeIcon icon={FiSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRenters.map(renter => {
          const property = properties.find(p => p.id === renter.property_id);
          return (
            <div key={renter.id} className="bg-white rounded-[32px] p-8 border border-gray-50 shadow-sm hover:shadow-xl transition-all group relative">
              <div className="absolute top-6 right-6 flex gap-2">
                <button onClick={() => openEdit(renter)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                  <SafeIcon icon={FiEdit2} />
                </button>
                <button 
                  onClick={() => handleDelete(renter)}
                  className={`p-2 rounded-xl transition-all ${renter.property_id ? 'text-gray-200 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                >
                  <SafeIcon icon={FiTrash2} />
                </button>
              </div>
              <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black mb-6 shadow-lg shadow-blue-100">
                {(renter.name || 'U').charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-4 truncate pr-16">{renter.name || 'Unnamed Tenant'}</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 text-sm font-bold text-gray-500">
                  <SafeIcon icon={FiMapPin} className="mt-1 text-blue-600 shrink-0" />
                  <span className="line-clamp-2">{renter.address || 'No address set'}</span>
                </div>
                <div className="flex items-center gap-4 text-sm font-bold text-blue-600">
                  <SafeIcon icon={FiMail} className="shrink-0" />
                  <span className="truncate">{renter.email}</span>
                </div>
                <div className="pt-4 border-t border-gray-50">
                  <div className={`px-4 py-3 rounded-2xl flex items-center gap-3 ${property ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'}`}>
                    <SafeIcon icon={FiHome} className={property ? 'text-emerald-600' : 'text-amber-600'} />
                    <p className={`text-[10px] font-black uppercase tracking-wider ${property ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {property ? property.name : 'Unassigned'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredRenters.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[32px] border border-dashed border-gray-200">
            <SafeIcon icon={FiUsers} className="text-4xl text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No tenants found</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-10 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="text-2xl font-black">{editingRenter ? 'Edit Profile' : 'Register Tenant'}</h3>
              <button onClick={closeModal} className="hover:rotate-90 transition-transform"><SafeIcon icon={FiPlus} className="rotate-45 text-3xl" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 max-h-[70vh] overflow-y-auto space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3">
                  <SafeIcon icon={FiAlertCircle} className="text-lg shrink-0" />
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Full Name</label>
                  <input required className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Smith" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Phone</label>
                  <input required className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="(555) 000-0000" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Email Address</label>
                <input required type="email" className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="tenant@example.com" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Assign Property</label>
                <select className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none" value={formData.property_id} onChange={(e) => handlePropertyChange(e.target.value)}>
                  <option value="">No Property (Manual Address)</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Property Address</label>
                <textarea required rows="2" className={`w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${formData.property_id ? 'opacity-50 cursor-not-allowed' : ''}`} value={formData.address} onChange={e => !formData.property_id && setFormData({ ...formData, address: e.target.value })} readOnly={!!formData.property_id} placeholder="Enter full physical address..." />
              </div>
              <button disabled={loading} type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[20px] font-black uppercase text-sm tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50">
                {loading ? 'Processing...' : editingRenter ? 'Update Renter' : 'Save Renter'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentersManager;