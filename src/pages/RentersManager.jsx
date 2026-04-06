import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiMail, FiPhone, FiMapPin, FiSearch, FiEdit2, FiTrash2, FiHome, FiAlertCircle } = FiIcons;

const RentersManager = () => {
  const { renters, properties, addRenter, updateRenter, deleteRenter, role } = useApp();
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

  const filteredRenters = renters.filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    let finalData = { ...formData };
    
    // Safety check: Address is mandatory in DB
    if (!finalData.address && !finalData.property_id) {
      setError("Please provide an address or assign a property.");
      setLoading(false);
      return;
    }

    try {
      const response = editingRenter 
        ? await updateRenter(editingRenter.id, finalData)
        : await addRenter(finalData);

      if (response?.error) {
        setError(response.error.message);
      } else {
        closeModal();
      }
    } catch (err) {
      setError("A critical error occurred. Please try again.");
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
      name: renter.name,
      address: renter.address,
      phone: renter.phone || '',
      email: renter.email,
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
    setFormData({
      name: '', address: '', phone: '', email: '',
      co_tenants: '', additional_phones: '', property_id: ''
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Tenants Directory</h2>
          <p className="text-gray-500 font-medium">Manage leaseholders and property assignments</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
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
                  className={`p-2 rounded-xl transition-all ${renter.property_id ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                >
                  <SafeIcon icon={FiTrash2} />
                </button>
              </div>

              <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black mb-6 shadow-lg shadow-blue-100">
                {renter.name?.charAt(0)}
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-4 truncate pr-16">{renter.name}</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 text-sm font-bold text-gray-500">
                  <SafeIcon icon={FiMapPin} className="mt-1 text-blue-600 shrink-0" />
                  <span className="line-clamp-2">{renter.address}</span>
                </div>
                <div className="flex items-center gap-4 text-sm font-bold text-blue-600">
                  <SafeIcon icon={FiMail} className="shrink-0" />
                  <span className="truncate">{renter.email}</span>
                </div>
                <div className="pt-4 border-t border-gray-50">
                  <div className={`px-4 py-3 rounded-2xl flex items-center gap-3 ${property ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                    <SafeIcon icon={FiHome} className={property ? 'text-emerald-600' : 'text-amber-600'} />
                    <p className="text-[10px] font-black uppercase text-gray-500">{property ? property.name : 'Unassigned'}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-10 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="text-2xl font-black">{editingRenter ? 'Edit Profile' : 'Register Tenant'}</h3>
              <button onClick={closeModal}><SafeIcon icon={FiPlus} className="rotate-45 text-3xl" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 max-h-[70vh] overflow-y-auto space-y-6">
              {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">{error}</div>}
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Full Name</label>
                  <input required className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Phone</label>
                  <input required className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Email</label>
                <input required type="email" className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Assign Property</label>
                <select 
                  className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-bold" 
                  value={formData.property_id} 
                  onChange={e => handlePropertyChange(e.target.value)}
                >
                  <option value="">No Property (Manual Address)</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Current Address</label>
                <textarea 
                  required 
                  rows="2" 
                  className={`w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-bold ${formData.property_id ? 'opacity-50 cursor-not-allowed' : ''}`} 
                  value={formData.address} 
                  onChange={e => !formData.property_id && setFormData({...formData, address: e.target.value})}
                  readOnly={!!formData.property_id}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Co-Tenants</label>
                  <input className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-bold" value={formData.co_tenants} onChange={e => setFormData({...formData, co_tenants: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Emergency Contacts</label>
                  <input className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-bold" value={formData.additional_phones} onChange={e => setFormData({...formData, additional_phones: e.target.value})} />
                </div>
              </div>

              <button disabled={loading} type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[20px] font-black uppercase text-sm tracking-widest shadow-xl disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Renter'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentersManager;