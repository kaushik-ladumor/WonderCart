import { Lock, Eye, EyeOff, X, Shield, Loader2, ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import { API_URL } from "../utils/constants";

function UpdatePassword({ isOpen, onClose }) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(true);
  const [hasPassword, setHasPassword] = useState(null);
  const { authUser, setAuthUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const newPassword = watch("newPassword");

  useEffect(() => {
    if (!isOpen) return;
    
    const checkHasPassword = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCheckingPassword(false);
        return;
      }

      try {
        setCheckingPassword(true);
        const response = await axios.get(`${API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setHasPassword(response.data.user.hasPassword);
        }
      } catch (err) {
        console.error("Error checking password status:", err);
        setHasPassword(true);
      } finally {
        setCheckingPassword(false);
      }
    };

    checkHasPassword();
  }, [isOpen]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const passwordData = { newPassword: data.newPassword };

      if (hasPassword && data.currentPassword) {
        passwordData.currentPassword = data.currentPassword;
      }

      const response = await axios.put(
        `${API_URL}/user/update-password`,
        passwordData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        reset();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const needsCurrentPassword = hasPassword === true;
  const isSettingNewPassword = hasPassword === false;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-[18px] w-full max-w-sm mx-auto relative max-h-[90vh] overflow-hidden flex flex-col border border-[#e1e5f1]">
        
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#6d7892] hover:bg-[#f8f9fb] transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-6 pt-7 pb-0 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6d7892] mb-1">
            {isSettingNewPassword ? "Secure Account" : "Safety First"}
          </p>
          <h3 className="text-[1.3rem] font-semibold text-[#11182d]">
            {isSettingNewPassword ? "Set Password" : "Update Password"}
          </h3>
          <p className="text-[0.76rem] text-[#6d7892] mt-1.5 mb-5 leading-relaxed">
            {isSettingNewPassword
              ? "Set a password to enable multi-method login."
              : "Regular password rotation is recommended for security."}
          </p>
        </div>

        <div className="px-6 py-4 space-y-5 overflow-y-auto">
          {checkingPassword ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#0f49d7]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6d7892]">Syncing Status...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {needsCurrentPassword && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6d7892] px-1 block text-left">
                    Current Password
                  </label>
                  <div className="relative bg-white rounded-[14px] px-3.5 py-2.5 border border-[#d7dcea] focus-within:border-[#0f49d7] focus-within:ring-1 focus-within:ring-[#0f49d7] transition-all flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#b3bdd2]" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      className="bg-transparent flex-1 text-[0.82rem] text-[#11182d] outline-none placeholder:text-[#b3bdd2]"
                      disabled={loading}
                      {...register("currentPassword", {
                        required: needsCurrentPassword && "Required",
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="text-[#b3bdd2] hover:text-[#11182d]"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6d7892] px-1 block text-left">
                  New Password
                </label>
                <div className="relative bg-white rounded-[14px] px-3.5 py-2.5 border border-[#d7dcea] focus-within:border-[#0f49d7] focus-within:ring-1 focus-within:ring-[#0f49d7] transition-all flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#b3bdd2]" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    className="bg-transparent flex-1 text-[0.82rem] text-[#11182d] outline-none placeholder:text-[#b3bdd2]"
                    disabled={loading}
                    {...register("newPassword", {
                      required: "Required",
                      minLength: { value: 8, message: "Min 8 chars" },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-[#b3bdd2] hover:text-[#11182d]"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-[10px] font-semibold ml-1">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6d7892] px-1 block text-left">
                  Confirm Password
                </label>
                <div className="relative bg-white rounded-[14px] px-3.5 py-2.5 border border-[#d7dcea] focus-within:border-[#0f49d7] focus-within:ring-1 focus-within:ring-[#0f49d7] transition-all flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#b3bdd2]" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Verify new password"
                    className="bg-transparent flex-1 text-[0.82rem] text-[#11182d] outline-none placeholder:text-[#b3bdd2]"
                    disabled={loading}
                    {...register("confirmPassword", {
                      required: "Required",
                      validate: (value) => value === newPassword || "Passwords don't match",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-[#b3bdd2] hover:text-[#11182d]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-[10px] font-semibold ml-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0f49d7] text-white font-semibold rounded-[14px] h-11 text-[0.78rem] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <>{isSettingNewPassword ? "Set Secure Password" : "Update Changes"} <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="px-6 py-4 bg-[#f4f6fb] mt-auto">
          <div className="flex items-center gap-4 justify-center">
            <div className="flex items-center gap-1.5 text-[#5d6a84]">
              <Shield className="w-3.5 h-3.5 text-[#0f7a32]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.12em]">SECURE</span>
            </div>
            <div className="w-px h-3 bg-[#d7dcea]"></div>
            <div className="flex items-center gap-1.5 text-[#5d6a84]">
              <Zap className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-[9px] font-bold uppercase tracking-[0.12em]">ARCHIVAL</span>
            </div>
            <div className="w-px h-3 bg-[#d7dcea]"></div>
            <div className="flex items-center gap-1.5 text-[#5d6a84]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0f49d7]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.12em]">ENCRYPTED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdatePassword;
