import React from 'react';

const clamp = (value) => Math.max(0, Math.min(100, Number(value) || 0));

const StoreHealth = ({ storeHealth = {}, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex h-full flex-col rounded-[18px] border border-[#d7dcea] bg-white p-5 shadow-sm">
        <div className="mb-6 h-5 w-28 rounded bg-[#f1f4fb] animate-pulse" />
        <div className="space-y-6 flex-1">
          {[1, 2, 3].map((item) => (
            <div key={item}>
              <div className="mb-2 h-3.5 w-32 rounded bg-[#f1f4fb] animate-pulse" />
              <div className="h-2 rounded-full bg-[#f1f4fb] animate-pulse" />
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-[16px] bg-[#f8f9fd] p-4 border border-[#d7dcea]">
          <div className="h-3 w-24 rounded bg-[#f1f4fb] animate-pulse" />
          <div className="mt-3 h-7 w-16 rounded bg-[#f1f4fb] animate-pulse" />
        </div>
      </div>
    );
  }

  const { satisfactionRate = 0, monthlyGrowth = 0, returnRate = 0, avgDispatchDays = 0 } = storeHealth;

  const metrics = [
    {
      label: 'Customer Satisfaction',
      value: `${satisfactionRate}%`,
      width: clamp(satisfactionRate),
      textColor: 'text-[#0f49d7]',
      barColor: 'bg-[#0f49d7]'
    },
    {
      label: 'Monthly Growth',
      value: `${monthlyGrowth > 0 ? '+' : ''}${monthlyGrowth}%`,
      width: clamp(Math.abs(monthlyGrowth)),
      textColor: monthlyGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600',
      barColor: monthlyGrowth >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
    },
    {
      label: 'Return Rate',
      value: `${returnRate}%`,
      width: clamp(returnRate),
      textColor: 'text-rose-600',
      barColor: 'bg-rose-500'
    }
  ];

  return (
    <div className="flex h-full flex-col rounded-[18px] border border-[#d7dcea] bg-white p-5 shadow-sm">
      <div className="mb-6 flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#dcfce7] text-[0.7rem] font-semibold text-emerald-700">
          5
        </span>
        <h3 className="text-[0.95rem] font-semibold text-[#11182d]">Store Health</h3>
      </div>

      <div className="space-y-6 flex-1">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <span className="text-[0.82rem] font-semibold text-[#33415e]">{metric.label}</span>
              <span className={`text-[0.82rem] font-bold ${metric.textColor}`}>{metric.value}</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#f1f4fb] border border-[#d7dcea]/30 overflow-hidden">
              <div className={`h-full rounded-full ${metric.barColor} transition-all duration-1000`} style={{ width: `${metric.width}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[16px] bg-[#f8f9fd] p-4 border border-[#d7dcea] shadow-inner transition-all hover:border-[#0f49d7] group">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[#6d7892]">
          Avg. Dispatch Time
        </p>
        <p className="mt-2.5 text-[1.75rem] font-bold leading-none text-[#11182d] tracking-tight group-hover:text-[#0f49d7] transition-colors">
          {avgDispatchDays} <span className="text-[1rem] font-semibold text-[#6d7892]">Days</span>
        </p>
      </div>
    </div>
  );
};

export default StoreHealth;
