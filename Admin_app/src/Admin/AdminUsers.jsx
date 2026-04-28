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
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#f6f7fb]">
        <div className="text-center space-y-3">
          <div className="relative">
            <div className="w-8 h-8 border border-[#e2e8f0] rounded-full"></div>
            <div className="w-8 h-8 border border-[#0f49d7] border-t-transparent rounded-full animate-spin absolute inset-0"></div>
          </div>
          <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10 font-poppins bg-[#f6f7fb] min-h-screen px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Section */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between mb-4">
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-[#11182d]">User Governance</h1>
          <p className="mt-1 text-[0.85rem] text-[#64748b]">
            Manage platform access, review merchant profiles, and handle account security protocols.
          </p>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { label: 'Total Accounts', value: users.length, icon: Users, accent: '#0f49d7' },
          { label: 'Platform Buyers', value: userList.length, icon: User, accent: '#10b981' },
          { label: 'Verified Sellers', value: sellerList.filter(s => s.isVerified).length, icon: Store, accent: '#6366f1' },
        ].map((met, i) => (
          <div key={i} className="rounded-[18px] border border-[#d7dcea] bg-white p-7 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="h-12 w-12 rounded-[14px] flex items-center justify-center bg-[#f8fafc] border border-[#e2e8f0]">
                <met.icon className="h-6 w-6" style={{ color: met.accent }} />
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-1">{met.label}</p>
                <h4 className="text-2xl font-bold text-[#11182d] leading-none">{met.value}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sellers Management Section */}
      <div>
        <div className="rounded-[18px] border border-[#d7dcea] bg-white overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
            <div className="flex items-center gap-3">
               <div className="h-9 w-9 bg-blue-50 text-[#0f49d7] rounded-xl flex items-center justify-center border border-blue-100">
                  <Store className="w-4 h-4" />
               </div>
               <div>
                  <h2 className="text-[1rem] font-bold text-[#11182d]">Merchant Ecosystem</h2>
                  <p className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider">Authorized Vendors & Partners</p>
               </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                <tr>
                  <th className="px-8 py-4 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Merchant Details</th>
                  <th className="px-8 py-4 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Login Identifier</th>
                  <th className="px-8 py-4 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Audit Status</th>
                  <th className="px-8 py-4 text-right text-[10px] font-bold text-[#64748b] uppercase tracking-wider leading-none">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {sellerList.map((u) => (
                  <tr key={u._id}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-[14px] overflow-hidden border border-[#e2e8f0] shadow-sm">
                           <img src={`https://ui-avatars.com/api/?name=${u.username || 'S'}&background=0f49d7&color=fff&bold=true`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[0.9rem] font-bold text-[#11182d]">{u.username || "Vendor"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                         <span className="text-[0.88rem] font-semibold text-[#11182d]">{u.email}</span>
                         <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mt-0.5">ID: {u._id.substring(0, 8)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {u.isSuspended ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#fef2f2] text-[#dc2626] text-[9px] font-bold uppercase tracking-wider border border-[#fecaca]">
                          Suspended
                        </span>
                      ) : u.isVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#f0fdf4] text-[#16a34a] text-[9px] font-bold uppercase tracking-wider border border-[#bbf7d0]">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#fffbeb] text-[#d97706] text-[9px] font-bold uppercase tracking-wider border border-[#fde68a]">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-3">
                        {!u.isBanned && (
                          <button
                            onClick={() => navigate(`/admin/suspension?sellerId=${u._id}`)}
                            className="h-9 px-4 rounded-[10px] bg-white border border-[#d7dcea] text-[#64748b] text-[10px] font-bold uppercase tracking-wider"
                          >
                            Protocol
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, userId: u._id })}
                          className="h-9 px-4 rounded-[10px] bg-white border border-[#fecaca] text-[#dc2626] text-[10px] font-bold uppercase tracking-wider"
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
      <div>
        <div className="rounded-[18px] border border-[#d7dcea] bg-white overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
            <div className="flex items-center gap-3">
               <div className="h-9 w-9 bg-blue-50 text-[#0f49d7] rounded-xl flex items-center justify-center border border-blue-100">
                  <Users className="w-4 h-4" />
               </div>
               <div>
                  <h2 className="text-[1rem] font-bold text-[#11182d]">Platform Buyers</h2>
                  <p className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider">Customer Base</p>
               </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                <tr>
                  <th className="px-8 py-4 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Customer Name</th>
                  <th className="px-8 py-4 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Access Email</th>
                  <th className="px-8 py-4 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-wider">State</th>
                  <th className="px-8 py-4 text-right text-[10px] font-bold text-[#64748b] uppercase tracking-wider leading-none">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {userList.map((u) => (
                  <tr key={u._id}>
                    <td className="px-8 py-5 flex items-center gap-4">
                      <div className="h-10 w-10 bg-[#f8fafc] rounded-[14px] flex items-center justify-center border border-[#e2e8f0]">
                         <User className="w-4 h-4 text-[#64748b]" />
                      </div>
                      <span className="text-[0.9rem] font-bold text-[#11182d]">{u.username || "Customer"}</span>
                    </td>
                    <td className="px-8 py-5 text-[0.88rem] font-semibold text-[#11182d]">{u.email}</td>
                    <td className="px-8 py-5">
                       {u.isVerified ? (
                          <span className="text-[9px] font-bold text-[#16a34a] bg-[#f0fdf4] px-2.5 py-1 rounded-[8px] uppercase tracking-wider border border-[#bbf7d0]">Verified</span>
                       ) : (
                          <span className="text-[9px] font-bold text-[#64748b] bg-[#f8fafc] px-2.5 py-1 rounded-[8px] uppercase tracking-wider border border-[#e2e8f0]">Standard</span>
                       )}
                    </td>
                    <td className="px-8 py-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, userId: u._id })}
                        className="h-9 w-9 inline-flex items-center justify-center rounded-[10px] text-[#64748b] bg-white border border-[#d7dcea]"
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
          <div className="bg-white rounded-[24px] w-full max-w-[380px] shadow-2xl relative overflow-hidden">
            <div className="p-8 text-center">
              <div className="h-16 w-16 bg-[#fef2f2] rounded-[18px] flex items-center justify-center mx-auto mb-5 border border-[#fecaca]">
                <ShieldAlert className="h-8 w-8 text-[#dc2626]" />
              </div>
              <h3 className="text-[1.3rem] font-bold text-[#11182d] leading-none mb-3">Terminate Account?</h3>
              <p className="text-[0.88rem] text-[#64748b] font-medium leading-relaxed px-4">
                This action is <span className="text-[#dc2626] font-bold">permanent</span>. All associated data will be removed from the server.
              </p>
            </div>
            
            <div className="px-8 pb-8 flex flex-row gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, userId: null })}
                className="flex-1 bg-white text-[#64748b] font-bold rounded-[14px] h-11 text-[0.88rem] border border-[#d7dcea]"
              >
                CANCEL
              </button>
              <button
                onClick={deleteUser}
                className="flex-1 bg-[#ef4444] text-white font-bold rounded-[14px] h-11 text-[0.88rem] shadow-sm"
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
