import { Mail, Send, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { sendEmail } from "../utils/emailService";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import ResetPassword from "./ResetPassword";
import { API_URL } from "../utils/constants";
import Logo from "../components/Logo";

function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/user/forget-password`,
        data,
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setUserEmail(data.email);

        // Send Forgot Password Email via EmailJS
        if (response.data.verificationCode) {
          sendEmail({
            to_email: data.email,
            type: "forgotPassword",
            data: { verificationCode: response.data.verificationCode }
          }).catch(err => console.error("EmailJS Error:", err));
        }

        setTimeout(() => {
          const modal = document.getElementById("reset_modal");
          if (modal) {
            modal.showModal();
          }
        }, 600);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#f9f9ff] flex flex-col relative font-body selection:bg-blue-100 selection:text-blue-900 overflow-hidden">

        {/* Minimal Auth Header */}
        <div className="absolute top-0 left-0 w-full p-6 sm:p-10 flex justify-between items-center z-10">
          <Logo />
          <button onClick={() => toast.info("Support coming soon")} className="text-[0.82rem] font-semibold text-[#0f49d7] px-4 py-2 hover:bg-[#f8f9fc] rounded-xl transition-colors">
            Help & Support
          </button>
        </div>

        {/* Soft Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#004ac6]/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4 z-10">
          <div className="w-full max-w-[440px]">
            {/* Card Container */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(20,27,45,0.06)] border border-white/80 text-center flex flex-col items-center relative">

              {/* Header Icon */}
              <div className="w-14 h-14 bg-[#edf2ff] rounded-full flex items-center justify-center mb-6">
                <Mail className="w-6 h-6 text-[#0f49d7]" />
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-[1.5rem] font-semibold text-[#11182d] mb-1 tracking-tight">
                Forgot Password?
              </h1>
              <p className="text-[#6d7892] text-[0.84rem] mb-6">
                Enter your email to reset your password.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="w-full text-left space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-[0.84rem] font-semibold text-[#25324d] mb-1.5 ml-1">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-[#d9deeb] focus-within:border-[#0f49d7] focus-within:ring-1 focus-within:ring-[#0f49d7] transition-all">
                    <Mail className="w-4.5 h-4.5 text-[#6d7892]" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      className={`bg-transparent flex-1 text-[0.88rem] text-[#11182d] outline-none placeholder:text-[#94a3b8] ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                      disabled={loading}
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                          message: "Invalid email address",
                        },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-[0.76rem] mt-1.5 ml-1 font-semibold">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0f49d7] text-white font-semibold rounded-[14px] h-11 text-[0.88rem] hover:bg-[#003da3] transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-6">
                <p className="text-[#6d7892] text-[0.88rem]">
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      const m = document.getElementById("login_modal");
                      if (m) m.showModal();
                    }}
                    className="text-[#0f49d7] font-semibold hover:underline"
                  >
                    Login here
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Auth Footer */}
        <div className="w-full text-center pb-8 z-10 pt-4">
          <p className="text-[10px] font-semibold text-[#b0b8c9] uppercase tracking-[0.2em]">
            © WONDERCART CURATED COMMERCE 2024
          </p>
        </div>
      </div>

      {/* Reset Password Modal */}
      <ResetPassword email={userEmail} />
    </>
  );
}

export default ForgotPassword;
