import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { generateReceiptPDF } from '../utils/pdfGenerator';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiDownload, FiPlus, FiDollarSign, FiTag, FiEdit2, FiTrash2, FiHome, FiCalendar, FiAlertCircle } = FiIcons;

const CATEGORIES = ['Rent', 'Security Deposit', 'Utilities', 'Maintenance Fee', 'Late Fee', 'Parking', 'Other'];

const PaymentsManager = () => {
  const { payments = [], renters = [], properties = [], addPayment, updatePayment, deletePayment, role } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
    setError('');

    // CRITICAL: property_id must be null, not an empty string, for UUID columns
    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      property_id: formData.property_id || null, 
      renter_id: formData.renter_id,
      status: 'Paid'
    };

    try {
      const { error: apiError } = editingPayment 
        ? await updatePayment(editingPayment.id, payload) 
        : await addPayment(payload);

      if (apiError) {
        setError(apiError.message);
      } else {
        closeModal();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this payment record? This cannot be undone.')) {
      setLoading(true);
      await deletePayment(id);
      setLoading(false);
    }
  };

  const openEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      renter_id: payment.renter_id || '',
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
    setError('');
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
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Financial Ledger</h2>
          <p className="text-gray-500 font-medium tracking-tight">Real-time revenue tracking and receipts</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
        >
          <SafeIcon icon={FiPlus} /> Record Payment
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-8 py-6">Timeline</th>
                <th className="px-8 py-6">Tenant & Asset</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Amount</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p) => {
                const renter = renters.find(r => r.id === p.renter_id);
                const property = properties.find(prop => prop.id === p.property_id);
                return (
                  <tr key={p.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-black text-gray-900">{p.date}</div>
                      <div className="text-[10px] text-emerald-600 font-black uppercase mt-1">Paid: {p.received_date || p.date}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-black text-gray-900">{renter?.name || 'Unknown'}</div>
                      <div className="text-[10px] text-blue-600 font-black uppercase flex items-center gap-1 mt-1">
                        <SafeIcon icon={FiHome} className="text-[10px]" /> {property?.name || 'General'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-lg font-black text-gray-900">${parseFloat(p.amount).toFixed(2)}</div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleDownload(p)} className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Receipt">
                          <SafeIcon icon={FiDownload} />
                        </button>
                        <button onClick={() => openEdit(p)} className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit">
                          <SafeIcon icon={FiEdit2} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete">
                          <SafeIcon icon={FiTrash2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs italic">
                    No payment records in ledger
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-10 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="text-2xl font-black">{editingPayment ? 'Edit Ledger' : 'New Payment'}</h3>
              <button onClick={closeModal}><SafeIcon icon={FiPlus} className="rotate-45 text-3xl" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3">
                  <SafeIcon icon={FiAlertCircle} className="text-lg shrink-0" />
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Tenant</label>
                  <select required className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none" value={formData.renter_id} onChange={e => setFormData({ ...formData, renter_id: e.target.value })}>
                    <option value="">Select...</option>
                    {renters.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Property</label>
                  <select required className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none" value={formData.property_id} onChange={e => setFormData({ ...formData, property_id: e.target.value })}>
                    <option value="">Select...</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Due Date</label>
                  <input required type="date" className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Received Date</label>
                  <input required type="date" className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.received_date} onChange={e => setFormData({ ...formData, received_date: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Amount ($)</label>
                <input required type="number" step="0.01" className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-5 font-black text-2xl text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Category</label>
                <select className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button disabled={loading} type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[20px] font-black uppercase text-sm tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50">
                {loading ? 'Processing...' : editingPayment ? 'Update Ledger' : 'Save Payment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsManager;