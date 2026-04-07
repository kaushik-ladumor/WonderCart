import { useEffect, useState } from "react";
import axios from "axios";
import {
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Home,
  Briefcase,
  MoreVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import { API_URL } from "../utils/constants";
import AddAddressModal from "./AddAddressModal";
import EditAddressModal from "./EditAddressModal";
import Loader from "../components/Loader";

const Address = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState(null);

  const getToken = () =>
    localStorage.getItem("token") || localStorage.getItem("authToken");

  const fetchAddresses = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await axios.get(`${API_URL}/user/address`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(res.data.addresses || []);
    } catch (error) {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      const token = getToken();
      await axios.delete(`${API_URL}/user/address/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Address deleted successfully");
      fetchAddresses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete address");
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const token = getToken();
      await axios.put(
        `${API_URL}/user/address/${addressId}/default`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Default address updated");
      fetchAddresses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update default address");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#f6f7fb] py-8 text-[#11182d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-[1.5rem] font-semibold tracking-tight text-[#141b2d]">
              Manage Addresses
            </h1>
            <p className="mt-2 text-[0.82rem] text-[#5c6880]">
              Add, edit, or remove your shipping coordinates for precise fulfillment.
            </p>
          </div>
          <button
            onClick={() => document.getElementById("add_address_modal").showModal()}
            className="flex items-center gap-2 bg-[#004ac6] text-white px-5 py-2.5 rounded-xl font-semibold text-[0.82rem] tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-500/10"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`relative group bg-white rounded-2xl p-6 border transition-all duration-300 ${
                address.isDefault
                  ? "border-[#004ac6] ring-1 ring-[#004ac6]/10 shadow-tonal-md"
                  : "border-[#eef2ff] hover:border-[#004ac6]/30 hover:shadow-tonal-sm"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    address.isDefault ? "bg-[#004ac6] text-white" : "bg-[#f0f4ff] text-[#004ac6]"
                  }`}>
                    {address.addressType === "work" ? (
                      <Briefcase className="w-5 h-5" />
                    ) : (
                      <Home className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#5c6880]">
                      {address.addressType || "Home"}
                    </span>
                    <h3 className="font-semibold text-[#141b2d]">{address.fullName}</h3>
                  </div>
                </div>
                {address.isDefault && (
                  <span className="bg-[#f0f4ff] text-[#004ac6] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-[#004ac6]/10">
                    Default
                  </span>
                )}
              </div>

              <div className="space-y-2 text-[0.82rem] text-[#5c6880] mb-6 min-h-[80px]">
                <p className="leading-relaxed">{address.street}</p>
                <p>{address.city}, {address.state} - {address.zipCode}</p>
                <p className="flex items-center gap-2 font-semibold text-[#141b2d]">
                  <span className="w-4 h-4 rounded-full bg-[#f0f4ff] flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-[#004ac6]" />
                  </span>
                  {address.phone}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-5 border-t border-gray-50">
                <button
                  onClick={() => {
                    setEditingAddress(address);
                    document.getElementById("edit_address_modal").showModal();
                  }}
                  className="flex-1 text-[10px] font-black uppercase tracking-widest py-2.5 rounded-lg border border-[#eef2ff] text-[#5c6880] hover:bg-[#f0f4ff] hover:text-[#004ac6] transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(address._id)}
                  className="p-2.5 rounded-lg border border-[#eef2ff] text-[#5c6880] hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address._id)}
                    className="flex-1 text-[10px] font-black uppercase tracking-widest py-2.5 rounded-lg bg-[#f0f4ff] text-[#004ac6] hover:bg-[#004ac6] hover:text-white transition-all"
                  >
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))}

          {addresses.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-[#c6cede] text-[#5c6880]">
              <div className="w-16 h-16 rounded-full bg-[#f0f4ff] flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-[#004ac6]" />
              </div>
              <h3 className="font-semibold text-[0.9rem] text-[#141b2d]">No address saved yet</h3>
              <p className="text-[0.82rem] mt-1 mb-6">Add your first address to start ordering.</p>
              <button
                onClick={() => document.getElementById("add_address_modal").showModal()}
                className="bg-[#004ac6] text-white px-8 py-3 rounded-xl font-semibold text-[0.76rem] tracking-widest uppercase hover:scale-[1.05] transition-all"
              >
                Add New Address
              </button>
            </div>
          )}
        </div>
      </div>

      <AddAddressModal onAddressAdded={fetchAddresses} />
      <EditAddressModal
        address={editingAddress}
        onAddressUpdated={() => {
          setEditingAddress(null);
          fetchAddresses();
        }}
      />
    </div>
  );
};

export default Address;
