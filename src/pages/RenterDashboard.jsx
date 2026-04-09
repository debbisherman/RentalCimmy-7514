import React from 'react';
import { useApp } from '../store/AppContext';
import { generateReceiptPDF, generateStatementPDF } from '../utils/pdfGenerator';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiDownload, FiInfo, FiCheckCircle, FiFileText, FiPrinter } = FiIcons;

const RenterDashboard = () => {
  const { profile, renters, payments } = useApp();

  // Find the renter record that matches the logged-in user's profile
  const myInfo = renters.find(r => r.email === profile?.email);
  
  // Filter and sort payments
  const myPayments = payments
    .filter(p => p.renter_id === myInfo?.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalPaid = myPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  if (!myInfo) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200">
        <div className="max-w-md">
          <SafeIcon icon={FiInfo} className="text-4xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700">No Renter Profile Found</h3>
          <p className="text-gray-500 mt-2">
            Your account is not yet linked to a property. Please contact your landlord to add your email ({profile?.email}) to their renter list.
          </p>
        </div>
      </div>
    );
  }

  const handleDownloadReceipt = (payment) => {
    generateReceiptPDF(payment, myInfo);
  };

  const handleDownloadStatement = () => {
    generateStatementPDF(myPayments, myInfo);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black mb-3">Hello, {myInfo.name.split(' ')[0]}!</h1>
            <div className="flex flex-wrap items-center gap-4 text-blue-100">
              <span className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm text-sm font-semibold">
                <SafeIcon icon={FiInfo} /> {myInfo.address}
              </span>
            </div>
          </div>
          <button 
            onClick={handleDownloadStatement}
            className="bg-white text-blue-700 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-blue-50 transition-all shadow-xl active:scale-95"
          >
            <SafeIcon icon={FiFileText} className="text-lg" />
            Download Statement
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h3 className="font-black text-gray-900 text-lg mb-6 border-b border-gray-50 pb-4 uppercase tracking-wider">Financial Summary</h3>
            <div className="space-y-6">
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                <p className="text-xs text-emerald-600 font-black uppercase mb-1 tracking-widest">Total Paid YTD</p>
                <p className="text-4xl font-black text-emerald-700">${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              
              <div className="pt-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Contact Information</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                       <SafeIcon icon={FiCheckCircle} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">{myInfo.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                       <SafeIcon icon={FiInfo} />
                    </div>
                    <span className="text-sm font-bold text-blue-600 truncate">{myInfo.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-black text-gray-900 text-lg uppercase tracking-wider">Payment History</h3>
            <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-lg">
              {myPayments.length} TRANSACTIONS
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[600px]">
            {myPayments.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {myPayments.map(payment => (
                  <div key={payment.id} className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-gray-50/50 transition-all group">
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                        <SafeIcon icon={FiCheckCircle} className="text-2xl" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-black text-gray-900 text-xl">${parseFloat(payment.amount).toFixed(2)}</p>
                          <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md uppercase tracking-tighter">Paid</span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                          {new Date(payment.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-blue-600 font-bold uppercase text-xs tracking-widest">{payment.category || 'Rent'}</span>
                        </p>
                        {payment.note && <p className="text-xs text-gray-400 mt-1 italic">"{payment.note}"</p>}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownloadReceipt(payment)}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
                    >
                      <SafeIcon icon={FiDownload} />
                      Receipt
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center text-gray-400">
                <SafeIcon icon={FiPrinter} className="text-5xl mx-auto mb-4 opacity-20" />
                <p className="italic font-medium">No payments found on your account.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenterDashboard;