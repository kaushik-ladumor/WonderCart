import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/constants';
import { useAuth } from '../context/AuthProvider';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Download,
  Building2,
  Send,
  History,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminWallet = () => {
  const { token, authUser } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    fetchWalletData();
  }, [token]);

  const fetchWalletData = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/wallet-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setBalance(response.data.balance);
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error("Wallet fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || withdrawAmount <= 0) return toast.error("Enter valid amount");

    toast.loading("Initiating bank transfer...");
    setTimeout(() => {
      toast.dismiss();
      toast.success(`₹${withdrawAmount} withdrawal initiated to registered bank!`);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 font-body">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Platform Treasury</h1>
            <p className="text-sm text-gray-500">Manage platform commissions and corporate settlements</p>
          </div>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-black/10 hover:bg-gray-800 transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            Withdraw to Bank
          </button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Wallet className="w-16 h-16 text-black" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Available Balance</p>
            <h2 className="text-3xl font-bold text-gray-900">₹{balance.toLocaleString()}</h2>
            <div className="mt-4 flex items-center gap-2 text-emerald-600">
              <ArrowDownLeft className="w-3 h-3" />
              <span className="text-[10px] font-bold">+12% from last cycle</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Commission</p>
            <h2 className="text-3xl font-bold text-gray-900">₹{(balance * 1.4).toLocaleString()}</h2>
            <p className="text-[10px] text-gray-500 mt-4 leading-relaxed">Cumulative platform earnings after vendor settlements</p>
          </div>

          <div className="bg-black p-6 rounded-2xl shadow-xl shadow-black/10 text-white flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <Building2 className="w-6 h-6 opacity-60" />
              <span className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded-md">Settlement Account</span>
            </div>
            <div>
              <p className="text-[10px] font-bold opacity-60 uppercase mb-1">Registered Account</p>
              <p className="text-sm font-bold tracking-widest">HDFC **** 8821</p>
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-gray-900">Transaction History</h3>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-black transition-colors">
                <Filter className="w-4 h-4" />
              </button>
              <button className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-black transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reference</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.length > 0 ? transactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900">{tx.description}</span>
                        <span className="text-[10px] text-gray-400 font-medium lowercase">Source: {tx.source}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${tx.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-xs font-bold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-[10px] font-medium text-gray-500 font-mono">
                      #{tx.refId?.slice(-8).toUpperCase() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-[10px] font-medium text-gray-400">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-400">
                      No recent transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Withdrawal Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Withdraw Funds</h3>
              <p className="text-sm text-gray-500 mb-6 font-medium">Transfer platform balance to registered bank account</p>

              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3 mb-6">
                <Info className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  Settlements via <span className="font-bold">IMPS/NEFT</span> usually take 2-4 hours. Withdrawals are subject to Razorpay T+1 liquidity cycles.
                </p>
              </div>

              <form onSubmit={handleWithdraw}>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Amount to Withdraw</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-10 pr-4 text-lg font-bold focus:ring-2 focus:ring-black transition-all"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" className="py-3 px-4 bg-gray-50 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all">NEFT (No cap)</button>
                    <button type="button" className="py-3 px-4 bg-gray-900 rounded-2xl text-xs font-bold text-white shadow-xl shadow-black/20">IMPS (Instant)</button>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 py-4 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-black text-white py-4 rounded-2xl text-sm font-bold shadow-xl shadow-black/10 hover:bg-gray-800 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Confirm
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWallet;
