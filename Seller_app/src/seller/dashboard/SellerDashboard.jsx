import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useGetDashboardStatsQuery, dashboardApi } from '../../services/dashboardApi';
import socket from '../../socket';

import KpiCards from '../../components/dashboard/KpiCards';
import OrderStatusChart from '../../components/dashboard/OrderStatusChart';
import RevenueChart from '../../components/dashboard/RevenueChart';
import TopProducts from '../../components/dashboard/TopProducts';
import StoreHealth from '../../components/dashboard/StoreHealth';

const RUPEE = '\u20B9';

const pipelineCards = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const pipelineStyles = {
  pending: {
    accent: 'border-l-[#2156d8]',
    value: 'text-[#141b2d]',
    amount: 'text-[#5f6c89]'
  },
  processing: {
    accent: 'border-l-[#596987]',
    value: 'text-[#141b2d]',
    amount: 'text-[#5f6c89]'
  },
  shipped: {
    accent: 'border-l-[#d8e1ff]',
    value: 'text-[#141b2d]',
    amount: 'text-[#5f6c89]'
  },
  delivered: {
    accent: 'border-l-[#15803d]',
    value: 'text-[#15803d]',
    amount: 'text-[#5f6c89]'
  },
  cancelled: {
    accent: 'border-l-[#c81e1e]',
    value: 'text-[#c81e1e]',
    amount: 'text-[#5f6c89]'
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
    <div className="mx-auto max-w-[1180px] space-y-6 pb-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[28px] font-semibold leading-tight text-[#141b2d]">Seller Dashboard</h1>
            {isConnected && (
              <span
                className="h-2.5 w-2.5 rounded-full bg-[#15803d] animate-pulse"
                title="Live server connected"
              />
            )}
          </div>
          <p className="mt-1 text-sm text-[#66728d]">
            Track revenue, orders, products, and store health in one place.
          </p>
        </div>

        <div className="inline-flex w-fit rounded-[18px] border border-[#dfe4f4] bg-white p-1">
          {['7d', '30d', '90d', 'year'].map((value) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`rounded-[14px] px-4 py-2 text-sm font-medium transition ${
                period === value
                  ? 'bg-[#edf2ff] text-[#2156d8]'
                  : 'text-[#68758f] hover:text-[#141b2d]'
              }`}
            >
              {value.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {isError ? (
        <div className="rounded-[22px] border border-[#f2c9c9] bg-[#fff4f4] px-5 py-4 text-sm text-[#b42318]">
          Failed to load dashboard data.{' '}
          {error?.data?.message || error?.message || 'Please check your network connection.'}
        </div>
      ) : null}

      <KpiCards kpis={kpis} isLoading={isLoading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <RevenueChart data={revenueChart} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-4">
          <OrderStatusChart pipeline={pipeline} isLoading={isLoading} />
        </div>
      </div>

      <div>
        <div className="mb-4">
          <h2 className="text-[18px] font-semibold text-[#141b2d]">Order Pipeline</h2>
          <p className="mt-1 text-sm text-[#66728d]">Current status breakdown for active orders.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
          {isLoading
            ? [1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="h-[106px] animate-pulse rounded-[22px] border border-[#e7ebf5] bg-white"
                />
              ))
            : pipelineCards.map((status) => {
                const details = pipeline[status] || { count: 0, revenue: 0 };
                const style = pipelineStyles[status];

                return (
                  <div
                    key={status}
                    className={`rounded-[22px] border border-[#e7ebf5] border-l-4 ${style.accent} bg-[#f3f6ff] px-5 py-4`}
                  >
                    <p className="text-[13px] font-medium uppercase tracking-wide text-[#28324a]">
                      {status}
                    </p>
                    <p className={`mt-3 text-[18px] font-semibold ${style.value}`}>{details.count}</p>
                    <p className={`mt-1 text-xs ${style.amount}`}>
                      {RUPEE}
                      {Number(details.revenue || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                );
              })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <TopProducts products={topProducts} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-4">
          <StoreHealth storeHealth={storeHealth} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
