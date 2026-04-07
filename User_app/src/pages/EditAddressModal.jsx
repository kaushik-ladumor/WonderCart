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
    <dialog id="edit_address_modal" className="modal font-body shadow-none">
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
        <div className="bg-white rounded-2xl w-full max-w-md mx-auto shadow-tonal-md relative max-h-[90vh] overflow-y-auto scrollbar-hide animate-in zoom-in-95 duration-300">
          
          {/* Close Button */}
          <button
            onClick={() => document.getElementById("edit_address_modal").close()}
            disabled={loading}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#5c6880] hover:bg-[#f0f4ff] transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="px-6 pt-6 pb-0 text-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#004ac6] font-semibold block mb-1">
              SHIPPING LOGISTICS
            </span>
            <h3 className="font-display text-[1.2rem] font-semibold text-[#141b2d]">
              Edit Address
            </h3>
            <p className="text-[0.76rem] text-[#5c6880] mt-1 mb-5 leading-relaxed">
              Verifying your updated delivery coordinates.
            </p>
          </div>

          <div className="px-6 py-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-[#5c6880]">Full Name</label>
                  <div className="bg-[#f0f4ff] rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#004ac6]/20 transition-all border border-transparent focus-within:border-[#004ac6]/20">
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="NAME..."
                      className="bg-transparent w-full text-[0.76rem] text-[#141b2d] outline-none placeholder:text-[#5c6880]/40 font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-[#5c6880]">Phone</label>
                  <div className="bg-[#f0f4ff] rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#004ac6]/20 transition-all border border-transparent focus-within:border-[#004ac6]/20">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-DIGIT..."
                      className="bg-transparent w-full text-[0.76rem] text-[#141b2d] outline-none placeholder:text-[#5c6880]/40 font-semibold"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[#5c6880]">Address Type</label>
                <div className="grid grid-cols-2 gap-3 p-1 bg-[#f0f4ff] rounded-xl">
                  {["home", "work"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, addressType: type })}
                      className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        formData.addressType === type
                          ? "bg-white text-[#004ac6] shadow-sm"
                          : "text-[#5c6880] hover:text-[#004ac6]"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[#5c6880]">Street Address</label>
                <div className="bg-[#f0f4ff] rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#004ac6]/20 transition-all border border-transparent focus-within:border-[#004ac6]/20">
                  <textarea
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="LOCALE DETAILS..."
                    rows="2"
                    className="bg-transparent w-full text-[0.76rem] text-[#141b2d] outline-none placeholder:text-[#5c6880]/40 font-semibold resize-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5 text-center">
                  <label className="text-[8px] uppercase tracking-widest font-black text-[#5c6880]">City</label>
                  <div className="bg-[#f0f4ff] rounded-xl px-3 py-2.5">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="CITY"
                      className="bg-transparent w-full text-[0.76rem] text-center text-[#141b2d] outline-none placeholder:text-[#5c6880]/40 font-semibold"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5 text-center">
                  <label className="text-[8px] uppercase tracking-widest font-black text-[#5c6880]">State</label>
                  <div className="bg-[#f0f4ff] rounded-xl px-3 py-2.5">
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="STATE"
                      className="bg-transparent w-full text-[0.76rem] text-center text-[#141b2d] outline-none placeholder:text-[#5c6880]/40 font-semibold"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5 text-center">
                  <label className="text-[8px] uppercase tracking-widest font-black text-[#5c6880]">Zip</label>
                  <div className="bg-[#f0f4ff] rounded-xl px-3 py-2.5">
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder="PIN"
                      className="bg-transparent w-full text-[0.76rem] text-center text-[#141b2d] outline-none placeholder:text-[#5c6880]/40 font-semibold"
                      required
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group py-1">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-2 border-transparent bg-[#f0f4ff] text-[#004ac6] focus:ring-[#004ac6]/10"
                />
                <span className="text-[10px] font-semibold text-[#5c6880] uppercase tracking-widest group-hover:text-[#141b2d] transition-colors">
                  Set as default shipping address
                </span>
              </label>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white font-semibold rounded-xl h-12 text-[0.76rem] uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-50"
                >
                  {loading ? "SAVING..." : "UPDATE ADDRESS"}
                </button>
              </div>
            </form>
          </div>

          {/* Modal Footer */}
          <div className="px-6 pb-6 pt-2 border-t border-[#f0f4ff] bg-gray-50/30">
            <div className="flex items-center gap-3 text-[#5c6880]">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#f0f4ff]">
                <MapPin className="w-3.5 h-3.5 text-[#004ac6]" />
              </div>
              <span className="text-[10px] uppercase tracking-wider font-medium leading-tight">Your data is secured. Precise location details ensure accurate delivery estimates.</span>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default EditAddressModal;
