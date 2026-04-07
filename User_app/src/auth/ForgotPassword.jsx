import { Mail, Send, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { sendEmail } from "../utils/emailService";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import ResetPassword from "./ResetPassword";
import { API_URL } from "../utils/constants";

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
          <Link to="/" className="font-display text-[1.2rem] font-extrabold tracking-tight text-[#141b2d] hover:opacity-80 transition-opacity">
            WonderCart
          </Link>
          <button onClick={() => toast.info("Support coming soon")} className="flex items-center gap-2 text-[10px] font-semibold text-[#004ac6] bg-white border border-[#e1e8fd] shadow-sm px-4 py-2.5 rounded-full hover:bg-[#f0f4ff] transition-colors tracking-wide">
            <div className="w-[14px] h-[14px] rounded-full bg-[#004ac6] text-white flex items-center justify-center font-black text-[9px] pt-[1px]">?</div>
            Support
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
              <div className="w-14 h-14 bg-[#f0f4ff] rounded-full flex items-center justify-center mb-6">
                <Mail className="w-6 h-6 text-[#004ac6]" strokeWidth={2.5} fill="#004ac6" fillOpacity={0.2} />
              </div>

              {/* Title & Subtitle */}
              <h1 className="font-display text-[1.2rem] font-extrabold text-[#141b2d] mb-2 tracking-tight">
                Forgot Password?
              </h1>
              <p className="text-[#5c6880] text-[0.78rem] mb-6 leading-relaxed">
                Enter your email to reset your password.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="w-full text-left space-y-5">
                {/* Email Input */}
                <div>
                  <label className="block text-[10px] font-semibold text-[#5c6880] uppercase tracking-[0.15em] mb-2 ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" strokeWidth={2.5} />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      className={`w-full pl-11 pr-4 py-3.5 bg-[#f0f4ff] border border-transparent rounded-xl text-[#141b2d] text-[0.78rem] font-medium placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6]/30 transition-all ${
                        errors.email ? "focus:ring-red-500/20 focus:border-red-500/30 ring-1 ring-red-500/50 bg-[#fff5f5]" : ""
                      } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
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
                    <p className="text-red-500 text-[10px] mt-1.5 ml-1 font-medium">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#185EE0] text-white py-4 rounded-xl font-display font-semibold text-[0.78rem] hover:bg-[#144fbc] focus:ring-4 focus:ring-[#185EE0]/20 transition-all outline-none shadow-md shadow-[#185EE0]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
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
                <p className="text-[#5c6880] text-[0.74rem] font-medium">
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      const m = document.getElementById("login_modal");
                      if (m) m.showModal();
                    }}
                    className="text-[#185EE0] font-semibold hover:underline"
                  >
                    Login here
                  </button>
                </p>
              </div>

              {/* Security Note */}
              <div className="mt-6">
                <div className="inline-flex items-center gap-2 bg-[#f0fdf4] text-[#166534] px-4 py-2 rounded-full text-[9px] font-semibold uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-[#16a34a] rounded-full opacity-80" />
                  Secure Process
                </div>
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
