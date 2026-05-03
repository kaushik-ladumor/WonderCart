import { Mail, Lock, Eye, EyeOff, User, Gift } from "lucide-react";
import { sendEmail } from "../utils/emailService";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import VerifyEmail from "./VerifyEmail";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../Firebase";
import { useAuth } from "../context/AuthProvider";
import { API_URL } from "../utils/constants";
import Logo from "../components/Logo";

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
  const [searchParams] = useSearchParams();
  const { setAuthUser, setToken, setRefreshToken } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    defaultValues: {
      role: "user",
      referredByCode: searchParams.get("ref") || ""
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

      const selectedRole = "user";

      const response = await axios.post(
        `${API_URL}/user/google-auth`,
        {
          username: user.displayName || user.email.split("@")[0],
          email: user.email,
          photoURL: user.photoURL,
          uid: user.uid,
          selectedRole,
          referredByCode: searchParams.get("ref") || "",
        },
      );

      toast.dismiss();

      if (response.data.success) {
        const { token, refreshToken: rToken, user, isNewUser } = response.data;

        if (user.role !== "user") {
          toast.error("User exists but role mismatch for User portal.");
          setDisabled(false);
          return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", rToken);
        localStorage.setItem("Users", JSON.stringify(user));
        setAuthUser(user);
        setToken(token);
        setRefreshToken(rToken);

        toast.success(
          isNewUser ? "Account created successfully!" : "Welcome back!",
        );

        reset();

        setTimeout(() => {
          navigate("/");
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
      role: "user",
      referredByCode: data.referredByCode
    };

    try {
      setDisabled(true);
      const loadingToast = toast.loading("Creating your account...");

      const response = await axios.post(
        `${API_URL}/user/signup`,
        userInfo,
      );

      toast.dismiss(loadingToast);

      if (response.data.success) {
        // New user created successfully - show verify modal
        toast.success("Signup successful! Please verify your email.");
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("Users", JSON.stringify(response.data.user));
        setAuthUser(response.data.user);
        setToken(response.data.token);
        setRefreshToken(response.data.refreshToken);
        setTempEmail(data.email);

        // Send Verification Email via EmailJS
        if (response.data.verificationCode) {
          sendEmail({
            to_email: data.email,
            type: "verification",
            data: { verificationCode: response.data.verificationCode }
          }).catch(err => console.error("EmailJS Error:", err));
        }

        // Store email for verification
        localStorage.setItem("tempUserEmail", data.email);

        reset();

        // SHOW VERIFY MODAL IMMEDIATELY
        setShowVerifyModal(true);
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
    <div className="min-h-screen bg-[#f9f9ff] flex items-center justify-center p-2 md:p-4 font-body selection:bg-blue-100 selection:text-blue-900">
      <div className="w-full max-w-[1000px] bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(20,27,45,0.06)] overflow-hidden flex flex-col md:flex-row min-h-[560px] relative border border-white/80">
        
        {/* Left Side - Image & Editorial */}
        <div className="hidden md:flex md:w-[45%] lg:w-[45%] relative flex-col justify-between p-8 xl:p-10 overflow-hidden text-white bg-[#1a1a1a]">
          <img 
            src="https://images.unsplash.com/photo-1592078615290-033ee584e267?w=1000&auto=format&fit=crop&q=80" 
            alt="Modern Chair" 
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
          {/* Subtle gradient overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/20 to-transparent"></div>
          
          {/* Top Brand */}
          <div className="relative z-10 scale-[0.85] origin-top-left -ml-2">
            <Logo lightText={true} />
          </div>

          {/* Middle Editorial */}
          <div className="relative z-10 mt-auto mb-8 max-w-md space-y-4">
            <h1 className="font-display text-[1.5rem] xl:text-[36px] font-extrabold leading-[1.1] tracking-tight">
              Refined style<br />for the modern<br />home.
            </h1>
            <p className="font-medium text-white/80 text-[0.74rem] leading-relaxed max-w-[260px]">
              Experience a collection of curated objects designed to elevate your everyday living.
            </p>
            
            {/* Glassmorphic Card Overlay */}
            <div className="inline-flex items-center gap-3 mt-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 pr-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/20 shrink-0">
                <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=150&auto=format&fit=crop" alt="Minimalist Objects" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-[7px] font-semibold text-white/50 uppercase tracking-[0.2em] mb-0.5">Featured Collection</span>
                <span className="font-semibold text-[10px] text-white">The Minimalist Series</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="relative z-10">
            <span className="text-[7px] font-semibold text-white/50 uppercase tracking-[0.25em]">Curated Excellence 2024</span>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="flex-1 w-full md:w-[55%] lg:w-[55%] flex flex-col items-center justify-center py-6 px-6 md:px-10">
          <div className="w-full max-w-[360px] flex flex-col h-full">
            
            <div className="mb-6">
              <h2 className="text-[1.5rem] font-semibold text-[#11182d] tracking-tight mb-1">
                Create Account
              </h2>
              <p className="text-[0.84rem] text-[#6d7892] mt-1">
                Your aesthetic journey begins here.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex-1">

              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-[0.84rem] font-semibold text-[#25324d] block">
                  Full Name
                </label>
                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-[#d9deeb] focus-within:border-[#0f49d7] focus-within:ring-1 focus-within:ring-[#0f49d7] transition-all">
                  <User className="w-4.5 h-4.5 text-[#6d7892]" />
                  <input
                    type="text"
                    placeholder="Jane Cooper"
                    className="bg-transparent flex-1 text-[0.88rem] text-[#11182d] outline-none placeholder:text-[#94a3b8]"
                    disabled={disabled}
                    {...register("username", {
                      required: "Username is required",
                      minLength: { value: 3, message: "Too short" },
                    })}
                  />
                </div>
                {errors.username && <p className="text-red-500 text-[0.76rem] font-semibold mt-1 ml-1">{errors.username.message}</p>}
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[0.84rem] font-semibold text-[#25324d] block">
                  Email Address
                </label>
                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-[#d9deeb] focus-within:border-[#0f49d7] focus-within:ring-1 focus-within:ring-[#0f49d7] transition-all">
                  <Mail className="w-4.5 h-4.5 text-[#6d7892]" />
                  <input
                    type="email"
                    placeholder="hello@wondercart.com"
                    className="bg-transparent flex-1 text-[0.88rem] text-[#11182d] outline-none placeholder:text-[#94a3b8]"
                    disabled={disabled}
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" },
                    })}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-[0.76rem] font-semibold mt-1 ml-1">{errors.email.message}</p>}
              </div>

              {/* Referral Code Input (Optional) - MOVED HERE */}
              <div className="space-y-1.5">
                <label className="text-[0.84rem] font-semibold text-[#25324d] block flex items-center justify-between">
                  Referral Code
                  <div className="flex items-center gap-2">
                    {searchParams.get("ref") && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider animate-pulse">Benefit Applied</span>
                    )}
                    <span className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider">Optional</span>
                  </div>
                </label>
                <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border transition-all ${searchParams.get("ref") ? "bg-indigo-50/50 border-indigo-200" : "bg-white border-[#d9deeb]"} focus-within:border-[#0f49d7] focus-within:ring-1 focus-within:ring-[#0f49d7]`}>
                  <Gift className={`w-4.5 h-4.5 ${searchParams.get("ref") ? "text-indigo-600" : "text-[#6d7892]"}`} />
                  <input
                    type="text"
                    placeholder="ENTER-CODE"
                    className="bg-transparent flex-1 text-[0.88rem] text-[#11182d] font-mono outline-none placeholder:text-[#94a3b8] uppercase"
                    disabled={disabled}
                    {...register("referredByCode")}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-[0.84rem] font-semibold text-[#25324d] block">
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
                      minLength: { value: 6, message: "Min 6 chars" },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#6d7892] hover:text-[#11182d] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-[0.76rem] font-semibold mt-1 ml-1">{errors.password.message}</p>}
              </div>

              {/* Checkbox */}
              <div className="flex items-center gap-2 mt-4 ml-1">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="w-3.5 h-3.5 rounded border-[#d9deeb] text-[#0f49d7] focus:ring-[#0f49d7]/20 bg-white cursor-pointer" 
                  required 
                />
                <label htmlFor="terms" className="text-[0.82rem] font-medium text-[#6d7892] cursor-pointer leading-tight">
                  I agree to the <span className="text-[#0f49d7] font-semibold hover:underline">Terms & Privacy</span>
                </label>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={disabled}
                className="w-full bg-[#0f49d7] text-white font-semibold rounded-[14px] h-11 text-[0.88rem] hover:bg-[#003da3] transition-colors mt-[4px] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {disabled ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Separator */}
            <div className="flex items-center mb-5 mt-5">
              <div className="flex-grow h-px bg-[#e4e8f2]"></div>
              <span className="px-4 text-[0.82rem] font-semibold text-[#6d7892]">Or continue with</span>
              <div className="flex-grow h-px bg-[#e4e8f2]"></div>
            </div>

            <button
              type="button"
              onClick={signUpWithGoogle}
              disabled={disabled}
              className="w-full flex items-center justify-center gap-3 bg-white border border-[#d9deeb] rounded-[14px] h-11 text-[0.88rem] font-semibold text-[#25324d] hover:bg-[#f8f9fc] transition-all disabled:opacity-50"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google Account
            </button>

            <div className="mt-8 text-center">
              <p className="text-[0.88rem] font-semibold text-[#6d7892]">
                Already part of the community?{" "}
                <button
                  type="button"
                  onClick={() => document.getElementById("login_modal")?.showModal()}
                  className="font-semibold text-[#0f49d7] hover:underline"
                >
                  Log in
                </button>
              </p>
            </div>

            <div className="mt-auto pt-6 flex justify-center gap-6">
              <a href="#" className="text-[0.76rem] font-semibold text-[#94a3b8] hover:text-[#25324d] transition-colors">Privacy</a>
              <a href="#" className="text-[0.76rem] font-semibold text-[#94a3b8] hover:text-[#25324d] transition-colors">Terms</a>
              <a href="#" className="text-[0.76rem] font-semibold text-[#94a3b8] hover:text-[#25324d] transition-colors">Support</a>
            </div>

          </div>
        </div>
      </div>

      <VerifyEmail isOpen={showVerifyModal} onClose={() => setShowVerifyModal(false)} email={tempEmail} />
    </div>
  );
}

export default Signup;
