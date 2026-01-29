import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import VerifyEmail from "./VerifyEmail";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../Firebase";
import { useAuth } from "../context/AuthProvider"; // Add this import

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account",
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const navigate = useNavigate();
  const { setAuthUser } = useAuth(); // Add this line

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      role: "user",
    },
  });

  const signUpWithGoogle = async () => {
    try {
      setDisabled(true);
      const loadingToast = toast.loading("Connecting with Google...");

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      toast.dismiss(loadingToast);
      toast.loading("Setting up your account...");

      const selectedRole = watch("role");

      const response = await axios.post(
        "http://localhost:4000/user/google-auth",
        {
          username: user.displayName || user.email.split("@")[0],
          email: user.email,
          photoURL: user.photoURL,
          uid: user.uid,
          selectedRole,
        },
      );

      toast.dismiss();

      if (response.data.success) {
        const { token, user, isNewUser } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("Users", JSON.stringify(user));
        setAuthUser(user);

        toast.success(
          isNewUser ? "Account created successfully!" : "Welcome back!",
        );

        reset();

        setTimeout(() => {
          if (user.role === "seller") {
            navigate("/seller/dashboard");
          } else {
            navigate("/");
          }
        }, 300);
      } else {
        // Handle existing user - redirect to OTP
        if (
          response.data.message?.includes("already exists") ||
          response.data.message?.includes("User already exists")
        ) {
          toast.error("User already exists. Please verify your email.");
          setTimeout(() => {
            const modal = document.getElementById("verify_email_modal");
            if (modal) {
              modal.showModal();
            }
          }, 500);
        } else {
          toast.error(
            response.data.message || "Signup failed. Please try again.",
          );
        }
      }
    } catch (error) {
      toast.dismiss();

      if (error.code === "auth/popup-closed-by-user") {
        toast.error("Signup cancelled. Please try again.");
      } else if (error.code === "auth/popup-blocked") {
        toast.error("Popup was blocked. Please allow popups for this site.");
      } else if (error.response) {
        const errorMessage = error.response.data?.message;

        // Handle existing user case for Google signup
        if (
          errorMessage?.includes("already exists") ||
          errorMessage?.includes("User already exists")
        ) {
          toast.error("User already exists. Please verify your email.");
          setTimeout(() => {
            const modal = document.getElementById("verify_email_modal");
            if (modal) {
              modal.showModal();
            }
          }, 500);
        } else {
          toast.error(errorMessage || "Signup failed. Please try again.");
        }
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } finally {
      setDisabled(false);
    }
  };

  const onSubmit = async (data) => {
    const userInfo = {
      username: data.username,
      email: data.email,
      password: data.password,
      role: data.role,
    };

    try {
      setDisabled(true);
      const loadingToast = toast.loading("Creating your account...");

      // Store email temporarily for OTP modal
      localStorage.setItem("tempUserEmail", data.email);

      const response = await axios.post(
        "http://localhost:4000/user/signup",
        userInfo,
      );

      toast.dismiss(loadingToast);

      if (response.data.success) {
        toast.success("Signup successful!");
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("Users", JSON.stringify(response.data.user));
        setAuthUser(response.data.user);
        reset();

        setTimeout(() => {
          const modal = document.getElementById("verify_email_modal");
          if (modal) {
            modal.showModal();
          }
        }, 500);
      } else {
        // Handle specific error messages
        if (response.data.message?.includes("already exists")) {
          toast.error("User already exists. Please verify your email.");
          // Store email for existing user
          localStorage.setItem("tempUserEmail", data.email);
          setTimeout(() => {
            const modal = document.getElementById("verify_email_modal");
            if (modal) {
              modal.showModal();
            }
          }, 500);
        } else {
          toast.error(
            response.data.message || "Signup failed. Please try again.",
          );
        }
      }
    } catch (err) {
      toast.dismiss();

      if (err.response) {
        const errorMessage = err.response.data?.message;

        // Handle existing user - show OTP modal
        if (
          err.response.status === 409 ||
          errorMessage?.includes("already exists") ||
          errorMessage?.includes("User already exists")
        ) {
          toast.error("User already exists. Please verify your email.");
          // Store email for existing user
          localStorage.setItem("tempUserEmail", data.email);
          setTimeout(() => {
            const modal = document.getElementById("verify_email_modal");
            if (modal) {
              modal.showModal();
            }
          }, 500);
        } else {
          toast.error(errorMessage || "Signup failed. Please try again.");
        }
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } finally {
      setDisabled(false);
    }
  };

  const selectedRole = watch("role");

  return (
    <div className="h-screen w-screen bg-white flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-5xl h-[90vh] max-h-[700px]">
        {/* Main Container */}
        <div className="grid md:grid-cols-2 gap-0 bg-white border border-black h-full">
          {/* Left Side - Form Section */}
          <div className="p-8 md:p-10 bg-white overflow-y-auto h-full">
            {/* Header */}
            <div className="mb-4">
              <h2 className="text-3xl font-black text-black mb-2 tracking-tight">
                SIGN UP
              </h2>
              <div className="h-1 w-16 bg-black mb-3"></div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-black mb-2 uppercase">
                  SELECT ROLE
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "user", label: "User" },
                    { value: "seller", label: "Seller" },
                  ].map(({ value, label }) => (
                    <label
                      key={value}
                      className={`flex items-center justify-center p-3 border cursor-pointer transition-all ${
                        errors.role
                          ? "border-red-600"
                          : selectedRole === value
                            ? "border-black bg-black text-white"
                            : "border-gray-300 hover:border-black"
                      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="radio"
                        value={value}
                        disabled={disabled}
                        {...register("role", {
                          required: "Please select a role",
                        })}
                        className="sr-only"
                      />
                      <span
                        className={`font-bold text-sm ${selectedRole === value ? "text-white" : "text-black"}`}
                      >
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.role && (
                  <p className="text-red-600 text-xs mt-1 font-medium">
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-black mb-1 uppercase">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter username"
                    className={`w-full px-4 py-3 pl-10 border focus:outline-none focus:border-black text-sm text-black placeholder-gray-500 bg-transparent ${
                      errors.username ? "border-red-600" : "border-gray-300"
                    } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    disabled={disabled}
                    {...register("username", {
                      required: "Username is required",
                      minLength: {
                        value: 3,
                        message: "Username must be at least 3 characters",
                      },
                    })}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
                {errors.username && (
                  <p className="text-red-600 text-xs mt-1 font-medium">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-black mb-1 uppercase">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter email"
                    className={`w-full px-4 py-3 pl-10 border focus:outline-none focus:border-black text-sm text-black placeholder-gray-500 bg-transparent ${
                      errors.email ? "border-red-600" : "border-gray-300"
                    } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    disabled={disabled}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value:
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-black mb-1 uppercase">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    className={`w-full px-4 py-3 pl-10 pr-10 border focus:outline-none focus:border-black text-sm text-black placeholder-gray-500 bg-transparent ${
                      errors.password ? "border-red-600" : "border-gray-300"
                    } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    disabled={disabled}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed"
                    disabled={disabled}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-xs mt-1 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={disabled}
                className="w-full bg-black text-white py-3 font-bold text-sm tracking-wider hover:bg-gray-900 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed mt-4 border border-black uppercase"
              >
                {disabled ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </div>

          {/* Right Side - Additional Options */}
          <div className="p-8 md:p-10 bg-black text-white flex flex-col justify-center overflow-y-auto h-full">
            <div className="space-y-8">
              {/* Welcome Text */}
              <div>
                <h3 className="text-xl font-bold mb-2">WELCOME</h3>
                <div className="h-1 w-12 bg-white mb-4"></div>
                <p className="text-gray-300 text-sm">
                  Join our community and unlock exclusive features. Sign up to
                  get started with your personalized experience.
                </p>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="flex items-center">
                  <div className="flex-grow h-px bg-gray-700"></div>
                  <span className="px-3 text-xs text-gray-400 font-bold uppercase">
                    OR CONTINUE WITH
                  </span>
                  <div className="flex-grow h-px bg-gray-700"></div>
                </div>
              </div>

              {/* Google Sign Up Button */}
              <button
                type="button"
                onClick={signUpWithGoogle}
                disabled={disabled}
                className="w-full py-3 bg-white border border-white text-black font-bold text-sm hover:bg-gray-100 transition-all disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                SIGN UP WITH GOOGLE
              </button>

              {/* Login Link */}
              <div className="text-center pt-4 border-t border-gray-800">
                <p className="text-gray-400 text-sm">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-white font-bold hover:underline bg-transparent border-none cursor-pointer disabled:text-gray-600 ml-1"
                    disabled={disabled}
                  >
                    LOGIN HERE
                  </button>
                </p>
              </div>

              {/* Additional Info */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Secure & encrypted authentication</p>
                <p>• No spam, ever</p>
                <p>• Easy account management</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VerifyEmail modalId="verify_email_modal" />
    </div>
  );
}

export default Signup;
