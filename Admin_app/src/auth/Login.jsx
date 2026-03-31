import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, X } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../utils/constants";
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

        if (user.role !== "admin") {
          toast.error("Access denied. Role mismatch for Admin portal.");
          setDisabled(false);
          return;
        }

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
          navigate("/admin");
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
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[#5c6880] mb-1.5 block">
                  Email Address
                </label>
                <div className="flex items-center gap-2 bg-[#f0f4ff] rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#004ac6]/20 transition-all border border-transparent focus-within:border-[#004ac6]/20">
                  <Mail className="w-4 h-4 text-[#5c6880]" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="bg-transparent flex-1 text-sm text-[#141b2d] outline-none placeholder:text-[#5c6880]/60"
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
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-[#5c6880]">
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
                    className="text-[10px] uppercase tracking-widest font-bold text-[#004ac6] hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-[#f0f4ff] rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#004ac6]/20 transition-all border border-transparent focus-within:border-[#004ac6]/20">
                  <Lock className="w-4 h-4 text-[#5c6880]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="bg-transparent flex-1 text-sm text-[#141b2d] outline-none placeholder:text-[#5c6880]/60"
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
                  <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.password.message}</p>
                )}
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={disabled}
                className="w-full bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white font-bold rounded-xl h-12 text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform mt-2 disabled:opacity-50 shadow-lg shadow-blue-500/10 active:scale-95"
              >
                {disabled ? "Processing..." : "Sign In to Dashboard"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export default Login;
