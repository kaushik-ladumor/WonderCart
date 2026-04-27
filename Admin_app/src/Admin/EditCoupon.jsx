import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../utils/constants";
import { useAuth } from "../context/AuthProvider";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  Tag,
  Ticket,
  Calendar,
  Users,
  Info,
  Sparkles,
  Gift,
  Percent,
  CreditCard,
  Truck,
  MapPin,
  ShieldCheck,
  Zap,
  Globe,
  ShoppingCart,
  Trash2,
  Pencil
} from "lucide-react";

function EditCoupon() {
  const { token } = useAuth();
  const { couponId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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
    startDate: "",
    endDate: "",
    neverExpires: false,
    targetType: "all",
    targetCity: "",
    targetRegion: "",
    targetCategory: "",
    targetProducts: "", 
    allowedPaymentMethods: ["Razorpay", "COD", "Wallet"],
    status: "active",
    referrerRewardAmount: 0
  });

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/coupon/${couponId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const coupon = res.data.coupon;
        if (coupon) {
          setFormData({
            code: coupon.code || "",
            name: coupon.name || "",
            description: coupon.description || "",
            couponType: coupon.couponType || "flat",
            discountAmount: coupon.discountAmount || "",
            maxDiscount: coupon.maxDiscount || "",
            minOrderValue: coupon.minOrderValue || "",
            usageLimitTotal: coupon.usageLimitTotal || "",
            usageLimitPerUser: coupon.usageLimitPerUser || 1,
            startDate: coupon.startDate ? coupon.startDate.split("T")[0] : "",
            endDate: coupon.endDate ? coupon.endDate.split("T")[0] : "",
            neverExpires: !!coupon.neverExpires,
            targetType: coupon.targetType || "all",
            targetCity: coupon.targetCity || "",
            targetRegion: coupon.targetRegion || "",
            targetCategory: coupon.targetCategory || "",
            targetProducts: coupon.targetProducts ? coupon.targetProducts.join(", ") : "",
            allowedPaymentMethods: coupon.allowedPaymentMethods || ["Razorpay", "COD", "Wallet"],
            status: coupon.status || "active",
            referrerRewardAmount: coupon.referrerRewardAmount || 0
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load campaign data");
      } finally {
        setLoading(false);
      }
    };

    if (couponId && token) {
      fetchCoupon();
    }
  }, [couponId, token]);

  const updateCoupon = async (e) => {
    e.preventDefault();

    if (!formData.code || !formData.name || !formData.discountAmount) {
      toast.error("Required fields missing");
      return;
    }

    setUpdating(true);
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
      await axios.patch(`${API_URL}/coupon/${couponId}`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Campaign updated successfully");
      navigate("/admin/coupon");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
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

  if (loading) return <Loader />;

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
                    <Pencil className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-[#141b2d] tracking-tight">Modify Campaign</h1>
                    <p className="text-[#64748b] font-medium">Update parameters for active incentive "{formData.code}"</p>
                </div>
            </div>
        </div>

        <form onSubmit={updateCoupon} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            
            {/* Identity */}
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
                            <input
                                name="code"
                                type="text"
                                className="w-full bg-[#f1f5f9] border border-[#e2e8f0] rounded-2xl py-3.5 px-4 text-sm font-black text-gray-500 outline-none cursor-not-allowed"
                                value={formData.code}
                                readOnly
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-[#475569] ml-1">CAMPAIGN TITLE</label>
                            <input
                                name="name"
                                type="text"
                                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-3.5 px-4 text-sm font-bold text-[#1e293b] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
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
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            {/* Logic */}
            <div className="bg-white rounded-[32px] border border-[#e2e8f0] shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-[#f1f5f9] flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-[#1e293b]">Reward Configuration</h2>
                </div>
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                            { id: 'percentage', label: 'Percentage', icon: Percent },
                            { id: 'flat', label: 'Flat Amount', icon: CreditCard },
                            { id: 'free_shipping', label: 'Free Shipping', icon: Truck },
                        ].map(type => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setFormData({...formData, couponType: type.id})}
                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                                    formData.couponType === type.id ? 'border-blue-600 bg-blue-50/30' : 'border-gray-50 bg-white'
                                }`}
                            >
                                <type.icon className={`w-4 h-4 ${formData.couponType === type.id ? 'text-blue-600' : 'text-gray-400'}`} />
                                <span className={`text-[10px] font-black uppercase ${formData.couponType === type.id ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {type.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-[#475569] ml-1">VALUE</label>
                            <input
                                name="discountAmount"
                                type="number"
                                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-3.5 px-4 text-sm font-black text-[#1e293b] outline-none"
                                value={formData.discountAmount}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-[#475569] ml-1">MAX CAP</label>
                            <input
                                name="maxDiscount"
                                type="number"
                                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-3.5 px-4 text-sm font-black text-[#1e293b] outline-none"
                                value={formData.maxDiscount}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-[#475569] ml-1">MIN ORDER</label>
                            <input
                                name="minOrderValue"
                                type="number"
                                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-3.5 px-4 text-sm font-black text-[#1e293b] outline-none"
                                value={formData.minOrderValue}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Targeting */}
            <div className="bg-white rounded-[32px] border border-[#e2e8f0] shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-[#f1f5f9] flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Users className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-[#1e293b]">Targeting & Scope</h2>
                </div>
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[13px] font-bold text-[#475569] ml-1">AUDIENCE TYPE</label>
                            <div className="grid grid-cols-1 gap-2">
                                {['all', 'new_users', 'specific_users', 'local_users'].map(target => (
                                    <button
                                        key={target}
                                        type="button"
                                        onClick={() => setFormData({...formData, targetType: target})}
                                        className={`px-4 py-3 rounded-2xl border-2 text-left transition-all ${
                                            formData.targetType === target ? 'border-blue-600 bg-blue-50/30 text-blue-600' : 'border-[#f1f5f9] text-[#64748b]'
                                        }`}
                                    >
                                        <span className="text-xs font-black uppercase tracking-wider">{target.replace('_', ' ')}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-[#475569] ml-1">PRODUCT RESTRICTIONS</label>
                                <textarea
                                    name="targetProducts"
                                    rows="4"
                                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-4 px-4 text-[11px] font-mono font-bold text-[#1e293b] outline-none resize-none"
                                    placeholder="Product ID list..."
                                    value={formData.targetProducts}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white rounded-[32px] border border-[#e2e8f0] shadow-sm overflow-hidden sticky top-8">
                <div className="p-8 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                            <span className="text-xs font-bold text-gray-600 uppercase">Status</span>
                            <select 
                                name="status"
                                className="bg-transparent border-none text-xs font-black uppercase text-blue-600 focus:ring-0"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Paused</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Validity</label>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-gray-500 uppercase">End Date</p>
                                <input
                                    name="endDate"
                                    type="date"
                                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-3 px-4 text-sm font-bold text-[#1e293b] outline-none"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    disabled={formData.neverExpires}
                                />
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="checkbox"
                                    name="neverExpires"
                                    checked={formData.neverExpires}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-xs font-bold text-[#1e293b] uppercase">No Expiry</span>
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={updating}
                            className="w-full bg-blue-600 text-white py-4 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
                        >
                            {updating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                            Update Campaign
                        </button>
                    </div>

                    <div className="pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/coupon')}
                            className="w-full bg-white text-gray-500 py-4 rounded-[24px] font-black text-sm uppercase tracking-widest border border-gray-100 hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                        >
                            Cancel
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

export default EditCoupon;

