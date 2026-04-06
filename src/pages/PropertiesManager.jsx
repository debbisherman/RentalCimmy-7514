import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiMapPin, FiHome, FiSearch, FiEdit2, FiTrash2, FiUsers } = FiIcons;

const PropertiesManager = () => {
  const { properties, addProperty, updateProperty, deleteProperty, renters, role, user } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', address: '' });

  const isSuperAdmin = role === 'super_admin';

  const filteredProperties = properties.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingProperty) {
        await updateProperty(editingProperty.id, formData);
      } else {
        await addProperty(formData);
      }
      closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const assignedTenants = renters.filter(r => r.property_id === id);
    if (assignedTenants.length > 0) {
      alert(`Cannot delete: This property has ${assignedTenants.length} assigned tenants. Unassign them first.`);
      return;
    }

    if (window.confirm('Delete this property?')) {
      setLoading(true);
      await deleteProperty(id);
      setLoading(false);
    }
  };

  const openEdit = (property) => {
    setEditingProperty(property);
    setFormData({ name: property.name, address: property.address });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProperty(null);
    setFormData({ name: '', address: '' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Property Portfolio</h2>
          <p className="text-gray-500 font-medium">Manage buildings and multiple assigned tenants</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
          <SafeIcon icon={FiPlus} /> Add Property
        </button>
      </div>

      <div className="relative">
        <SafeIcon icon={FiSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search properties..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none font-medium text-gray-700" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map(property => {
          // FIX: Use formal property_id link to count tenants
          const tenantList = renters.filter(r => r.property_id === property.id);
          
          return (
            <div key={property.id} className="bg-white rounded-[32px] p-8 border border-gray-50 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black mb-6">
                <SafeIcon icon={FiHome} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2 truncate pr-10">{property.name}</h3>
              <div className="flex items-start gap-3 text-sm font-bold text-gray-500 mb-6 h-10 overflow-hidden">
                <SafeIcon icon={FiMapPin} className="mt-1 text-blue-600 shrink-0" />
                <span className="line-clamp-2">{property.address}</span>
              </div>

              <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="bg-gray-50 px-4 py-2 rounded-xl flex items-center gap-2">
                  <SafeIcon icon={FiUsers} className="text-blue-600" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Tenants</p>
                    <p className="text-sm font-black text-gray-900">{tenantList.length}</p>
                  </div>
                </div>

                {(isSuperAdmin || property.landlord_id === user?.id) && (
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(property)} className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <SafeIcon icon={FiEdit2} />
                    </button>
                    <button onClick={() => handleDelete(property.id)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <SafeIcon icon={FiTrash2} />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Show tenant names if they exist */}
              {tenantList.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tenantList.map(t => (
                    <span key={t.id} className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase">
                      {t.name.split(' ')[0]}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-10 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="text-2xl font-black">{editingProperty ? 'Edit Asset' : 'New Property'}</h3>
              <button onClick={closeModal}><SafeIcon icon={FiPlus} className="rotate-45 text-3xl" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Building Name</label>
                <input required className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Sunset Heights Unit A" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Full Address</label>
                <textarea required rows="3" className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-bold resize-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="123 Luxury Lane..." />
              </div>
              <button disabled={loading} type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[20px] font-black uppercase text-sm tracking-widest shadow-xl">
                {loading ? 'Saving...' : 'Save Property'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesManager;