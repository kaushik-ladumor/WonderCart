const AdminFooter = () => {
  return (
    <footer className="bg-[#EAE4D5] border-t border-[#B6B09F]/30 py-4">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm text-[#000000]">
          © {new Date().getFullYear()} WonderCart Admin • E-commerce Management
          Platform
        </p>
      </div>
    </footer>
  );
};

export default AdminFooter;
