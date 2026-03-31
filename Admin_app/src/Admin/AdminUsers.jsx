import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../utils/constants";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthProvider";
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
} from "lucide-react";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.data.users);
      console.log(response.data.data.users);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`${API_URL}/admin/users/delete`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { userId },
      });
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      console.log("User deleted successfully");
      toast.success("User Deleted Successfully");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Header - FAQ style */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-3">
            <Users className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            User Management
          </h1>
          <p className="text-gray-600 text-sm">
            Manage all users and sellers on your platform
          </p>
        </div>

        {/* Users Table - FAQ style */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-600" />
              <h2 className="text-base font-bold text-gray-900">
                User Data ({userList.length})
              </h2>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              Regular customers and buyers
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {userList.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-600 font-medium text-xs">
                            {u.username
                              ? u.username.charAt(0).toUpperCase()
                              : "U"}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">
                          {u.username || "No Name"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-600">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          <XCircle className="w-3 h-3" />
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteUser(u._id)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {userList.map((u) => (
              <div key={u._id} className="p-3 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 font-medium text-xs">
                        {u.username ? u.username.charAt(0).toUpperCase() : "U"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {u.username || "No Name"}
                      </p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteUser(u._id)}
                    className="p-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                    {u.role}
                  </span>
                  {u.isVerified ? (
                    <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 border border-green-200 rounded flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Unverified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sellers Table - FAQ style */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-gray-600" />
              <h2 className="text-base font-bold text-gray-900">
                Seller Data ({sellerList.length})
              </h2>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              Product sellers and vendors
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sellerList.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-600 font-medium text-xs">
                            {u.username
                              ? u.username.charAt(0).toUpperCase()
                              : "S"}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">
                          {u.username || "No Name"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-600">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          <XCircle className="w-3 h-3" />
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteUser(u._id)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {sellerList.map((u) => (
              <div key={u._id} className="p-3 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 font-medium text-xs">
                        {u.username ? u.username.charAt(0).toUpperCase() : "S"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {u.username || "No Name"}
                      </p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteUser(u._id)}
                    className="p-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded">
                    {u.role}
                  </span>
                  {u.isVerified ? (
                    <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 border border-green-200 rounded flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Unverified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
