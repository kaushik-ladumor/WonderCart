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

  // Load the dashboard stats
  const { data, isLoading, isError, error } = useGetDashboardStatsQuery(period);

  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onNewOrder = () => {
      // Invalidate dashboard stats
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

  // Extract variables
  const kpis = data?.kpis || {};
  const pipeline = data?.pipeline || {};
  const revenueChart = data?.revenueChart || [];
  const topProducts = data?.topProducts || [];
  const storeHealth = data?.storeHealth || {};

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 pb-20 dark:bg-gray-900 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2156d8] bg-[#2156d8]/10 px-2 py-0.5 rounded-md">Real-time Analytics</span>
          </div>
          <h1 className="text-[1.75rem] font-black tracking-tight text-[#0f172a] dark:text-white flex items-center gap-3">
            Business Overview
            {isConnected && (
              <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Live</span>
              </div>
            )}
          </h1>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full p-1 text-[11px] font-bold">
          {['7d', '30d', '90d', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2 rounded-full transition-all duration-300 ${period === p
                ? 'bg-white dark:bg-gray-700 shadow-md shadow-gray-200/50 dark:shadow-none text-[#2156d8] dark:text-white'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {isError ? (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl mb-6 text-sm font-medium border border-rose-100">
          ⚠️ Failed to sync dashboard data. {error?.data?.message || error?.message || "Please check your network connection."}
        </div>
      ) : null}

      {/* QuickActions Bar */}
      <div className="mb-8">
        <QuickActions />
      </div>

      {/* KPI Cards Row */}
      <KpiCards kpis={kpis} isLoading={isLoading} />

      {/* Order Pipeline */}
      <div className="mb-10 mt-10">
        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="text-[15px] font-extrabold uppercase tracking-widest text-[#1e293b] dark:text-gray-100">Order Lifecycle</h2>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Pipeline</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {isLoading ? (
            [1, 2, 3, 4, 5].map((i) => <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-[24px]" />)
          ) : (
            ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => {
              const d = pipeline[status] || { count: 0, revenue: 0 };
              const colors = {
                pending: 'border-l-[#f59e0b] text-[#f59e0b]',
                processing: 'border-l-[#6366f1] text-[#6366f1]',
                shipped: 'border-l-[#3b82f6] text-[#3b82f6]',
                delivered: 'border-l-[#10b981] text-[#10b981]',
                cancelled: 'border-l-[#ef4444] text-[#ef4444]'
              };
              return (
                <div key={status} className={`border border-gray-100 border-l-[4px] rounded-[22px] p-5 bg-white dark:bg-gray-800 transition-all duration-300 shadow-sm ${colors[status].split(' ')[0]} group cursor-default`}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#64748b] mb-3">{status.toUpperCase()}</p>
                  <h3 className={`text-[1.75rem] font-black leading-none tracking-tight mb-2 ${colors[status].split(' ')[1]}`}>{d.count}</h3>
                  <div className="flex items-center gap-1 text-[#94a3b8]">
                    <span className="text-[11px] font-bold">₹{d.revenue?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-7 xl:col-span-8">
          <RevenueChart data={revenueChart} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <OrderStatusChart pipeline={pipeline} isLoading={isLoading} />
        </div>
      </div>

      {/* Bottom Layout Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 xl:col-span-8">
          <TopProducts products={topProducts} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <StoreHealth storeHealth={storeHealth} isLoading={isLoading} />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
