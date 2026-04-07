import { Truck, Clock, MapPin, Package, CheckCircle, Mail, Phone, History, ShieldCheck, ArrowRight } from "lucide-react";

function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-[#f8f9fc] text-[#11182d]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
           <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-[#0f49d7] rounded-xl flex items-center justify-center text-white shadow-sm">
                 <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-[#0f49d7]">Logistics Network</span>
           </div>
           <h1 className="text-[1.8rem] md:text-[2.2rem] font-semibold text-[#11182d] leading-tight tracking-tight mb-2">
             Shipping Policy
           </h1>
           <p className="text-[0.82rem] text-[#42506d] leading-relaxed max-w-lg font-medium">
             Precision fulfillment and rapid logistics management across the subcontinent.
           </p>
        </div>

        {/* Shipping Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Truck, title: "Standard", time: "5-7 Business Days", cost: "FREE over ₹999", color: "text-[#0f49d7]" },
            { icon: Clock, title: "Express", time: "2-3 Business Days", cost: "Only ₹99", color: "text-[#10b981]" },
            { icon: MapPin, title: "Coverage", time: "Pan-India Network", cost: "End-to-End Tracking", color: "text-[#8b5cf6]" },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-[#eef2ff] rounded-[24px] p-5 shadow-sm">
              <div className="w-10 h-10 bg-[#f8f9fc] border border-[#eef2ff] rounded-xl flex items-center justify-center mb-4 text-[#0f49d7]">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-[#11182d] text-[0.82rem] uppercase tracking-widest mb-1">{item.title}</h3>
              <p className="text-[#5d6a84] text-[0.7rem] font-medium mb-2 uppercase tracking-wide">{item.time}</p>
              <p className={`text-[0.7rem] font-semibold uppercase tracking-widest ${item.color}`}>{item.cost}</p>
            </div>
          ))}
        </div>

        {/* Policy Content */}
        <div className="space-y-6">
          <section className="bg-white border border-[#eef2ff] rounded-[24px] p-6 shadow-sm">
            <h2 className="text-[0.95rem] font-semibold text-[#11182d] uppercase tracking-widest mb-4 flex items-center gap-2">
               <div className="w-1 h-4 bg-[#0f49d7] rounded-full"></div> Processing Protocol
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
               {[ "Orders processed in 24-48h", "Weekends & holiday exclusion", "Volume-based latency alerts" ].map((t, i) => (
                 <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                    <p className="text-[#42506d] text-[0.72rem] font-semibold uppercase tracking-tight leading-relaxed">{t}</p>
                 </div>
               ))}
            </div>
          </section>

          <section className="bg-white border border-[#eef2ff] rounded-[24px] p-6 shadow-sm">
            <h2 className="text-[0.95rem] font-semibold text-[#11182d] uppercase tracking-widest mb-4 flex items-center gap-2">
               <div className="w-1 h-4 bg-[#0f49d7] rounded-full"></div> Tariff Schedule
            </h2>
            <div className="bg-[#f8f9fc] rounded-[20px] overflow-hidden border border-[#eef2ff]">
               <table className="w-full text-left">
                  <thead className="bg-[#0f49d7]/5 text-[0.6rem] font-semibold text-[#0f49d7] uppercase tracking-widest">
                     <tr>
                        <th className="px-6 py-3.5">Option Type</th>
                        <th className="px-6 py-3.5">Timeframe</th>
                        <th className="px-6 py-3.5 text-right">Settlement</th>
                     </tr>
                  </thead>
                  <tbody className="text-[0.7rem] font-semibold text-[#11182d]">
                     {[
                       { o: "FREE TIER", t: "5-7 BUSINESS DAYS", c: "FREE", color: "text-[#10b981]" },
                       { o: "EXPRESS PRIORITY", t: "2-3 BUSINESS DAYS", c: "₹99", color: "text-[#0f49d7]" },
                       { o: "REGULAR SHIP", t: "5-7 BUSINESS DAYS", c: "₹50", color: "text-[#11182d]" },
                     ].map((row, i) => (
                        <tr key={i} className={`border-t border-[#eef2ff] ${i % 2 === 1 ? 'bg-white' : ''}`}>
                           <td className="px-6 py-4 uppercase tracking-wide">{row.o}</td>
                           <td className="px-6 py-4 uppercase tracking-wide opacity-60 font-medium">{row.t}</td>
                           <td className={`px-6 py-4 text-right uppercase tracking-widest ${row.color}`}>{row.c}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </section>

          <section className="bg-white border border-[#eef2ff] rounded-[24px] p-6 shadow-sm">
            <h2 className="text-[0.95rem] font-semibold text-[#11182d] uppercase tracking-widest mb-4 flex items-center gap-2">
               <div className="w-1 h-4 bg-[#0f49d7] rounded-full"></div> Fulfillment Analytics
            </h2>
            <p className="text-[0.78rem] font-medium text-[#42506d] leading-relaxed mb-5">
              Live coordinates are established via an encrypted tracking ID dispatched upon fulfillment. We execute up to <span className="text-[#11182d] font-semibold">3 strategic delivery attempts</span> to ensure receipt.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[
                 { icon: History, t: "Operational window", d: "MON - SAT | 9 AM - 8 PM", bg: "bg-[#eef2ff]", c: "text-[#0f49d7]" },
                 { icon: Package, t: "Precision Pack", d: "Secure double-seal cases", bg: "bg-[#fff1f2]", c: "text-[#e11d48]" },
               ].map((item, i) => (
                 <div key={i} className={`${item.bg} rounded-[20px] p-5 flex items-start gap-4 border border-black/5`}>
                    <div className="bg-white p-2.5 rounded-xl text-[#0f49d7] shadow-sm">
                      <item.icon className={`w-4 h-4 ${item.c}`} />
                    </div>
                    <div>
                       <p className="text-[0.55rem] font-semibold text-[#11182d] uppercase tracking-widest opacity-40 mb-1">{item.t}</p>
                       <p className="text-[0.74rem] font-semibold text-[#11182d] uppercase tracking-wide">{item.d}</p>
                    </div>
                 </div>
               ))}
            </div>
          </section>

          <section className="bg-white border border-[#eef2ff] rounded-[24px] p-6 shadow-sm">
            <h2 className="text-[0.95rem] font-semibold text-[#11182d] uppercase tracking-widest mb-6 flex items-center gap-2">
               <div className="w-1 h-4 bg-[#0f49d7] rounded-full"></div> Regional Timelines
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { l: "METRO CENTERS", d: "2-3 DAYS" },
                { l: "TIER 2 CITIES", d: "4-5 DAYS" },
                { l: "TIER 3 CITIES", d: "5-7 DAYS" },
                { l: "REMOTE REGIONS", d: "7-10 DAYS" }
              ].map((loc, i) => (
                <div key={i} className="bg-[#f8f9fc] border border-[#eef2ff] rounded-2xl p-4">
                  <p className="text-[0.6rem] font-semibold text-[#0f49d7] mb-1 uppercase tracking-widest">{loc.l}</p>
                  <p className="text-[0.8rem] font-black text-[#11182d]">{loc.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-[#eef2ff] rounded-[24px] p-6 shadow-sm">
             <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-[#f8f9fc] border border-[#eef2ff] rounded-xl flex items-center justify-center text-[#0f49d7] shadow-sm">
                      <Mail className="w-4.5 h-4.5" />
                   </div>
                   <div>
                      <p className="text-[0.55rem] font-semibold text-[#0f49d7] uppercase tracking-widest">Fulfillment Helpdesk</p>
                      <p className="text-[0.74rem] font-semibold text-[#11182d] uppercase tracking-widest">wondercarthelp@gmail.com</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="text-[0.75rem] font-semibold text-[#11182d] bg-[#f8f9fc] px-5 py-2.5 rounded-xl border border-[#eef2ff]">+91 7226987466</div>
                </div>
             </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-8 bg-[#1e293b] text-white rounded-[28px] p-8 text-center shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 w-48 h-48 bg-[#0f49d7]/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
           <div className="w-12 h-12 bg-[#0f49d7] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
             <Package className="w-6 h-6 text-white" />
           </div>
           <h3 className="text-[1.2rem] font-semibold mb-3 uppercase tracking-widest">Fulfillment Unleashed</h3>
           <p className="text-white/60 text-[0.74rem] uppercase tracking-widest font-semibold mb-8 max-w-sm mx-auto leading-relaxed">
             Get <span className="text-[#10b981]">FREE SHIPPING</span> on all premium orders over ₹999 currently live for pan-India delivery.
           </p>
           <a
             href="/"
             className="inline-block bg-[#0f49d7] text-white px-10 py-3.5 rounded-xl font-semibold text-[0.65rem] uppercase tracking-widest shadow-md border-none outline-none"
           >
             Start Acquisition
           </a>
        </div>
      </div>
    </div>
  );
}

export default ShippingPolicy;
