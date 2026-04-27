import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetDashboardStatsQuery, dashboardApi } from '../services/dashboardApi';
import socket from '../socket';

import KpiCards from '../components/dashboard/KpiCards';
import OrderStatusChart from '../components/dashboard/OrderStatusChart';
import RevenueChart from '../components/dashboard/RevenueChart';
import TopProducts from '../components/dashboard/TopProducts';
import StoreHealth from '../components/dashboard/StoreHealth';
import QuickActions from '../components/dashboard/QuickActions';

const Dashboard = () => {
  const [period, setPeriod] = useState('30d');
  const dispatch = useDispatch();

  const { data, isLoading, isError, error } = useGetDashboardStatsQuery(period);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onNewOrder = () => {
      dispatch(dashboardApi.util.invalidateTags(['DashboardStats']));
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new_order', onNewOrder);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new_order', onNewOrder);
    };
  }, [dispatch]);

  const kpis = data?.kpis || {};
  const pipeline = data?.pipeline || {};
  const revenueChart = data?.revenueChart || [];
  const topProducts = data?.topProducts || [];
  const storeHealth = data?.storeHealth || {};

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-12 pt-0 font-poppins text-[#11182d]">
      <section className="rounded-[18px] border border-[#d7dcea] bg-white px-5 py-4 sm:px-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef2ff] text-[#0f49d7] shadow-sm border border-[#d7dcea]">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-[1.35rem] font-black tracking-tight text-[#11182d]">Business Overview</h1>
                {isConnected && (
                  <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[0.6rem] font-black text-emerald-600 uppercase tracking-widest">LIVE</span>
                  </div>
                )}
              </div>
              <p className="text-[0.8rem] text-[#6d7892]">Real-time analytics and performance tracking.</p>
            </div>
          </div>

          <div className="flex bg-[#f1f4fb] p-1 rounded-[14px] border border-[#d7dcea] shadow-inner">
            {['7d', '30d', '90d', 'year'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-[10px] text-[0.7rem] font-bold transition-all duration-300 uppercase tracking-wider ${
                  period === p
                    ? 'bg-white text-[#0f49d7] shadow-sm'
                    : 'text-[#6d7892] hover:text-[#0f49d7]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>

      {isError && (
        <div className="rounded-[18px] border border-rose-100 bg-rose-50 p-4 shadow-sm animate-in fade-in duration-500">
          <div className="flex items-center gap-3 text-rose-600">
            <AlertCircle className="h-5 w-5" />
            <p className="text-[0.8rem] font-bold">Failed to sync dashboard data: {error?.data?.message || "Check your connection."}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <QuickActions />
        
        <div>
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f49d7] text-[0.7rem] font-black text-white shadow-sm">
              1
            </span>
            <h2 className="text-[1rem] font-black tracking-tight text-[#11182d]">Key Performance Indicators</h2>
          </div>
          <KpiCards kpis={kpis} isLoading={isLoading} />
        </div>

        <div>
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f49d7] text-[0.7rem] font-black text-white shadow-sm">
              2
            </span>
            <h2 className="text-[1rem] font-black tracking-tight text-[#11182d]">Order Lifecycle Pipeline</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => <div key={i} className="h-28 bg-[#f8f9fd] animate-pulse rounded-[18px] border border-[#d7dcea]" />)
            ) : (
              ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => {
                const d = pipeline[status] || { count: 0, revenue: 0 };
                const colors = {
                  pending: 'text-[#f59e0b] bg-amber-50 border-amber-100',
                  processing: 'text-[#6366f1] bg-indigo-50 border-indigo-100',
                  shipped: 'text-[#3b82f6] bg-blue-50 border-blue-100',
                  delivered: 'text-[#10b981] bg-emerald-50 border-emerald-100',
                  cancelled: 'text-[#ef4444] bg-rose-50 border-rose-100'
                };
                return (
                  <div key={status} className="group relative overflow-hidden rounded-[18px] border border-[#d7dcea] bg-white p-5 shadow-sm transition-all hover:border-[#0f49d7]/30 hover:shadow-md">
                    <div className={`absolute left-0 top-0 h-1 w-full opacity-50 ${colors[status].split(' ')[1].replace('bg-', 'bg-')}`} />
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.15em] text-[#6d7892] mb-3">{status}</p>
                    <h3 className={`text-[1.75rem] font-black leading-none tracking-tighter mb-1.5 ${colors[status].split(' ')[0]}`}>{d.count}</h3>
                    <p className="text-[0.75rem] font-bold text-[#11182d]">₹{d.revenue?.toLocaleString('en-IN')}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f49d7] text-[0.7rem] font-black text-white shadow-sm">
                3
              </span>
              <h2 className="text-[1rem] font-black tracking-tight text-[#11182d]">Revenue Trends</h2>
            </div>
            <div className="rounded-[18px] border border-[#d7dcea] bg-white p-1 shadow-sm overflow-hidden">
              <RevenueChart data={revenueChart} isLoading={isLoading} />
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f49d7] text-[0.7rem] font-black text-white shadow-sm">
                4
              </span>
              <h2 className="text-[1rem] font-black tracking-tight text-[#11182d]">Order Status</h2>
            </div>
            <div className="rounded-[18px] border border-[#d7dcea] bg-white p-1 shadow-sm overflow-hidden">
              <OrderStatusChart pipeline={pipeline} isLoading={isLoading} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f49d7] text-[0.7rem] font-black text-white shadow-sm">
                5
              </span>
              <h2 className="text-[1rem] font-black tracking-tight text-[#11182d]">Top Selling Products</h2>
            </div>
            <div className="rounded-[18px] border border-[#d7dcea] bg-white shadow-sm overflow-hidden">
              <TopProducts products={topProducts} isLoading={isLoading} />
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f49d7] text-[0.7rem] font-black text-white shadow-sm">
                6
              </span>
              <h2 className="text-[1rem] font-black tracking-tight text-[#11182d]">Store Health</h2>
            </div>
            <div className="rounded-[18px] border border-[#d7dcea] bg-white shadow-sm overflow-hidden">
              <StoreHealth storeHealth={storeHealth} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
