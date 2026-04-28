import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/constants';
import { useAuth } from '../context/AuthProvider';
import {
  TrendingUp,
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Search,
  Filter,
  ChevronDown,
  BarChart3,
  Wallet,
  Users,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminEarnings = () => {
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_URL}/admin/earnings-summary`, { headers });
      if (res.data.success) {
        setStats(res.data.data.stats);
        setPayouts(res.data.data.payouts);
      }
    } catch (err) {
      console.error('Earnings fetch error:', err);
      toast.error('Could not load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const statusConfig = {
    pending: { label: 'Pending', classes: 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]' },
    processing: { label: 'Processing', classes: 'bg-[#eff6ff] text-[#0f49d7] border-[#bfdbfe]' },
    paid: { label: 'Paid', classes: 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]' },
  };

  const filteredPayouts = payouts.filter((p) => {
    const matchSearch =
      p.sellerName?.toLowerCase().includes(search.toLowerCase()) ||
      p.sellerId?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0f49d7] border-t-transparent" />
      </div>
    );
  }

  const kpiCards = [
    {
      label: 'Total Platform Revenue',
      value: fmt(stats?.totalRevenue),
      sub: `+${stats?.growthPercent}% vs last month`,
      icon: TrendingUp,
      iconBg: 'bg-[#eff6ff] text-[#0f49d7]',
      positive: true,
    },
    {
      label: 'Platform Commission Earned',
      value: fmt(stats?.platformCommission),
      sub: `${stats?.commissionRate}% of gross sales`,
      icon: CircleDollarSign,
      iconBg: 'bg-[#f0fdf4] text-[#16a34a]',
      positive: true,
    },
    {
      label: 'Total Payable to Sellers',
      value: fmt(stats?.totalSellerPayable),
      sub: 'Net after commission deduction',
      icon: Store,
      iconBg: 'bg-[#fffbeb] text-[#d97706]',
      positive: false,
    },
    {
      label: 'Pending Payouts',
      value: fmt(stats?.pendingPayouts),
      sub: 'Awaiting disbursement',
      icon: Clock,
      iconBg: 'bg-[#fef2f2] text-[#dc2626]',
      positive: false,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10 font-poppins bg-[#f6f7fb] min-h-screen px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between mb-4">
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-[#11182d]">Earnings & Payables</h1>
          <p className="mt-1 text-[0.85rem] text-[#64748b]">
            Platform revenue overview and seller payout obligations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="h-[38px] w-[38px] flex items-center justify-center bg-white border border-[#d7dcea] rounded-[10px] text-[#64748b] hover:bg-[#f8fafc] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 h-[38px] px-4 bg-white border border-[#d7dcea] text-[#64748b] rounded-[10px] text-[10px] font-bold uppercase tracking-wider hover:bg-[#f8fafc] transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-[18px] border border-[#d7dcea] p-5">
              <div className="flex items-start justify-between mb-4">
                <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider leading-tight pr-2">{card.label}</p>
                <div className={`h-10 w-10 shrink-0 flex items-center justify-center rounded-[10px] ${card.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[1.5rem] font-bold text-[#11182d] leading-none">{card.value}</p>
              <div className="flex items-center gap-1.5 mt-2">
                {card.positive ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#16a34a]" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-[#64748b]" />
                )}
                <span className={`text-[0.75rem] font-semibold ${card.positive ? 'text-[#16a34a]' : 'text-[#64748b]'}`}>
                  {card.sub}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Bar */}
      <div className="bg-white rounded-[18px] border border-[#d7dcea] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Commission vs Seller Payout Split</p>
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-[#0f49d7]"></span> Platform ({stats?.commissionRate}%)</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-[#e2e8f0]"></span> Sellers ({100 - (stats?.commissionRate || 15)}%)</span>
              </div>
            </div>
            <div className="w-full h-3 bg-[#f1f5f9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0f49d7] rounded-full"
                style={{ width: `${stats?.commissionRate || 15}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-6 shrink-0 border-l border-[#e2e8f0] pl-6">
            <div>
              <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Paid Out This Month</p>
              <p className="text-[1.1rem] font-bold text-[#11182d]">{fmt(stats?.paidOutThisMonth)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Active Sellers</p>
              <p className="text-[1.1rem] font-bold text-[#11182d]">{stats?.activeSellerCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Payout Table */}
      <div className="bg-white rounded-[18px] border border-[#d7dcea] overflow-hidden">
        {/* Table Controls */}
        <div className="px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[#64748b]" />
            <h2 className="text-[0.9rem] font-bold text-[#11182d]">Seller Payout Ledger</h2>
            <span className="ml-1 px-2 py-0.5 rounded-[6px] bg-[#eff6ff] text-[#0f49d7] text-[10px] font-bold border border-[#bfdbfe]">
              {filteredPayouts.length} sellers
            </span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search seller..."
                className="w-full bg-white border border-[#d9deeb] rounded-[10px] py-2 pl-9 pr-4 text-[0.85rem] text-[#11182d] outline-none focus:border-[#0f49d7] focus:ring-1 focus:ring-[#0f49d7] placeholder:text-[#94a3b8]"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-[#d9deeb] rounded-[10px] py-2 pl-3 pr-8 text-[0.85rem] font-medium text-[#11182d] outline-none focus:border-[#0f49d7] focus:ring-1 focus:ring-[#0f49d7]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="paid">Paid</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748b] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full min-w-[900px]">
            <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Seller</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Gross Sales</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Commission ({stats?.commissionRate}%)</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Net Payable</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Orders</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredPayouts.length > 0 ? filteredPayouts.map((p) => (
                <tr key={p._id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-[10px] bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center shrink-0">
                        <Store className="w-4 h-4 text-[#64748b]" />
                      </div>
                      <div>
                        <p className="text-[0.88rem] font-bold text-[#11182d]">{p.sellerName}</p>
                        <p className="text-[10px] font-medium text-[#64748b]">{p.sellerId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-[0.88rem] font-semibold text-[#11182d]">{fmt(p.grossSales)}</td>
                  <td className="px-6 py-4 text-right text-[0.88rem] font-semibold text-[#dc2626]">− {fmt(p.commission)}</td>
                  <td className="px-6 py-4 text-right text-[0.95rem] font-bold text-[#16a34a]">{fmt(p.netPayable)}</td>
                  <td className="px-6 py-4 text-center text-[0.88rem] font-semibold text-[#64748b]">{p.totalOrders}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-[8px] text-[9px] font-bold uppercase tracking-wider border ${statusConfig[p.status]?.classes || ''}`}>
                      {statusConfig[p.status]?.label || p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-[0.8rem] font-medium text-[#64748b]">
                    {new Date(p.lastActivity).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <BarChart3 className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
                    <p className="text-[0.9rem] font-bold text-[#11182d]">No payouts found</p>
                    <p className="text-[0.8rem] text-[#64748b] mt-1">Try adjusting your search or filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
            {filteredPayouts.length > 0 && (
              <tfoot className="bg-[#f8fafc] border-t-2 border-[#e2e8f0]">
                <tr>
                  <td className="px-6 py-4 text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Totals</td>
                  <td className="px-6 py-4 text-right text-[0.88rem] font-bold text-[#11182d]">
                    {fmt(filteredPayouts.reduce((s, p) => s + (p.grossSales || 0), 0))}
                  </td>
                  <td className="px-6 py-4 text-right text-[0.88rem] font-bold text-[#dc2626]">
                    − {fmt(filteredPayouts.reduce((s, p) => s + (p.commission || 0), 0))}
                  </td>
                  <td className="px-6 py-4 text-right text-[0.95rem] font-bold text-[#16a34a]">
                    {fmt(filteredPayouts.reduce((s, p) => s + (p.netPayable || 0), 0))}
                  </td>
                  <td className="px-6 py-4 text-center text-[0.88rem] font-bold text-[#64748b]">
                    {filteredPayouts.reduce((s, p) => s + (p.totalOrders || 0), 0)}
                  </td>
                  <td colSpan="2" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminEarnings;
