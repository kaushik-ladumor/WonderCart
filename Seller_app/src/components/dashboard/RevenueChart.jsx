import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const RUPEE = '\u20B9';

// Helper to get week number
const getWeek = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

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
  const [view, setView] = useState('daily');

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    if (view === 'daily') {
      return data.slice(-14).map(item => {
        const date = new Date(item._id || item.label);
        const isValidDate = !isNaN(date.getTime());
        
        return {
          ...item,
          label: isValidDate 
            ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
            : (item.label || 'Invalid')
        };
      });
    }

    const groups = {};
    data.forEach(item => {
      const date = new Date(item._id || item.label);
      const isValidDate = !isNaN(date.getTime());
      
      let key;
      if (!isValidDate) {
        key = item.label || 'Other';
      } else if (view === 'weekly') {
        key = `Week ${getWeek(date)}, ${date.getFullYear()}`;
      } else {
        key = date.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
      }

      if (!groups[key]) {
        groups[key] = { 
          label: key, 
          revenue: 0, 
          orders: 0, 
          rawDate: isValidDate ? date : new Date(0) 
        };
      }
      groups[key].revenue += item.revenue || 0;
      groups[key].orders += item.orders || 0;
    });

    return Object.values(groups)
      .sort((a, b) => a.rawDate - b.rawDate)
      .slice(-7);
  }, [data, view]);

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
    <div className="flex h-[400px] flex-col rounded-[28px] border border-[#e7ebf5] bg-white p-7 shadow-[0_16px_40px_rgba(18,36,84,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-[18px] font-semibold text-[#141b2d]">Revenue &amp; Orders Performance</h3>
          <p className="mt-1 text-sm text-[#66728d]">
            {view.charAt(0).toUpperCase() + view.slice(1)} view compared across revenue and order count.
          </p>
        </div>
        <div className="inline-flex rounded-full bg-[#eef2ff] p-1 text-[11px] font-bold uppercase tracking-wider">
          {['daily', 'weekly', 'monthly'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-full px-4 py-1.5 transition-all duration-300 ${
                view === v ? 'bg-[#2156d8] text-white shadow-lg' : 'text-[#68739d] hover:text-[#2156d8]'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {!processedData || processedData.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-[#75819d]">
          No chart data available for this period.
        </div>
      ) : (
        <div className="mt-6 flex-1">
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={processedData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} barCategoryGap="20%">
              <CartesianGrid vertical={false} stroke="#edf1f8" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#4b556d', fontSize: 10, fontWeight: 600 }}
                dy={10}
              />
              <YAxis yAxisId="revenue" hide />
              <YAxis yAxisId="orders" hide />
              <Tooltip cursor={{ fill: '#f8fafd' }} content={<CustomTooltip />} />
              <Bar yAxisId="revenue" dataKey="revenue" fill="#c7d5f7" radius={[10, 10, 0, 0]} maxBarSize={40} />
              <Bar yAxisId="orders" dataKey="orders" fill="#2156d8" radius={[10, 10, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;
