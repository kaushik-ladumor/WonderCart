import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const AddAddressModal = ({ onAddressAdded }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    isDefault: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      const response = await axios.post(
        "http://localhost:4000/user/address",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        toast.success("Address added successfully!");
        onAddressAdded();
        // Reset form
        setFormData({
          fullName: "",
          phone: "",
          street: "",
          city: "",
          state: "",
          zipCode: "",
          isDefault: false,
        });
        // Close modal
        document.getElementById("add_address_modal").close();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog id="add_address_modal" className="modal">
      <div className="modal-box max-w-md">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>

        <h3 className="font-bold text-lg mb-6">Add New Address</h3>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full input input-bordered"
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Phone Number</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full input input-bordered"
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Street Address</span>
              </label>
              <textarea
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="House no., Building, Street, Area"
                rows="3"
                className="w-full textarea textarea-bordered resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text">City</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full input input-bordered"
                  required
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">State</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="w-full input input-bordered"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text">ZIP / Postal Code</span>
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="PIN Code"
                className="w-full input input-bordered"
                required
              />
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  className="checkbox checkbox-sm"
                />
                <span className="label-text">
                  Set as default shipping address
                </span>
              </label>
            </div>
          </div>

          <div className="modal-action">
            <button
              type="button"
              onClick={() =>
                document.getElementById("add_address_modal").close()
              }
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add Address"
              )}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default AddAddressModal;
