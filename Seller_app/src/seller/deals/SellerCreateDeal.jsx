import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Calendar,
  ChevronDown,
  Clock,
  Package,
  Percent,
  Zap,
  Ticket,
  Info,
  AlertCircle
} from 'lucide-react';
import { API_URL } from '../../utils/constants';
import { useAuth } from "../../context/AuthProvider";

const RUPEE = "₹";

const dealTypeOptions = [
  { value: 'lightning', label: 'Lightning Deal', Icon: Zap },
  { value: 'day_deal', label: 'Day Deal', Icon: Calendar },
  { value: 'coupon', label: 'Coupon', Icon: Ticket }
];

const SellerCreateDeal = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    productId: '',
    dealType: 'lightning',
    discountPercent: 25,
    originalPrice: 0,
    costPrice: 0,
    startTime: '',
    endTime: '',
    stockLimit: 1,
  });

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/product/seller/product`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.products || []);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = useMemo(() => 
    products.find(p => p._id === formData.productId)
  , [formData.productId, products]);

  const totalStock = useMemo(() => {
    if (!selectedProduct) return 0;
    return selectedProduct.variants?.[0]?.sizes?.reduce((sum, s) => sum + s.stock, 0) || 0;
  }, [selectedProduct]);

  useEffect(() => {
    if (selectedProduct) {
      setFormData(prev => ({
        ...prev,
        originalPrice: selectedProduct.variants?.[0]?.sizes?.[0]?.sellingPrice || 0,
        category: selectedProduct.category,
        stockLimit: Math.min(prev.stockLimit, totalStock) || 1
      }));
    }
  }, [selectedProduct, totalStock]);

  const dealPrice = Math.round(formData.originalPrice * (1 - formData.discountPercent / 100));
  const marketplaceFee = Math.round(dealPrice * 0.12);
  const logisticsEstimate = 149;
  const estimatedEarnings = dealPrice - marketplaceFee - logisticsEstimate;
  const profitMargin = dealPrice > 0 ? (estimatedEarnings / dealPrice) * 100 : 0;

  const isStockInvalid = formData.stockLimit > totalStock;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isStockInvalid) {
        setError(`Stock limit cannot exceed available stock (${totalStock})`);
        return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      await axios.post(`${API_URL}/api/deals`, {
          ...formData,
          dealPrice
      }, {
          headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1180px] space-y-5 pb-8">
      {/* Header Section */}
      <div className="mb-4 text-left">
        <h1 className="text-[28px] font-semibold text-[#141b2d] tracking-tight">Propose a New Deal</h1>
        <p className="text-[#66728d] mt-1 text-sm">
          Set up your campaign to boost sales and visibility.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Product Details Card */}
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#e7ebf5]">
            <div className="flex items-center gap-2.5 mb-5 px-1">
               <div className="w-8 h-8 bg-[#f1f4fd] rounded-lg flex items-center justify-center text-[#2156d8]">
                  <Package className="w-4 h-4" />
               </div>
               <h2 className="text-[17px] font-semibold text-[#141b2d]">Product Details</h2>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="text-[11px] font-medium text-[#66728d] uppercase tracking-wider mb-2 block">Select Product</label>
                  <div className="relative group">
                    <select
                      value={formData.productId}
                      onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                      className={`w-full h-14 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 appearance-none font-semibold outline-none focus:border-[#2156d8] transition-all cursor-pointer ${formData.productId ? 'text-transparent' : 'text-[#141b2d]'}`}
                    >
                      <option value="" className="text-[#141b2d]">{loading ? 'Loading...' : 'Select a product'}</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id} className="text-[#141b2d]">
                           {p.name} - {RUPEE}{p.variants?.[0]?.sizes?.[0]?.sellingPrice}
                        </option>
                      ))}
                    </select>
                    
                    {selectedProduct && (
                        <div className="absolute inset-y-0 left-0 flex items-center gap-3 pointer-events-none px-4 bg-transparent w-[calc(100%-40px)]">
                           <div className="w-9 h-9 bg-white rounded-lg border border-[#e2e8f0] flex items-center justify-center overflow-hidden shrink-0">
                              <img 
                                src={selectedProduct.variants?.[0]?.images?.[0]} 
                                alt="" 
                                className="w-full h-full object-cover" 
                              />
                           </div>
                           <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-[#141b2d] truncate">{selectedProduct.name}</p>
                              <p className="text-[10px] text-[#66728d] font-medium mt-0.5 whitespace-nowrap">
                                 Stock: {totalStock} units available
                              </p>
                           </div>
                        </div>
                    )}
                    
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#94a3b8]">
                       <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
               </div>

               <div>
                  <label className="text-[11px] font-medium text-[#66728d] uppercase tracking-wider mb-2 block">Deal Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {dealTypeOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setFormData({ ...formData, dealType: opt.value })}
                        className={`h-[48px] flex items-center justify-center gap-2 rounded-xl border font-semibold text-[13px] transition-all ${
                          formData.dealType === opt.value
                            ? 'bg-[#edf2ff] border-[#2156d8] text-[#2156d8]'
                            : 'bg-white border-[#e2e8f0] text-[#66728d] hover:border-[#bfdbfe]'
                        }`}
                      >
                        <opt.Icon className="w-4 h-4" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#e7ebf5]">
             <div className="flex items-center gap-2.5 mb-5 px-1">
                <div className="w-8 h-8 bg-[#f1f4fd] rounded-lg flex items-center justify-center text-[#2156d8]">
                   <Percent className="w-4 h-4" />
                </div>
                <h2 className="text-[17px] font-semibold text-[#141b2d]">Pricing & Inventory</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-6">
                   <div>
                      <div className="flex justify-between items-center mb-3">
                         <span className="text-[11px] font-medium text-[#66728d] uppercase tracking-wider">Discount</span>
                         <span className="text-[16px] font-bold text-[#2156d8]">{formData.discountPercent}%</span>
                      </div>
                      <div className="relative h-1.5 bg-[#f1f4fd] rounded-full">
                         <div className="absolute h-full bg-[#2156d8] rounded-full" style={{ width: `${formData.discountPercent}%` }}></div>
                         <input 
                            type="range"
                            min="5"
                            max="80"
                            value={formData.discountPercent}
                            onChange={(e) => setFormData({ ...formData, discountPercent: parseInt(e.target.value) })}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                         />
                         <div 
                           className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-[4px] border-[#2156d8] rounded-full shadow-sm pointer-events-none"
                           style={{ left: `calc(${formData.discountPercent}% - 8px)` }}
                         ></div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                           <label className="text-[11px] font-medium text-[#66728d] uppercase">Stock Limit</label>
                           {formData.productId && (
                              <span className={`text-[9px] font-bold ${isStockInvalid ? 'text-red-500' : 'text-green-600'}`}>
                                 /{totalStock}
                              </span>
                           )}
                        </div>
                        <div className="relative">
                           <input 
                              type="number"
                              min="1"
                              max={totalStock}
                              value={formData.stockLimit}
                              onChange={(e) => setFormData({ ...formData, stockLimit: parseInt(e.target.value) || 0 })}
                              className={`w-full h-12 bg-[#f8fafc] border rounded-xl px-4 text-[#141b2d] font-semibold outline-none transition-all text-sm ${isStockInvalid ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-[#e2e8f0] focus:border-[#2156d8]'}`}
                           />
                           {isStockInvalid && (
                              <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-[9px] text-red-500 font-bold whitespace-nowrap">
                                 <AlertCircle className="w-2.5 h-2.5" />
                                 Max available is {totalStock}
                              </div>
                           )}
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-[#66728d] uppercase mb-1.5 block">Cost</label>
                        <input 
                           type="number"
                           value={formData.costPrice}
                           onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                           className="w-full h-12 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 text-[#141b2d] font-semibold outline-none focus:border-[#2156d8] transition-all text-sm"
                        />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                   <div>
                      <label className="text-[11px] font-medium text-[#66728d] uppercase mb-1.5 block">Start Time</label>
                      <input 
                         type="datetime-local"
                         value={formData.startTime}
                         onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                         className="w-full h-12 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 text-[#141b2d] font-semibold outline-none focus:border-[#2156d8] transition-all text-sm"
                      />
                   </div>
                   <div>
                      <label className="text-[11px] font-medium text-[#66728d] uppercase mb-1.5 block">End Time</label>
                      <input 
                         type="datetime-local"
                         value={formData.endTime}
                         onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                         className="w-full h-12 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 text-[#141b2d] font-semibold outline-none focus:border-[#2156d8] transition-all text-sm"
                      />
                   </div>
                </div>
             </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-5">
          
          <div className="bg-[#f3f6ff] rounded-[24px] p-6 border border-white shadow-lg shadow-blue-50/50">
             <h3 className="text-[17px] font-semibold text-[#141b2d] mb-4 px-1">Earnings Review</h3>

             <div className="space-y-4">
                <div className="flex justify-between items-center px-1 text-[13px]">
                   <span className="text-[#66728d]">Original Price</span>
                   <span className="font-semibold text-[#141b2d]">{RUPEE}{formData.originalPrice}</span>
                </div>
                <div className="flex justify-between items-center px-1 text-[13px]">
                   <span className="font-bold text-[#2156d8]">Deal Price</span>
                   <span className="font-extrabold text-[#2156d8]">{RUPEE}{dealPrice}</span>
                </div>
                <div className="pt-3 border-t border-[#dce4f4] space-y-3">
                   <div className="flex justify-between items-center px-1 text-[12px]">
                      <span className="text-[#75819d]">Commission (12%)</span>
                      <span className="font-medium text-[#b42318]">- {RUPEE}{marketplaceFee}</span>
                   </div>
                   <div className="flex justify-between items-center px-1 text-[12px]">
                      <span className="text-[#75819d]">Logistics Fee</span>
                      <span className="font-medium text-[#b42318]">- {RUPEE}{logisticsEstimate}</span>
                   </div>
                </div>

                <div className="bg-white rounded-2xl p-4 mt-6">
                   <p className="text-[10px] font-bold text-[#75819d] uppercase mb-1 text-center">Net Earning</p>
                   <p className="text-[26px] font-bold text-[#141b2d] text-center leading-tight">
                     {RUPEE}{estimatedEarnings.toLocaleString()}
                   </p>
                   <div className="mt-3 h-1 w-full bg-[#f1f4fd] rounded-full">
                      <div className={`h-full rounded-full ${profitMargin > 15 ? 'bg-[#15803d]' : 'bg-[#b42318]'}`} style={{ width: `${Math.min(profitMargin, 100)}%` }}></div>
                   </div>
                   <p className="mt-1.5 text-center text-[10px] font-bold text-[#66728d]">PROFIT: {profitMargin.toFixed(1)}%</p>
                </div>

                <div className="pt-2">
                   {error && !success && (
                      <p className="text-[10px] text-red-500 font-bold mb-3 px-1 flex items-center gap-1">
                         <AlertCircle className="w-3 h-3" />
                         {error}
                      </p>
                   )}
                   <button 
                     onClick={handleSubmit}
                     disabled={submitting || !formData.productId || isStockInvalid}
                     className="w-full h-12 bg-[#2156d8] text-white rounded-xl font-bold text-[14px] hover:bg-[#173d99] transition-all disabled:opacity-50"
                   >
                      {submitting ? 'Submitting...' : 'Propose Deal'}
                   </button>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#e7ebf5]">
             <div className="flex items-center gap-2 mb-3 px-1 text-[11px] font-semibold text-[#66728d] uppercase tracking-wider">
                <Info className="w-3.5 h-3.5" />
                <h3>Requirement</h3>
             </div>
             <p className="text-[12px] text-[#66728d] px-1 font-medium leading-relaxed">
               Deals require a minimum 10% discount to be eligible for homepage placement.
             </p>
          </div>

        </div>

      </div>

      {success && (
        <div className="fixed top-24 right-10 bg-[#15803d] text-white px-6 py-3 rounded-xl shadow-xl z-50 font-bold animate-in fade-in slide-in-from-top-4 duration-500">
           ✅ Deal proposed successfully!
        </div>
      )}
    </div>
  );
};

export default SellerCreateDeal;
