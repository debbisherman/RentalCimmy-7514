import React from 'react';
import { useApp } from '../store/AppContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiDollarSign, FiUsers, FiBox, FiTrendingUp, FiArrowUpRight, FiArrowDownRight } = FiIcons;

const StatCard = ({ title, value, icon, subtitle, colorClass = "blue" }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600"
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${colorMap[colorClass]}`}>
          <SafeIcon icon={icon} className="text-2xl" />
        </div>
        <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">
          <SafeIcon icon={FiArrowUpRight} />
          +4.5%
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-black text-gray-900 mt-1">{value}</h3>
        <p className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</p>
      </div>
    </div>
  );
};

const LandlordOverview = () => {
  const { renters, payments, items } = useApp();
  
  const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const thisMonthPayments = payments.filter(p => {
    const pDate = new Date(p.date);
    const now = new Date();
    return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
  });
  
  const monthlyRevenue = thisMonthPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  
  // Group payments by category
  const categories = payments.reduce((acc, p) => {
    const cat = p.category || 'Rent';
    acc[cat] = (acc[cat] || 0) + parseFloat(p.amount);
    return acc;
  }, {});

  const recentPayments = [...payments].slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-black text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-500 font-medium">Real-time performance and property insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}`} 
          icon={FiDollarSign} 
          subtitle="Cumulative earnings to date"
          colorClass="emerald"
        />
        <StatCard 
          title="Monthly Income" 
          value={`$${monthlyRevenue.toLocaleString()}`} 
          icon={FiTrendingUp} 
          subtitle="Collected this current month"
          colorClass="blue"
        />
        <StatCard 
          title="Portfolio" 
          value={renters.length} 
          icon={FiUsers} 
          subtitle="Active tenant profiles"
          colorClass="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Payments Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 text-lg">Recent Ledger Entries</h3>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-400 font-bold uppercase tracking-tighter">
                <tr>
                  <th className="px-6 py-4">Renter</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentPayments.map((payment) => {
                  const renter = renters.find(r => r.id === payment.renter_id);
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{renter?.name || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase bg-gray-100 text-gray-600">
                          {payment.category || 'Rent'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-black">${parseFloat(payment.amount).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-emerald-50 text-emerald-700">
                          PAID
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-6">Revenue Mix</h3>
          <div className="space-y-6">
            {Object.entries(categories).sort((a,b) => b[1] - a[1]).map(([cat, amount]) => (
              <div key={cat} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-600">{cat}</span>
                  <span className="font-black text-gray-900">${amount.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full" 
                    style={{ width: `${(amount / totalRevenue) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {Object.keys(categories).length === 0 && (
              <p className="text-center text-gray-400 py-12 text-sm">No revenue data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordOverview;