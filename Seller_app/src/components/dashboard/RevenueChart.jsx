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
        key = `W${getWeek(date)}, ${date.getFullYear()}`;
      } else {
        key = date.toLocaleString('en-IN', { month: 'short' });
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
      <div className="flex h-full min-h-[380px] flex-col rounded-[18px] border border-[#d7dcea] bg-white p-5 shadow-sm">
        <div className="mb-3 h-5 w-44 rounded bg-[#f1f4fb] animate-pulse" />
        <div className="mb-6 h-3.5 w-32 rounded bg-[#f1f4fb] animate-pulse" />
        <div className="flex flex-1 items-end justify-between gap-4 px-2">
          {[1, 2, 3, 4, 5, 6, 7].map((item) => (
            <div
              key={item}
              className="w-full rounded-t-lg bg-[#f1f4fb] animate-pulse"
              style={{ height: `${Math.random() * 60 + 20}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[440px] flex-col rounded-[18px] border border-[#d7dcea] bg-white p-5 shadow-sm font-poppins">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#dfe7ff] text-[0.7rem] font-semibold text-[#0f49d7]">
            1
          </span>
          <div>
            <h3 className="text-[0.95rem] font-semibold text-[#11182d]">Performance Analytics</h3>
            <p className="text-[0.72rem] text-[#6d7892]">Revenue & Order trends</p>
          </div>
        </div>
        <div className="flex bg-[#f1f4fb] p-1 rounded-[12px] border border-[#d7dcea] w-fit">
          {['daily', 'weekly', 'monthly'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-[10px] px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.08em] transition-all ${view === v
                ? 'bg-white text-[#0f49d7] shadow-sm'
                : 'text-[#6d7892] hover:text-[#0f49d7]'
                }`}
            >
              {v.substring(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {!processedData || processedData.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-[0.82rem] font-medium text-[#6d7892]">
          No performance data available.
        </div>
      ) : (
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={processedData}
              margin={{ top: 10, right: 15, left: 10, bottom: 10 }}
            >
              <CartesianGrid vertical={false} stroke="#f1f4fb" strokeOpacity={0.8} />
              <XAxis
                dataKey="label"
                axisLine={{ stroke: '#f1f4fb', strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: '#98a4bd', fontSize: 9, fontWeight: 700, fontFamily: 'Poppins' }}
                dy={10}
                padding={{ left: 20, right: 20 }}
              />
              <YAxis
                yAxisId="revenue"
                axisLine={{ stroke: '#f1f4fb', strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: '#98a4bd', fontSize: 9, fontWeight: 700, fontFamily: 'Poppins' }}
                tickFormatter={(val) => `${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                dx={-10}
              />
              <YAxis yAxisId="orders" hide />
              <Tooltip
                cursor={{ stroke: '#f1f4fb', strokeWidth: 2 }}
                content={<CustomTooltip />}
              />
              <Line
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stroke="#0f49d7"
                strokeWidth={3}
                dot={{ r: 4, fill: '#0f49d7', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#0f49d7', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={1000}
              />
              <Line
                yAxisId="orders"
                type="monotone"
                dataKey="orders"
                stroke="#98a4bd"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#98a4bd', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#98a4bd' }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;
