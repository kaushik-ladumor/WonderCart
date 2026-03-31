import { useForm } from "react-hook-form";
import { sendEmail } from "../utils/emailService";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Mail, Shield, Clock, CheckCircle, X } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { API_URL } from "../utils/constants";

function VerifyEmail({ modalId = "verify_email_modal" }) {
  const navigate = useNavigate();
  const { authUser, setAuthUser, setToken, setRefreshToken } = useAuth();
  const [timer, setTimer] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Get user email from various sources
  useEffect(() => {
    const getEmail = () => {
      if (authUser?.email) {
        setUserEmail(authUser.email);
        return;
      }

      const storedUser = JSON.parse(localStorage.getItem("Users"));
      if (storedUser?.email) {
        setUserEmail(storedUser.email);
        return;
      }

      const signupData = JSON.parse(localStorage.getItem("signupData"));
      if (signupData?.email) {
        setUserEmail(signupData.email);
        return;
      }

      const tempEmail = localStorage.getItem("tempUserEmail");
      if (tempEmail) {
        setUserEmail(tempEmail);
        return;
      }

      setUserEmail("your registered email");
    };

    getEmail();
  }, [authUser]);

  // Timer countdown - 10 minutes
  useEffect(() => {
    if (timer > 0 && !canResend) {
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
  }, [timer, canResend]);

  // Reset timer when modal opens
  useEffect(() => {
    const modal = document.getElementById(modalId);
    if (modal) {
      const handleOpen = () => {
        setTimer(600); // Reset to 10 minutes
        setCanResend(false);
        reset();
        setTimeout(() => {
          const firstInput = document.getElementById("digit1");
          if (firstInput) firstInput.focus();
        }, 100);
      };

      modal.addEventListener("shown", handleOpen);
      return () => modal.removeEventListener("shown", handleOpen);
    }
  }, [modalId, reset]);

  const handleInputChange = (e, index) => {
    const value = e.target.value;
    if (value.length === 1 && index < 4) {
      const nextInput = document.getElementById(`digit${index + 1}`);
      if (nextInput) nextInput.focus();
    } else if (e.key === "Backspace" && !value && index > 1) {
      const prevInput = document.getElementById(`digit${index - 1}`);
      if (prevInput) prevInput.focus();
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

          // Welcome email removed - not needed here

          const modal = document.getElementById(modalId);
          if (modal) modal.close();

          reset();

          // Only navigate if user is on signup page (not already logged in and browsing)
          // If they're verifying from profile, just close modal and stay on current page
          const currentPath = window.location.pathname;
          if (currentPath === "/signup" || currentPath === "/") {
            setTimeout(() => {
              const storedUser = JSON.parse(localStorage.getItem("Users"));
              if (!storedUser) {
                navigate("/");
                return;
              }

              const role = storedUser.role;
              if (role === "seller") navigate("/seller/dashboard");
              else if (role === "admin") navigate("/admin");
              else navigate("/");
            }, 800);
          }
          // If verifying from profile or other pages, just stay on current page
        }
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Verification failed. Please check the code.",
      );
      reset();
      const firstInput = document.getElementById("digit1");
      if (firstInput) firstInput.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/user/resend-code`, { email: userEmail }); // Correct endpoint & payload

      toast.success("New OTP sent to your email!");
      setTimer(600); // Reset to 10 minutes
      setCanResend(false);
      reset();

      // Send Resend Code Email via EmailJS
      if (res.data.verificationCode) {
        sendEmail({
          to_email: userEmail,
          type: "resendCode",
          data: { verificationCode: res.data.verificationCode }
        }).catch(err => console.error("EmailJS Error:", err));
      }

      const firstInput = document.getElementById("digit1");
      if (firstInput) firstInput.focus();
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

  const closeModal = () => {
    if (!loading) {
      const modal = document.getElementById(modalId);
      if (modal) modal.close();
    }
  };

  return (
    <dialog id={modalId} className="modal font-body shadow-none">
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
        <div className="bg-white rounded-2xl w-full max-w-sm mx-auto shadow-tonal-md relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
          
          {/* Close Button */}
          <button
            onClick={closeModal}
            disabled={loading}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#5c6880] hover:bg-[#f0f4ff] transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal header */}
          <div className="px-6 pt-6 pb-0 text-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#004ac6] font-semibold block mb-1">
              ACCOUNT SECURITY
            </span>
            <h3 className="font-display text-2xl font-bold text-[#141b2d]">
              Verify Email
            </h3>
            <p className="text-xs text-[#5c6880] mt-1 mb-5 leading-relaxed">
              We've sent a 4-digit verification code to help protect your account.
            </p>
          </div>

          {/* Email Display */}
          <div className="mx-6 mb-4 p-3 bg-[#f0f4ff] rounded-xl border border-transparent">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#004ac6] shadow-sm">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-[#5c6880] font-bold uppercase tracking-wider">Recipient</p>
                <p className="text-xs font-bold text-[#141b2d] truncate">
                  {userEmail}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* OTP Inputs */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[#5c6880] mb-3 block text-center">
                  Verification Code
                </label>
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4].map((digit) => (
                    <input
                      key={digit}
                      id={`digit${digit}`}
                      type="text"
                      maxLength="1"
                      className={`w-12 h-12 text-center text-lg font-bold rounded-xl transition-all border-2 ${
                        errors[`digit${digit}`]
                          ? "border-red-500 bg-white"
                          : "border-transparent bg-[#f0f4ff] text-[#141b2d] focus:border-[#004ac6] focus:bg-white focus:ring-4 focus:ring-[#004ac6]/10"
                      } ${loading ? "opacity-50" : ""}`}
                      disabled={loading}
                      {...register(`digit${digit}`, {
                        required: true,
                        pattern: /^[0-9]$/,
                        onChange: (e) => handleInputChange(e, digit),
                      })}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !e.target.value && digit > 1) {
                          const prevInput = document.getElementById(`digit${digit - 1}`);
                          if (prevInput) prevInput.focus();
                        }
                      }}
                    />
                  ))}
                </div>
                {(errors.digit1 || errors.digit2 || errors.digit3 || errors.digit4) && (
                  <p className="text-red-500 text-[10px] font-bold mt-2 text-center">Please enter a valid 4-digit code</p>
                )}
              </div>

              {/* Timer */}
              <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#5c6880]">
                <Clock className="w-3.5 h-3.5 text-[#004ac6]" />
                <span>Expires in</span>
                <span className="text-[#141b2d]">{formatTime(timer)}</span>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white font-bold rounded-xl h-12 text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-50"
              >
                {loading ? "VERIFYING..." : "CONFIRM VERIFICATION"}
              </button>

              {/* Resend Code */}
              <div className="text-center pt-2">
                <p className="text-[10px] font-medium text-[#5c6880] uppercase tracking-widest mb-2">
                  Didn't receive code?
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend || loading}
                  className={`text-[10px] font-black uppercase tracking-[0.15em] ${
                    canResend ? "text-[#004ac6] hover:underline" : "text-[#5c6880]/30 cursor-not-allowed"
                  } transition-colors`}
                >
                  {canResend
                    ? "Resend Code"
                    : `Wait ${formatTime(timer)}`}
                </button>
              </div>
            </form>
          </div>

          {/* Modal footer */}
          <div className="px-6 pb-6 pt-2 border-t border-[#f0f4ff] bg-gray-50/30">
            <div className="flex items-center gap-3 text-[#5c6880]">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#f0f4ff]">
                <Shield className="w-3.5 h-3.5 text-[#004ac6]" />
              </div>
              <span className="text-[10px] uppercase tracking-wider font-medium leading-tight">Your data is secured with end-to-end encryption protocols during transmission.</span>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export default VerifyEmail;
