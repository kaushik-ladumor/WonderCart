import { Lock, Eye, EyeOff, X, CheckCircle2, Mail, RefreshCw, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../utils/constants";
import { sendEmail } from "../utils/emailService";

function ResetPassword({ email }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const hiddenInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");

  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Timer countdown - 5 minutes
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index, e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value[value.length - 1]; // take the last character typed
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3 && inputRefs[index + 1].current) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs[index - 1].current) {
      inputRefs[index - 1].current.focus();
    }
  };

  // Focus first input when modal opens
  useEffect(() => {
    const modal = document.getElementById("reset_modal");
    if (modal) {
      const handleOpen = () => {
        setTimeout(() => {
          setTimer(300); // Reset to 5 minutes
          setCanResend(false);
          if (inputRefs[0].current) {
            inputRefs[0].current.focus();
          }
        }, 100);
      };

      modal.addEventListener("shown", handleOpen);
      return () => modal.removeEventListener("shown", handleOpen);
    }
  }, []);

  const handleResendCode = async () => {
    if (!email) return;
    try {
      setResending(true);
      const response = await axios.post(`${API_URL}/user/forget-password`, {
        email: email,
      });

      if (response.data.success) {
        toast.success("Verification code resent successfully!");
        setOtp(["", "", "", ""]);
        setTimer(300);
        setCanResend(false);

        if (response.data.verificationCode) {
          sendEmail({
            to_email: email,
            type: "forgotPassword",
            data: { verificationCode: response.data.verificationCode },
          }).catch((err) => console.error("EmailJS Error:", err));
        }

        if (inputRefs[0].current) {
          inputRefs[0].current.focus();
        }
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to resend verification code"
      );
    } finally {
      setResending(false);
    }
  };

  const onSubmit = async (data) => {
    const otpString = otp.join("");
    
    if (otpString.length !== 4) {
      toast.error("Please enter all 4 digits of the verification code");
      if (inputRefs[0].current) inputRefs[0].current.focus();
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/user/reset-password`,
        {
          email: email,
          verificationCode: otpString,
          newPassword: data.newPassword,
        },
      );

      if (response.data.success) {
        toast.success(response.data.message);
        document.getElementById("reset_modal")?.close();

        setTimeout(() => {
          document.getElementById("success_modal")?.showModal();
        }, 300);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
      focusHiddenInput();
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    if (!loading) {
      document.getElementById("reset_modal")?.close();
    }
  };

  return (
    <>
      {/* Reset Password Modal */}
      <dialog id="reset_modal" className="modal">
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl w-full max-w-sm mx-auto shadow-[0_20px_60px_-15px_rgba(20,27,45,0.06)] relative animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-6 pt-6 pb-2 text-center relative">
              <button
                onClick={closeModal}
                disabled={loading}
                className="absolute right-4 top-4 p-1.5 hover:bg-[#f8f9fc] rounded-full disabled:opacity-50 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4 text-[#6d7892]" />
              </button>
              <h3 className="text-[1.3rem] font-semibold text-[#11182d] tracking-tight">
                Reset Password
              </h3>
              <p className="text-[0.84rem] text-[#6d7892] mt-1 mb-2">
                Enter code and set new password
              </p>
            </div>

            <div className="px-6 py-2">



          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Verification Code - Visual Boxes */}
            <div>
              <label className="block text-[0.84rem] font-semibold text-[#25324d] mb-2 text-center">
                Verification Code
              </label>

              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[index]}
                    onChange={(e) => handleOtpChange(index, e)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className={`w-14 h-14 text-center border rounded-xl text-[1.2rem] font-bold transition-all outline-none ${
                        otp[index]
                          ? "border-[#0f49d7] ring-1 ring-[#0f49d7] bg-[#f8f9fc] text-[#0f49d7]"
                          : "border-[#d9deeb] bg-white text-[#11182d]"
                      } ${errors.otp ? "border-red-500" : ""} ${
                        loading ? "bg-[#f8f9fc] cursor-not-allowed" : "focus-within:border-[#0f49d7] focus-within:ring-1 focus-within:ring-[#0f49d7]"
                      }`}
                    disabled={loading}
                  />
                ))}
              </div>

              <div className="flex flex-col items-center justify-between mt-4 gap-2 border-t border-[#f8f9fc] pt-4">
                <div className="flex items-center gap-2 text-[0.76rem] font-semibold text-[#5c6880] uppercase tracking-widest">
                  <Clock className="w-3.5 h-3.5 text-[#0f49d7]" />
                  <span>Expires in:</span>
                  <span className="text-[#11182d] font-bold">{formatTime(timer)}</span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[0.76rem] font-medium text-[#6d7892]">
                    Didn't receive code?
                  </span>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={!canResend || resending || loading}
                    className="text-[0.76rem] font-semibold text-[#0f49d7] hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1.5 transition-all outline-none"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                    {resending ? "Sending..." : "Resend Code"}
                  </button>
                </div>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[0.84rem] font-semibold text-[#25324d] mb-1.5 ml-1">
                New Password
              </label>
              <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-[#d9deeb] focus-within:border-[#0f49d7] focus-within:ring-1 focus-within:ring-[#0f49d7] transition-all">
                <Lock className="w-4.5 h-4.5 text-[#6d7892]" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="bg-transparent flex-1 text-[0.88rem] text-[#11182d] outline-none placeholder:text-[#94a3b8]"
                  disabled={loading}
                  {...register("newPassword", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Min 8 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#6d7892] hover:text-[#11182d] transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-[0.76rem] mt-1.5 ml-1 font-semibold">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[0.84rem] font-semibold text-[#25324d] mb-1.5 ml-1">
                Confirm Password
              </label>
              <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-[#d9deeb] focus-within:border-[#0f49d7] focus-within:ring-1 focus-within:ring-[#0f49d7] transition-all">
                <Lock className="w-4.5 h-4.5 text-[#6d7892]" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="bg-transparent flex-1 text-[0.88rem] text-[#11182d] outline-none placeholder:text-[#94a3b8]"
                  disabled={loading}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === newPassword || "Passwords don't match",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-[#6d7892] hover:text-[#11182d] transition-colors"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-[0.76rem] mt-1.5 ml-1 font-semibold">
                  {errors.confirmPassword.message}
                </p>
              )}
              {!errors.confirmPassword &&
                newPassword &&
                confirmPassword &&
                newPassword === confirmPassword && (
                  <div className="flex items-center gap-1.5 text-[#16a34a] text-[0.76rem] font-semibold mt-1.5 ml-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Passwords match
                  </div>
                )}
            </div>

            {/* Reset Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0f49d7] text-white font-semibold rounded-[14px] h-11 text-[0.88rem] hover:bg-[#003da3] transition-colors mt-4 disabled:opacity-50 shadow-sm disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Resetting...
                </div>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-4 pb-2 text-center text-[0.76rem] font-semibold text-[#6d7892] flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> Encrypted & Secured
          </div>
          
            </div>
          </div>
        </div>
      </dialog>

      {/* Success Modal */}
      <dialog id="success_modal" className="modal">
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl w-full max-w-sm mx-auto shadow-[0_20px_60px_-15px_rgba(20,27,45,0.06)] relative animate-in zoom-in-95 duration-300 p-8 text-center flex flex-col items-center">
            
            <div className="w-14 h-14 bg-[#e8f5e9] rounded-full flex items-center justify-center mb-5">
              <CheckCircle2 className="w-7 h-7 text-[#16a34a]" />
            </div>

            <h3 className="text-[1.3rem] font-semibold text-[#11182d] tracking-tight mb-2">
              Password Reset Complete!
            </h3>
            <p className="text-[0.84rem] text-[#6d7892] mb-6">
              Your password has been successfully reset. You can now login with your new profile details.
            </p>

            <button
              onClick={() => {
                document.getElementById("success_modal")?.close();
                document.getElementById("login_modal")?.showModal();
              }}
              className="w-full bg-[#0f49d7] text-white font-semibold rounded-[14px] h-11 text-[0.88rem] hover:bg-[#003da3] transition-colors mb-2"
            >
              Go to Login
            </button>

            <button
              onClick={() => document.getElementById("success_modal")?.close()}
              className="w-full bg-[#f8f9fc] border border-[#d9deeb] text-[#25324d] font-semibold rounded-[14px] h-11 text-[0.88rem] hover:bg-[#edf2ff] transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

export default ResetPassword;
