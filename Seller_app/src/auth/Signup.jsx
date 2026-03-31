import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { sendEmail } from "../utils/emailService";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import VerifyEmail from "./VerifyEmail";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../Firebase";
import { useAuth } from "../context/AuthProvider";
import { API_URL } from "../utils/constants";

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
  const { setAuthUser, setToken, setRefreshToken } = useAuth();

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

      const selectedRole = "seller";

      const response = await axios.post(
        `${API_URL}/user/google-auth`,
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
        const { token, refreshToken: rToken, user, isNewUser } = response.data;

        if (user.role !== "seller") {
          toast.error("User exists but role mismatch for Seller portal.");
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
          navigate("/seller/dashboard");
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
      role: "seller",
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

        // Show verify modal after a short delay
        // Navigate to home immediately, verification can happen later in profile
        setTimeout(() => {
          navigate("/seller/dashboard");
        }, 1500);
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
          <div className="relative z-10">
            <h2 className="font-display font-black text-[11px] tracking-[0.25em] uppercase text-white/90">WonderCart</h2>
          </div>

          {/* Middle Editorial */}
          <div className="relative z-10 mt-auto mb-8 max-w-md space-y-4">
            <h1 className="font-display text-3xl xl:text-[36px] font-extrabold leading-[1.1] tracking-tight">
              Refined style<br />for the modern<br />home.
            </h1>
            <p className="font-medium text-white/80 text-[12px] leading-relaxed max-w-[260px]">
              Experience a collection of curated objects designed to elevate your everyday living.
            </p>
            
            {/* Glassmorphic Card Overlay */}
            <div className="inline-flex items-center gap-3 mt-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 pr-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/20 shrink-0">
                <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=150&auto=format&fit=crop" alt="Minimalist Objects" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-[7px] font-bold text-white/50 uppercase tracking-[0.2em] mb-0.5">Featured Collection</span>
                <span className="font-bold text-[11px] text-white">The Minimalist Series</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="relative z-10">
            <span className="text-[7px] font-bold text-white/50 uppercase tracking-[0.25em]">Curated Excellence 2024</span>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="flex-1 w-full md:w-[55%] lg:w-[55%] flex flex-col items-center justify-center py-6 px-6 md:px-10">
          <div className="w-full max-w-[340px] flex flex-col h-full">
            
            <div className="mb-4">
              <h2 className="font-display text-[22px] font-extrabold text-[#141b2d] tracking-tight mb-1">
                Create Account
              </h2>
              <p className="font-body text-[#5c6880] text-[11px] font-medium">
                Your aesthetic journey begins here.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 flex-1">


              {/* Username Input */}
              <div className="space-y-1">
                <label className="font-body text-[8px] font-bold text-[#5c6880] uppercase tracking-[0.15em] ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Jane Cooper"
                  className={`w-full px-4 py-2 bg-[#f0f4ff] border border-transparent rounded-lg font-body text-[12px] font-medium text-[#141b2d] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6]/30 transition-all placeholder:text-[#a1abbd] ${errors.username ? "focus:ring-red-500/20 focus:border-red-500/30 ring-1 ring-red-500/50 bg-[#fff5f5]" : ""}`}
                  disabled={disabled}
                  {...register("username", {
                    required: "Username is required",
                    minLength: { value: 3, message: "Too short" },
                  })}
                />
                {errors.username && <p className="text-red-500 text-[9px] mt-0.5 ml-1 font-bold">{errors.username.message}</p>}
              </div>

              {/* Email Input */}
              <div className="space-y-1">
                <label className="font-body text-[8px] font-bold text-[#5c6880] uppercase tracking-[0.15em] ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="hello@wondercart.com"
                  className={`w-full px-4 py-2 bg-[#f0f4ff] border border-transparent rounded-lg font-body text-[12px] font-medium text-[#141b2d] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6]/30 transition-all placeholder:text-[#a1abbd] ${errors.email ? "focus:ring-red-500/20 focus:border-red-500/30 ring-1 ring-red-500/50 bg-[#fff5f5]" : ""}`}
                  disabled={disabled}
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" },
                  })}
                />
                {errors.email && <p className="text-red-500 text-[9px] mt-0.5 ml-1 font-bold">{errors.email.message}</p>}
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="font-body text-[8px] font-bold text-[#5c6880] uppercase tracking-[0.15em] ml-1">
                  Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full pl-4 pr-10 py-2 bg-[#f0f4ff] border border-transparent rounded-lg font-body text-[12px] font-medium text-[#141b2d] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6]/30 transition-all tracking-[0.2em] placeholder:tracking-normal placeholder:text-[#a1abbd] ${errors.password ? "focus:ring-red-500/20 focus:border-red-500/30 ring-1 ring-red-500/50 bg-[#fff5f5]" : ""}`}
                    disabled={disabled}
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Min 6 chars" },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1abbd] hover:text-[#141b2d] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={2.5} /> : <Eye className="w-4 h-4" strokeWidth={2.5} />}
                  </button>
                </div>
                
                {/* Visual Password Strength Match */}
                <div className="flex gap-1 mt-1.5 px-1">
                  <div className="h-1 flex-1 bg-[#004ac6] rounded-full"></div>
                  <div className="h-1 flex-1 bg-[#004ac6] rounded-full"></div>
                  <div className="h-1 flex-1 bg-[#e1e8fd] rounded-full"></div>
                </div>

                {errors.password && <p className="text-red-500 text-[9px] mt-0.5 ml-1 font-bold">{errors.password.message}</p>}
              </div>

              {/* Checkbox */}
              <div className="flex items-center gap-2 mt-3 ml-1">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="w-3 h-3 rounded-sm border border-gray-300 text-[#004ac6] focus:ring-[#004ac6]/20 bg-[#f0f4ff] cursor-pointer" 
                  required 
                />
                <label htmlFor="terms" className="text-[9px] font-medium text-[#5c6880] cursor-pointer leading-tight">
                  I agree to the <span className="text-[#004ac6] font-bold hover:underline">Terms & Privacy Policy</span>
                </label>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={disabled}
                className="w-full h-10 bg-[#185ee0] text-white rounded-lg font-display font-bold text-[12px] hover:bg-[#144fbc] focus:ring-4 focus:ring-[#185ee0]/20 transition-all shadow-md shadow-[#185ee0]/20 disabled:opacity-70 disabled:cursor-not-allowed mt-3 flex items-center justify-center gap-2"
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
            <div className="flex items-center mt-4 mb-3">
              <div className="flex-grow h-[1px] bg-gray-100"></div>
              <span className="px-3 font-body text-[8px] text-[#9ca3af] uppercase tracking-[0.2em] font-bold">Or</span>
              <div className="flex-grow h-[1px] bg-gray-100"></div>
            </div>

            <button
              type="button"
              onClick={signUpWithGoogle}
              disabled={disabled}
              className="w-full flex items-center justify-center gap-2 h-10 bg-white border border-gray-100 rounded-lg font-body text-[12px] font-bold text-[#141b2d] hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="mt-4 text-center">
              <p className="font-body text-[#5c6880] text-[10px] font-medium">
                Already part of the community?{" "}
                <button
                  type="button"
                  onClick={() => document.getElementById("login_modal")?.showModal()}
                  className="font-bold text-[#004ac6] hover:underline transition-all ml-1"
                >
                  Log in
                </button>
              </p>
            </div>

            <div className="mt-auto pt-3 flex justify-center gap-6">
              <a href="#" className="text-[7px] font-bold text-[#b0b8c9] uppercase tracking-[0.2em] hover:text-[#5c6880] transition-colors">Privacy</a>
              <a href="#" className="text-[7px] font-bold text-[#b0b8c9] uppercase tracking-[0.2em] hover:text-[#5c6880] transition-colors">Terms</a>
              <a href="#" className="text-[7px] font-bold text-[#b0b8c9] uppercase tracking-[0.2em] hover:text-[#5c6880] transition-colors">Support</a>
            </div>

          </div>
        </div>
      </div>

      <VerifyEmail modalId="verify_email_modal" email={tempEmail} />
    </div>
  );
}

export default Signup;
