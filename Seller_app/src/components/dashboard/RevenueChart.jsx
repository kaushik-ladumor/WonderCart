import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const RUPEE = '\u20B9';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-[18px] border border-[#e5e9f5] bg-white p-3 text-sm shadow-[0_16px_30px_rgba(18,36,84,0.08)]">
        <p className="mb-2 font-semibold text-[#1a2238]">{label}</p>
        <p className="mb-1 font-medium text-[#6e82b5]">
          Revenue: {RUPEE}
          {Number(payload[0]?.value || 0).toLocaleString('en-IN')}
        </p>
        <p className="font-medium text-[#2156d8]">
          Orders: {Number(payload[1]?.value || 0).toLocaleString('en-IN')}
        </p>
      </div>
    );
  }

  return null;
};

const RevenueChart = ({ data = [], isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex h-full min-h-[350px] flex-col rounded-[28px] border border-[#e7ebf5] bg-white p-7 shadow-[0_16px_40px_rgba(18,36,84,0.06)]">
        <div className="mb-2 h-6 w-52 rounded bg-[#edf1fb] animate-pulse" />
        <div className="mb-8 h-4 w-40 rounded bg-[#edf1fb] animate-pulse" />
        <div className="flex flex-1 items-end justify-between gap-4 px-2">
          {[1, 2, 3, 4, 5, 6, 7].map((item) => (
            <div
              key={item}
              className="w-full rounded-t-[12px] bg-[#edf1fb] animate-pulse"
              style={{ height: `${Math.random() * 60 + 20}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[350px] flex-col rounded-[28px] border border-[#e7ebf5] bg-white p-7 shadow-[0_16px_40px_rgba(18,36,84,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-[18px] font-semibold text-[#141b2d]">Revenue &amp; Orders Performance</h3>
          <p className="mt-1 text-sm text-[#66728d]">Last 7 periods compared across revenue and order count.</p>
        </div>
        <div className="inline-flex rounded-full bg-[#eef2ff] p-1 text-sm">
          <span className="rounded-full bg-[#dfe7ff] px-4 py-1.5 font-medium text-[#2156d8]">Weekly</span>
          <span className="px-4 py-1.5 font-medium text-[#3a455e]">Monthly</span>
        </div>
      </div>

      {!data || data.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-[#75819d]">
          No chart data available for this period.
        </div>
      ) : (
        <div className="mt-6 flex-1">
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} barCategoryGap="20%">
              <CartesianGrid vertical={false} stroke="#edf1f8" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#4b556d', fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis yAxisId="revenue" hide />
              <YAxis yAxisId="orders" hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="revenue" dataKey="revenue" fill="#c7d5f7" radius={[10, 10, 0, 0]} maxBarSize={54} />
              <Bar yAxisId="orders" dataKey="orders" fill="#2156d8" radius={[10, 10, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;
