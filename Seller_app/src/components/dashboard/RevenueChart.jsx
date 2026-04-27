import React, { useMemo, useState } from 'react';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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
      <div className="rounded-3xl border-none bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.12)] min-w-[160px] font-poppins">
        <p className="mb-3 text-[15px] font-bold text-[#1e293b]">{label}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[13px] font-semibold text-[#64748b]">Revenue:</span>
            <span className="text-[14px] font-bold text-[#334155]">{RUPEE}{Number(payload[0]?.value || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[13px] font-semibold text-[#64748b]">Orders:</span>
            <span className="text-[14px] font-bold text-[#2563eb]">{Number(payload[1]?.value || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
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
      return data.slice(-7).map(item => {
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
      <div className="flex h-full min-h-[420px] flex-col rounded-[32px] border border-[#f1f5f9] bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.03)]">
        <div className="mb-3 h-7 w-60 rounded-full bg-[#f8fafc] animate-pulse" />
        <div className="mb-10 h-5 w-48 rounded-full bg-[#f8fafc] animate-pulse" />
        <div className="flex flex-1 items-end justify-between gap-6 px-4">
          {[1, 2, 3, 4, 5, 6, 7].map((item) => (
            <div
              key={item}
              className="w-full rounded-t-full bg-[#f8fafc] animate-pulse"
              style={{ height: `${Math.random() * 60 + 20}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[480px] flex-col rounded-[32px] border border-[#f1f5f9] bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.03)] font-poppins">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <h3 className="text-[22px] font-black tracking-tight text-[#0f172a]">Revenue &amp; Orders Performance</h3>
            <p className="mt-1 text-[15px] font-medium text-[#64748b]">
              {view.charAt(0).toUpperCase() + view.slice(1)} view compared across revenue and order count.
            </p>
          </div>
          <div className="inline-flex rounded-full bg-[#f1f5f9] p-1 shadow-inner">
            {['daily', 'weekly', 'monthly'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-full px-6 py-2 text-[12px] font-bold uppercase tracking-wider transition-all duration-500 ease-out ${view === v
                    ? 'bg-[#2563eb] text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!processedData || processedData.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm font-medium text-[#94a3b8]">
          No performance data available for this period.
        </div>
      ) : (
        <div className="mt-4 flex-1">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={processedData} margin={{ top: 20, right: 30, left: 80, bottom: 80 }}>
              <CartesianGrid vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis
                dataKey="label"
                axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600, fontFamily: 'Poppins' }}
                dy={15}
              />
              <YAxis
                yAxisId="revenue"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600, fontFamily: 'Poppins' }}
                tickFormatter={(value) => `${RUPEE}${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
              />
              <YAxis yAxisId="orders" hide />
              <Tooltip
                cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                content={<CustomTooltip />}
              />
              <Line
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
              />
              <Line
                yAxisId="orders"
                type="monotone"
                dataKey="orders"
                stroke="#cbd5e1"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#cbd5e1', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#94a3b8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;
