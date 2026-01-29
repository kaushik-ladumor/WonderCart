import { Outlet } from "react-router-dom";
import SellerNavbar from "./SellerNavbar";
import SellerFooter from "./SellerFooter";

const SellerLayout = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <SellerNavbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <SellerFooter />
    </div>
  );
};

export default SellerLayout;
