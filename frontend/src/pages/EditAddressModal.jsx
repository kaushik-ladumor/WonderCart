import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Save, Loader2, MapPin, X, Home, Briefcase } from "lucide-react";
import { API_URL } from "../utils/constants";

const EditAddressModal = ({ onAddressUpdated, address }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    addressType: "home",
    isDefault: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      setFormData({
        fullName: address.fullName || "",
        phone: address.phone || "",
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        zipCode: address.zipCode || "",
        addressType: address.addressType || "home",
        isDefault: address.isDefault || false,
      });
    }
  }, [address]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!address) return;

    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");

    if (!token) {
      toast.error("Please login first");
      return;
    }

    // Validation
    if (!formData.fullName.trim()) {
      toast.error("Please enter full name");
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    if (!formData.street.trim()) {
      toast.error("Please enter street address");
      return;
    }
    if (!formData.city.trim()) {
      toast.error("Please enter city");
      return;
    }
    if (!formData.state.trim()) {
      toast.error("Please enter state");
      return;
    }
    if (!formData.zipCode.trim() || formData.zipCode.length < 6) {
      toast.error("Please enter a valid zip code");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/user/address/${address._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        toast.success("Address updated successfully!");
        onAddressUpdated();
        // Close modal
        document.getElementById("edit_address_modal").close();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog id="edit_address_modal" className="modal">
      <div className="modal-box max-w-md p-5 bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Edit Address</h3>
              <p className="text-gray-600 text-xs mt-0.5">
                Update your shipping details
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              document.getElementById("edit_address_modal").close()
            }
            className="btn btn-sm btn-ghost btn-circle hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            {/* Name & Phone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm text-gray-900 placeholder-gray-500 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm text-gray-900 placeholder-gray-500 bg-white"
                  required
                />
              </div>
            </div>

            {/* Address Type */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Address Type
              </label>
              <div className="flex gap-2">
                {["home", "work"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, addressType: type })
                    }
                    className={`flex-1 px-3 py-2 rounded border text-sm font-medium flex items-center justify-center gap-2 ${formData.addressType === type
                      ? "bg-black text-white border-black"
                      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                      }`}
                  >
                    {type === "home" ? (
                      <Home className="w-3.5 h-3.5" />
                    ) : (
                      <Briefcase className="w-3.5 h-3.5" />
                    )}
                    {type === "home" ? "Home" : "Work"}
                  </button>
                ))}
              </div>
            </div>

            {/* Street Address */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Street Address
              </label>
              <textarea
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="House no., Building, Street, Area"
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none text-sm text-gray-900 placeholder-gray-500 bg-white"
                required
              />
            </div>

            {/* City, State, ZIP Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm text-gray-900 placeholder-gray-500 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm text-gray-900 placeholder-gray-500 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="PIN Code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm text-gray-900 placeholder-gray-500 bg-white"
                  required
                />
              </div>
            </div>

            {/* Default Checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black"
                />
                <span className="text-sm text-gray-700">
                  Set as default shipping address
                </span>
              </label>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-2 pt-4 mt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() =>
                document.getElementById("edit_address_modal").close()
              }
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Address
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      {/* Modal backdrop */}
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default EditAddressModal;
