import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../utils/constants";
import { useAuth } from "../context/AuthProvider";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Ticket,
  Calendar,
  Users,
  Info,
  Sparkles,
  Gift,
  Percent,
  CreditCard,
  Tag,
  Truck,
  MapPin,
  ShieldCheck,
  Zap,
  Globe,
  ShoppingCart
} from "lucide-react";

function AddCoupon() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    couponType: "flat",
    discountAmount: "",
    maxDiscount: "",
    minOrderValue: "",
    usageLimitTotal: "",
    usageLimitPerUser: 1,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    neverExpires: false,
    targetType: "all",
    targetCity: "",
    targetRegion: "",
    targetCategory: "",
    targetProducts: "", // Will be split into array
    allowedPaymentMethods: ["Razorpay", "COD", "Wallet"],
    status: "active",
    referrerRewardAmount: 0
  });

  const createCoupon = async (e) => {
    e.preventDefault();

    if (!formData.code || !formData.name || !formData.discountAmount) {
      toast.error("Code, Name, and Discount Amount are required");
      return;
    }

    setLoading(true);
    
    // Prepare data
    const dataToSend = {
      ...formData,
      discountAmount: Number(formData.discountAmount),
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
      minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : 0,
      usageLimitTotal: formData.usageLimitTotal ? Number(formData.usageLimitTotal) : null,
      usageLimitPerUser: Number(formData.usageLimitPerUser),
      targetProducts: formData.targetProducts ? formData.targetProducts.split(",").map(id => id.trim()) : [],
      endDate: formData.neverExpires ? null : formData.endDate,
    };

    try {
      await axios.post(`${API_URL}/coupon`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Marketing campaign launched successfully!");
      navigate("/admin/coupon");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error creating coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePaymentMethodToggle = (method) => {
    setFormData(prev => {
        const methods = [...prev.allowedPaymentMethods];
        if (methods.includes(method)) {
            return { ...prev, allowedPaymentMethods: methods.filter(m => m !== method) };
        } else {
            return { ...prev, allowedPaymentMethods: [...methods, method] };
        }
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-poppins pb-20">
      <div className="max-w-5xl mx-auto px-6 py-10">
        
        {/* Breadcrumb & Title */}
        <div className="mb-10">
            <button
                onClick={() => navigate("/admin/coupon")}
                className="flex items-center gap-2 text-[#64748b] hover:text-[#1e293b] transition-all text-sm font-semibold mb-4 group"
            >
                <div className="p-1.5 rounded-lg bg-white border border-[#e2e8f0] group-hover:bg-gray-50 shadow-sm">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                Return to Ledger
            </button>
            <div className="flex items-end gap-4">
                <div className="h-16 w-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-100 rotate-3">
                    <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-[#141b2d] tracking-tight">New Marketing Campaign</h1>
                    <p className="text-[#64748b] font-medium">Design high-conversion incentives for WinderCart users</p>
                </div>
            </div>
        </div>

        <form onSubmit={createCoupon} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            
            {/* Section 1: Identity */}
            <div className="bg-white rounded-[32px] border border-[#e2e8f0] shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-[#f1f5f9] flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Tag className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-[#1e293b]">Campaign Identity</h2>
                </div>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-[#475569] ml-1">COUPON CODE</label>
                            <div className="relative">
                                <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    name="code"
                                    type="text"
                                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-[#1e293b] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all uppercase placeholder:text-gray-300"
                                    placeholder="e.g. FESTIVAL10"
                                    value={formData.code}
                                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-[#475569] ml-1">CAMPAIGN TITLE</label>
                            <input
                                name="name"
                                type="text"
                                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-3.5 px-4 text-sm font-bold text-[#1e293b] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                placeholder="e.g. Diwali Super Sale 2025"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-[#475569] ml-1">PUBLIC DESCRIPTION</label>
                        <textarea
                            name="description"
                            rows="3"
                            className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-4 px-4 text-sm font-medium text-[#1e293b] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                            placeholder="Tell users what they get..."
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            {/* Section 2: Reward Logic */}
            <div className="bg-white rounded-[32px] border border-[#e2e8f0] shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-[#f1f5f9] flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-[#1e293b]">Reward Configuration</h2>
                </div>
                <div className="p-8 space-y-8">
                    <div className="space-y-4">
                        <label className="text-[13px] font-bold text-[#475569] ml-1">COUPON TYPE</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                                { id: 'percentage', label: 'Percentage', icon: Percent, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { id: 'flat', label: 'Flat Amount', icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                { id: 'free_shipping', label: 'Free Shipping', icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { id: 'welcome', label: 'Welcome', icon: Gift, color: 'text-rose-600', bg: 'bg-rose-50' },
                                { id: 'loyalty', label: 'Loyalty', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
                                { id: 'referral', label: 'Referral', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
                            ].map(type => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setFormData({...formData, couponType: type.id})}
                                    className={`flex flex-col items-center gap-3 p-4 rounded-[24px] border-2 transition-all ${
                                        formData.couponType === type.id 
                                        ? 'border-blue-600 bg-blue-50/30' 
                                        : 'border-[#f1f5f9] bg-white hover:border-[#e2e8f0]'
                                    }`}
                                >
                                    <div className={`p-2.5 rounded-xl ${type.bg} ${type.color}`}>
                                        <type.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`text-xs font-bold ${formData.couponType === type.id ? 'text-blue-600' : 'text-[#64748b]'}`}>
                                        {type.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-[#475569] ml-1">
                                {formData.couponType === 'percentage' ? 'DISCOUNT %' : 'DISCOUNT AMOUNT (₹)'}
                            </label>
                            <input
                                name="discountAmount"
                                type="number"
                                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-3.5 px-4 text-sm font-black text-[#1e293b] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                value={formData.discountAmount}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-[#475569] ml-1">MAX DISCOUNT (₹)</label>
                            <input
                                name="maxDiscount"
                                type="number"
                                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-3.5 px-4 text-sm font-black text-[#1e293b] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                value={formData.maxDiscount}
                                onChange={handleChange}
                                placeholder="No Cap"
                                disabled={formData.couponType !== 'percentage'}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-[#475569] ml-1">MIN ORDER (₹)</label>
                            <input
                                name="minOrderValue"
                                type="number"
                                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-3.5 px-4 text-sm font-black text-[#1e293b] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                value={formData.minOrderValue}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {formData.couponType === 'referral' && (
                        <div className="p-5 bg-purple-50 rounded-3xl border border-purple-100 flex items-center gap-4">
                            <div className="h-12 w-12 bg-white text-purple-600 rounded-2xl flex items-center justify-center shadow-sm">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <label className="text-[11px] font-black text-purple-600 uppercase tracking-widest">Referrer Reward (Wallet Credit)</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xl font-black text-purple-900">₹</span>
                                    <input 
                                        name="referrerRewardAmount"
                                        type="number"
                                        className="bg-transparent border-none p-0 text-xl font-black text-purple-900 focus:ring-0 w-24"
                                        value={formData.referrerRewardAmount}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Section 3: Targeting & Restrictions */}
            <div className="bg-white rounded-[32px] border border-[#e2e8f0] shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-[#f1f5f9] flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Users className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-[#1e293b]">Targeting & Inventory</h2>
                </div>
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[13px] font-bold text-[#475569] ml-1">AUDIENCE SCOPE</label>
                            <div className="space-y-3">
                                {[
                                    { id: 'all', label: 'All Registered Users', sub: 'Open campaign' },
                                    { id: 'new_users', label: 'Acquisition Focus', sub: 'First-time buyers only' },
                                    { id: 'specific_users', label: 'Direct Targeting', sub: 'Manual user selection' },
                                    { id: 'local_users', label: 'Hyper-Local', sub: 'City/Region specific' },
                                ].map(target => (
                                    <label key={target.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                        formData.targetType === target.id ? 'border-blue-600 bg-blue-50/30' : 'border-[#f1f5f9] bg-[#f8fafc] hover:border-[#e2e8f0]'
                                    }`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${formData.targetType === target.id ? 'border-blue-600' : 'border-gray-300'}`}>
                                                {formData.targetType === target.id && <div className="h-2 w-2 bg-blue-600 rounded-full" />}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${formData.targetType === target.id ? 'text-blue-600' : 'text-[#1e293b]'}`}>{target.label}</p>
                                                <p className="text-[10px] text-[#64748b] font-bold uppercase">{target.sub}</p>
                                            </div>
                                        </div>
                                        <input 
                                            type="radio" 
                                            name="targetType" 
                                            value={target.id} 
                                            checked={formData.targetType === target.id}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {formData.targetType === 'local_users' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-bold text-[#475569] ml-1">TARGET CITY</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                name="targetCity"
                                                type="text"
                                                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-[#1e293b] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                                placeholder="e.g. Mumbai"
                                                value={formData.targetCity}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-bold text-[#475569] ml-1">TARGET REGION</label>
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                name="targetRegion"
                                                type="text"
                                                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-[#1e293b] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                                placeholder="e.g. Maharashtra"
                                                value={formData.targetRegion}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-[#475569] ml-1">RESTRICT TO CATEGORY</label>
                                <div className="relative">
                                    <ShoppingCart className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        name="targetCategory"
                                        type="text"
                                        className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-[#1e293b] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        placeholder="e.g. Electronics"
                                        value={formData.targetCategory}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-[#475569] ml-1">SPECIFIC PRODUCT IDs</label>
                                <textarea
                                    name="targetProducts"
                                    rows="3"
                                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-4 px-4 text-[13px] font-mono font-bold text-[#1e293b] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                                    placeholder="Comma separated IDs..."
                                    value={formData.targetProducts}
                                    onChange={handleChange}
                                />
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-1">Optional: Limits coupon to these items only</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          <div className="space-y-8">
            
            {/* Validity Sidebar Card */}
            <div className="bg-white rounded-[32px] border border-[#e2e8f0] shadow-sm overflow-hidden sticky top-8">
                <div className="px-8 py-6 border-b border-[#f1f5f9] flex items-center gap-3 bg-gray-50/50">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-[#1e293b]">Scheduling</h2>
                </div>
                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Start Date</label>
                        <input
                            name="startDate"
                            type="date"
                            className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-3 px-4 text-sm font-bold text-[#1e293b] outline-none"
                            value={formData.startDate}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                            <span className="text-xs font-bold text-gray-600">NEVER EXPIRES</span>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, neverExpires: !formData.neverExpires})}
                                className={`w-11 h-6 rounded-full transition-all relative ${formData.neverExpires ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.neverExpires ? 'left-6' : 'left-1'}`} />
                            </button>
                        </div>

                        {!formData.neverExpires && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Expiration Date</label>
                                <input
                                    name="endDate"
                                    type="date"
                                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-3 px-4 text-sm font-bold text-[#1e293b] outline-none"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required={!formData.neverExpires}
                                />
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 space-y-4">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Usage Governance</label>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-gray-500 uppercase">Total Usage Limit</p>
                                <input 
                                    name="usageLimitTotal"
                                    type="number"
                                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-3 px-4 text-sm font-bold text-[#1e293b] outline-none"
                                    placeholder="Unlimited"
                                    value={formData.usageLimitTotal}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-gray-500 uppercase">Limit Per User</p>
                                <input 
                                    name="usageLimitPerUser"
                                    type="number"
                                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-3 px-4 text-sm font-bold text-[#1e293b] outline-none"
                                    value={formData.usageLimitPerUser}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 space-y-4">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Accepted Payments</label>
                        <div className="flex flex-wrap gap-2">
                            {['Razorpay', 'COD', 'Wallet'].map(method => (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => handlePaymentMethodToggle(method)}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${
                                        formData.allowedPaymentMethods.includes(method)
                                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                                        : 'border-gray-100 bg-gray-50 text-gray-400'
                                    }`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-8">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1e293b] text-white py-4 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-[#0f172a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="w-5 h-5" />
                                    Publish Campaign
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

          </div>

        </form>
      </div>
    </div>
  );
}

export default AddCoupon;

