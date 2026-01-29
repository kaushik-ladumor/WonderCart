import { Mail, Lock, Eye, EyeOff, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../Firebase";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account",
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const { setAuthUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const signInWithGoogle = async () => {
    try {
      setDisabled(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const response = await axios.post(
        "http://localhost:4000/user/google-auth",
        {
          email: user.email,
          username: user.displayName || user.email.split("@")[0],
          photoURL: user.photoURL,
          uid: user.uid,
        },
      );

      const loggedUser = response.data.user;
      const token = response.data.token;

      localStorage.setItem("token", token);
      localStorage.setItem("Users", JSON.stringify(loggedUser));
      setAuthUser(loggedUser);

      document.getElementById("login_modal")?.close();
      reset();
      toast.success("Login successful!");

      setTimeout(() => {
        const redirectPath = localStorage.getItem("redirectAfterLogin");
        if (redirectPath) {
          localStorage.removeItem("redirectAfterLogin");
          navigate(redirectPath);
        } else if (loggedUser.role === "seller") {
          navigate("/seller/dashboard");
        } else if (loggedUser.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 300);
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        toast.error("Login cancelled. Please try again.");
      } else if (error.code === "auth/popup-blocked") {
        toast.error("Popup was blocked. Please allow popups for this site.");
      } else if (error.response) {
        toast.error(
          error.response.data?.message || "Login failed. Please try again.",
        );
      } else {
        toast.error("Google login failed. Please try again.");
      }
    } finally {
      setDisabled(false);
    }
  };

  const onSubmit = async (data) => {
    const userInfo = {
      email: data.email,
      password: data.password,
    };

    try {
      setDisabled(true);
      const result = await axios.post(
        "http://localhost:4000/user/login",
        userInfo,
      );

      if (result.data) {
        const user = result.data.user;
        const token = result.data.token;

        localStorage.setItem("token", token);
        localStorage.setItem("Users", JSON.stringify(user));
        setAuthUser(user);

        document.getElementById("login_modal")?.close();
        reset();

        setTimeout(() => {
          const redirectPath = localStorage.getItem("redirectAfterLogin");
          if (redirectPath) {
            localStorage.removeItem("redirectAfterLogin");
            navigate(redirectPath);
          } else if (user.role === "seller") {
            navigate("/seller/dashboard");
          } else if (user.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }, 300);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setDisabled(false);
    }
  };

  const closeModal = () => {
    if (!disabled) {
      document.getElementById("login_modal")?.close();
    }
  };

  return (
    <dialog id="login_modal" className="modal backdrop-blur-sm">
      <div className="modal-box max-w-5xl p-0 bg-white border border-black rounded-none shadow-none">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left Side - Login Form */}
          <div className="p-10 bg-white relative">
            {/* Close Button - Top Right Corner */}
            <button
              onClick={closeModal}
              disabled={disabled}
              className="absolute -top-2 -right-2 w-8 h-8 bg-black text-white flex items-center justify-center hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-4xl font-black text-black mb-2 tracking-tight">
                LOGIN
              </h2>
              <div className="h-1 w-16 bg-black mb-3"></div>
              <p className="text-gray-600 text-sm tracking-wide">
                Welcome back! Please enter your credentials
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-black mb-2 tracking-wider uppercase">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className={`w-full px-4 py-3.5 pl-12 border rounded-none focus:outline-none focus:border-black text-sm text-black placeholder-gray-500 bg-transparent ${
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
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1.5 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-black mb-2 tracking-wider uppercase">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-3.5 pl-12 pr-12 border rounded-none focus:outline-none focus:border-black text-sm text-black placeholder-gray-500 bg-transparent ${
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
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed"
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
                  <p className="text-red-600 text-xs mt-1.5 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={disabled}
                className="w-full bg-black text-white py-3.5 rounded-none font-bold text-sm tracking-wider hover:bg-gray-800 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed mt-2 border border-black uppercase"
              >
                {disabled ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          </div>

          {/* Right Side - Additional Options */}
          <div className="p-10 bg-black text-white flex flex-col justify-center border-l border-gray-800">
            <div className="space-y-8">
              {/* Welcome Text */}
              <div>
                <h3 className="text-2xl font-bold mb-2 tracking-tight">
                  WELCOME BACK
                </h3>
                <div className="h-1 w-16 bg-white mb-4"></div>
                <p className="text-gray-300 text-sm tracking-wide">
                  Continue your journey with us. Access your personalized
                  dashboard and exclusive features.
                </p>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="flex items-center justify-center">
                  <div className="flex-grow h-px bg-gray-700"></div>
                  <span className="px-4 text-xs text-gray-400 font-bold tracking-wider uppercase">
                    OR CONTINUE WITH
                  </span>
                  <div className="flex-grow h-px bg-gray-700"></div>
                </div>
              </div>

              {/* Google Login Button */}
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={disabled}
                className="w-full py-3.5 bg-white border border-white text-black rounded-none font-bold text-sm tracking-wider hover:bg-gray-100 transition-all disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-4"
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
                LOGIN WITH GOOGLE
              </button>

              {/* Divider Line */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
              </div>

              {/* Signup Link */}
              <div className="text-center pt-4 border-t border-gray-800">
                <p className="text-gray-400 text-sm tracking-wide">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      if (!disabled) {
                        document.getElementById("login_modal")?.close();
                        navigate("/signup");
                      }
                    }}
                    className="text-white font-bold hover:underline bg-transparent border-none cursor-pointer disabled:text-gray-600 ml-1 tracking-wider"
                    disabled={disabled}
                  >
                    SIGN UP HERE
                  </button>
                </p>
              </div>

              {/* Additional Info */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Secure & encrypted authentication</p>
                <p>• Fast and reliable access</p>
                <p>• Your data is protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={closeModal} disabled={disabled}>
          close
        </button>
      </form>
    </dialog>
  );
}

export default Login;
