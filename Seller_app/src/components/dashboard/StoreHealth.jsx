import React from 'react';

const clamp = (value) => Math.max(0, Math.min(100, Number(value) || 0));

const StoreHealth = ({ storeHealth = {}, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex h-full flex-col rounded-[28px] border border-[#e7ebf5] bg-[#eef2ff] p-7 shadow-[0_16px_40px_rgba(18,36,84,0.06)]">
        <div className="mb-8 h-6 w-32 rounded bg-white/70 animate-pulse" />
        <div className="space-y-7">
          {[1, 2, 3].map((item) => (
            <div key={item}>
              <div className="mb-3 h-4 w-36 rounded bg-white/70 animate-pulse" />
              <div className="h-2.5 rounded-full bg-white/70 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-[24px] bg-white p-5">
          <div className="h-4 w-32 rounded bg-[#edf1fb] animate-pulse" />
          <div className="mt-3 h-8 w-20 rounded bg-[#edf1fb] animate-pulse" />
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
      textColor: 'text-[#2156d8]',
      barColor: 'bg-[#2156d8]'
    },
    {
      label: 'Monthly Growth',
      value: `${monthlyGrowth > 0 ? '+' : ''}${monthlyGrowth}%`,
      width: clamp(Math.abs(monthlyGrowth)),
      textColor: monthlyGrowth >= 0 ? 'text-[#15803d]' : 'text-[#c81e1e]',
      barColor: monthlyGrowth >= 0 ? 'bg-[#15803d]' : 'bg-[#c81e1e]'
    },
    {
      label: 'Return Rate',
      value: `${returnRate}%`,
      width: clamp(returnRate),
      textColor: 'text-[#c81e1e]',
      barColor: 'bg-[#c81e1e]'
    }
  ];

  return (
    <div className="flex h-full flex-col rounded-[28px] border border-[#e7ebf5] bg-[#eef2ff] p-7 shadow-[0_16px_40px_rgba(18,36,84,0.06)]">
      <h3 className="text-[18px] font-semibold text-[#141b2d]">Store Health</h3>

      <div className="mt-8 space-y-8">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-[15px] font-medium text-[#141b2d]">{metric.label}</span>
              <span className={`text-[15px] font-semibold ${metric.textColor}`}>{metric.value}</span>
            </div>
            <div className="h-2 rounded-full bg-[#dde4fb]">
              <div className={`h-2 rounded-full ${metric.barColor}`} style={{ width: `${metric.width}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-[24px] bg-white p-5 shadow-[0_12px_28px_rgba(18,36,84,0.05)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#5e6a85]">
          Avg. Dispatch Time
        </p>
        <p className="mt-3 text-[2rem] font-semibold leading-none text-[#141b2d]">
          {avgDispatchDays} Days
        </p>
      </div>
    </div>
  );
};

export default StoreHealth;
