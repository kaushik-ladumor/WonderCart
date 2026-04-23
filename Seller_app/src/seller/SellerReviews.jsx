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
    <div className="space-y-4 px-0 pb-6">
      {/* Header section */}
      <section className="rounded-[28px] border border-[#e3e8ff] bg-white px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#9aa6c7]">
              Seller Performance
            </p>
            <h1 className="mt-1.5 text-[24px] font-semibold tracking-[-0.03em] text-[#11182d]">
              Customer Feedback
            </h1>
            <p className="mt-1.5 max-w-2xl text-[13px] text-[#6d7894]">
              Monitor your shop's reputation and service quality through authentic customer reviews.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Overall Score */}
        <div className="lg:col-span-4 rounded-[28px] border border-[#e3e8ff] bg-white p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#9aa6c7] mb-4">Overall Score</h3>
            <div className="text-[54px] font-bold text-[#11182d] leading-none mb-2">
                {stats.avg.toFixed(1)}
            </div>
            <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(stats.avg) ? "fill-orange-400 text-orange-400" : "fill-gray-100 text-gray-200"}`} />
                ))}
            </div>
            <p className="text-[13px] text-[#6d7894] font-medium">Based on {stats.total} verified reviews</p>
        </div>

        {/* Breakdown */}
        <div className="lg:col-span-8 rounded-[28px] border border-[#e3e8ff] bg-white p-6">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#9aa6c7] mb-6">Rating Breakdown</h3>
            <div className="space-y-4">
                {[5, 4, 3, 2, 1].map(star => {
                    const count = stats.breakdown[star];
                    const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                        <div key={star} className="flex items-center gap-4">
                            <div className="flex items-center gap-1 w-12">
                                <span className="text-[13px] font-bold text-[#11182d]">{star}</span>
                                <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                            </div>
                            <div className="flex-1 h-2.5 bg-[#f5f7ff] rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-orange-400 rounded-full transition-all duration-500" 
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                            <span className="text-[12px] font-semibold text-[#6d7894] w-10 text-right">{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

      {/* Reviews List */}
      <section className="space-y-4">
        {reviews.length === 0 ? (
          <div className="rounded-[28px] border border-[#e3e8ff] bg-white px-6 py-16 text-center">
             <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#f2f5ff]">
                <MessageSquare className="h-8 w-8 text-[#6c79a0]" />
             </div>
             <h3 className="text-[18px] font-semibold text-[#11182d]">No shop reviews yet</h3>
             <p className="mx-auto mt-2 max-w-sm text-[13px] text-[#6d7894]">
               Once customers rate your service and delivery, their feedback will appear here.
             </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div key={rev._id} className="rounded-[24px] border border-[#e3e8ff] bg-white p-5 hover:border-[#2f5fe3]/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f5f7ff] border border-[#eef2ff] flex items-center justify-center text-[13px] font-bold text-[#2f5fe3]">
                        {rev.user?.name?.[0]?.toUpperCase() || rev.user?.username?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                        <h4 className="text-[14px] font-bold text-[#11182d]">{rev.user?.name || rev.user?.username || "Anonymous"}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <ShieldCheck className="w-3 h-3 text-[#10b981]" />
                            <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-wider">Verified Buyer</span>
                        </div>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-orange-400 text-orange-400" : "fill-gray-100 text-gray-200"}`} />
                    ))}
                  </div>
                </div>
                
                <div className="bg-[#fcfdfe] border border-[#f0f4ff] rounded-[14px] p-4 mb-3">
                    <p className="text-[13px] text-[#42506d] leading-relaxed italic">
                        "{rev.comment || "No comment provided."}"
                    </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#9aa6c7] font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Submitted on {new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default SellerReviews;
