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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            Dashboard
            {isConnected && <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse ml-2" title="Live Server Connected" />}
          </h1>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 text-sm">
          {['7d', '30d', '90d', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md transition-all ${period === p
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white font-medium'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {isError ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
          Failed to load dashboard data. {error?.data?.message || error?.message || "Please check your network connection."}
        </div>
      ) : null}

      {/* QuickActions Bar */}
      <QuickActions />

      {/* KPI Cards Row */}
      <KpiCards kpis={kpis} isLoading={isLoading} />

      {/* Order Pipeline */}
      <div className="mb-6 mt-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Order Pipeline</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {isLoading ? (
            [1, 2, 3, 4, 5].map((i) => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl" />)
          ) : (
            ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => {
              const d = pipeline[status] || { count: 0, revenue: 0 };
              const colors = {
                pending: 'text-amber-600 bg-amber-50 border-amber-200 hover:border-amber-400',
                processing: 'text-blue-600 bg-blue-50 border-blue-200 hover:border-blue-400',
                shipped: 'text-green-600 bg-green-50 border-green-200 hover:border-green-400',
                delivered: 'text-teal-600 bg-teal-50 border-teal-200 hover:border-teal-400',
                cancelled: 'text-red-600 bg-red-50 border-red-200 hover:border-red-400'
              };
              return (
                <div key={status} className={`border-2 rounded-xl p-4 transition-all ${colors[status]} cursor-pointer`}>
                  <p className="text-sm font-semibold capitalize mb-1">{status}</p>
                  <h3 className="text-2xl font-bold">{d.count}</h3>
                  <p className="text-xs opacity-80 mt-1">₹{d.revenue?.toLocaleString('en-IN')}</p>
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
