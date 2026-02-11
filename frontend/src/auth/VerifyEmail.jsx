import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Mail, Shield, Clock, CheckCircle, X } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { API_URL } from "../utils/constants";

function VerifyEmail({ modalId = "verify_email_modal" }) {
  const navigate = useNavigate();
  const { authUser } = useAuth();
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
          localStorage.setItem("token", res.data.token);
        }

        const modal = document.getElementById(modalId);
        if (modal) modal.close();

        reset();

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
      await axios.post(`${API_URL}/user/resend-otp`);

      toast.success("New OTP sent to your email!");
      setTimer(600); // Reset to 10 minutes
      setCanResend(false);
      reset();

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
    <dialog id={modalId} className="modal">
      <div className="modal-box max-w-md p-5 bg-white rounded-lg shadow-xl border border-gray-200">
        {/* Header - Login modal style */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Verify Email</h3>
            <p className="text-gray-600 text-xs mt-0.5">
              Enter the 4-digit code sent to your email
            </p>
          </div>
          <button
            onClick={closeModal}
            disabled={loading}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Icon and Email Display */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-3">
            <Shield className="w-6 h-6 text-white" />
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">
              Verification code sent to
            </p>
            <div className="flex items-center justify-center gap-1.5">
              <Mail className="w-4 h-4 text-gray-500" />
              <p className="text-sm font-medium text-gray-900">{userEmail}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* OTP Inputs - Updated styling */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-3 text-center">
              Enter 4-digit code
            </label>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4].map((digit) => (
                <input
                  key={digit}
                  id={`digit${digit}`}
                  type="text"
                  maxLength="1"
                  className={`w-12 h-12 text-center text-xl font-bold border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900 ${errors[`digit${digit}`]
                      ? "border-red-500"
                      : "border-gray-300"
                    } ${loading ? "bg-gray-100" : ""}`}
                  disabled={loading}
                  {...register(`digit${digit}`, {
                    required: true,
                    pattern: /^[0-9]$/,
                    onChange: (e) => handleInputChange(e, digit),
                  })}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !e.target.value && digit > 1) {
                      const prevInput = document.getElementById(
                        `digit${digit - 1}`,
                      );
                      if (prevInput) prevInput.focus();
                    }
                  }}
                />
              ))}
            </div>
            {(errors.digit1 ||
              errors.digit2 ||
              errors.digit3 ||
              errors.digit4) && (
                <p className="text-red-600 text-xs mt-2 text-center">
                  Please enter all 4 digits correctly
                </p>
              )}
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 mb-4 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Code expires in</span>
            <span className="font-medium text-gray-900">
              {formatTime(timer)}
            </span>
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2.5 rounded-md font-medium hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm mb-4"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Verifying...
              </div>
            ) : (
              "Verify Email"
            )}
          </button>

          {/* Resend Code */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600 text-sm mb-2">
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend || loading}
              className={`text-sm font-medium ${canResend ? "text-black hover:underline" : "text-gray-400 cursor-not-allowed"} disabled:text-gray-400 disabled:cursor-not-allowed`}
            >
              {canResend
                ? "Resend Code"
                : `Resend available in ${formatTime(timer)}`}
            </button>
          </div>
        </form>

        {/* Security Note */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Verification ensures secure access to your account</span>
          </div>
        </div>
      </div>

      {/* Modal backdrop */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={closeModal} disabled={loading}>
          close
        </button>
      </form>
    </dialog>
  );
}

export default VerifyEmail;
