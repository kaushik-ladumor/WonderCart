import AdminNavbar from './AdminNavbar';
import AdminFooter from './AdminFooter';
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <AdminNavbar />

      <main className="flex-1 p-6">
        <Outlet />
      </main>

      <AdminFooter />
    </div>
  );
};

export default AdminLayout;
