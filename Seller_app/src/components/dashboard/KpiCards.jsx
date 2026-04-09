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
  if (!trendStr) return { color: 'text-[#7a849b]', Icon: null, val: '' };

  const isPositive = trendStr.startsWith('+');
  const isNegative = trendStr.startsWith('-');

  return {
    color: isPositive ? 'text-[#15803d]' : isNegative ? 'text-[#c81e1e]' : 'text-[#7a849b]',
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-[22px] border border-[#e7ebf5] bg-white p-4 shadow-[0_10px_24px_rgba(18,36,84,0.05)]"
          >
            <div className="mb-3 h-3.5 w-24 rounded bg-[#edf1fb] animate-pulse" />
            <div className="mb-2 h-8 w-28 rounded bg-[#edf1fb] animate-pulse" />
            <div className="mb-4 h-3.5 w-14 rounded bg-[#edf1fb] animate-pulse" />
            <div className="flex h-8 items-end gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((bar) => (
                <div
                  key={bar}
                  className="flex-1 rounded-t-[6px] bg-[#edf1fb] animate-pulse"
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
      iconWrap: 'bg-[#dfe7ff] text-[#2156d8]',
      bars: kpis.revenueBar?.length ? kpis.revenueBar : [34, 52, 50, 68, 79, 58],
      barColor: 'bg-[#9eb6f5]'
    },
    {
      label: 'Total Orders',
      value: Number(totalOrders).toLocaleString('en-IN'),
      trend: parseTrend(ordersChange),
      Icon: ClipboardList,
      iconWrap: 'bg-[#dfe4f0] text-[#56627d]',
      bars: kpis.ordersBar?.length ? kpis.ordersBar : [45, 40, 58, 55, 49, 64],
      barColor: 'bg-[#b7beca]'
    },
    {
      label: 'Avg Order Value',
      value: `${RUPEE}${Math.round(avgOrderValue).toLocaleString('en-IN')}`,
      trend: null,
      Icon: Boxes,
      iconWrap: 'bg-[#dff6e4] text-[#17803d]',
      bars: kpis.revenueBar?.length ? kpis.revenueBar.map(v => v * 0.8) : [63, 56, 52, 49, 47, 43],
      barColor: 'bg-[#9dc4b2]'
    },
    {
      label: 'Total Products',
      value: Number(totalProducts).toLocaleString('en-IN'),
      trend: null,
      Icon: Package,
      iconWrap: 'bg-[#dfe7ff] text-[#2156d8]',
      bars: kpis.productsBar?.length ? kpis.productsBar : [18, 27, 35, 44, 56, 63],
      barColor: 'bg-[#8fabeb]'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-[22px] border border-[#e7ebf5] bg-white p-4 shadow-[0_10px_24px_rgba(18,36,84,0.05)]"
        >
          <div className="flex items-start justify-between gap-2.5">
            <p className="max-w-[150px] text-[12px] font-medium uppercase tracking-[0.16em] text-[#222b3f]">
              {card.label}
            </p>
            <div className={`flex h-10 w-10 items-center justify-center rounded-[16px] ${card.iconWrap}`}>
              <card.Icon className="h-4.5 w-4.5" />
            </div>
          </div>

          <div className="mt-4 flex items-end gap-2">
            <h2 className="text-[1.55rem] font-semibold leading-none text-[#141b2d]">{card.value}</h2>
            {card.trend && (
              <div className={`mb-0.5 flex items-center gap-1 text-[12px] font-medium ${card.trend.color}`}>
                {card.trend.Icon && <card.trend.Icon size={13} />}
                <span>{card.trend.val}</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex h-8 items-end gap-1.5">
            {card.bars.map((height, index) => (
              <div
                key={index}
                className={`flex-1 rounded-t-[6px] ${card.barColor}`}
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
