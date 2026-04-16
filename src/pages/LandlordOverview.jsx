import React from 'react';
import { useApp } from '../store/AppContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiDollarSign, FiUsers, FiTrendingUp, FiTrendingDown, FiArrowUpRight, FiPieChart } = FiIcons;

const StatCard = ({ title, value, icon, subtitle, colorClass = "blue" }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600"
  };
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${colorMap[colorClass]}`}>
          <SafeIcon icon={icon} className="text-2xl" />
        </div>
      </div>
      <div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-gray-900 mt-1">{value}</h3>
        <p className="text-[10px] text-gray-500 mt-1 font-bold uppercase tracking-tighter">{subtitle}</p>
      </div>
    </div>
  );
};

const LandlordOverview = () => {
  const { renters, payments, expenses } = useApp();
  
  const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const netIncome = totalRevenue - totalExpenses;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyRevenue = payments
    .filter(p => {
      const d = new Date(p.received_date || p.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const recentPayments = [...payments].slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-black text-gray-900">Portfolio Overview</h2>
        <p className="text-gray-500 font-medium">Real-time performance and financial health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}`} 
          icon={FiTrendingUp} 
          subtitle="Lifetime Gross" 
          colorClass="emerald" 
        />
        <StatCard 
          title="Total Expenses" 
          value={`$${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 0 })}`} 
          icon={FiTrendingDown} 
          subtitle="Operational Costs" 
          colorClass="red" 
        />
        <StatCard 
          title="Net Income" 
          value={`$${netIncome.toLocaleString(undefined, { minimumFractionDigits: 0 })}`} 
          icon={FiDollarSign} 
          subtitle="Profit After Costs" 
          colorClass="blue" 
        />
        <StatCard 
          title="Active Renters" 
          value={renters.length} 
          icon={FiUsers} 
          subtitle="Tenant Count" 
          colorClass="purple" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-black text-gray-900 text-lg uppercase tracking-wider">Recent Collections</h3>
            <button className="text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest">Full Ledger</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="px-8 py-4">Tenant</th>
                  <th className="px-8 py-4">Category</th>
                  <th className="px-8 py-4">Amount</th>
                  <th className="px-8 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentPayments.map((payment) => {
                  const renter = renters.find(r => r.id === payment.renter_id);
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-4 font-black text-gray-900">{renter?.name || 'Unknown'}</td>
                      <td className="px-8 py-4">
                        <span className="px-2 py-1 rounded-lg text-[9px] font-black uppercase bg-gray-100 text-gray-600">
                          {payment.category || 'Rent'}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-emerald-600 font-black">${parseFloat(payment.amount).toFixed(2)}</td>
                      <td className="px-8 py-4 text-gray-400 font-bold text-xs">
                        {new Date(payment.received_date || payment.date).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <SafeIcon icon={FiPieChart} className="text-3xl" />
          </div>
          <h3 className="font-black text-gray-900 text-lg uppercase tracking-widest">Monthly Yield</h3>
          <p className="text-4xl font-black text-blue-700 mt-2">${monthlyRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-400 font-bold uppercase mt-2 tracking-tighter">Gross collected this month</p>
          
          <div className="w-full mt-8 pt-8 border-t border-gray-50 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Margin</span>
              <span className="text-sm font-black text-emerald-600">
                {totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full" 
                style={{ width: `${totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordOverview;