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
  AlertCircle,
  Layers,
  ShoppingBag,
  Timer
} from 'lucide-react';
import { API_URL } from '../../utils/constants';
import { useAuth } from "../../context/AuthProvider";


const RUPEE = "₹";

const dealTypeOptions = [
  { value: 'single', label: 'Single Product', Icon: Package, desc: 'Discount on one high-focus product' },
  { value: 'bundle', label: 'Bundle Deal', Icon: Layers, desc: 'Combo of 2-10 related products' },
  { value: 'category', label: 'Category Sale', Icon: ShoppingBag, desc: '% Off on all products in a category' },
  { value: 'flash', label: 'Flash Sale', Icon: Zap, desc: 'Deep discount with countdown' },
  { value: 'bogo', label: 'Buy X Get Y', Icon: Timer, desc: 'Buy N, get M free/discounted' },
  { value: 'coupon', label: 'Coupon Code', Icon: Ticket, desc: 'Shareable code with usage limits' }
];

const getInitialTimeState = () => {
  const d = new Date(Date.now() + 15 * 60 * 1000); // 15 mins from now for admin review buffer
  const m = d.getMinutes();
  const remainder = m % 15;
  if (remainder !== 0) {
      d.setMinutes(m + (15 - remainder));
  }
  
  const startDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  
  let startHour = d.getHours();
  const startAmPm = startHour >= 12 ? 'PM' : 'AM';
  startHour = startHour % 12 || 12;
  const startHourStr = String(startHour).padStart(2, '0');
  
  const startMinuteStr = String(d.getMinutes()).padStart(2, '0');

  const endD = new Date(d.getTime() + 24 * 60 * 60 * 1000); // 1 day later
  const endDate = new Date(endD.getTime() - endD.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  
  let endHour = endD.getHours();
  const endAmPm = endHour >= 12 ? 'PM' : 'AM';
  endHour = endHour % 12 || 12;
  const endHourStr = String(endHour).padStart(2, '0');
  
  const endMinuteStr = String(endD.getMinutes()).padStart(2, '0');

  return {
      startDate, startHour: startHourStr, startMinute: startMinuteStr, startAmPm,
      endDate, endHour: endHourStr, endMinute: endMinuteStr, endAmPm
  };
};

const SellerCreateDeal = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    productIds: [],
    dealType: 'single',
    discountType: 'percent',
    discountValue: 25,
    buyQuantity: 1,
    getQuantity: 1,
    title: '',
    description: '',
    category: '',
    couponCode: '',
    ...getInitialTimeState()
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

  const selectedProductsData = useMemo(() =>
    products.filter(p => formData.productIds.includes(p._id))
    , [formData.productIds, products]);

  const minStockAvailable = useMemo(() => {
    if (selectedProductsData.length === 0) return 0;
    return Math.min(...selectedProductsData.map(p =>
      p.variants?.[0]?.sizes?.reduce((sum, s) => sum + s.stock, 0) || 0
    ));
  }, [selectedProductsData]);

  // Frontend time validation buffer (10 mins)
  const getMinStartTime = () => {
    const d = new Date(Date.now() + 10 * 60 * 1000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Clear previous errors
    setError(null);

      // Business Logic Validations
      if (formData.dealType === 'category' && !formData.category) {
        return setError("Please specify a category.");
      }
      if (formData.productIds.length === 0 && formData.dealType !== 'category') {
        return setError("Please select at least one product.");
      }
      if (formData.discountValue > 70 && formData.discountType === 'percent') {
        return setError("Maximum allowed discount is 70%.");
      }

      // Time parsing
      const convertToDate = (dateStr, h, m, ampm) => {
          if (!dateStr) return null;
          let hours = parseInt(h, 10);
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
          
          const [year, month, day] = dateStr.split('-');
          return new Date(year, month - 1, day, hours, parseInt(m, 10), 0, 0);
      };

      const startD = convertToDate(formData.startDate, formData.startHour, formData.startMinute, formData.startAmPm);
      const endD = convertToDate(formData.endDate, formData.endHour, formData.endMinute, formData.endAmPm);

      if (!startD || !endD) {
        return setError("Please complete both start and end date/time.");
      }

      const payload = {
          ...formData,
          startDateTime: startD.toISOString(),
          endDateTime: endD.toISOString()
      };

      try {
        setSubmitting(true);
        await axios.post(`${API_URL}/api/deals`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess(true);
  
        // Reset Form State
        setFormData({
          productIds: [],
          dealType: 'single',
          discountType: 'percent',
          discountValue: 25,
          buyQuantity: 1,
          getQuantity: 1,
          title: '',
          description: '',
          category: '',
          couponCode: '',
          ...getInitialTimeState()
        });

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
        <h1 className="text-[28px] font-bold text-[#141b2d] tracking-tight">Create Merchant Deal</h1>
        <p className="text-[#66728d] mt-1 text-sm font-medium">
          Set up your campaign. A flat fee of <span className="text-[#2156d8] font-bold">₹50</span> will be charged upon admin approval.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-4">

          {/* Deal Type Selection */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-[#e2e8f0]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#eff4ff] rounded-2xl flex items-center justify-center text-[#2156d8]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-[#141b2d]">Campaign Type</h2>
                <p className="text-[11px] text-[#7c87a2] font-medium">Choose how you want to promote your products</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {dealTypeOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFormData({ ...formData, dealType: opt.value, productIds: [], category: '' })}
                  className={`p-4 rounded-3xl border text-left transition-all ${formData.dealType === opt.value
                      ? 'bg-[#f0f5ff] border-[#2156d8] ring-1 ring-[#2156d8]'
                      : 'bg-white border-[#e2e8f0] hover:border-[#bfdbfe]'
                    }`}
                >
                  <opt.Icon className={`w-6 h-6 mb-3 ${formData.dealType === opt.value ? 'text-[#2156d8]' : 'text-[#7c87a2]'}`} />
                  <p className="text-[14px] font-bold text-[#141b2d] mb-1">{opt.label}</p>
                  <p className="text-[10px] text-[#7c87a2] font-medium leading-tight">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Campaign Metadata */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-[#e2e8f0]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#eff4ff] rounded-2xl flex items-center justify-center text-[#2156d8]">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-[#141b2d]">Campaign Identity</h2>
                <p className="text-[11px] text-[#7c87a2] font-medium">Define how customers see your deal</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[11px] font-black text-[#7c87a2] uppercase tracking-[0.12em] mb-2 block">Deal Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Summer Bonanza, Weekend Flash"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-12 bg-[#f8faff] border border-[#e2e8f0] rounded-2xl px-4 text-[14px] font-bold text-[#141b2d] outline-none focus:border-[#2156d8] transition-all"
                />
              </div>
              <div>
                <label className="text-[11px] font-black text-[#7c87a2] uppercase tracking-[0.12em] mb-2 block">Description (Optional)</label>
                <textarea
                  placeholder="Share some details about this campaign..."
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#f8faff] border border-[#e2e8f0] rounded-3xl p-4 text-[13px] font-medium text-[#141b2d] outline-none focus:border-[#2156d8] transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-[#e2e8f0]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Selection */}
              <div className="md:col-span-2">
                <label className="text-[11px] font-black text-[#7c87a2] uppercase tracking-[0.1em] mb-3 block">Selection Scope</label>

                {formData.dealType === 'category' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Array.from(new Set(products.map(p => p.category))).map(cat => {
                      const isSelected = formData.category === cat;
                      const catProductCount = products.filter(p => p.category === cat).length;

                      return (
                        <button
                          key={cat}
                          onClick={() => {
                              const catProductIds = products.filter(p => p.category === cat).map(p => p._id);
                              setFormData({ ...formData, category: cat, productIds: catProductIds });
                          }}
                          className={`p-4 rounded-2xl border text-left transition-all ${isSelected
                              ? 'bg-[#eff4ff] border-[#2156d8] ring-1 ring-[#2156d8]'
                              : 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1]'
                            }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${isSelected ? 'bg-[#2156d8] text-white' : 'bg-[#f1f5f9] text-[#7c87a2]'}`}>
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <p className={`text-[13px] font-bold ${isSelected ? 'text-[#2156d8]' : 'text-[#141b2d]'}`}>{cat}</p>
                          <p className="text-[10px] font-medium text-[#7c87a2] mt-1">{catProductCount} Products in Shop</p>
                        </button>
                      );
                    })}
                    {products.length === 0 && <p className="text-[12px] font-medium text-[#7c87a2]">No categories found.</p>}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                    {products.map(p => {
                      const isSelected = formData.productIds.includes(p._id);
                      const stock = p.variants?.[0]?.sizes?.reduce((sum, s) => sum + s.stock, 0) || 0;

                      return (
                        <button
                          key={p._id}
                          onClick={() => {
                            if (formData.dealType === 'single') {
                              setFormData({ ...formData, productIds: [p._id] });
                            } else {
                              const newIds = isSelected
                                ? formData.productIds.filter(id => id !== p._id)
                                : [...formData.productIds, p._id].slice(0, 10);
                              setFormData({ ...formData, productIds: newIds });
                            }
                          }}
                          className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${isSelected
                              ? 'bg-[#eff4ff] border-[#2156d8] ring-1 ring-[#2156d8]'
                              : 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1]'
                            }`}
                        >
                          <div className="w-12 h-12 rounded-xl border border-[#e2e8f0] overflow-hidden bg-white shrink-0">
                            <img src={p.variants?.[0]?.images?.[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-[13px] font-bold truncate ${isSelected ? 'text-[#2156d8]' : 'text-[#141b2d]'}`}>
                              {p.name}
                            </p>
                            <p className="text-[10px] font-medium text-[#7c87a2]">
                              Stock: <span className={stock > 0 ? 'text-green-600' : 'text-red-500'}>{stock} units</span>
                            </p>
                          </div>
                          {isSelected && (
                            <div className="ml-auto w-5 h-5 bg-[#2156d8] rounded-full flex items-center justify-center text-white">
                              <Package className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                    {products.length === 0 && (
                      <div className="col-span-full py-10 text-center bg-[#f8faff] rounded-3xl border border-dashed border-[#e2e8f0]">
                        <p className="text-[12px] font-medium text-[#7c87a2]">No active products found.</p>
                      </div>
                    )}
                  </div>
                )}
                <p className="mt-3 text-[10px] font-bold text-[#7c87a2] uppercase tracking-[0.05em]">
                  {formData.dealType === 'bundle' ? `Selected ${formData.productIds.length}/10 products` : 'Click to select your focus product'}
                </p>
              </div>

              {/* BOGO Extra Inputs */}
              {formData.dealType === 'bogo' && (
                <div className="md:col-span-2 grid grid-cols-2 gap-4 bg-[#f8faff] p-5 rounded-3xl border border-[#e2e8f0]">
                  <div>
                    <label className="text-[11px] font-black text-[#7c87a2] uppercase tracking-[0.1em] mb-2 block">Buy Quantity (N)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.buyQuantity}
                      onChange={(e) => setFormData({ ...formData, buyQuantity: parseInt(e.target.value) || 1 })}
                      className="w-full h-12 bg-white border border-[#e2e8f0] rounded-2xl px-4 font-bold outline-none focus:border-[#2156d8]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-[#7c87a2] uppercase tracking-[0.1em] mb-2 block">Get Quantity (M)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.getQuantity}
                      onChange={(e) => setFormData({ ...formData, getQuantity: parseInt(e.target.value) || 1 })}
                      className="w-full h-12 bg-white border border-[#e2e8f0] rounded-2xl px-4 font-bold outline-none focus:border-[#2156d8]"
                    />
                  </div>
                </div>
              )}

              {/* Timing */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#f8faff] p-4 rounded-3xl border border-[#e2e8f0]">
                  <label className="text-[11px] font-black text-[#7c87a2] uppercase tracking-[0.12em] mb-3 block">Start Date & Time</label>
                  <div className="space-y-3">
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full h-12 bg-white border border-[#e2e8f0] rounded-2xl px-4 text-[14px] font-bold text-[#141b2d] outline-none focus:border-[#2156d8] transition-all"
                    />
                    <div className="flex gap-2">
                      <select
                        value={formData.startHour}
                        onChange={(e) => setFormData({ ...formData, startHour: e.target.value })}
                        className="w-full h-12 bg-white border border-[#e2e8f0] rounded-2xl px-3 text-[14px] font-bold text-[#141b2d] outline-none focus:border-[#2156d8] transition-all"
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <span className="flex items-center text-gray-400 font-bold">:</span>
                      <select
                        value={formData.startMinute}
                        onChange={(e) => setFormData({ ...formData, startMinute: e.target.value })}
                        className="w-full h-12 bg-white border border-[#e2e8f0] rounded-2xl px-3 text-[14px] font-bold text-[#141b2d] outline-none focus:border-[#2156d8] transition-all"
                      >
                        {['00', '15', '30', '45'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <select
                        value={formData.startAmPm}
                        onChange={(e) => setFormData({ ...formData, startAmPm: e.target.value })}
                        className="w-full h-12 bg-white border border-[#e2e8f0] rounded-2xl px-3 text-[14px] font-bold text-[#141b2d] outline-none focus:border-[#2156d8] transition-all"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-[#f8faff] p-4 rounded-3xl border border-[#e2e8f0]">
                  <label className="text-[11px] font-black text-[#7c87a2] uppercase tracking-[0.12em] mb-3 block">End Date & Time</label>
                  <div className="space-y-3">
                    <input
                      type="date"
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full h-12 bg-white border border-[#e2e8f0] rounded-2xl px-4 text-[14px] font-bold text-[#141b2d] outline-none focus:border-[#2156d8] transition-all"
                    />
                    <div className="flex gap-2">
                      <select
                        value={formData.endHour}
                        onChange={(e) => setFormData({ ...formData, endHour: e.target.value })}
                        className="w-full h-12 bg-white border border-[#e2e8f0] rounded-2xl px-3 text-[14px] font-bold text-[#141b2d] outline-none focus:border-[#2156d8] transition-all"
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <span className="flex items-center text-gray-400 font-bold">:</span>
                      <select
                        value={formData.endMinute}
                        onChange={(e) => setFormData({ ...formData, endMinute: e.target.value })}
                        className="w-full h-12 bg-white border border-[#e2e8f0] rounded-2xl px-3 text-[14px] font-bold text-[#141b2d] outline-none focus:border-[#2156d8] transition-all"
                      >
                        {['00', '15', '30', '45', '59'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <select
                        value={formData.endAmPm}
                        onChange={(e) => setFormData({ ...formData, endAmPm: e.target.value })}
                        className="w-full h-12 bg-white border border-[#e2e8f0] rounded-2xl px-3 text-[14px] font-bold text-[#141b2d] outline-none focus:border-[#2156d8] transition-all"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-4">

          <div className="bg-[#2156d8] rounded-[32px] p-7 text-white shadow-xl shadow-blue-100">
            <h3 className="text-[18px] font-black tracking-tight mb-8">Terms & Payout</h3>

            <div className="space-y-6">
              <div className="flex justify-between items-center text-[13px] font-bold opacity-80">
                <span className="uppercase tracking-widest text-[10px] font-black text-blue-100">Platform Fee</span>
                <span className="bg-white/20 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest leading-none">FLAT ₹50</span>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">Potential Redemptions</span>
                  <span className="font-black text-[22px] leading-none">{minStockAvailable}</span>
                </div>
                <p className="text-[10px] text-blue-100/60 font-bold uppercase tracking-wider">Based on shop inventory</p>
              </div>

              <div className="bg-white/10 rounded-3xl p-5 mt-6 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <Percent className="w-4 h-4 text-blue-100" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Discount Strategy</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="70"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                />
                <div className="flex justify-between mt-3 text-[18px] font-black">
                  <span>{formData.discountValue}% OFF</span>
                </div>
              </div>

              <div className="pt-4">
                {error && !success && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-5 flex items-center gap-3 text-[11px] font-black uppercase tracking-wider text-red-100">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full h-14 bg-white text-[#2156d8] rounded-2xl font-black text-[15px] hover:bg-blue-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {submitting ? 'Processing...' : 'Submit Proposal'}
                </button>
                <p className="mt-4 text-center text-[10px] text-blue-100/70 font-black uppercase tracking-[0.2em]">
                  ₹50 Charged on approval
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-[#e2e8f0]">
            <div className="flex items-center gap-2 mb-4 text-[11px] font-black text-[#7c87a2] uppercase tracking-[0.2em]">
              <Info className="w-4 h-4 text-[#2156d8]" />
              <h3>Merchant Policy</h3>
            </div>
            <p className="text-[12px] text-[#5f6b88] font-bold leading-relaxed">
              Approved deals auto-stop when stock hits zero and auto-resume on restock within the date range window.
            </p>
          </div>

        </div>

      </div>

      {success && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-[#18794e] text-white px-8 py-4 rounded-3xl shadow-2xl z-50 font-black flex items-center gap-3 animate-in fade-in slide-in-from-top-10 duration-500">
          ✅ DEAL SUBMITTED FOR REVIEW
        </div>
      )}
    </div>
  );
};

export default SellerCreateDeal;
