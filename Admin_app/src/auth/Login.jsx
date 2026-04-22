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
          <div className="px-6 pt-6 pb-2 text-center">
            <h3 className="text-[1.3rem] font-semibold text-[#11182d] tracking-tight">
              Sign In
            </h3>
            <p className="text-[0.84rem] text-[#6d7892] mt-1 mb-2">
              Access your admin control center.
            </p>
          </div>

          {/* Modal body */}
          <div className="px-6 py-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="text-[0.84rem] font-semibold text-[#25324d] mb-1.5 block">
                  Email Address
                </label>
                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-[#d9deeb] focus-within:border-[#0f49d7] focus-within:ring-1 focus-within:ring-[#0f49d7] transition-all">
                  <Mail className="w-4.5 h-4.5 text-[#6d7892]" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="bg-transparent flex-1 text-[0.88rem] text-[#11182d] outline-none placeholder:text-[#94a3b8]"
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
                  <p className="text-red-500 text-[0.76rem] font-semibold mt-1.5 ml-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="text-[0.84rem] font-semibold text-[#25324d] mb-1.5 block">
                  Password
                </label>
                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-[#d9deeb] focus-within:border-[#0f49d7] focus-within:ring-1 focus-within:ring-[#0f49d7] transition-all">
                  <Lock className="w-4.5 h-4.5 text-[#6d7892]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="bg-transparent flex-1 text-[0.88rem] text-[#11182d] outline-none placeholder:text-[#94a3b8]"
                    disabled={disabled}
                    {...register("password", {
                      required: "Password is required",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#6d7892] hover:text-[#11182d] transition-colors"
                    disabled={disabled}
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-1.5 font-semibold">
                  {errors.password ? (
                    <p className="text-red-500 text-[0.76rem] ml-1">{errors.password.message}</p>
                  ) : <span />}
                  <button
                    type="button"
                    onClick={() => {
                      if (!disabled) {
                        document.getElementById("login_modal")?.close();
                        navigate("/forgot-password");
                      }
                    }}
                    className="text-[0.82rem] text-[#0f49d7] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={disabled}
                className="w-full bg-[#0f49d7] text-white font-semibold rounded-[14px] h-11 text-[0.88rem] hover:bg-[#003da3] transition-colors mt-[4px] disabled:opacity-50"
              >
                {disabled ? "Processing..." : "Sign In to Dashboard"}
              </button>
            </form>
          </div>
          <div className="px-6 pb-6 pt-2">
            <div className="flex items-center mb-5 mt-2">
              <div className="flex-grow h-px bg-[#e4e8f2]"></div>
              <span className="px-4 text-[0.82rem] font-semibold text-[#6d7892]">Restricted Access</span>
              <div className="flex-grow h-px bg-[#e4e8f2]"></div>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export default Login;
