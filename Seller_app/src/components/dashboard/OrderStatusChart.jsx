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
      <div className="flex h-full min-h-[350px] flex-col rounded-[18px] border border-[#d7dcea] bg-white p-5 shadow-sm">
        <div className="mb-2 h-5 w-32 rounded bg-[#f1f4fb] animate-pulse" />
        <div className="mb-8 h-3 w-28 rounded bg-[#f1f4fb] animate-pulse" />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-32 w-32 rounded-full border-[12px] border-[#f1f4fb] animate-pulse" />
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
    <div className="flex h-[440px] flex-col rounded-[18px] border border-[#d7dcea] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#dfe7ff] text-[0.7rem] font-semibold text-[#0f49d7]">
          2
        </span>
        <div>
          <h3 className="text-[0.95rem] font-semibold text-[#11182d]">Order Distribution</h3>
          <p className="text-[0.72rem] text-[#6d7892]">Lifecycle status spread</p>
        </div>
      </div>

      {totalOrders === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-sm text-[#6d7892]">
          <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#f1f4fb]">0</div>
          No orders yet
        </div>
      ) : (
        <>
          <div className="relative mb-4 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="85%"
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

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-[1.8rem] font-bold tracking-tight text-[#11182d] transition-all ${activeItem ? 'scale-110' : ''}`}>
                {activeItem ? activeItem.value : totalOrders}
              </span>
              <span className={`text-[0.6rem] font-bold uppercase tracking-[0.15em] transition-colors ${activeItem ? 'text-[#0f49d7]' : 'text-[#6d7892]'}`}>
                {activeItem ? activeItem.name.replaceAll('_', ' ') : 'Total'}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-[#f1f4fb]">
            {data.slice(0, 5).map((item, idx) => (
              <div 
                key={item.name} 
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`flex items-center justify-between gap-3 transition-all cursor-default ${activeIndex !== null && activeIndex !== idx ? 'opacity-30' : 'opacity-100'}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[0.78rem] font-semibold capitalize text-[#33415e]">{item.name.replaceAll('_', ' ')}</span>
                </div>
                <span className="text-[0.78rem] font-bold text-[#11182d]">{item.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default OrderStatusChart;
