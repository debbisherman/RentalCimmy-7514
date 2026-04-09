import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { generateReceiptPDF } from '../utils/pdfGenerator';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiDownload, FiPlus, FiTag, FiAlertCircle } = FiIcons;

const CATEGORIES = [
  'Rent', 'Security Deposit', 'Utilities', 'Maintenance Fee', 'Late Fee', 'Parking', 'Other'
];

const PaymentsManager = () => {
  const { payments, renters, addPayment } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    renter_id: '',
    amount: '',
    received_date: new Date().toISOString().split('T')[0],
    category: 'Rent',
    note: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error: submitError } = await addPayment({
        ...formData,
        amount: parseFloat(formData.amount),
        status: 'Paid',
        // Support both schema variations
        date: formData.received_date 
      });

      if (submitError) {
        setError(submitError.message);
      } else {
        setIsModalOpen(false);
        setFormData({
          renter_id: '',
          amount: '',
          received_date: new Date().toISOString().split('T')[0],
          category: 'Rent',
          note: ''
        });
      }
    } catch (err) {
      setError("An unexpected error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (payment) => {
    const renter = renters.find(r => r.id === payment.renter_id);
    generateReceiptPDF(payment, renter);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Payments Ledger</h2>
          <p className="text-gray-500 text-sm">Record and track all incoming payments</p>
        </div>
        <button 
          onClick={() => {
            setError(null);
            setIsModalOpen(true);
          }} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-sm"
        >
          <SafeIcon icon={FiPlus} /> Record Payment
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Renter</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((payment) => {
                const renter = renters.find(r => r.id === payment.renter_id);
                const displayDate = payment.received_date || payment.date;
                return (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {new Date(displayDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{renter?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{renter?.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 uppercase">
                        <SafeIcon icon={FiTag} className="text-[10px]" />
                        {payment.category || 'Rent'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-base font-bold text-gray-900">${parseFloat(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      <div className="text-[10px] text-gray-400 font-medium uppercase">{payment.note}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDownload(payment)}
                        className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-all"
                      >
                        <SafeIcon icon={FiDownload} /> Receipt
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-gray-100 bg-emerald-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Record Payment</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">
                <SafeIcon icon={FiPlus} className="rotate-45 text-2xl" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Select Renter</label>
                <select 
                  required 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none transition-all font-medium"
                  value={formData.renter_id}
                  onChange={e => setFormData({ ...formData, renter_id: e.target.value })}
                >
                  <option value="">-- Choose Renter --</option>
                  {renters.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Category</label>
                  <select 
                    required 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Payment Date</label>
                  <input 
                    required 
                    type="date" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
                    value={formData.received_date}
                    onChange={e => setFormData({ ...formData, received_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Amount ($)</label>
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-lg"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-500 font-bold">Cancel</button>
                <button type="submit" disabled={loading} className="flex-[2] py-3 bg-emerald-600 text-white rounded-xl font-bold">
                  {loading ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsManager;