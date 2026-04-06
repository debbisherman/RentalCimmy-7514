import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiMail, FiPhone, FiMapPin, FiUser, FiSearch, FiMessageSquare } = FiIcons;

const RentersManager = () => {
  const { renters, addRenter } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    co_tenants: '',
    additional_phones: ''
  });

  const filteredRenters = renters.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await addRenter(formData);
    setIsModalOpen(false);
    setFormData({ name: '', address: '', phone: '', email: '', co_tenants: '', additional_phones: '' });
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-gray-900">Tenants Directory</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100">
          <SafeIcon icon={FiPlus} /> Add Renter
        </button>
      </div>

      <div className="relative">
        <SafeIcon icon={FiSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search tenants..." className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRenters.map(renter => (
          <div key={renter.id} className="bg-white rounded-3xl p-8 border border-gray-50 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black mb-6">
              {renter.name.charAt(0)}
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-4">{renter.name}</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-4 text-sm font-bold text-gray-500">
                <SafeIcon icon={FiMapPin} className="mt-1" /> <span>{renter.address}</span>
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-blue-600">
                <SafeIcon icon={FiMail} /> <span className="truncate">{renter.email}</span>
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-gray-700">
                <SafeIcon icon={FiPhone} /> <span>{renter.phone}</span>
              </div>
              
              {(renter.co_tenants || renter.additional_phones) && (
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Additional Contacts</p>
                  {renter.co_tenants && <p className="text-xs font-medium text-gray-600">Names: {renter.co_tenants}</p>}
                  {renter.additional_phones && <p className="text-xs font-medium text-gray-600">Phones: {renter.additional_phones}</p>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-8 bg-blue-600 text-white">
              <h3 className="text-2xl font-black">Register Tenant</h3>
              <p className="text-blue-100 text-sm">Add comprehensive contact information</p>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Primary Name</label>
                  <input required className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-3.5 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Primary Phone</label>
                  <input required className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-3.5 font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(555) 000-0000" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Additional Tenants (Names)</label>
                <input className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-3.5 font-bold" value={formData.co_tenants} onChange={e => setFormData({...formData, co_tenants: e.target.value})} placeholder="Jane Doe, Child Name" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Additional Phone Numbers</label>
                <input className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-3.5 font-bold" value={formData.additional_phones} onChange={e => setFormData({...formData, additional_phones: e.target.value})} placeholder="(555) 111-2222, (555) 333-4444" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Email Address</label>
                <input required type="email" className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-3.5 font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Property Address</label>
                <input required className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-3.5 font-bold" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <button disabled={loading} type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest">
                {loading ? 'Saving...' : 'Save Renter Profile'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentersManager;