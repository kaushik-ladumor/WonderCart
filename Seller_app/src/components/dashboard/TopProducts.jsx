import React from 'react';
import { Link } from 'react-router-dom';

const RUPEE = '\u20B9';

const TopProducts = ({ products = [], isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex h-full flex-col rounded-[18px] border border-[#d7dcea] bg-white p-5 shadow-sm">
        <div className="mb-6 h-5 w-44 rounded bg-[#f1f4fb] animate-pulse" />
        {[1, 2, 3].map((item) => (
          <div key={item} className="mb-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-[#f1f4fb] animate-pulse" />
            <div className="grid flex-1 grid-cols-4 gap-4">
              <div className="h-3.5 rounded bg-[#f1f4fb] animate-pulse" />
              <div className="h-3.5 rounded bg-[#f1f4fb] animate-pulse" />
              <div className="h-3.5 rounded bg-[#f1f4fb] animate-pulse" />
              <div className="h-3.5 rounded bg-[#f1f4fb] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const lowStockProducts = products.filter((product) => product.currentStock < 5);
  const visibleProducts = products.slice(0, 4);

  return (
    <div className="relative flex h-full flex-col rounded-[18px] border border-[#d7dcea] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#dcfce7] text-[0.7rem] font-semibold text-emerald-700">
            4
          </span>
          <h3 className="text-[0.95rem] font-semibold text-[#11182d]">Top Selling Products</h3>
        </div>
        <Link to="/seller/products" className="text-[0.78rem] font-bold text-[#0f49d7] hover:underline transition-all">
          View All
        </Link>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="mb-4 space-y-2">
          {lowStockProducts.map((product, index) => (
            <div
              key={product._id || product.id || index}
              className="flex items-center justify-between gap-3 rounded-[12px] border border-rose-200 bg-rose-50 px-4 py-2 text-[0.72rem] font-semibold text-rose-700"
            >
              <span className="truncate">{product.name} is low on stock</span>
              <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[0.65rem] border border-rose-100">
                Only {product.currentStock} left
              </span>
            </div>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-6 text-sm text-[#6d7892]">
          <p>No product sales recorded for this period.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 border-b border-[#f1f4fb] px-1 pb-3 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#98a4bd] md:grid">
            <span>Product</span>
            <span>Category</span>
            <span>Status</span>
            <span className="text-right">Revenue</span>
          </div>

          <div className="divide-y divide-[#f1f4fb]">
            {visibleProducts.map((product, index) => {
              const category = product.category || product.productCategory || 'General';
              const isLowStock = product.currentStock < 5;
              const status = isLowStock ? 'Low Stock' : 'In Stock';
              
              return (
                <div
                  key={product._id || product.id || index}
                  className="grid gap-4 py-3.5 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center hover:bg-[#fcfcff] transition-colors rounded-lg px-1"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[#f8f9fd] border border-[#f1f4fb]">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-bold text-[#98a4bd]">N/A</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[0.88rem] font-semibold text-[#11182d]">{product.name}</p>
                      <p className="mt-0.5 text-[0.68rem] text-[#6d7892] font-medium">
                        ID: {product._id?.slice(-6) || product.id || `P-${index + 1}`} | <span className="text-[#11182d]">{product.totalSold || 0} sold</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-[0.78rem] font-medium text-[#5c6880]">{category}</p>

                  <div>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider border ${
                      isLowStock 
                        ? 'bg-rose-50 text-rose-600 border-rose-100' 
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {status}
                    </span>
                  </div>

                  <p className="text-[0.9rem] font-bold text-[#11182d] text-right">
                    {RUPEE}{Number(product.totalRevenue || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopProducts;
