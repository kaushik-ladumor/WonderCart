import { Mail, Lock, Eye, EyeOff, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../Firebase";
import { API_URL } from "../utils/constants";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account",
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const { setAuthUser, setToken, setRefreshToken } = useAuth();
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
        `${API_URL}/user/google-auth`,
        {
          email: user.email,
          username: user.displayName || user.email.split("@")[0],
          photoURL: user.photoURL,
          uid: user.uid,
        },
      );

      const loggedUser = response.data.user;
      const token = response.data.token;
      const rToken = response.data.refreshToken;

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", rToken);
      localStorage.setItem("Users", JSON.stringify(loggedUser));
      setAuthUser(loggedUser);
      setToken(token);
      setRefreshToken(rToken);

      document.getElementById("login_modal")?.close();
      reset();
      toast.success("Login successful!");

      setTimeout(() => {
        if (loggedUser.role === "seller") {
          navigate("/seller/dashboard");
        } else if (loggedUser.role === "admin") {
          navigate("/admin");
        } else {
          window.location.reload();
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
        `${API_URL}/user/login`,
        userInfo,
      );

      if (result.data) {
        const user = result.data.user;
        const token = result.data.token;
        const rToken = result.data.refreshToken;

        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", rToken);
        localStorage.setItem("Users", JSON.stringify(user));
        setAuthUser(user);
        setToken(token);
        setRefreshToken(rToken);

        document.getElementById("login_modal")?.close();
        reset();
        toast.success("Login successful!");

        setTimeout(() => {
          if (user.role === "seller") {
            navigate("/seller/dashboard");
          } else if (user.role === "admin") {
            navigate("/admin");
          } else {
            window.location.reload();
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
    <dialog id="login_modal" className="modal">
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
        <div className="bg-white rounded-2xl w-full max-w-sm mx-auto shadow-tonal-md relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
          
          {/* Close Button */}
          <button
            onClick={closeModal}
            disabled={disabled}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#5c6880] hover:bg-[#f0f4ff] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal header */}
          <div className="px-6 pt-6 pb-0 text-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#004ac6] font-semibold block mb-1">
              Welcome Back
            </span>
            <h3 className="font-display text-2xl font-bold text-[#141b2d]">
              Sign In
            </h3>
            <p className="text-xs text-[#5c6880] mt-1 mb-5">
              Access your curation and orders.
            </p>
          </div>

          {/* Modal body */}
          <div className="px-6 py-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="text-xs uppercase tracking-widest font-semibold text-[#5c6880] mb-1.5 block">
                Email Address
              </label>
              <div className="flex items-center gap-2 bg-[#f0f4ff] rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#004ac6] transition-all">
                <Mail className="w-4 h-4 text-[#5c6880]" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="bg-transparent flex-1 text-sm text-[#141b2d] outline-none placeholder:text-[#5c6880]"
                  disabled={disabled}
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
                <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs uppercase tracking-widest font-semibold text-[#5c6880]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (!disabled) {
                      document.getElementById("login_modal")?.close();
                      navigate("/forgot-password");
                    }
                  }}
                  className="text-xs text-[#004ac6] hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="flex items-center gap-2 bg-[#f0f4ff] rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#004ac6] transition-all">
                <Lock className="w-4 h-4 text-[#5c6880]" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-transparent flex-1 text-sm text-[#141b2d] outline-none placeholder:text-[#5c6880]"
                  disabled={disabled}
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#5c6880] hover:text-[#141b2d]"
                  disabled={disabled}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 text-nowrap">{errors.password.message}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={disabled}
              className="w-full bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white font-semibold rounded-xl py-3 text-sm hover:scale-[1.02] transition-transform mt-4 disabled:opacity-50"
            >
              {disabled ? "Processing..." : "Sign In to Dashboard"}
            </button>
          </form>
          </div>

          {/* Modal footer */}
          <div className="px-6 pb-6 pt-2">
            {/* Divider */}
            <div className="flex items-center mb-6">
              <div className="flex-grow h-px bg-[#f0f4ff]"></div>
              <span className="px-3 text-[10px] uppercase tracking-widest text-[#5c6880] text-center font-bold">Social authentication</span>
              <div className="flex-grow h-px bg-[#f0f4ff]"></div>
            </div>

            {/* Social Logins */}
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={disabled}
              className="w-full flex items-center justify-center gap-2 bg-white border border-[#e1e8fd] rounded-xl py-2.5 text-sm font-medium text-[#141b2d] hover:bg-[#f0f4ff] transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>

            {/* Signup Footer */}
            <div className="mt-5 text-center">
              <p className="text-xs text-[#5c6880]">
                New curator?{" "}
                <button
                  type="button"
                  onClick={() => {
                    if (!disabled) {
                      document.getElementById("login_modal")?.close();
                      navigate("/signup");
                    }
                  }}
                  className="text-[#004ac6] font-semibold hover:underline"
                  disabled={disabled}
                >
                  Create account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export default Login;
