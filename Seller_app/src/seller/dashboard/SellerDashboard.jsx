import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useGetDashboardStatsQuery, dashboardApi } from '../../services/dashboardApi';
import socket from '../../socket';

import KpiCards from '../../components/dashboard/KpiCards';
import OrderStatusChart from '../../components/dashboard/OrderStatusChart';
import RevenueChart from '../../components/dashboard/RevenueChart';
import TopProducts from '../../components/dashboard/TopProducts';
import StoreHealth from '../../components/dashboard/StoreHealth';

import { AlertCircle } from 'lucide-react';

const RUPEE = '\u20B9';

const pipelineCards = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const pipelineStyles = {
  pending: {
    accent: 'border-l-[#0f49d7]',
    value: 'text-[#11182d]',
    amount: 'text-[#6d7892]'
  },
  processing: {
    accent: 'border-l-[#5c6880]',
    value: 'text-[#11182d]',
    amount: 'text-[#6d7892]'
  },
  shipped: {
    accent: 'border-l-[#dfe7ff]',
    value: 'text-[#11182d]',
    amount: 'text-[#6d7892]'
  },
  delivered: {
    accent: 'border-l-emerald-500',
    value: 'text-emerald-700',
    amount: 'text-[#6d7892]'
  },
  cancelled: {
    accent: 'border-l-rose-500',
    value: 'text-rose-700',
    amount: 'text-[#6d7892]'
  }
};

const SellerDashboard = () => {
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

  const payload = data?.data || data || {};
  const kpis = payload?.kpis || {};
  const pipeline = payload?.pipeline || {};
  const revenueChart = payload?.revenueChart || [];
  const topProducts = payload?.topProducts || [];
  const storeHealth = payload?.storeHealth || {};

  return (
    <div className="min-h-screen bg-[#f6f7fb] pb-6 text-[#11182d] font-poppins">
      <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[1.5rem] font-semibold tracking-tight text-[#11182d]">Seller Dashboard</h1>
              {isConnected && (
                <span
                  className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"
                  title="Live server connected"
                />
              )}
            </div>
            <p className="mt-0.5 text-[0.82rem] text-[#6d7892]">
              Track revenue, orders, products, and store health in one place.
            </p>
          </div>

          <div className="inline-flex w-fit rounded-[18px] border border-[#d7dcea] bg-white p-1">
            {['7d', '30d', '90d', 'year'].map((value) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className={`rounded-[14px] px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.08em] transition-all ${
                  period === value
                    ? 'bg-[#eef2ff] text-[#0f49d7] shadow-sm'
                    : 'text-[#6d7892] hover:text-[#11182d]'
                }`}
              >
                {value === 'year' ? 'YR' : value}
              </button>
            ))}
          </div>
        </div>

        {isError ? (
          <div className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-[0.76rem] font-medium text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Failed to load dashboard data. {error?.data?.message || error?.message}</span>
          </div>
        ) : null}

        <KpiCards kpis={kpis} isLoading={isLoading} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <RevenueChart data={revenueChart} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-4">
            <OrderStatusChart pipeline={pipeline} isLoading={isLoading} />
          </div>
        </div>

        <div>
          <div className="mb-2.5 flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f49d7] text-[0.7rem] font-semibold text-white">
              3
            </span>
            <h2 className="text-[1rem] font-semibold text-[#11182d]">Order Pipeline</h2>
          </div>

          <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-5">
            {isLoading
              ? [1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="h-[90px] animate-pulse rounded-[18px] border border-[#d7dcea] bg-white"
                  />
                ))
              : pipelineCards.map((status) => {
                  const details = pipeline[status] || { count: 0, revenue: 0 };
                  const style = pipelineStyles[status];

                  return (
                    <div
                      key={status}
                      className={`rounded-[18px] border border-[#d7dcea] border-l-4 ${style.accent} bg-white px-5 py-3.5 shadow-sm hover:border-[#0f49d7] transition-all`}
                    >
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#6d7892]">
                        {status}
                      </p>
                      <p className={`mt-2 text-[1.25rem] font-bold ${style.value}`}>{details.count}</p>
                      <p className={`mt-0.5 text-[0.7rem] font-medium ${style.amount}`}>
                        {RUPEE}
                        {Number(details.revenue || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  );
                })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <TopProducts products={topProducts} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-4">
            <StoreHealth storeHealth={storeHealth} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
