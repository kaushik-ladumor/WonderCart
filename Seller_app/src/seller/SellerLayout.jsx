import { Outlet } from "react-router-dom";
import SellerNavbar from "./SellerNavbar";

const SellerLayout = () => {
  return (
    <div className="min-h-screen bg-[#f5f6ff] text-[#141b2d]">
      <SellerNavbar />
      <main className="px-4 pb-8 pt-[80px] sm:px-6 lg:pl-[304px] lg:pr-8 lg:pt-[88px]">
        <Outlet />
      </main>
    </div>
  );
};

export default SellerLayout;
