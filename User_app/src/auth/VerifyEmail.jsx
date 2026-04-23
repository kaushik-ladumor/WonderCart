import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Mail, Shield, Clock, CheckCircle, X, Loader2, ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { API_URL } from "../utils/constants";

function VerifyEmail({ isOpen, onClose, email }) {
  const navigate = useNavigate();
  const { authUser, setAuthUser, setToken, setRefreshToken } = useAuth();
  const [timer, setTimer] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState(email || "");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    if (email) setUserEmail(email);
    else if (authUser?.email) setUserEmail(authUser.email);
  }, [email, authUser]);

  useEffect(() => {
    if (!isOpen) return;
    setTimer(600);
    setCanResend(false);
    reset();
  }, [isOpen, reset]);

  useEffect(() => {
    if (isOpen && timer > 0 && !canResend) {
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [isOpen, timer, canResend]);

  const handleInputChange = (e, index) => {
    const value = e.target.value;
    if (value.length === 1 && index < 4) {
      const nextInput = document.getElementById(`digit${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const otp = `${data.digit1}${data.digit2}${data.digit3}${data.digit4}`;

      const res = await axios.post(`${API_URL}/user/verify`, {
        verificationCode: otp,
      });

      if (res.data) {
        toast.success("Email verified successfully!");

        if (res.data.user) {
          localStorage.setItem("Users", JSON.stringify(res.data.user));
          setAuthUser(res.data.user);

          if (res.data.token) {
            localStorage.setItem("token", res.data.token);
            setToken(res.data.token);
          }
          if (res.data.refreshToken) {
            localStorage.setItem("refreshToken", res.data.refreshToken);
            setRefreshToken(res.data.refreshToken);
          }

          reset();
          onClose();

          const currentPath = window.location.pathname;
          if (currentPath === "/signup" || currentPath === "/") {
            setTimeout(() => {
              const role = res.data.user.role;
              if (role === "seller") navigate("/seller/dashboard");
              else if (role === "admin") navigate("/admin");
              else navigate("/");
            }, 800);
          }
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
      reset();
      document.getElementById("digit1")?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      setLoading(true);
      await axios.post(`${API_URL}/user/resend-code`, { email: userEmail });
      toast.success("New OTP sent!");
      setTimer(600);
      setCanResend(false);
      reset();
      document.getElementById("digit1")?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

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
            Account Security
          </p>
          <h3 className="text-[1.3rem] font-semibold text-[#11182d]">
            Verify Email
          </h3>
          <p className="text-[0.76rem] text-[#6d7892] mt-1.5 mb-5 leading-relaxed">
            We've sent a 4-digit code to help protect your account.
          </p>
        </div>

        <div className="mx-6 mb-2 p-3.5 bg-[#eef2ff] rounded-[16px] border border-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-white flex items-center justify-center text-[#0f49d7] shadow-sm">
              <Mail className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-[#6d7892] font-bold uppercase tracking-wider">Recipient</p>
              <p className="text-[0.78rem] font-semibold text-[#11182d] truncate">
                {userEmail}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-6 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#6d7892] mb-3 block text-center">
                Verification Code
              </label>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4].map((digit) => (
                  <input
                    key={digit}
                    id={`digit${digit}`}
                    type="text"
                    maxLength="1"
                    className={`w-12 h-12 text-center text-[1rem] font-bold rounded-[14px] transition-all border-2 ${
                      errors[`digit${digit}`]
                        ? "border-red-500 bg-white"
                        : "border-transparent bg-[#f8f9fd] text-[#11182d] focus:border-[#0f49d7] focus:bg-white focus:ring-4 focus:ring-[#0f49d7]/10"
                    } ${loading ? "opacity-50" : ""}`}
                    disabled={loading}
                    {...register(`digit${digit}`, {
                      required: true,
                      pattern: /^[0-9]$/,
                      onChange: (e) => handleInputChange(e, digit),
                    })}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !e.target.value && digit > 1) {
                        document.getElementById(`digit${digit - 1}`)?.focus();
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#6d7892]">
              <Clock className="w-3.5 h-3.5 text-[#0f49d7]" />
              <span>Expires in</span>
              <span className="text-[#11182d]">{formatTime(timer)}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0f49d7] text-white font-semibold rounded-[14px] h-11 text-[0.78rem] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <>Confirm Verification <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <div className="text-center">
              <p className="text-[10px] font-bold text-[#6d7892] uppercase tracking-widest mb-2">
                Didn't receive code?
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend || loading}
                className={`text-[10px] font-black uppercase tracking-[0.15em] ${
                  canResend ? "text-[#0f49d7] hover:underline" : "text-[#b3bdd2] cursor-not-allowed"
                }`}
              >
                {canResend ? "Resend Code" : `Wait ${formatTime(timer)}`}
              </button>
            </div>
          </form>
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
              <span className="text-[9px] font-bold uppercase tracking-[0.12em]">INSTANT</span>
            </div>
            <div className="w-px h-3 bg-[#d7dcea]"></div>
            <div className="flex items-center gap-1.5 text-[#5d6a84]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0f49d7]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.12em]">VERIFIED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
