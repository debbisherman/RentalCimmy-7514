import React from 'react';
import { useApp } from '../store/AppContext';
import { generateReceiptPDF, generateStatementPDF } from '../utils/pdfGenerator';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiDownload, FiInfo, FiCheckCircle, FiFileText, FiPrinter, FiUsers } = FiIcons;

const RenterDashboard = () => {
  const { profile, renters = [], payments = [] } = useApp();

  // Defensive: Find the renter record that matches the logged-in user's profile
  const myInfo = (renters || []).find(r => r.email === profile?.email);

  // Defensive: Filter and sort payments safely
  const myPayments = (payments || [])
    .filter(p => p.renter_id === myInfo?.id)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const totalPaid = myPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  // 1. Handle Case: No Profile Found
  if (!myInfo) {
    return (
      <div className="h-[70vh] flex items-center justify-center p-8 text-center bg-white rounded-[32px] border border-dashed border-gray-200">
        <div className="max-w-md">
          <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <SafeIcon icon={FiInfo} className="text-4xl" />
          </div>
          <h3 className="text-2xl font-black text-gray-900">Linking Required</h3>
          <p className="text-gray-500 mt-4 font-medium leading-relaxed">
            Your account ({profile?.email}) is not yet linked to a property record. 
            Please ask your landlord to add this email to their <span className="text-blue-600 font-bold">Renters Directory</span>.
          </p>
        </div>
      </div>
    );
  }

  const handleDownloadReceipt = (payment) => {
    generateReceiptPDF(payment, myInfo);
  };

  const handleDownloadStatement = () => {
    if (myPayments.length === 0) return;
    const start = myPayments[myPayments.length - 1]?.date || 'N/A';
    const end = myPayments[0]?.date || 'N/A';
    generateStatementPDF(myPayments, myInfo, null, start, end);
  };

  const firstName = myInfo.name ? myInfo.name.split(' ')[0] : 'User';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[40px] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h1 className="text-5xl font-black mb-4 tracking-tight">Hello, {firstName}!</h1>
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-2 bg-white/10 px-5 py-2 rounded-2xl backdrop-blur-md text-sm font-bold border border-white/10">
                <SafeIcon icon={FiInfo} className="text-blue-200" />
                {myInfo.address || 'Address pending update'}
              </span>
            </div>
          </div>
          <button 
            onClick={handleDownloadStatement}
            disabled={myPayments.length === 0}
            className="bg-white text-blue-700 px-8 py-4 rounded-[20px] font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-blue-50 transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            <SafeIcon icon={FiFileText} className="text-xl" />
            Full Statement
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
            <h3 className="font-black text-gray-900 text-lg mb-8 border-b border-gray-50 pb-4 uppercase tracking-widest">Financials</h3>
            <div className="space-y-8">
              <div className="bg-emerald-50/50 p-8 rounded-3xl border border-emerald-100">
                <p className="text-[10px] text-emerald-600 font-black uppercase mb-2 tracking-widest">Total Paid YTD</p>
                <p className="text-4xl font-black text-emerald-700">${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              
              <div className="pt-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Contact File</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                      <SafeIcon icon={FiCheckCircle} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">{myInfo.phone || 'No phone listed'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
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
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-10 py-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
            <h3 className="font-black text-gray-900 text-lg uppercase tracking-widest">Ledger History</h3>
            <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
              {myPayments.length} Records
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[600px]">
            {myPayments.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {myPayments.map(payment => (
                  <div key={payment.id} className="p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-8 hover:bg-gray-50/50 transition-all group">
                    <div className="flex items-start gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                        <SafeIcon icon={FiCheckCircle} className="text-3xl" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-black text-gray-900 text-2xl">${parseFloat(payment.amount || 0).toFixed(2)}</p>
                          <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-emerald-100">Paid</span>
                        </div>
                        <p className="text-sm text-gray-500 font-bold">
                          {new Date(payment.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                          <span className="mx-3 text-gray-200">|</span>
                          <span className="text-blue-600 font-black uppercase text-[10px] tracking-widest">{payment.category || 'Rent'}</span>
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownloadReceipt(payment)}
                      className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
                    >
                      <SafeIcon icon={FiDownload} className="text-lg" />
                      Receipt
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-32 text-center text-gray-400">
                <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-dashed border-gray-200">
                  <SafeIcon icon={FiPrinter} className="text-5xl opacity-30" />
                </div>
                <p className="font-black uppercase tracking-widest text-xs">No transactions found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenterDashboard;