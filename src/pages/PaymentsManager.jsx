import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { generateReceiptPDF } from '../utils/pdfGenerator';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiDownload, FiPlus, FiDollarSign, FiTag, FiEdit2, FiTrash2, FiHome, FiCalendar } = FiIcons;

const CATEGORIES = ['Rent', 'Security Deposit', 'Utilities', 'Maintenance Fee', 'Late Fee', 'Parking', 'Other'];

const PaymentsManager = () => {
  const { payments, renters, properties, addPayment, updatePayment, deletePayment, role } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    renter_id: '',
    property_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    received_date: new Date().toISOString().split('T')[0],
    category: 'Rent',
    note: ''
  });

  const isSuperAdmin = role === 'super_admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = { ...formData, amount: parseFloat(formData.amount) };
    try {
      const { error } = editingPayment 
        ? await updatePayment(editingPayment.id, data) 
        : await addPayment({ ...data, status: 'Paid' });
      
      if (!error) {
        closeModal();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment record? This action cannot be undone.')) {
      setLoading(true);
      try {
        await deletePayment(id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const openEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      renter_id: payment.renter_id,
      property_id: payment.property_id || '',
      amount: payment.amount.toString(),
      date: payment.date,
      received_date: payment.received_date || payment.date,
      category: payment.category || 'Rent',
      note: payment.note || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPayment(null);
    setFormData({
      renter_id: '',
      property_id: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      received_date: new Date().toISOString().split('T')[0],
      category: 'Rent',
      note: ''
    });
  };

  const handleDownload = (payment) => {
    const renter = renters.find(r => r.id === payment.renter_id);
    const property = properties.find(p => p.id === payment.property_id);
    generateReceiptPDF(payment, renter, property);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Ledger</h2>
          <p className="text-gray-500 text-sm">Track property revenue and individual payments</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-100"
        >
          <SafeIcon icon={FiPlus} /> Record Payment
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-tighter">Date Details</th>
              <th className="px-6 py-4 font-bold uppercase tracking-tighter">Tenant & Property</th>
              <th className="px-6 py-4 font-bold uppercase tracking-tighter">Category</th>
              <th className="px-6 py-4 font-bold uppercase tracking-tighter">Amount</th>
              <th className="px-6 py-4 font-bold uppercase tracking-tighter text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map((p) => {
              const renter = renters.find(r => r.id === p.renter_id);
              const property = properties.find(prop => prop.id === p.property_id);
              return (
                <tr key={p.id} className="hover:bg-gray-50/50 group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{p.date}</div>
                    <div className="text-[10px] text-emerald-600 font-black uppercase">Received: {p.received_date || p.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{renter?.name || 'Unknown'}</div>
                    <div className="text-xs text-blue-600 font-medium flex items-center gap-1">
                      <SafeIcon icon={FiHome} className="text-[10px]" /> {property?.name || 'General Property'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-black uppercase">{p.category}</span>
                  </td>
                  <td className="px-6 py-4 font-black text-gray-900 text-base">${parseFloat(p.amount).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-1">
                    {isSuperAdmin && (
                      <>
                        <button 
                          onClick={() => openEdit(p)} 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Payment"
                        >
                          <SafeIcon icon={FiEdit2} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)} 
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Payment"
                        >
                          <SafeIcon icon={FiTrash2} />
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => handleDownload(p)} 
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Download Receipt"
                    >
                      <SafeIcon icon={FiDownload} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {payments.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium italic">
                  No payment records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingPayment ? 'Edit Record' : 'Record Payment'}</h3>
              <button onClick={closeModal} className="text-white/80 hover:text-white">
                <SafeIcon icon={FiPlus} className="rotate-45 text-2xl" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Renter</label>
                  <select 
                    required 
                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-blue-500" 
                    value={formData.renter_id} 
                    onChange={e => setFormData({ ...formData, renter_id: e.target.value })}
                  >
                    <option value="">Select Tenant</option>
                    {renters.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Property</label>
                  <select 
                    required 
                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-blue-500" 
                    value={formData.property_id} 
                    onChange={e => setFormData({ ...formData, property_id: e.target.value })}
                  >
                    <option value="">Select Property</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Due Date</label>
                  <input 
                    required 
                    type="date" 
                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-blue-500" 
                    value={formData.date} 
                    onChange={e => setFormData({ ...formData, date: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Date Received</label>
                  <input 
                    required 
                    type="date" 
                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-blue-500" 
                    value={formData.received_date} 
                    onChange={e => setFormData({ ...formData, received_date: e.target.value })} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Amount ($)</label>
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 font-black text-lg focus:ring-2 focus:ring-blue-500" 
                  value={formData.amount} 
                  onChange={e => setFormData({ ...formData, amount: e.target.value })} 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Category</label>
                <select 
                  className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-blue-500" 
                  value={formData.category} 
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <button 
                disabled={loading} 
                type="submit" 
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 mt-4 uppercase tracking-widest text-sm disabled:opacity-50"
              >
                {loading ? 'Processing...' : editingPayment ? 'Update Record' : 'Save Payment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsManager;