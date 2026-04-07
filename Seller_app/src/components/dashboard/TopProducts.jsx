import React from 'react';
import { Link } from 'react-router-dom';

const RUPEE = '\u20B9';

const TopProducts = ({ products = [], isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex h-full flex-col rounded-[28px] border border-[#e7ebf5] bg-white p-7 shadow-[0_16px_40px_rgba(18,36,84,0.06)]">
        <div className="mb-8 h-6 w-44 rounded bg-[#edf1fb] animate-pulse" />
        {[1, 2, 3].map((item) => (
          <div key={item} className="mb-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-[#edf1fb] animate-pulse" />
            <div className="grid flex-1 grid-cols-4 gap-4">
              <div className="h-4 rounded bg-[#edf1fb] animate-pulse" />
              <div className="h-4 rounded bg-[#edf1fb] animate-pulse" />
              <div className="h-4 rounded bg-[#edf1fb] animate-pulse" />
              <div className="h-4 rounded bg-[#edf1fb] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const lowStockProducts = products.filter((product) => product.currentStock < 5);
  const visibleProducts = products.slice(0, 4);

  return (
    <div className="relative flex h-full flex-col rounded-[28px] border border-[#e7ebf5] bg-white p-7 shadow-[0_16px_40px_rgba(18,36,84,0.06)]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-[18px] font-semibold text-[#141b2d]">Top Selling Products</h3>
        <Link to="/seller/products" className="text-sm font-medium text-[#2156d8] transition hover:text-[#173d99]">
          View All
        </Link>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="mb-5 space-y-2">
          {lowStockProducts.map((product, index) => (
            <div
              key={product._id || product.id || index}
              className="flex items-center justify-between gap-3 rounded-[18px] border border-[#f2d2d2] bg-[#fff7f7] px-4 py-3 text-xs font-medium text-[#b42318]"
            >
              <span className="truncate">{product.name} is low on stock</span>
              <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[11px]">
                Only {product.currentStock} left
              </span>
            </div>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-6 text-sm text-[#75819d]">
          <p>No product sales recorded for this period.</p>
        </div>
      ) : (
        <div className="flex-1">
          <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 border-b border-[#edf1f7] px-2 pb-4 text-[12px] font-medium uppercase tracking-[0.2em] text-[#28324a] md:grid">
            <span>Product</span>
            <span>Category</span>
            <span>Status</span>
            <span>Revenue</span>
          </div>

          <div className="divide-y divide-[#edf1f7]">
            {visibleProducts.map((product, index) => {
              const category = product.category || product.productCategory || 'General';
              const status = product.currentStock < 5 ? 'Low Stock' : 'In Stock';
              const statusClasses =
                product.currentStock < 5
                  ? 'bg-[#fff0f0] text-[#c81e1e]'
                  : 'bg-[#eaf7ef] text-[#166534]';

              return (
                <div
                  key={product._id || product.id || index}
                  className="grid gap-4 py-5 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f1f4fd]">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[11px] font-semibold text-[#6d7892]">N/A</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-[#141b2d]">{product.name}</p>
                      <p className="mt-1 text-sm text-[#66728d]">
                        ID: {product._id?.slice(-6) || product.id || `P-${index + 1}`} | {product.totalSold || 0} sold
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-[#3f4963]">{category}</p>

                  <div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ${statusClasses}`}>
                      {status}
                    </span>
                  </div>

                  <p className="text-[15px] font-semibold text-[#141b2d]">
                    {RUPEE}
                    {Number(product.totalRevenue || 0).toLocaleString('en-IN')}
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
