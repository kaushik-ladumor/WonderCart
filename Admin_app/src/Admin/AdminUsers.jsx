import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../utils/constants";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Users,
  Store,
  Trash2,
  CheckCircle,
  XCircle,
  Mail,
  User,
  HelpCircle,
  ShieldAlert
} from "lucide-react";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null });
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/users`);
      setUsers(response.data.data.users);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    const userId = deleteModal.userId;
    if (!userId) return;
    
    try {
      await axios.delete(`${API_URL}/admin/users/delete`, {
        data: { userId },
      });
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("User Deleted Successfully");
      setDeleteModal({ isOpen: false, userId: null });
    } catch (error) {
       console.error(error);
       toast.error(error.response?.data?.message || "Deletion failed");
       setDeleteModal({ isOpen: false, userId: null });
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const userList = users.filter((u) => u.role === "user");
  const sellerList = users.filter((u) => u.role === "seller");

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 pb-20 font-body relative">
      {/* Header Section */}
      <div className="flex flex-col gap-2 pt-4 px-4">
        <h1 className="text-[1.8rem] font-bold text-[#11182d] leading-none tracking-tight">User Governance</h1>
        <p className="text-[0.95rem] font-medium text-[#6d7892]">
          Manage platform access, review merchant profiles, and handle account security protocols.
        </p>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 px-4">
        {[
          { label: 'Total Accounts', value: users.length, icon: Users, accent: '#0f49d7' },
          { label: 'Platform Buyers', value: userList.length, icon: User, accent: '#10b981' },
          { label: 'Verified Sellers', value: sellerList.filter(s => s.isVerified).length, icon: Store, accent: '#6366f1' },
        ].map((met, i) => (
          <div key={i} className="rounded-[24px] border border-[#e4e8f2] bg-white p-7 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-5">
              <div className="h-12 w-12 rounded-[16px] flex items-center justify-center bg-[#f8fafc] border border-[#eef2f6]">
                <met.icon className="h-6 w-6" style={{ color: met.accent }} />
              </div>
              <div className="flex flex-col">
                <p className="text-[0.7rem] font-bold text-[#6d7892] uppercase tracking-[0.14em] mb-1">{met.label}</p>
                <h4 className="text-2xl font-bold text-[#11182d] leading-none">{met.value}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sellers Management Section */}
      <div className="px-4">
        <div className="rounded-[28px] border border-[#e4e8f2] bg-white overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-[#f1f4f9] flex items-center justify-between bg-gray-50/20">
            <div className="flex items-center gap-3">
               <div className="h-9 w-9 bg-blue-50 text-[#0f49d7] rounded-xl flex items-center justify-center">
                  <Store className="w-4.5 h-4.5" />
               </div>
               <div>
                  <h2 className="text-[1rem] font-bold text-[#11182d]">Merchant Ecosystem</h2>
                  <p className="text-[0.65rem] text-[#6d7892] font-bold uppercase tracking-widest">Authorized Vendors & Partners</p>
               </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#fcfdfe]">
                <tr>
                  <th className="px-8 py-4 text-left text-[0.7rem] font-bold text-[#6d7892] uppercase tracking-widest">Merchant Details</th>
                  <th className="px-8 py-4 text-left text-[0.7rem] font-bold text-[#6d7892] uppercase tracking-widest">Login Identifier</th>
                  <th className="px-8 py-4 text-left text-[0.7rem] font-bold text-[#6d7892] uppercase tracking-widest">Audit Status</th>
                  <th className="px-8 py-4 text-right text-[0.7rem] font-bold text-[#6d7892] uppercase tracking-widest leading-none">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f4f9]">
                {sellerList.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-[14px] overflow-hidden border border-[#eef2f6] shadow-sm">
                           <img src={`https://ui-avatars.com/api/?name=${u.username || 'S'}&background=0f49d7&color=fff&bold=true`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[0.9rem] font-bold text-[#11182d]">{u.username || "Vendor"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                         <span className="text-[0.88rem] font-semibold text-[#11182d]">{u.email}</span>
                         <span className="text-[0.65rem] font-bold text-[#6d7892] uppercase tracking-widest mt-0.5">ID: {u._id.substring(0, 8)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {u.isSuspended ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest border border-red-100">
                          Suspended
                        </span>
                      ) : u.isVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-widest border border-amber-100">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-3">
                        {!u.isBanned && (
                          <button
                            onClick={() => navigate(`/admin/suspension?sellerId=${u._id}`)}
                            className="h-10 px-5 rounded-xl border border-[#e4e8f2] text-[#11182d] hover:bg-[#11182d] hover:text-white text-[0.7rem] font-bold uppercase tracking-widest transition-all"
                          >
                            Protocol
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, userId: u._id })}
                          className="h-10 px-5 rounded-xl border border-red-100 text-red-500 hover:bg-red-500 hover:text-white text-[0.7rem] font-bold uppercase tracking-widest transition-all"
                        >
                          Terminate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customers Section */}
      <div className="px-4">
        <div className="rounded-[28px] border border-[#e4e8f2] bg-white overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-[#f1f4f9] flex items-center justify-between bg-gray-50/20">
            <div className="flex items-center gap-3">
               <div className="h-9 w-9 bg-blue-50 text-[#0f49d7] rounded-xl flex items-center justify-center">
                  <Users className="w-4.5 h-4.5" />
               </div>
               <div>
                  <h2 className="text-[1rem] font-bold text-[#11182d]">Platform Buyers</h2>
                  <p className="text-[0.65rem] text-[#6d7892] font-bold uppercase tracking-widest">Customer Base</p>
               </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#fcfdfe]">
                <tr>
                  <th className="px-8 py-4 text-left text-[0.7rem] font-bold text-[#6d7892] uppercase tracking-widest">Customer Name</th>
                  <th className="px-8 py-4 text-left text-[0.7rem] font-bold text-[#6d7892] uppercase tracking-widest">Access Email</th>
                  <th className="px-8 py-4 text-left text-[0.7rem] font-bold text-[#6d7892] uppercase tracking-widest">State</th>
                  <th className="px-8 py-4 text-right text-[0.7rem] font-bold text-[#6d7892] uppercase tracking-widest leading-none">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f4f9]">
                {userList.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 flex items-center gap-4">
                      <div className="h-10 w-10 bg-[#f8fafc] rounded-xl flex items-center justify-center border border-[#e4e8f2]">
                         <User className="w-4 h-4 text-[#6d7892]" />
                      </div>
                      <span className="text-[0.9rem] font-bold text-[#11182d]">{u.username || "Customer"}</span>
                    </td>
                    <td className="px-8 py-5 text-[0.88rem] font-semibold text-[#11182d]">{u.email}</td>
                    <td className="px-8 py-5">
                       {u.isVerified ? (
                          <span className="text-[0.65rem] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100 italic">Verified</span>
                       ) : (
                          <span className="text-[0.65rem] font-bold text-[#94a3b8] bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest border border-gray-100">Standard</span>
                       )}
                    </td>
                    <td className="px-8 py-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, userId: u._id })}
                        className="h-9 w-9 inline-flex items-center justify-center rounded-xl text-[#94a3b8] hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-2xl w-full max-w-[380px] shadow-2xl relative overflow-hidden">
            <div className="p-8 text-center">
              <div className="h-16 w-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-100">
                <ShieldAlert className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-[1.3rem] font-bold text-[#11182d] leading-none mb-3">Terminate Account?</h3>
              <p className="text-[0.88rem] text-[#6d7892] font-semibold leading-relaxed px-4">
                This action is <span className="text-red-500">permanent</span>. All associated data will be removed from the server.
              </p>
            </div>
            
            <div className="px-8 pb-8 flex flex-row gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, userId: null })}
                className="flex-1 bg-white text-[#6d7892] font-bold rounded-[14px] h-11 text-[0.88rem] hover:bg-gray-50 transition-colors border border-[#d9deeb]"
              >
                CANCEL
              </button>
              <button
                onClick={deleteUser}
                className="flex-1 bg-[#ef4444] text-white font-bold rounded-[14px] h-11 text-[0.88rem] hover:bg-red-700 transition-colors shadow-sm"
              >
                TERMINATE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
