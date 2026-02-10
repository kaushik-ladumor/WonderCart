import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import VerifyEmail from "./VerifyEmail";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../Firebase";
import { useAuth } from "../context/AuthProvider";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account",
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [tempEmail, setTempEmail] = useState("");
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();

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
        if (
          response.data.message?.includes("already exists") ||
          response.data.message?.includes("User already exists")
        ) {
          // User already exists - ask to login instead
          toast.error("User already exists. Please login instead.");
          setTimeout(() => {
            document.getElementById("login_modal")?.showModal();
          }, 1000);
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

        if (
          errorMessage?.includes("already exists") ||
          errorMessage?.includes("User already exists")
        ) {
          // User already exists - ask to login instead
          toast.error("User already exists. Please login instead.");
          setTimeout(() => {
            document.getElementById("login_modal")?.showModal();
          }, 1000);
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

      const response = await axios.post(
        "http://localhost:4000/user/signup",
        userInfo,
      );

      toast.dismiss(loadingToast);

      if (response.data.success) {
        // New user created successfully - show verify modal
        toast.success("Signup successful! Please verify your email.");
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("Users", JSON.stringify(response.data.user));
        setAuthUser(response.data.user);
        setTempEmail(data.email);

        // Store email for verification
        localStorage.setItem("tempUserEmail", data.email);

        reset();

        // Show verify modal after a short delay
        setTimeout(() => {
          setShowVerifyModal(true);
          const modal = document.getElementById("verify_email_modal");
          if (modal) {
            modal.showModal();
          }
        }, 500);
      } else {
        // Handle other errors
        toast.error(
          response.data.message || "Signup failed. Please try again.",
        );
      }
    } catch (err) {
      toast.dismiss();

      if (err.response) {
        const errorMessage = err.response.data?.message;

        // Check if user already exists
        if (
          err.response.status === 409 ||
          errorMessage?.includes("already exists") ||
          errorMessage?.includes("User already exists")
        ) {
          // User already exists - show login prompt
          toast.error("User already exists. Please login instead.");
          setTimeout(() => {
            document.getElementById("login_modal")?.showModal();
          }, 1000);
        } else {
          // Other errors
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Main Container - Compact */}
        <div className="grid md:grid-cols-2 gap-0 bg-white rounded-xl shadow-lg border border-gray-200">
          {/* Left Side - Form Section */}
          <div className="p-6 md:p-8 bg-white">
            {/* Header */}
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-900">Sign Up</h2>
              <p className="text-gray-600 text-xs mt-0.5">
                Create your account to get started
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">
                  Select Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "user", label: "User" },
                    { value: "seller", label: "Seller" },
                  ].map(({ value, label }) => (
                    <label
                      key={value}
                      className={`flex items-center justify-center p-2.5 border rounded cursor-pointer transition-all ${errors.role
                        ? "border-red-600"
                        : selectedRole === value
                          ? "border-black bg-black text-white"
                          : "border-gray-300 hover:border-gray-400"
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
                        className={`font-medium text-xs ${selectedRole === value ? "text-white" : "text-gray-900"}`}
                      >
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.role && (
                  <p className="text-red-600 text-xs mt-0.5">
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* Username Input */}
              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter username"
                    className={`w-full px-3 py-2 pl-9 border rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm text-gray-900 placeholder-gray-500 bg-white ${errors.username ? "border-red-600" : "border-gray-300"
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
                  <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                </div>
                {errors.username && (
                  <p className="text-red-600 text-xs mt-0.5">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter email"
                    className={`w-full px-3 py-2 pl-9 border rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm text-gray-900 placeholder-gray-500 bg-white ${errors.email ? "border-red-600" : "border-gray-300"
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
                  <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-xs mt-0.5">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    className={`w-full px-3 py-2 pl-9 pr-9 border rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm text-gray-900 placeholder-gray-500 bg-white ${errors.password ? "border-red-600" : "border-gray-300"
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
                  <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed"
                    disabled={disabled}
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-xs mt-0.5">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={disabled}
                className="w-full bg-black text-white py-2.5 rounded font-medium hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-xs mt-1"
              >
                {disabled ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-3">
              <div className="flex-grow h-px bg-gray-300"></div>
              <span className="px-2 text-xs text-gray-500">or</span>
              <div className="flex-grow h-px bg-gray-300"></div>
            </div>

            {/* Google Sign Up */}
            <button
              type="button"
              onClick={signUpWithGoogle}
              disabled={disabled}
              className="w-full py-2.5 border border-gray-300 rounded font-medium hover:bg-gray-50 transition disabled:bg-gray-100 disabled:text-gray-400 text-xs flex items-center justify-center gap-1.5 text-black"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
              Sign up with Google
            </button>

            {/* Login Link */}
            <div className="text-center mt-4 pt-3 border-t border-gray-200">
              <p className="text-gray-600 text-xs">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => document.getElementById("login_modal")?.showModal()}
                  className="text-black font-medium hover:underline bg-transparent border-none cursor-pointer disabled:text-gray-400"
                  disabled={disabled}
                >
                  Login here
                </button>
              </p>
            </div>
          </div>

          {/* Right Side - Additional Info */}
          <div className="p-6 md:p-8 bg-gray-50 text-gray-800 flex flex-col justify-center">
            <div className="space-y-4">
              {/* Welcome Text */}
              <div>
                <h3 className="text-lg font-bold mb-1 text-gray-900">
                  Welcome
                </h3>
                <div className="h-0.5 w-10 bg-black mb-2"></div>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Join our community and unlock exclusive features. Sign up to
                  get started with your personalized experience.
                </p>
              </div>

              {/* Benefits List */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 text-sm">Benefits:</h4>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li className="flex items-center gap-1.5">
                    <span className="text-green-600">✓</span>
                    <span>Personalized recommendations</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-green-600">✓</span>
                    <span>Faster checkout process</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-green-600">✓</span>
                    <span>Order tracking & history</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-green-600">✓</span>
                    <span>Exclusive offers & discounts</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-green-600">✓</span>
                    <span>Seller dashboard access</span>
                  </li>
                </ul>
              </div>

              {/* Security Info */}
              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-900">
                    Secure & Private
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Your data is encrypted and protected. We never share your
                  personal information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VerifyEmail modalId="verify_email_modal" email={tempEmail} />
    </div>
  );
}

export default Signup;
