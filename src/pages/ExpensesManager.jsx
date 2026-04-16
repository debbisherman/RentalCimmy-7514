import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiTag, FiEdit3, FiTrash2, FiCalendar, FiUser } = FiIcons;

const CATEGORIES = [
  'Repairs', 'Maintenance', 'Utilities', 'Taxes', 'Insurance', 'Marketing', 'Legal', 'Supplies', 'Other'
];

const ExpensesManager = () => {
  const { expenses, addExpense, updateExpense, deleteExpense } = useApp();
  const [modal, setModal] = useState({ isOpen: false, type: 'add', data: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    vendor_name: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    category: 'Maintenance'
  });

  const handleOpenModal = (type, data = null) => {
    setError(null);
    setModal({ isOpen: true, type, data });
    if (data) {
      setFormData({
        vendor_name: data.vendor_name,
        amount: data.amount,
        expense_date: data.expense_date,
        category: data.category
      });
    } else {
      setFormData({
        vendor_name: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        category: 'Maintenance'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      let result;
      if (modal.type === 'edit') {
        result = await updateExpense(modal.data.id, payload);
      } else {
        result = await addExpense(payload);
      }

      if (result.error) {
        setError(result.error.message);
      } else {
        setModal({ isOpen: false, type: 'add', data: null });
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    await deleteExpense(id);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Expenses</h2>
          <p className="text-gray-500 font-medium">Track operational costs and property repairs</p>
        </div>
        <button 
          onClick={() => handleOpenModal('add')} 
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-100"
        >
          <SafeIcon icon={FiPlus} /> Record Expense
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Vendor</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5 text-gray-600 font-bold">
                    {new Date(expense.expense_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-5">
                    <div className="font-black text-gray-900">{expense.vendor_name}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-gray-100 text-gray-600 uppercase tracking-widest">
                      <SafeIcon icon={FiTag} className="text-[10px]" />
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-lg font-black text-red-600">-${parseFloat(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal('edit', expense)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <SafeIcon icon={FiEdit3} />
                      </button>
                      <button 
                        onClick={() => handleDelete(expense.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <SafeIcon icon={FiTrash2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-gray-400 italic">
                    No expenses recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal.isOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-50 bg-red-600 text-white flex justify-between items-center">
              <h3 className="text-2xl font-black">{modal.type === 'edit' ? 'Edit Expense' : 'New Expense'}</h3>
              <button onClick={() => setModal({ ...modal, isOpen: false })} className="text-white/80 hover:text-white text-2xl">
                <SafeIcon icon={FiPlus} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Vendor / Payee</label>
                <div className="relative">
                  <SafeIcon icon={FiUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    required 
                    type="text"
                    placeholder="e.g. Home Depot, City Water"
                    className="w-full bg-gray-50 border border-transparent rounded-2xl pl-12 pr-5 py-4 outline-none transition-all font-bold focus:bg-white focus:border-red-500"
                    value={formData.vendor_name}
                    onChange={e => setFormData({ ...formData, vendor_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Category</label>
                  <select 
                    required 
                    className="w-full bg-gray-50 border border-transparent rounded-2xl px-5 py-4 outline-none font-bold focus:bg-white focus:border-red-500"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Date</label>
                  <div className="relative">
                    <input 
                      required 
                      type="date" 
                      className="w-full bg-gray-50 border border-transparent rounded-2xl px-5 py-4 outline-none font-bold focus:bg-white focus:border-red-500"
                      value={formData.expense_date}
                      onChange={e => setFormData({ ...formData, expense_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Amount ($)</label>
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  className="w-full bg-gray-50 border border-transparent rounded-2xl px-5 py-5 font-black text-2xl text-red-600 outline-none focus:bg-white focus:border-red-500"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setModal({ ...modal, isOpen: false })} className="flex-1 py-4 text-gray-500 font-bold">Cancel</button>
                <button type="submit" disabled={loading} className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl shadow-red-100 disabled:opacity-50">
                  {loading ? 'Processing...' : modal.type === 'edit' ? 'Update Entry' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesManager;