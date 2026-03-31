import React, { useState, useEffect, useRef } from "react";
import {
  Mail, CheckCircle, XCircle, Building2, Landmark, Shield, AlertTriangle, ChevronDown, FileText,
  Upload, X, Loader2, Store, LogOut, Trash2, Key, Tag, Plus, Send, Clock, Ban, Info,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import UpdatePassword from "../../auth/UpdatePassword";
import DeleteModal from "../../auth/DeletedModel";
import { API_URL } from "../../utils/constants";

const ALL_CATEGORIES = [
  "Fashion", "Footwear", "Home & Kitchen", "Electronics", "Books",
  "Beauty & Care", "Sports", "Grocery", "Toys", "Automotive", "Health", "Other",
];

const BUSINESS_TYPES = [
  "Individual / Sole Proprietor", "Partnership Firm", "Private Limited", "LLP", "Trust/NGO",
];

const REJECTION_REASONS = [
  "Incomplete or invalid documents",
  "Mismatch in business details",
  "Invalid PAN or GST number",
  "Suspicious or fraudulent application",
  "Other",
];

// ─── OTP MODAL ───
const OtpModal = ({ isOpen, onClose, email, onVerified }) => {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (isOpen) {
      setDigits(["", "", "", ""]);
      setError("");
      setShake(false);
      setCountdown(30);
      setCanResend(false);
      setTimeout(() => inputRefs[0].current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (countdown <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, isOpen]);

  const handleDigitChange = (idx, value) => {
    if (!/^\d?$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[idx] = value;
    setDigits(newDigits);
    setError("");

    if (value && idx < 3) {
      inputRefs[idx + 1].current?.focus();
    }

    // Auto-submit on 4th digit
    if (idx === 3 && value) {
      const otp = newDigits.join("");
      if (otp.length === 4) submitOtp(otp);
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs[idx - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length === 4) {
      const newDigits = pasted.split("");
      setDigits(newDigits);
      inputRefs[3].current?.focus();
      setTimeout(() => submitOtp(pasted), 100);
    }
  };

  const submitOtp = async (otp) => {
    setVerifying(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/seller/verify-otp`, { otp }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        toast.success("Email verified successfully");
        onVerified();
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Verification failed";
      setError(msg);
      setShake(true);
      setTimeout(() => { setShake(false); setDigits(["", "", "", ""]); inputRefs[0].current?.focus(); }, 600);
    } finally {
      setVerifying(false);
    }
  };

  const resendOtp = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/seller/send-otp`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("New OTP sent!");
      setCountdown(30);
      setCanResend(false);
      setError("");
      setDigits(["", "", "", ""]);
      inputRefs[0].current?.focus();
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Verify your email</h3>
          <p className="text-sm text-gray-500 mt-1">We sent a 4-digit code to <b>{email}</b></p>
        </div>

        <div className="flex justify-center gap-3 mb-4" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={inputRefs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={verifying}
              className={`w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all
                ${error ? "border-red-400 bg-red-50" : d ? "border-blue-500 bg-blue-50" : "border-gray-200"}
                ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}
                focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                disabled:opacity-50`}
            />
          ))}
        </div>

        {verifying && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-3">
            <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
          </div>
        )}

        {error && <p className="text-center text-sm text-red-500 font-medium mb-3">{error}</p>}

        <div className="text-center">
          {canResend ? (
            <button onClick={resendOtp} className="text-sm text-blue-600 font-semibold hover:underline">Resend OTP</button>
          ) : (
            <p className="text-sm text-gray-400">Resend in <span className="font-bold text-gray-600">{countdown}s</span></p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN PROFILE COMPONENT ───
const SellerProfile = () => {
  const navigate = useNavigate();
  const { authUser, setAuthUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  // Step 2 form
  const [businessForm, setBusinessForm] = useState({
    shopName: "", businessType: "", sellerCategories: [],
    gstNumber: "", panNumber: "",
    businessAddress: { pinCode: "", addressLine1: "", addressLine2: "", city: "", state: "", country: "India" },
    warehouseAddress: { pinCode: "", addressLine1: "", addressLine2: "", city: "", state: "", country: "India" },
    warehouseSameAsBusiness: false,
    supportEmail: "", supportPhone: "",
  });
  const [panFile, setPanFile] = useState(null);
  const [identityFile, setIdentityFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [gstFile, setGstFile] = useState(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [warehousePinLoading, setWarehousePinLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Step 3 form
  const [bankForm, setBankForm] = useState({
    bankAccountHolder: "", bankAccountNumber: "", confirmAccountNumber: "",
    bankIfscCode: "", bankName: "", bankBranch: "", bankAccountType: "",
  });
  const [ifscLoading, setIfscLoading] = useState(false);

  // Category request
  const [showCategoryRequest, setShowCategoryRequest] = useState(false);
  const [newCategoryRequest, setNewCategoryRequest] = useState({ category: "", reason: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [profileRes, userRes] = await Promise.all([
        axios.get(`${API_URL}/seller/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/user/profile`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const p = profileRes.data.profile;
      const u = userRes.data.user;
      setProfile(p);
      setUserData(u);

      // Populate business form from profile
      if (p) {
        setBusinessForm({
          shopName: p.shopName || "",
          businessType: p.businessType || "",
          sellerCategories: p.sellerCategories || [],
          gstNumber: p.gstNumber || "",
          panNumber: p.panNumber || "",
          businessAddress: p.businessAddress || { pinCode: "", addressLine1: "", addressLine2: "", city: "", state: "", country: "India" },
          warehouseAddress: p.warehouseAddress || { pinCode: "", addressLine1: "", addressLine2: "", city: "", state: "", country: "India" },
          warehouseSameAsBusiness: p.warehouseSameAsBusiness || false,
          supportEmail: p.supportEmail || "",
          supportPhone: p.supportPhone || "",
        });
        setBankForm({
          bankAccountHolder: p.bankAccountHolder || "",
          bankAccountNumber: p.bankAccountNumber || "",
          confirmAccountNumber: p.bankAccountNumber || "",
          bankIfscCode: p.bankIfscCode || "",
          bankName: p.bankName || "",
          bankBranch: p.bankBranch || "",
          bankAccountType: p.bankAccountType || "",
        });

        // Set active step
        if (!p.emailVerified) setActiveStep(1);
        else if (!p.step2Completed) setActiveStep(2);
        else if (!p.step3Completed) setActiveStep(3);
        else setActiveStep(3);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // PIN code auto-fill
  const fetchPinDetails = async (pin, type) => {
    if (pin.length !== 6) return;
    const setLoading = type === "business" ? setPinLoading : setWarehousePinLoading;
    setLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        const addressKey = type === "business" ? "businessAddress" : "warehouseAddress";
        setBusinessForm(prev => ({
          ...prev,
          [addressKey]: { ...prev[addressKey], city: po.District, state: po.State, country: po.Country },
        }));
        setFieldErrors(prev => ({ ...prev, [`${type}Pin`]: "" }));
      } else {
        setFieldErrors(prev => ({ ...prev, [`${type}Pin`]: "Invalid PIN code, please check" }));
      }
    } catch {
      setFieldErrors(prev => ({ ...prev, [`${type}Pin`]: "Could not verify PIN code" }));
    } finally {
      setLoading(false);
    }
  };

  // IFSC auto-fill
  const fetchIfscDetails = async (ifsc) => {
    if (ifsc.length !== 11) return;
    setIfscLoading(true);
    try {
      const res = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
      if (res.ok) {
        const data = await res.json();
        setBankForm(prev => ({ ...prev, bankName: data.BANK, bankBranch: data.BRANCH }));
        setFieldErrors(prev => ({ ...prev, ifsc: "" }));
      } else {
        setFieldErrors(prev => ({ ...prev, ifsc: "Invalid IFSC code" }));
        setBankForm(prev => ({ ...prev, bankName: "", bankBranch: "" }));
      }
    } catch {
      setFieldErrors(prev => ({ ...prev, ifsc: "Could not verify IFSC" }));
    } finally {
      setIfscLoading(false);
    }
  };

  // Validators
  const validatePan = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase());
  const validateGst = (gst) => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gst.toUpperCase());

  const [sendingOtp, setSendingOtp] = useState(false);

  // Send OTP
  const handleSendOtp = async () => {
    setSendingOtp(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/seller/send-otp`, {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (res.data.success) {
        setShowOtpModal(true);
        toast.success("Verification code sent!");
      } else {
        toast.error(res.data.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  // Save Step 2
  const handleSaveStep2 = async () => {
    const errors = {};
    if (!businessForm.shopName) errors.shopName = "Shop name required";
    if (businessForm.gstNumber && !validateGst(businessForm.gstNumber)) errors.gstNumber = "Invalid GST format";
    if (businessForm.panNumber && !validatePan(businessForm.panNumber)) errors.panNumber = "Invalid PAN format";
    if (businessForm.sellerCategories.length === 0) errors.categories = "Select at least one category";
    if (!businessForm.businessAddress.pinCode) errors.businessPin = "PIN code required";
    if (!businessForm.businessAddress.addressLine1) errors.businessAddr = "Address line 1 required";
    
    // Document validations for new registrations
    if (!profile?.step2Completed) {
      if (!logoFile) errors.logo = "Shop Logo / Image is required";
      if (!identityFile) errors.identity = "Identity Document is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fix the errors");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("shopName", businessForm.shopName);
      formData.append("businessType", businessForm.businessType);
      formData.append("gstNumber", businessForm.gstNumber);
      formData.append("panNumber", businessForm.panNumber);
      formData.append("supportEmail", businessForm.supportEmail);
      formData.append("supportPhone", businessForm.supportPhone);
      formData.append("warehouseSameAsBusiness", businessForm.warehouseSameAsBusiness);
      formData.append("businessAddress", JSON.stringify(businessForm.businessAddress));
      formData.append("warehouseAddress", JSON.stringify(
        businessForm.warehouseSameAsBusiness ? businessForm.businessAddress : businessForm.warehouseAddress
      ));
      
      businessForm.sellerCategories.forEach(c => formData.append("sellerCategories[]", c));

      if (panFile) formData.append("panCardDocument", panFile);
      if (identityFile) formData.append("identityDocument", identityFile);
      if (logoFile) formData.append("shopLogo", logoFile);
      if (gstFile) formData.append("gstBill", gstFile);

      const res = await axios.post(`${API_URL}/seller/business-details`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "multipart/form-data" 
        },
      });

      if (res.data.success) {
        toast.success("Business details saved!");
        setProfile(res.data.profile);
        setActiveStep(3);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // Save Step 3
  const handleSaveStep3 = async () => {
    const errors = {};
    if (!bankForm.bankAccountHolder.trim()) errors.holder = "Account holder required";
    if (!bankForm.bankAccountNumber) errors.accNo = "Account number required";
    if (bankForm.bankAccountNumber !== bankForm.confirmAccountNumber) errors.confirmAcc = "Account numbers don't match";
    if (!bankForm.bankIfscCode || bankForm.bankIfscCode.length !== 11) errors.ifsc = "Valid IFSC required";
    if (!bankForm.bankAccountType) errors.accType = "Select account type";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fix the errors");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/seller/bank-details`, bankForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        toast.success("Bank details saved!");
        setProfile(res.data.profile);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // Submit for Review
  const handleSubmitReview = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/seller/submit-review`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        toast.success("Profile submitted for review!");
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit");
    } finally {
      setSaving(false);
    }
  };

  // Request Category
  const handleRequestCategory = async () => {
    if (!newCategoryRequest.category || !newCategoryRequest.reason) {
      toast.error("Category and reason required");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/seller/request-category`, newCategoryRequest, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        toast.success("Category request submitted!");
        setShowCategoryRequest(false);
        setNewCategoryRequest({ category: "", reason: "" });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("Users");
    localStorage.removeItem("refreshToken");
    setAuthUser(null);
    toast.success("Logged out");
    navigate("/");
  };

  // Category toggle
  const toggleCategory = (cat) => {
    setBusinessForm(prev => {
      const cats = prev.sellerCategories.includes(cat)
        ? prev.sellerCategories.filter(c => c !== cat)
        : prev.sellerCategories.length < 5
          ? [...prev.sellerCategories, cat]
          : prev.sellerCategories;
      return { ...prev, sellerCategories: cats };
    });
  };

  if (loading) return <Loader />;

  const status = profile?.profileStatus || "email_pending";
  const emailVerified = profile?.emailVerified || false;
  const isEditable = !["submitted", "active", "suspended"].includes(status);
  const accountMatch = bankForm.bankAccountNumber && bankForm.confirmAccountNumber &&
    bankForm.bankAccountNumber === bankForm.confirmAccountNumber;
  const accountMismatch = bankForm.confirmAccountNumber && bankForm.bankAccountNumber !== bankForm.confirmAccountNumber;

  const steps = [
    { num: 1, label: "Verify Email", icon: Mail, done: emailVerified, locked: false },
    { num: 2, label: "Business Details", icon: Building2, done: profile?.step2Completed, locked: !emailVerified },
    { num: 3, label: "Bank Account", icon: Landmark, done: profile?.step3Completed, locked: !emailVerified },
  ];

  const completionPct = Math.round(
    ((emailVerified ? 1 : 0) + (profile?.step2Completed ? 1 : 0) + (profile?.step3Completed ? 1 : 0)) / 3 * 100
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seller Profile</h1>
            <p className="text-sm text-gray-500 mt-1">Complete your profile to start selling</p>
          </div>
          <button onClick={() => navigate("/seller/dashboard")}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">
            <Store className="w-4 h-4" /> Dashboard
          </button>
        </div>

        {/* Status Banners */}
        {status === "submitted" && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900">Profile Under Review</h3>
              <p className="text-sm text-amber-700 mt-1">Our team will review your details within 24–48 hours. We'll email you once done.</p>
            </div>
          </div>
        )}
        {status === "rejected" && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900">Application Rejected</h3>
              <p className="text-sm text-red-700 mt-1">{profile?.rejectionReason}</p>
              {profile?.adminMessage && <p className="text-sm text-red-600 mt-1 italic">"{profile.adminMessage}"</p>}
              <button onClick={() => { setActiveStep(2); }} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                Edit & Resubmit
              </button>
            </div>
          </div>
        )}
        {status === "suspended" && (
          <div className="mb-6 bg-gray-100 border border-gray-300 rounded-xl p-5 flex items-start gap-3">
            <Ban className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-900">Account Suspended</h3>
              <p className="text-sm text-gray-600 mt-1">Your seller account has been suspended. Please contact support.</p>
            </div>
          </div>
        )}
        {status === "active" && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-green-900">Account Active</h3>
              <p className="text-sm text-green-700 mt-1">Your seller account is fully active. You can manage products and orders.</p>
            </div>
          </div>
        )}
        {profile?.adminMessage && status === "email_verified" && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-900">Admin Request</h3>
              <p className="text-sm text-blue-700 mt-1">"{profile.adminMessage}"</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Left: Stepper */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Progress</h3>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{completionPct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
              </div>

              <div className="space-y-1">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  const isActive = activeStep === step.num;
                  const isLocked = step.locked;
                  return (
                    <button key={step.num} onClick={() => !isLocked && setActiveStep(step.num)} disabled={isLocked}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all text-sm
                        ${isActive ? "bg-gray-900 text-white" : step.done ? "bg-green-50 text-green-800 hover:bg-green-100" : isLocked ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "hover:bg-gray-50 text-gray-600"}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                        ${isActive ? "bg-white/20" : step.done ? "bg-green-200" : "bg-gray-100"}`}>
                        {step.done ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                          isLocked ? <Shield className="w-4 h-4 text-gray-400" /> :
                            <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-500"}`} />}
                      </div>
                      <div>
                        <p className="font-medium">{step.label}</p>
                        <p className={`text-[10px] ${isActive ? "text-gray-300" : "text-gray-400"}`}>
                          {step.done ? "Completed" : isLocked ? "Locked" : "Pending"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <button onClick={() => document.getElementById("update_password_modal")?.showModal()}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                <Key className="w-4 h-4" /> Update Password
              </button>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                <LogOut className="w-4 h-4" /> Log Out
              </button>
              <button onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition">
                <Trash2 className="w-4 h-4" /> Delete Account
              </button>
            </div>
          </div>

          {/* Right: Step Content */}
          <div className="space-y-6">
            {/* ═══ STEP 1: EMAIL ═══ */}
            {activeStep === 1 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2"><Mail className="w-5 h-5" /> Email Verification</h2>
                <p className="text-sm text-gray-500 mb-6">Verify your email to unlock business details and bank account steps</p>

                <div className="bg-gray-50 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Email Address</p>
                    <p className="text-base font-semibold text-gray-900">{userData?.email}</p>
                  </div>
                  {emailVerified ? (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                      <CheckCircle className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <button 
                      onClick={handleSendOtp} 
                      disabled={sendingOtp}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                      {sendingOtp && <Loader2 className="w-4 h-4 animate-spin" />}
                      {sendingOtp ? "Sending..." : "Verify Email"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ═══ STEP 2: BUSINESS ═══ */}
            {activeStep === 2 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2"><Building2 className="w-5 h-5" /> Business Details</h2>
                <p className="text-sm text-gray-500 mb-6">Tell us about your business</p>

                <div className="space-y-5">
                  {/* Shop Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Shop Name *</label>
                    <input type="text" value={businessForm.shopName} disabled={!isEditable}
                      onChange={e => { setBusinessForm(p => ({ ...p, shopName: e.target.value })); setFieldErrors(p => ({ ...p, shopName: "" })); }}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none ${fieldErrors.shopName ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                      placeholder="Your shop name" />
                    {fieldErrors.shopName && <p className="text-xs text-red-500 mt-1">{fieldErrors.shopName}</p>}
                  </div>

                  {/* Business Type */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Business Type</label>
                    <select value={businessForm.businessType} disabled={!isEditable}
                      onChange={e => setBusinessForm(p => ({ ...p, businessType: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white">
                      <option value="">Select type</option>
                      {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Categories * <span className="text-blue-600 font-bold ml-2">{businessForm.sellerCategories.length} of 5 selected</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ALL_CATEGORIES.map(cat => {
                        const selected = businessForm.sellerCategories.includes(cat);
                        const atLimit = businessForm.sellerCategories.length >= 5 && !selected;
                        return (
                          <button key={cat} type="button" disabled={atLimit || !isEditable}
                            onClick={() => toggleCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition
                              ${selected ? "bg-blue-600 text-white border-blue-600" : atLimit ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                    {fieldErrors.categories && <p className="text-xs text-red-500 mt-1">{fieldErrors.categories}</p>}
                  </div>

                  {/* PAN & GST */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">PAN Number *</label>
                      <input type="text" value={businessForm.panNumber} maxLength={10} disabled={!isEditable}
                        onChange={e => { setBusinessForm(p => ({ ...p, panNumber: e.target.value.toUpperCase() })); setFieldErrors(p => ({ ...p, panNumber: "" })); }}
                        onBlur={() => businessForm.panNumber && !validatePan(businessForm.panNumber) && setFieldErrors(p => ({ ...p, panNumber: "Invalid PAN format" }))}
                        className={`w-full px-4 py-2.5 border rounded-lg text-sm font-mono uppercase ${fieldErrors.panNumber ? "border-red-400" : validatePan(businessForm.panNumber) ? "border-green-400" : "border-gray-200"}`}
                        placeholder="AAAAA9999A" />
                      {fieldErrors.panNumber && <p className="text-xs text-red-500 mt-1">{fieldErrors.panNumber}</p>}
                      {validatePan(businessForm.panNumber) && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Valid</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">GST Number <span className="text-gray-400">(Optional)</span></label>
                      <input type="text" value={businessForm.gstNumber} maxLength={15} disabled={!isEditable}
                        onChange={e => { setBusinessForm(p => ({ ...p, gstNumber: e.target.value.toUpperCase() })); setFieldErrors(p => ({ ...p, gstNumber: "" })); }}
                        onBlur={() => businessForm.gstNumber && !validateGst(businessForm.gstNumber) && setFieldErrors(p => ({ ...p, gstNumber: "Invalid GST format" }))}
                        className={`w-full px-4 py-2.5 border rounded-lg text-sm font-mono uppercase ${fieldErrors.gstNumber ? "border-red-400" : businessForm.gstNumber && validateGst(businessForm.gstNumber) ? "border-green-400" : "border-gray-200"}`}
                        placeholder="22AAAAA0000A1Z5" />
                      {fieldErrors.gstNumber && <p className="text-xs text-red-500 mt-1">{fieldErrors.gstNumber}</p>}
                    </div>
                  </div>

                  {/* Business Address */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Business Address</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <input type="text" value={businessForm.businessAddress.pinCode} maxLength={6} disabled={!isEditable}
                          onChange={e => {
                            const pin = e.target.value.replace(/\D/g, "");
                            setBusinessForm(p => ({ ...p, businessAddress: { ...p.businessAddress, pinCode: pin } }));
                            if (pin.length === 6) setTimeout(() => fetchPinDetails(pin, "business"), 500);
                          }}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="PIN Code" />
                        {pinLoading && <p className="text-xs text-blue-500 mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Fetching location...</p>}
                        {fieldErrors.businessPin && <p className="text-xs text-red-500 mt-1">{fieldErrors.businessPin}</p>}
                      </div>
                      <input type="text" value={businessForm.businessAddress.city} readOnly className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50" placeholder="City" />
                      <input type="text" value={businessForm.businessAddress.state} readOnly className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50" placeholder="State" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <input type="text" value={businessForm.businessAddress.addressLine1} disabled={!isEditable}
                        onChange={e => setBusinessForm(p => ({ ...p, businessAddress: { ...p.businessAddress, addressLine1: e.target.value } }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="Address Line 1 *" />
                      <input type="text" value={businessForm.businessAddress.addressLine2} disabled={!isEditable}
                        onChange={e => setBusinessForm(p => ({ ...p, businessAddress: { ...p.businessAddress, addressLine2: e.target.value } }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="Address Line 2" />
                    </div>
                  </div>

                  {/* Warehouse Address */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Warehouse / Pickup Address</label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={businessForm.warehouseSameAsBusiness} disabled={!isEditable}
                          onChange={e => setBusinessForm(p => ({ ...p, warehouseSameAsBusiness: e.target.checked }))}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                        <span className="text-xs text-gray-500 font-medium">Same as business address</span>
                      </label>
                    </div>
                    {!businessForm.warehouseSameAsBusiness && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <input type="text" value={businessForm.warehouseAddress.pinCode} maxLength={6} disabled={!isEditable}
                              onChange={e => {
                                const pin = e.target.value.replace(/\D/g, "");
                                setBusinessForm(p => ({ ...p, warehouseAddress: { ...p.warehouseAddress, pinCode: pin } }));
                                if (pin.length === 6) setTimeout(() => fetchPinDetails(pin, "warehouse"), 500);
                              }}
                              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="PIN Code" />
                            {warehousePinLoading && <p className="text-xs text-blue-500 mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Fetching...</p>}
                          </div>
                          <input type="text" value={businessForm.warehouseAddress.city} readOnly className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50" placeholder="City" />
                          <input type="text" value={businessForm.warehouseAddress.state} readOnly className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50" placeholder="State" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                          <input type="text" value={businessForm.warehouseAddress.addressLine1} disabled={!isEditable}
                            onChange={e => setBusinessForm(p => ({ ...p, warehouseAddress: { ...p.warehouseAddress, addressLine1: e.target.value } }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="Address Line 1" />
                          <input type="text" value={businessForm.warehouseAddress.addressLine2} disabled={!isEditable}
                            onChange={e => setBusinessForm(p => ({ ...p, warehouseAddress: { ...p.warehouseAddress, addressLine2: e.target.value } }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="Address Line 2" />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Support Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Support Email</label>
                      <input type="email" value={businessForm.supportEmail} disabled={!isEditable}
                        onChange={e => setBusinessForm(p => ({ ...p, supportEmail: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="support@yourshop.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Support Phone</label>
                      <input type="tel" value={businessForm.supportPhone} disabled={!isEditable}
                        onChange={e => setBusinessForm(p => ({ ...p, supportPhone: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="+91 XXXXX XXXXX" />
                    </div>
                  </div>

                  {/* Document Uploads */}
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                       <Upload className="w-4 h-4" /> Business Documents
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Shop Logo */}
                      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 transition-all hover:border-blue-300 group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm overflow-hidden text-gray-300">
                              {logoFile ? <img src={URL.createObjectURL(logoFile)} alt="Logo Preview" className="w-full h-full object-cover" /> : <Store className="w-8 h-8 opacity-20" />}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Shop Logo / Image *</h4>
                              <p className="text-[11px] text-gray-500 mt-0.5">Recommended 512x512px (JPG, PNG)</p>
                            </div>
                          </div>
                          <label className="cursor-pointer bg-white px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm active:scale-95">
                            {logoFile ? "Change Image" : "Select Image"}
                            <input type="file" className="hidden" accept="image/*" onChange={e => { setLogoFile(e.target.files[0]); setFieldErrors(p => ({ ...p, logo: "" })); }} disabled={!isEditable} />
                          </label>
                        </div>
                        {fieldErrors.logo && <p className="text-xs text-red-500 mt-3 font-medium flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> {fieldErrors.logo}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Identity Document */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-200 transition-colors">
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                <Shield className="w-5 h-5" />
                              </div>
                              <h4 className="text-sm font-bold text-gray-900">Identity Doc *</h4>
                            </div>
                            <label className="cursor-pointer w-full py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-center text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition">
                              {identityFile ? identityFile.name : "Select Identity File"}
                              <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={e => { setIdentityFile(e.target.files[0]); setFieldErrors(p => ({ ...p, identity: "" })); }} disabled={!isEditable} />
                            </label>
                          </div>
                          {fieldErrors.identity && <p className="text-xs text-red-500 mt-2">{fieldErrors.identity}</p>}
                        </div>

                        {/* GST Bill */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-200 transition-colors">
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                <FileText className="w-5 h-5" />
                              </div>
                              <h4 className="text-sm font-bold text-gray-900">GST Bill <span className="text-gray-400 font-normal">(Optional)</span></h4>
                            </div>
                            <label className="cursor-pointer w-full py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-center text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition">
                              {gstFile ? gstFile.name : "Select GST Document"}
                              <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={e => setGstFile(e.target.files[0])} disabled={!isEditable} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isEditable && (
                    <button onClick={handleSaveStep2} disabled={saving}
                      className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2">
                      {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Business Details"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ═══ STEP 3: BANK ═══ */}
            {activeStep === 3 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2"><Landmark className="w-5 h-5" /> Bank Account</h2>
                <p className="text-sm text-gray-500 mb-6">Add your bank account for payouts</p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Account Holder Name *</label>
                    <input type="text" value={bankForm.bankAccountHolder} disabled={!isEditable}
                      onChange={e => setBankForm(p => ({ ...p, bankAccountHolder: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="As per bank records" />
                    {fieldErrors.holder && <p className="text-xs text-red-500 mt-1">{fieldErrors.holder}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Account Number *</label>
                      <input type="password" value={bankForm.bankAccountNumber} disabled={!isEditable}
                        onChange={e => setBankForm(p => ({ ...p, bankAccountNumber: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono" placeholder="Enter account number" />
                      {fieldErrors.accNo && <p className="text-xs text-red-500 mt-1">{fieldErrors.accNo}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Confirm Account Number *</label>
                      <div className="relative">
                        <input type="text" value={bankForm.confirmAccountNumber} disabled={!isEditable}
                          onChange={e => setBankForm(p => ({ ...p, confirmAccountNumber: e.target.value }))}
                          className={`w-full px-4 py-2.5 border rounded-lg text-sm font-mono pr-10 ${accountMatch ? "border-green-400" : accountMismatch ? "border-red-400" : "border-gray-200"}`}
                          placeholder="Re-enter account number" />
                        {accountMatch && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />}
                        {accountMismatch && <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />}
                      </div>
                      {fieldErrors.confirmAcc && <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmAcc}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">IFSC Code *</label>
                      <input type="text" value={bankForm.bankIfscCode} maxLength={11} disabled={!isEditable}
                        onChange={e => {
                          const val = e.target.value.toUpperCase();
                          setBankForm(p => ({ ...p, bankIfscCode: val }));
                          if (val.length === 11) fetchIfscDetails(val);
                        }}
                        className={`w-full px-4 py-2.5 border rounded-lg text-sm font-mono uppercase ${fieldErrors.ifsc ? "border-red-400" : "border-gray-200"}`}
                        placeholder="e.g. SBIN0001234" />
                      {ifscLoading && <p className="text-xs text-blue-500 mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Fetching bank details...</p>}
                      {fieldErrors.ifsc && <p className="text-xs text-red-500 mt-1">{fieldErrors.ifsc}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Bank Name</label>
                      <input type="text" value={bankForm.bankName} readOnly className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50" placeholder="Auto-filled" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Branch</label>
                      <input type="text" value={bankForm.bankBranch} readOnly className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50" placeholder="Auto-filled" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Account Type *</label>
                    <select value={bankForm.bankAccountType} disabled={!isEditable}
                      onChange={e => setBankForm(p => ({ ...p, bankAccountType: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white">
                      <option value="">Select type</option>
                      <option value="Savings">Savings</option>
                      <option value="Current">Current</option>
                    </select>
                    {fieldErrors.accType && <p className="text-xs text-red-500 mt-1">{fieldErrors.accType}</p>}
                  </div>

                  {isEditable && (
                    <button onClick={handleSaveStep3} disabled={saving}
                      className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2">
                      {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Bank Details"}
                    </button>
                  )}
                </div>

                {/* Submit for Review */}
                {profile?.step2Completed && profile?.step3Completed && isEditable && status !== "submitted" && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <button onClick={handleSubmitReview} disabled={saving}
                      className="w-full py-4 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                      <Send className="w-4 h-4" /> Submit for Review
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-2">Once submitted, you won't be able to edit until reviewed</p>
                  </div>
                )}
              </div>
            )}

            {/* Category Management (for active sellers) */}
            {status === "active" && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Tag className="w-4 h-4" /> Approved Categories</h3>
                  <button onClick={() => setShowCategoryRequest(true)}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Request New
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile?.sellerCategories?.map(cat => (
                    <span key={cat} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold border border-green-200">{cat}</span>
                  ))}
                </div>

                {/* Pending requests */}
                {profile?.categoryRequests?.filter(r => r.status === "pending").length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-500 mb-2">Pending Requests</p>
                    {profile.categoryRequests.filter(r => r.status === "pending").map((r, i) => (
                      <div key={i} className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-700">{r.category}</span>
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-bold">Pending</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Category Request Modal */}
                {showCategoryRequest && (
                  <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Request New Category</h3>
                      <select value={newCategoryRequest.category} onChange={e => setNewCategoryRequest(p => ({ ...p, category: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm mb-3 bg-white">
                        <option value="">Select category</option>
                        {ALL_CATEGORIES.filter(c => !profile?.sellerCategories?.includes(c)).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <textarea value={newCategoryRequest.reason} onChange={e => setNewCategoryRequest(p => ({ ...p, reason: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm resize-none" rows={3} placeholder="Why do you need this category?" />
                      <div className="flex gap-3 mt-4">
                        <button onClick={() => setShowCategoryRequest(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium">Cancel</button>
                        <button onClick={handleRequestCategory} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold">Submit Request</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      <OtpModal isOpen={showOtpModal} onClose={() => setShowOtpModal(false)} email={userData?.email} onVerified={fetchData} />

      {/* Update Password Modal */}
      <UpdatePassword />

      {/* Delete Account Modal */}
      <DeleteModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} />

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

export default SellerProfile;
