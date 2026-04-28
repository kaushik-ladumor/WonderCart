import AdminNavbar from './AdminNavbar';
import AdminFooter from './AdminFooter';
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f6f7fb] text-[#11182d]">
      <AdminNavbar />

      <main className="flex-1 lg:pl-[272px] pt-[64px]">
        <div className="p-4 sm:p-6 lg:p-8">
           <Outlet />
        </div>
      </main>

      {/* Optional: Adjust footer for sidebar if version tracking is needed at bottom */}
      <div className="lg:pl-[272px]">
         <AdminFooter />
      </div>
    </div>
  );
};

export default AdminLayout;
