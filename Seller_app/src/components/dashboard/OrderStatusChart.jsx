import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = {
  pending: '#2d63e2',
  processing: '#55627d',
  shipped: '#d9e3ff',
  delivered: '#15803d',
  cancelled: '#c81e1e',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-[18px] border border-[#e5e9f5] bg-white p-3 text-sm shadow-[0_16px_30px_rgba(18,36,84,0.08)]">
        <p className="font-semibold capitalize text-[#1a2238]">{payload[0].name}</p>
        <p className="font-medium text-[#4b556d]">{payload[0].value} order(s)</p>
      </div>
    );
  }

  return null;
};

const OrderStatusChart = ({ pipeline = {}, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex h-full min-h-[350px] flex-col rounded-[28px] border border-[#e7ebf5] bg-white p-7 shadow-[0_16px_40px_rgba(18,36,84,0.06)]">
        <div className="mb-2 h-6 w-36 rounded bg-[#edf1fb] animate-pulse" />
        <div className="mb-8 h-4 w-32 rounded bg-[#edf1fb] animate-pulse" />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-40 w-40 rounded-full border-[14px] border-[#edf1fb] animate-pulse" />
        </div>
      </div>
    );
  }

  const data = Object.keys(pipeline)
    .map((key) => ({
      name: key,
      value: pipeline[key]?.count || 0,
      color: COLORS[key] || '#9ca3af'
    }))
    .filter((item) => item.value > 0);

  const totalOrders = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex h-full min-h-[350px] flex-col rounded-[28px] border border-[#e7ebf5] bg-white p-7 shadow-[0_16px_40px_rgba(18,36,84,0.06)]">
      <div>
        <h3 className="text-[18px] font-semibold text-[#141b2d]">Category Split</h3>
        <p className="mt-1 text-sm text-[#66728d]">Pipeline distribution</p>
      </div>

      {totalOrders === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-sm text-[#75819d]">
          <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#e3e8f5]">0</div>
          No orders yet
        </div>
      ) : (
        <>
          <div className="relative mb-6 mt-4 flex-1">
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={96}
                  paddingAngle={1}
                  dataKey="value"
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[2.3rem] font-semibold leading-none text-[#141b2d]">100%</span>
              <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.28em] text-[#6e7891]">Total</span>
              <span className="mt-1 text-xs text-[#7d879d]">{totalOrders} orders</span>
            </div>
          </div>

          <div className="space-y-3">
            {Object.keys(pipeline).map((key) => {
              const count = pipeline[key]?.count || 0;
              if (count === 0) return null;

              const percent = Math.round((count / totalOrders) * 100);

              return (
                <div key={key} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: COLORS[key] || '#9ca3af' }} />
                    <span className="font-medium capitalize text-[#1f2940]">{key}</span>
                  </div>
                  <span className="text-[#1f2940]">{percent}%</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default OrderStatusChart;
