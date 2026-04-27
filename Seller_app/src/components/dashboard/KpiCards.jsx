import React from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  ClipboardList,
  IndianRupee,
  Package,
} from 'lucide-react';

const RUPEE = '\u20B9';

const parseTrend = (trendStr) => {
  if (!trendStr) return { color: 'text-[#6d7892]', Icon: null, val: '' };

  const isPositive = trendStr.startsWith('+');
  const isNegative = trendStr.startsWith('-');

  return {
    color: isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : 'text-[#6d7892]',
    Icon: isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : null,
    val: trendStr
  };
};

const KpiCards = ({ kpis = {}, isLoading }) => {
  const {
    totalRevenue = 0,
    totalOrders = 0,
    avgOrderValue = 0,
    totalProducts = 0,
    revenueChange = '',
    ordersChange = ''
  } = kpis;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-[18px] border border-[#d7dcea] bg-white p-4.5 shadow-sm"
          >
            <div className="mb-3 h-3 w-20 rounded bg-[#f1f4fb] animate-pulse" />
            <div className="mb-2 h-7 w-24 rounded bg-[#f1f4fb] animate-pulse" />
            <div className="mb-4 h-3 w-12 rounded bg-[#f1f4fb] animate-pulse" />
            <div className="flex h-7 items-end gap-1">
              {[1, 2, 3, 4, 5, 6].map((bar) => (
                <div
                  key={bar}
                  className="flex-1 rounded-t-[4px] bg-[#f1f4fb] animate-pulse"
                  style={{ height: `${30 + bar * 8}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Revenue',
      value: `${RUPEE}${Number(totalRevenue).toLocaleString('en-IN')}`,
      trend: parseTrend(revenueChange),
      Icon: IndianRupee,
      iconWrap: 'bg-[#eef2ff] text-[#0f49d7]',
      bars: kpis.revenueBar?.length ? kpis.revenueBar : [34, 52, 50, 68, 79, 58],
      barColor: 'bg-[#9eb6f5]'
    },
    {
      label: 'Total Orders',
      value: Number(totalOrders).toLocaleString('en-IN'),
      trend: parseTrend(ordersChange),
      Icon: ClipboardList,
      iconWrap: 'bg-[#f8f9fd] text-[#5c6880]',
      bars: kpis.ordersBar?.length ? kpis.ordersBar : [45, 40, 58, 55, 49, 64],
      barColor: 'bg-[#b7beca]'
    },
    {
      label: 'Avg Order Value',
      value: `${RUPEE}${Math.round(avgOrderValue).toLocaleString('en-IN')}`,
      trend: null,
      Icon: Boxes,
      iconWrap: 'bg-emerald-50 text-emerald-600',
      bars: kpis.revenueBar?.length ? kpis.revenueBar.map(v => v * 0.8) : [63, 56, 52, 49, 47, 43],
      barColor: 'bg-[#9dc4b2]'
    },
    {
      label: 'Total Products',
      value: Number(totalProducts).toLocaleString('en-IN'),
      trend: null,
      Icon: Package,
      iconWrap: 'bg-[#eef2ff] text-[#0f49d7]',
      bars: kpis.productsBar?.length ? kpis.productsBar : [18, 27, 35, 44, 56, 63],
      barColor: 'bg-[#8fabeb]'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-[18px] border border-[#d7dcea] bg-white p-4.5 shadow-sm hover:border-[#0f49d7] transition-all group"
        >
          <div className="flex items-start justify-between gap-2.5">
            <p className="max-w-[150px] text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#6d7892]">
              {card.label}
            </p>
            <div className={`flex h-9 w-9 items-center justify-center rounded-[12px] ${card.iconWrap} transition-transform group-hover:scale-110`}>
              <card.Icon className="h-4.5 w-4.5" />
            </div>
          </div>

          <div className="mt-3 flex items-end gap-2">
            <h2 className="text-[1.35rem] font-bold leading-none text-[#11182d] tracking-tight">{card.value}</h2>
            {card.trend && (
              <div className={`mb-0.5 flex items-center gap-1 text-[0.7rem] font-bold ${card.trend.color}`}>
                {card.trend.Icon && <card.trend.Icon size={12} />}
                <span>{card.trend.val}</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex h-7 items-end gap-1">
            {card.bars.map((height, index) => (
              <div
                key={index}
                className={`flex-1 rounded-t-[4px] ${card.barColor} opacity-70 group-hover:opacity-100 transition-opacity`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KpiCards;
