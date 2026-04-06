import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiMapPin, FiHome, FiSearch, FiEdit2, FiTrash2 } = FiIcons;

const PropertiesManager = () => {
  const { properties, addProperty, renters } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  });

  const filteredProperties = properties.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addProperty(formData);
      setIsModalOpen(false);
      setFormData({ name: '', address: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Property Portfolio</h2>
          <p className="text-gray-500 font-medium">Manage your buildings and rental units</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
        >
          <SafeIcon icon={FiPlus} /> Add Property
        </button>
      </div>

      <div className="relative">
        <SafeIcon icon={FiSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search properties by name or address..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 transition-all" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map(property => {
          const tenantCount = renters.filter(r => r.address.includes(property.address) || r.address.includes(property.name)).length;
          
          return (
            <div key={property.id} className="bg-white rounded-[32px] p-8 border border-gray-50 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <SafeIcon icon={FiHome} className="text-8xl" />
              </div>
              
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black mb-6">
                <SafeIcon icon={FiHome} />
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-2">{property.name}</h3>
              
              <div className="flex items-start gap-3 text-sm font-bold text-gray-500 mb-6">
                <SafeIcon icon={FiMapPin} className="mt-1 text-blue-600 shrink-0" />
                <span>{property.address}</span>
              </div>

              <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="bg-gray-50 px-4 py-2 rounded-xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Active Tenants</p>
                  <p className="text-sm font-black text-gray-900">{tenantCount} Profiles</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                    <SafeIcon icon={FiEdit2} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProperties.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[32px] border border-dashed border-gray-200">
            <SafeIcon icon={FiHome} className="text-5xl text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-bold">No properties found. Start by adding your first building.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-10 bg-blue-600 text-white">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-2xl font-black">Register Property</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white transition-colors">
                  <SafeIcon icon={FiPlus} className="rotate-45 text-3xl" />
                </button>
              </div>
              <p className="text-blue-100 font-medium">Record a new asset in your portfolio</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">Property Name / ID</label>
                <div className="relative">
                  <SafeIcon icon={FiHome} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    required 
                    className="w-full bg-gray-50 border-0 rounded-2xl pl-14 pr-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="e.g. Sunset Heights Unit A" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">Physical Address</label>
                <div className="relative">
                  <SafeIcon icon={FiMapPin} className="absolute left-5 top-5 text-gray-400" />
                  <textarea 
                    required 
                    rows="3"
                    className="w-full bg-gray-50 border-0 rounded-2xl pl-14 pr-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all resize-none" 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                    placeholder="123 Luxury Lane, Beverly Hills, CA 90210" 
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  disabled={loading} 
                  type="submit" 
                  className="w-full py-5 bg-blue-600 text-white rounded-[20px] font-black uppercase text-sm tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? 'Creating Asset...' : 'Save Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesManager;