import { Mail, Send, ArrowLeft } from "lucide-react";
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
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Forgot Password?
                  </h1>
                  <p className="text-gray-600 text-xs mt-0.5">
                    Enter your email to reset your password
                  </p>
                </div>
              </div>

              <div className="h-1 w-16 bg-black rounded-full"></div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm text-gray-900 placeholder-gray-500 bg-white ${errors.email ? "border-red-500" : "border-gray-300"
                      } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    disabled={loading}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value:
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "Invalid email address",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-2.5 rounded-md font-medium hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm mt-2"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending Code...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    Send Verification Code
                    <Send className="w-4 h-4" />
                  </div>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6 pt-5 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => document.getElementById("login_modal")?.showModal()}
                  className="text-black font-medium hover:underline bg-transparent border-none cursor-pointer"
                >
                  Login here
                </button>
              </p>
            </div>

            {/* Security Note */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <div className="w-4 h-4 flex items-center justify-center mt-0.5">
                  <div className="w-3 h-3 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Secure Process</p>
                  <p className="mt-0.5">
                    Your email is protected and we never share your information
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              Didn't receive the email?{" "}
              <button
                className="text-gray-700 hover:text-black transition-colors"
                onClick={() =>
                  toast.info(
                    "Please wait a few minutes before requesting another code",
                  )
                }
              >
                Check spam folder
              </button>
              {" • "}
              <button
                className="text-gray-700 hover:text-black transition-colors"
                onClick={() =>
                  toast.info("Contact support at help@wondercart.com")
                }
              >
                Need help?
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      <ResetPassword email={userEmail} />
    </>
  );
}

export default ForgotPassword;
