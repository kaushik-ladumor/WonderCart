import { Mail, Send, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import ResetPassword from "./ResetPassword";

function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:4000/user/forget-password",
        data,
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setUserEmail(data.email);

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
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white flex items-center justify-center px-2 py-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {/* Header Section */}
            <div className="px-4 py-6 text-center border-b border-gray-200">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-black mb-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Forgot Password?
              </h1>
              <p className="text-gray-600 text-sm">
                Enter your email and we'll send you a code to reset your
                password
              </p>
            </div>

            {/* Form Section */}
            <div className="px-6 py-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="yourname@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition text-black text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending Code...
                    </>
                  ) : (
                    <>
                      Send Verification Code
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Back to Login */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <a
                    href="/"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-black transition-colors"
                  >
                    {/* <ArrowLeft className="w-4 h-4" /> */}
                    Back to Login
                  </a>
                </div>
              </form>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-center text-xs text-gray-500 mt-6">
            Check your spam folder if you don't receive the email
          </p>
        </div>
      </div>

      {/* Reset Password Modal */}
      <ResetPassword email={userEmail} />
    </>
  );
}

export default ForgotPassword;
