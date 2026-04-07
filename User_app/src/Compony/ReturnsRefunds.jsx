import {
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Package,
  Truck,
  CreditCard,
  History,
  ShieldCheck,
  ArrowRight
} from "lucide-react";

function ReturnsRefunds() {
  return (
    <div className="min-h-screen bg-[#f8f9fc] text-[#11182d]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
           <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-[#0f49d7] rounded-xl flex items-center justify-center text-white shadow-sm">
                 <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-[#0f49d7]">Fulfillment Guarantee</span>
           </div>
           <h1 className="text-[1.8rem] md:text-[2.2rem] font-semibold text-[#11182d] leading-tight tracking-tight mb-2">
             Returns & Refunds
           </h1>
           <p className="text-[0.82rem] text-[#42506d] leading-relaxed max-w-lg">
              Our commitment to excellence includes a seamless return protocol for your peace of mind.
           </p>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: RotateCcw, title: "30-Day Returns", desc: "Standard return window", color: "text-[#0f49d7]" },
            { icon: CheckCircle, title: "Free Protocol", desc: "No hidden restocking fees", color: "text-[#10b981]" },
            { icon: CreditCard, title: "Quick Credits", desc: "Processed in 5-7 days", color: "text-[#8b5cf6]" },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-[#eef2ff] rounded-[24px] p-5 shadow-sm">
              <div className="w-10 h-10 bg-[#f8f9fc] border border-[#eef2ff] rounded-xl flex items-center justify-center mb-4">
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <h3 className="font-semibold text-[#11182d] text-[0.82rem] uppercase tracking-widest mb-1">{item.title}</h3>
              <p className="text-[#5d6a84] text-[0.7rem] font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Policy Content */}
        <div className="space-y-6">
          <section className="bg-white border border-[#eef2ff] rounded-[24px] p-6 shadow-sm">
            <h2 className="text-[0.95rem] font-semibold text-[#11182d] uppercase tracking-widest mb-3 flex items-center gap-2">
               <div className="w-1 h-4 bg-[#0f49d7] rounded-full"></div> Core Policy
            </h2>
            <p className="text-[0.78rem] text-[#42506d] leading-relaxed font-medium">
              We offer a 30-day return policy on most items. To be eligible,
              items must be unused, in original condition, and in original
              packaging. Some categories such as personal care and gift cards are excluded for health and safety reasons.
            </p>
          </section>

          <section className="bg-white border border-[#eef2ff] rounded-[24px] p-6 shadow-sm">
            <h2 className="text-[0.95rem] font-semibold text-[#11182d] uppercase tracking-widest mb-6 flex items-center gap-2">
               <div className="w-1 h-4 bg-[#0f49d7] rounded-full"></div> Return Workflow
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { n: "01", t: "Initiate Return", d: "Access your dashboard and select items for return." },
                { n: "02", t: "Package Securely", d: "Pack items in original state with all accessories." },
                { n: "03", t: "Ship Returns", d: "Attach shipping label and drop off at courier hub." },
                { n: "04", t: "Audit & Refund", d: "Refund issued after our 24h inspection protocol." },
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-7 h-7 bg-[#f8f9fc] border border-[#eef2ff] text-[#0f49d7] rounded-lg flex items-center justify-center flex-shrink-0 text-[0.65rem] font-semibold">
                    {step.n}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#11182d] text-[0.78rem] uppercase tracking-widest mb-1">{step.t}</h3>
                    <p className="text-[#5d6a84] text-[0.7rem] leading-relaxed font-medium">{step.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-[#eef2ff] rounded-[24px] p-6 shadow-sm">
            <h2 className="text-[0.95rem] font-semibold text-[#11182d] uppercase tracking-widest mb-3 flex items-center gap-2">
               <div className="w-1 h-4 bg-[#0f49d7] rounded-full"></div> Refund Settlement
            </h2>
            <p className="text-[0.78rem] text-[#42506d] leading-relaxed mb-5 font-medium">
              Once your return is received and inspected, we'll notify you of the approval status. Approved refunds are processed immediately to your original payment method.
            </p>
            <div className="bg-[#fff1f2] border border-[#ffe4e6] rounded-[18px] p-4 flex items-start gap-3">
               <AlertCircle className="w-4 h-4 text-[#e11d48] flex-shrink-0 mt-0.5" />
               <div>
                  <p className="text-[0.7rem] font-semibold text-[#e11d48] uppercase tracking-widest mb-0.5">Banking Latency Note</p>
                  <p className="text-[0.68rem] font-semibold text-[#e11d48]/70 leading-relaxed uppercase tracking-wide">Financial institutions may take 2-3 additional business days to settle funds.</p>
               </div>
            </div>
          </section>

          <section className="bg-white border border-[#eef2ff] rounded-[24px] p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-[0.9rem] font-semibold text-[#11182d] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#10b981]" /> Eligible Items
                </h2>
                <ul className="space-y-2.5">
                  {[ "Unused original state", "All tags/labels attached", "Within 30-day window" ].map((t, i) => (
                    <li key={i} className="text-[0.7rem] font-semibold text-[#5d6a84] uppercase tracking-wide flex items-center gap-2.5">
                      <ArrowRight className="w-3 h-3 text-[#10b981]" /> {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-[0.9rem] font-semibold text-[#11182d] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-[#e11d48]" /> Not Eligible
                </h2>
                <ul className="space-y-2.5">
                  {[ "Digital gift vouchers", "Hygiene sensitive products", "Final clearance items" ].map((t, i) => (
                    <li key={i} className="text-[0.7rem] font-semibold text-[#5d6a84] uppercase tracking-wide flex items-center gap-2.5">
                      <ArrowRight className="w-3 h-3 text-[#e11d48]" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white border border-[#eef2ff] rounded-[24px] p-6 shadow-sm">
             <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-[#f8f9fc] border border-[#eef2ff] rounded-xl flex items-center justify-center text-[#0f49d7] shadow-sm">
                      <History className="w-4.5 h-4.5" />
                   </div>
                   <div>
                      <p className="text-[0.55rem] font-semibold text-[#0f49d7] uppercase tracking-widest">Support Availability</p>
                      <p className="text-[0.8rem] font-semibold text-[#11182d]">Mon - Sat: 9 AM - 6 PM IST</p>
                   </div>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                   <a href="mailto:wondercarthelp@gmail.com" className="text-[0.7rem] font-semibold text-[#0f49d7] uppercase tracking-widest bg-[#f8f9fc] px-4 py-2 rounded-lg border border-[#eef2ff]">Email Support</a>
                   <div className="text-[0.7rem] font-semibold text-[#11182d] uppercase tracking-widest bg-[#f8f9fc] px-4 py-2 rounded-lg border border-[#eef2ff]">+91 7226987466</div>
                </div>
             </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-8 bg-[#1e293b] text-white rounded-[28px] p-8 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0f49d7]/10 rounded-full blur-2xl -mr-16 -mt-16" />
          <h3 className="text-[1.2rem] font-semibold mb-2">Need to initiate a return?</h3>
          <p className="text-white/60 text-[0.74rem] uppercase tracking-widest font-semibold mb-8 max-w-xs mx-auto leading-relaxed">
            Head to your dashboard orders list to quickly start the process.
          </p>
          <div className="flex justify-center">
             <a
               href="/profile"
               className="bg-[#0f49d7] text-white px-10 py-3.5 rounded-xl font-semibold text-[0.65rem] uppercase tracking-widest shadow-md border-none outline-none"
             >
               Start Return Request
             </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReturnsRefunds;
