import React, { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = {
  placed: '#2f5fe3',
  confirmed: '#4f46e5',
  processing: '#f59e0b',
  shipped: '#6366f1',
  out_for_delivery: '#0ea5e9',
  delivered: '#10b981',
  cancelled: '#ef4444',
  return_requested: '#f97316',
  returned: '#d946ef',
  refunded: '#14b8a6',
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
  const [activeIndex, setActiveIndex] = useState(null);

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
  const activeItem = activeIndex !== null ? data[activeIndex] : null;

  return (
    <div className="flex h-[480px] flex-col rounded-[28px] border border-[#e7ebf5] bg-white p-7 shadow-[0_16px_40px_rgba(18,36,84,0.06)]">
      <div>
        <h3 className="text-[18px] font-semibold text-[#141b2d]">Order Breakdown</h3>
        <p className="mt-1 text-sm text-[#66728d]">Current status distribution</p>
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
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke="transparent" 
                      style={{ transition: 'all 0.3s ease', cursor: 'pointer', opacity: activeIndex === null || activeIndex === index ? 1 : 0.6 }}
                    />
                  ))}
                </Pie>
                <Tooltip content={() => null} />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center transition-all duration-300">
              <span className={`text-[1.85rem] font-bold leading-none tracking-tight text-[#141b2d] ${activeItem ? 'scale-110' : ''}`}>
                {activeItem ? activeItem.value : totalOrders}
              </span>
              <span className={`mt-1 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${activeItem ? 'text-[#2156d8]' : 'text-[#6e7891]'}`}>
                {activeItem ? activeItem.name : 'Total'}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {data.map((item, idx) => {
              const percent = Math.round((item.value / totalOrders) * 100);
              return (
                <div 
                  key={item.name} 
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`flex items-center justify-between gap-3 text-sm transition-opacity duration-300 cursor-default ${activeIndex !== null && activeIndex !== idx ? 'opacity-30' : 'opacity-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium capitalize text-[#1f2940]">{item.name}</span>
                  </div>
                  <span className="font-bold text-[#1f2940]">{item.value}</span>
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
