import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Mail, Shield, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthProvider"; // Import your auth context

function VerifyEmail({ modalId = "verify_email_modal" }) {
  const navigate = useNavigate();
  const { authUser } = useAuth(); // Get auth user from context
  const [timer, setTimer] = useState(600);
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
      // Try to get email from auth context first
      if (authUser?.email) {
        setUserEmail(authUser.email);
        return;
      }

      // Try to get email from localStorage
      const storedUser = JSON.parse(localStorage.getItem("Users"));
      if (storedUser?.email) {
        setUserEmail(storedUser.email);
        return;
      }

      // Try to get email from signup response
      const signupData = JSON.parse(localStorage.getItem("signupData"));
      if (signupData?.email) {
        setUserEmail(signupData.email);
        return;
      }

      // Default fallback
      setUserEmail("your registered email");
    };

    getEmail();
  }, [authUser]);

  // Timer countdown
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

  // Auto-focus first input when modal opens
  useEffect(() => {
    const modal = document.getElementById(modalId);
    if (modal) {
      const handleOpen = () => {
        setTimeout(() => {
          const firstInput = document.getElementById("digit1");
          if (firstInput) firstInput.focus();
        }, 100);
      };

      modal.addEventListener("shown", handleOpen);
      return () => modal.removeEventListener("shown", handleOpen);
    }
  }, [modalId]);

  // Handle OTP input navigation
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

      const res = await axios.post("http://localhost:4000/user/verify", {
        verificationCode: otp,
      });
      console.log(res);

      if (res.data) {
        toast.success("Email verified successfully!");

        // Store user data if returned
        if (res.data.user) {
          localStorage.setItem("Users", JSON.stringify(res.data.user));
          localStorage.setItem("token", res.data.token);
        }

        // Close modal
        const modal = document.getElementById(modalId);
        if (modal) modal.close();

        // Reset form
        reset();

        // Redirect based on role
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
      await axios.post("http://localhost:4000/user/resend-otp");

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

  return (
    <dialog id={modalId} className="modal">
      <div className="modal-box bg-white border border-black max-w-md p-0 overflow-hidden rounded-none">
        {/* Modal Header */}
        <div className="p-6 pb-4">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 text-gray-500 hover:text-black hover:bg-gray-100 border-none">
              ✕
            </button>
          </form>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-black to-gray-800 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-black text-black mb-2 text-center tracking-tight">
            VERIFY EMAIL
          </h3>

          {/* Divider */}
          <div className="h-1 w-12 bg-black mx-auto mb-4"></div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-1 text-center">
            We've sent a 4-digit verification code to
          </p>
          <p className="text-black font-bold text-sm mb-4 text-center flex items-center justify-center gap-1">
            <Mail className="w-3 h-3" />
            {userEmail}
          </p>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* OTP Inputs */}
            <div className="mb-6">
              <div className="flex justify-center gap-3 mb-2">
                {[1, 2, 3, 4].map((digit) => (
                  <input
                    key={digit}
                    id={`digit${digit}`}
                    type="text"
                    maxLength="1"
                    className="w-14 h-14 text-center text-3xl font-black border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-0 text-black bg-transparent"
                    {...register(`digit${digit}`, {
                      required: true,
                      pattern: /^[0-9]$/,
                      onChange: (e) => handleInputChange(e, digit),
                    })}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Backspace" &&
                        !e.target.value &&
                        digit > 1
                      ) {
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
                <p className="text-red-600 text-xs text-center font-medium">
                  Please enter all 4 digits correctly
                </p>
              )}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 font-bold text-sm tracking-wider hover:bg-gray-900 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed border border-black mb-4 uppercase"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </span>
              ) : (
                "Verify Code"
              )}
            </button>

            {/* Timer and Resend */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Code expires in</span>
                <span className="font-bold text-black">
                  {formatTime(timer)}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend || loading}
                  className={`font-bold text-sm ${canResend ? "text-black hover:underline" : "text-gray-400 cursor-not-allowed"} disabled:text-gray-400 disabled:cursor-not-allowed`}
                >
                  {canResend ? "Resend Code" : "Wait to resend"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Success Note */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Verification ensures secure access to your account</span>
          </div>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

export default VerifyEmail;
