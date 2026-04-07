import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Banknote, Boxes, LayoutList, PackagePlus } from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { label: '+ Add Product', path: '/seller/products/add', primary: true, Icon: PackagePlus },
    { label: 'View All Orders', path: '/seller/orders', primary: false, Icon: LayoutList },
    { label: 'Check Inventory', path: '/seller/products', primary: false, Icon: Boxes },
    { label: 'View Earnings', path: '/seller/earnings', primary: false, Icon: Banknote }
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {actions.map((action) => {
        const Icon = action.Icon;

        return (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className={
              action.primary
                ? 'flex items-center gap-2 rounded-[18px] border border-[#2156d8] bg-[#2156d8] px-4 py-3 text-[13px] font-medium text-white transition hover:bg-[#1c49b8]'
                : 'flex items-center gap-2 rounded-[18px] border border-[#dfe4f4] bg-white px-4 py-3 text-[13px] font-medium text-[#28324a] transition hover:border-[#cad3ea] hover:bg-[#f7f9ff]'
            }
          >
            <Icon size={16} className={action.primary ? 'text-white' : 'text-[#6c7893]'} />
            {action.label}
          </button>
        );
      })}
    </div>
  );
};

export default QuickActions;
