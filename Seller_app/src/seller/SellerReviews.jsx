import React, { useEffect, useState } from "react";
import axios from "axios";
import { Star, MessageSquare, User, Calendar, ShieldCheck, AlertCircle, RefreshCw, StarHalf } from "lucide-react";
import { API_URL } from "../utils/constants";
import Loader from "../components/Loader";

const SellerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avg: 0,
    total: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/seller-review/my-reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        const revs = res.data.reviews || [];
        setReviews(revs);
        calculateStats(revs);
      }
    } catch (err) {
      console.error("Failed to load seller reviews", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (revs) => {
    if (revs.length === 0) return;

    const total = revs.length;
    const sum = revs.reduce((acc, r) => acc + r.rating, 0);
    const avg = sum / total;

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    revs.forEach(r => {
      if (breakdown[r.rating] !== undefined) breakdown[r.rating]++;
    });

    setStats({ avg, total, breakdown });
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#f6f7fb] py-3 text-[#11182d] font-poppins">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {/* Header section */}
          <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[0.74rem] font-semibold uppercase tracking-wider text-[#0f49d7]">
                Seller Performance
              </p>
              <h1 className="mt-1 text-[1.5rem] font-semibold tracking-tight sm:text-[1.75rem]">
                Customer Feedback
              </h1>
              <p className="mt-1 text-[0.82rem] text-[#6d7892]">
                Monitor your shop's reputation and service quality through authentic customer reviews.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Overall Score */}
            <div className="lg:col-span-4 rounded-[18px] border border-[#e1e5f1] bg-white p-4 flex flex-col items-center justify-center text-center">
              <h3 className="text-[0.74rem] font-semibold uppercase tracking-wider text-[#6d7892] mb-3">Overall Score</h3>
              <div className="text-[3rem] font-semibold text-[#11182d] leading-none mb-2">
                {stats.avg.toFixed(1)}
              </div>
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(stats.avg) ? "fill-orange-400 text-orange-400" : "fill-gray-100 text-gray-200"}`} />
                ))}
              </div>
              <p className="text-[0.82rem] text-[#6d7892]">Based on {stats.total} verified reviews</p>
            </div>

            {/* Breakdown */}
            <div className="lg:col-span-8 rounded-[18px] border border-[#e1e5f1] bg-white p-4">
              <h3 className="text-[0.74rem] font-semibold uppercase tracking-wider text-[#6d7892] mb-4">Rating Breakdown</h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = stats.breakdown[star];
                  const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-10">
                        <span className="text-[0.82rem] font-semibold text-[#11182d]">{star}</span>
                        <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                      </div>
                      <div className="flex-1 h-2 bg-[#f6f7fb] rounded-full overflow-hidden border border-[#e1e5f1]">
                        <div
                          className="h-full bg-orange-400 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[0.78rem] font-medium text-[#6d7892] w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[18px] border border-dashed border-[#c6cede] bg-[#f8f9fd] py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#6d7892] shadow-sm">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <h3 className="text-[1.05rem] font-semibold text-[#11182d]">No shop reviews yet</h3>
                <p className="mt-1 max-w-sm text-[0.82rem] text-[#6d7892]">
                  Once customers rate your service and delivery, their feedback will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {reviews.map((rev) => (
                  <div key={rev._id} className="rounded-[18px] border border-[#e1e5f1] bg-white p-4 transition-all hover:border-[#b3bdd2]">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e1e5f1] bg-[#f6f7fb] text-[0.88rem] font-semibold text-[#0f49d7]">
                          {rev.user?.name?.[0]?.toUpperCase() || rev.user?.username?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <h4 className="text-[0.9rem] font-semibold text-[#11182d]">{rev.user?.name || rev.user?.username || "Anonymous"}</h4>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-[0.7rem] font-bold uppercase tracking-wider text-emerald-500">Verified Buyer</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < rev.rating ? "fill-orange-400 text-orange-400" : "fill-gray-100 text-gray-200"}`} />
                        ))}
                      </div>
                    </div>

                    <div className="mb-3 rounded-[14px] border border-[#e1e5f1] bg-[#f8f9fd] p-3">
                      <p className="text-[0.82rem] leading-relaxed italic text-[#33415e]">
                        "{rev.comment || "No comment provided."}"
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[0.74rem] text-[#6d7892]">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Submitted on {new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerReviews;
