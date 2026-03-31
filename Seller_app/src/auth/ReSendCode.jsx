// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { useMutation } from "@tanstack/react-query";
// import { Mail, Loader2, ArrowLeft } from "lucide-react";
// import toast from "react-hot-toast";

// const ResendCode = () => {
//   const [email, setEmail] = useState("");
//   const navigate = useNavigate();

//   const mutation = useMutation({
//     mutationFn: (email) => authAPI.resendCode(email),
//     onSuccess: (data) => {
//       if (data.success) {
//         toast.success("New verification code sent!");
//         navigate("/verify-email");
//       } else {
//         toast.error(data.message || "Failed to send code");
//       }
//     },
//     onError: (error) => {
//       toast.error("An error occurred");
//     },
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (email) {
//       mutation.mutate(email);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
//       <div className="sm:mx-auto sm:w-full sm:max-w-md">
//         <h2 className="mt-6 text-center text-3xl font-extrabold text-black">
//           Resend Verification Code
//         </h2>
//         <p className="mt-2 text-center text-sm text-gray-600">
//           Enter your email to receive a new verification code
//         </p>
//       </div>

//       <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
//           <form className="space-y-6" onSubmit={handleSubmit}>
//             <div>
//               <label
//                 htmlFor="email"
//                 className="block text-sm font-medium text-gray-700"
//               >
//                 Email Address
//               </label>
//               <div className="mt-1 relative">
//                 <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   autoComplete="email"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
//                   placeholder="Enter your email"
//                 />
//               </div>
//             </div>

//             <div>
//               <button
//                 type="submit"
//                 disabled={mutation.isPending}
//                 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {mutation.isPending ? (
//                   <Loader2 className="h-5 w-5 animate-spin" />
//                 ) : (
//                   "Resend Code"
//                 )}
//               </button>
//             </div>
//           </form>

//           <div className="mt-6 text-center">
//             <Link
//               to="/login"
//               className="inline-flex items-center text-sm font-medium text-black hover:text-gray-800"
//             >
//               <ArrowLeft className="h-4 w-4 mr-1" />
//               Back to login
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResendCode;
