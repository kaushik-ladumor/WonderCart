import React, { useState } from "react";
import { 
  DollarSign, 
  CreditCard, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  ArrowUpRight,
  TrendingUp,
  Download,
  AlertCircle,
  XCircle,
  Undo2,
  ShieldCheck,
  Zap,
  ArrowRight
} from "lucide-react";
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useGetSellerEarningsQuery } from "../services/dashboardApi";
import Loader from "../components/Loader";

const RUPEE = "\u20B9";

const SellerEarnings = () => {
  const [period, setPeriod] = useState("30d");
  const { data, isLoading, isFetching, refetch } = useGetSellerEarningsQuery(period);

  const getStatusStyle = (status) => {
    switch (status) {
      case "delivered":
        return { bg: "bg-[#eef2ff]", text: "text-[#0f49d7]", border: "border-[#0f49d7]/20", label: "Successful" };
      case "cancelled":
        return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100", label: "Cancelled" };
      case "returned":
      case "refunded":
        return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-100", label: "Returned" };
      default:
        return { bg: "bg-[#f8f9fd]", text: "text-[#5b6478]", border: "border-[#d7dcea]", label: "Pending" };
    }
  };

  const handleDownload = () => {
    if (!data?.orders?.length) return;
    const headers = ["Order ID", "Date", "Status", "Payment", "Customer Paid", "Admin Fee", "Discount", "Seller Earnings"];
    const rows = data.orders.map(o => [
      o.orderId,
      new Date(o.date).toLocaleDateString(),
      o.status,
      o.paymentMethod,
      o.financials.customerPaid,
      o.financials.adminFee,
      o.financials.discount,
      o.financials.sellerEarnings
    ]);
    const csv = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `earnings_report_${period}.csv`;
    link.click();
  };

  if (isLoading) return <Loader />;

  const stats = data?.summary || {};
  const balance = data?.balance || 0;

  return (
    <div className="min-h-screen bg-[#f6f7fb] pb-6 text-[#11182d] font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 pt-0">
        
        {/* Header & Balance */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-[1.5rem] font-semibold tracking-tight">Earnings Dashboard</h1>
            <p className="text-[#6d7892] text-[0.82rem] mt-0.5">Monitor your revenue and financial health</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-white border border-[#d7dcea] rounded-[18px] p-3 flex items-center gap-4 shadow-sm flex-1 md:flex-none min-w-[240px]">
              <div className="w-10 h-10 bg-[#eef2ff] rounded-[14px] flex items-center justify-center text-[#0f49d7]">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-[#6d7892] uppercase tracking-[0.12em]">Available Balance</p>
                <h2 className="text-lg font-bold text-[#11182d]">{RUPEE}{balance.toLocaleString()}</h2>
              </div>
            </div>
            
            <button 
              onClick={refetch}
              disabled={isFetching}
              className="p-3 bg-white border border-[#d7dcea] rounded-[18px] text-[#0f49d7] hover:border-[#0f49d7] shadow-sm transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Primary Metrics Group */}
        <section>
          <div className="mb-2.5 flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f49d7] text-[0.7rem] font-semibold text-white">
              1
            </span>
            <h2 className="text-[1rem] font-semibold">Revenue Overview</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Successful */}
            <div className="bg-white border border-[#d7dcea] rounded-[18px] p-4.5 shadow-sm transition-all hover:border-[#0f49d7]">
              <div className="flex justify-between items-start mb-3">
                <div className="w-9 h-9 bg-emerald-50 rounded-[12px] flex items-center justify-center text-emerald-600">
                  <CheckCircle className="w-4.5 h-4.5" />
                </div>
                <span className="bg-emerald-50 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Settled</span>
              </div>
              <p className="text-[0.7rem] font-semibold text-[#6d7892] uppercase tracking-wider mb-0.5">Successful</p>
              <h3 className="text-lg font-bold text-[#11182d]">{RUPEE}{stats.successfulRevenue?.toLocaleString()}</h3>
              <div className="mt-2 flex items-center gap-1.5 text-emerald-600 text-[0.65rem] font-bold">
                <TrendingUp className="w-3 h-3" />
                <span>{stats.successfulCount} Delivered</span>
              </div>
            </div>

            {/* Cancelled */}
            <div className="bg-white border border-[#d7dcea] rounded-[18px] p-4.5 shadow-sm transition-all hover:border-rose-200">
              <div className="flex justify-between items-start mb-3">
                <div className="w-9 h-9 bg-rose-50 rounded-[12px] flex items-center justify-center text-rose-600">
                  <XCircle className="w-4.5 h-4.5" />
                </div>
                <span className="bg-rose-50 text-rose-600 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Lost</span>
              </div>
              <p className="text-[0.7rem] font-semibold text-[#6d7892] uppercase tracking-wider mb-0.5">Cancelled</p>
              <h3 className="text-lg font-bold text-[#11182d]">{RUPEE}{stats.cancelledRevenue?.toLocaleString()}</h3>
              <div className="mt-2 flex items-center gap-1.5 text-rose-500 text-[0.65rem] font-bold">
                <AlertCircle className="w-3 h-3" />
                <span>{stats.cancelledCount} Orders</span>
              </div>
            </div>

            {/* Returned */}
            <div className="bg-white border border-[#d7dcea] rounded-[18px] p-4.5 shadow-sm transition-all hover:border-orange-200">
              <div className="flex justify-between items-start mb-3">
                <div className="w-9 h-9 bg-orange-50 rounded-[12px] flex items-center justify-center text-orange-600">
                  <Undo2 className="w-4.5 h-4.5" />
                </div>
                <span className="bg-orange-50 text-orange-600 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Reversed</span>
              </div>
              <p className="text-[0.7rem] font-semibold text-[#6d7892] uppercase tracking-wider mb-0.5">Returned</p>
              <h3 className="text-lg font-bold text-[#11182d]">{RUPEE}{stats.returnedAmount?.toLocaleString()}</h3>
              <div className="mt-2 flex items-center gap-1.5 text-orange-600 text-[0.65rem] font-bold">
                <RefreshCw className="w-3 h-3" />
                <span>{stats.returnedCount} Items</span>
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white border border-[#d7dcea] rounded-[18px] p-4.5 shadow-sm transition-all hover:border-[#0f49d7]">
              <div className="flex justify-between items-start mb-3">
                <div className="w-9 h-9 bg-[#eef2ff] rounded-[12px] flex items-center justify-center text-[#0f49d7]">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <span className="bg-[#eef2ff] text-[#0f49d7] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Process</span>
              </div>
              <p className="text-[0.7rem] font-semibold text-[#6d7892] uppercase tracking-wider mb-0.5">In-Pipeline</p>
              <h3 className="text-lg font-bold text-[#11182d]">{RUPEE}{stats.pendingRevenue?.toLocaleString()}</h3>
              <div className="mt-2 flex items-center gap-1.5 text-[#0f49d7] text-[0.65rem] font-bold">
                <Zap className="w-3 h-3" />
                <span>Active Orders</span>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Section */}
        <section>
          <div className="mb-2.5 flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#dfe7ff] text-[0.7rem] font-semibold text-[#0f49d7]">
              2
            </span>
            <h2 className="text-[1rem] font-semibold">Payment Analytics</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Payment Method Distribution */}
            <div className="bg-white border border-[#d7dcea] rounded-[18px] p-5 shadow-sm flex flex-col justify-between h-full">
              <h3 className="text-[0.9rem] font-semibold text-[#11182d] mb-4">Payment Method Split</h3>
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-[16px] bg-[#f8f9fd] border border-[#d7dcea]">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#0f49d7]" />
                      <span className="text-[0.8rem] font-semibold text-[#33415e]">Online</span>
                    </div>
                    <span className="text-[0.82rem] font-bold text-[#11182d]">{RUPEE}{stats.onlinePaymentsTotal?.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white rounded-full border border-[#d7dcea] overflow-hidden">
                    <div 
                      className="h-full bg-[#0f49d7] rounded-full transition-all duration-1000" 
                      style={{ width: `${(stats.onlinePaymentsTotal / (stats.totalCustomerPaid || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-3.5 rounded-[16px] bg-[#f8f9fd] border border-[#d7dcea]">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#5b6478]" />
                      <span className="text-[0.8rem] font-semibold text-[#33415e]">COD</span>
                    </div>
                    <span className="text-[0.82rem] font-bold text-[#11182d]">{RUPEE}{stats.codPaymentsTotal?.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white rounded-full border border-[#d7dcea] overflow-hidden">
                    <div 
                      className="h-full bg-[#5b6478] rounded-full transition-all duration-1000" 
                      style={{ width: `${(stats.codPaymentsTotal / (stats.totalCustomerPaid || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-[#d7dcea] space-y-1.5">
                <div className="flex justify-between text-[0.72rem] font-medium text-[#6d7892]">
                  <span>Admin Fee Impact</span>
                  <span className="font-bold text-[#11182d]">{RUPEE}{stats.platformCommissionTotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[0.72rem] font-medium text-[#6d7892]">
                  <span>Coupon Discounts</span>
                  <span className="font-bold text-rose-500">-{RUPEE}{stats.totalCouponDiscounts?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Realized Revenue Chart */}
            <div className="lg:col-span-2 bg-white border border-[#d7dcea] rounded-[18px] p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                <div>
                  <h3 className="text-[0.9rem] font-semibold text-[#11182d]">Earnings Trend</h3>
                  <p className="text-[0.72rem] text-[#6d7892]">Realized payout tracking</p>
                </div>
                <div className="flex bg-[#f1f4fb] p-1 rounded-[10px] border border-[#d7dcea]">
                  {['7d', '30d', 'year'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setPeriod(t)}
                      className={`px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] rounded-[8px] transition-all ${period === t ? 'bg-white text-[#0f49d7] shadow-sm' : 'text-[#6d7892] hover:text-[#0f49d7]'}`}
                    >
                      {t === 'year' ? 'Yr' : t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.chartData}>
                    <defs>
                      <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f49d7" stopOpacity={0.08}/>
                        <stop offset="95%" stopColor="#0f49d7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f4fb" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 9, fontWeight: 700, fill: '#98a4bd'}}
                      dy={8}
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        return d.getDate() === 1 || d.getDate() === 15 ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '';
                      }}
                    />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{stroke: '#0f49d7', strokeWidth: 1.5, strokeDasharray: '4 4'}}
                      contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                      formatter={(value) => [`${RUPEE}${value.toLocaleString()}`, 'Earnings']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#0f49d7" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#earningsGradient)" 
                      dot={{ r: 4, fill: '#0f49d7', strokeWidth: 2, stroke: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* DETAILED ORDER BREAKDOWN */}
        <section>
          <div className="mb-2.5 flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#dcfce7] text-[0.7rem] font-semibold text-emerald-700">
              3
            </span>
            <h2 className="text-[1rem] font-semibold">Order Breakdown</h2>
          </div>

          <div className="bg-white border border-[#d7dcea] rounded-[18px] shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#f1f4fb] flex justify-between items-center">
              <h3 className="text-[0.82rem] font-semibold text-[#11182d]">Transaction History</h3>
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-[#f8f9fd] border border-[#d7dcea] rounded-xl text-[0.7rem] font-bold text-[#11182d] hover:border-[#0f49d7] transition-all"
              >
                <Download className="w-3 h-3" /> Export
              </button>
            </div>

            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left min-w-[900px]">
                <thead>
                  <tr className="bg-[#f8f9fd] border-b border-[#d7dcea]">
                    <th className="pl-5 pr-3 py-3 text-[0.68rem] font-bold text-[#6d7892] uppercase tracking-[0.1em]">Order Info</th>
                    <th className="px-3 py-3 text-[0.68rem] font-bold text-[#6d7892] uppercase tracking-[0.1em]">Payment & Status</th>
                    <th className="px-3 py-3 text-[0.68rem] font-bold text-[#6d7892] uppercase tracking-[0.1em] text-center">Breakdown</th>
                    <th className="px-3 py-3 text-[0.68rem] font-bold text-[#6d7892] uppercase tracking-[0.1em] text-center">Customer Paid</th>
                    <th className="px-3 py-3 text-[0.68rem] font-bold text-[#6d7892] uppercase tracking-[0.1em] text-right pr-6">Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f4fb]">
                  {data.orders.map((order) => {
                    const style = getStatusStyle(order.status);
                    return (
                      <tr key={order.id} className="hover:bg-[#fcfcff] transition-colors group">
                        <td className="pl-5 pr-3 py-4">
                          <p className="text-[0.82rem] font-semibold text-[#11182d]">{order.orderId}</p>
                          <p className="text-[0.65rem] text-[#6d7892] mt-0.5">
                            {new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`${style.bg} ${style.text} px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${style.border} w-fit`}>
                              {style.label}
                            </span>
                            <div className="flex items-center gap-1 text-[0.7rem] text-[#5c6880] ml-1">
                              {order.paymentMethod === 'Razorpay' ? <ShieldCheck className="w-3 h-3 text-[#0f49d7]" /> : <DollarSign className="w-3 h-3 text-orange-500" />}
                              {order.paymentMethod}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center justify-center gap-5">
                            <div className="flex flex-col items-center">
                              <span className="text-[0.78rem] font-semibold text-[#33415e]">{RUPEE}{order.financials.adminFee}</span>
                              <p className="text-[0.58rem] font-bold text-[#98a4bd] uppercase">Fee</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[0.78rem] font-semibold text-rose-500">{RUPEE}{order.financials.discount}</span>
                              <p className="text-[0.58rem] font-bold text-[#98a4bd] uppercase">Promo</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-center">
                          <span className="text-[0.88rem] font-bold text-[#11182d]">{RUPEE}{order.financials.customerPaid.toLocaleString()}</span>
                          <p className="text-[0.6rem] text-[#6d7892]">Gross</p>
                        </td>
                        <td className="px-3 py-4 text-right pr-6">
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1">
                              <span className="text-[0.95rem] font-bold text-[#0f49d7] tracking-tight">{RUPEE}{order.financials.sellerEarnings.toLocaleString()}</span>
                              <ArrowUpRight className="w-3 h-3 text-[#0f49d7]" />
                            </div>
                            <p className="text-[0.62rem] text-[#6d7892] mt-0.5 font-medium">Net Payout</p>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="px-5 py-3.5 bg-[#f8f9fd] border-t border-[#d7dcea] flex flex-col sm:flex-row justify-between items-center gap-2">
              <p className="text-[0.7rem] text-[#6d7892] font-medium flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                Payments processed daily via WonderCart Settlement.
              </p>
              <div className="flex items-center gap-3 text-[0.7rem] font-bold text-[#0f49d7]">
                <button className="hover:underline">Need help?</button>
                <button className="hover:underline">Payout Rules</button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>

  );
};

export default SellerEarnings;
