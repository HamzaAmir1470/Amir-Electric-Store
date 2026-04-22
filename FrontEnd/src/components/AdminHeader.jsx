import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const AdminHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      localStorage.clear();

      navigate("/");
    } catch (error) {
      console.log(error);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/");
    }
  };

  const linkStyle = ({ isActive }) =>
    isActive
      ? "bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
      : "text-gray-200 hover:bg-gray-700 px-4 py-2 rounded-lg transition";

  return (
    <header className="bg-gradient-to-r from-gray-900 via-black to-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <div className="text-xl font-bold tracking-wide text-blue-400">
          <Link to="/admin/dashboard">⚡ АЄ$ Admin</Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex flex-wrap gap-3 items-center text-sm md:text-base">

          <NavLink to="/" className={linkStyle}> Home</NavLink>

          <NavLink to="/admin/dashboard" className={linkStyle}> Dashboard</NavLink>

          <NavLink to="/admin/add-product" className={linkStyle}> Add Product</NavLink>

          <NavLink to="/admin/stock" className={linkStyle}> Stock</NavLink>

          <NavLink to="/admin/khata" className={linkStyle}>Khata</NavLink>

          <NavLink to="/admin/invoice" className={linkStyle}> Invoice</NavLink>
        </nav>

        {/* Right Side - Profile */}
        <div className="hidden md:block relative">

          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            👤 Admin
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg overflow-hidden z-50">

              <Link
                to="/profile"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setProfileOpen(false)}
              >
                Profile
              </Link>

              <button
                className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden text-2xl text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-2 bg-black/90">

          <NavLink to="/" className={linkStyle} onClick={() => setIsOpen(false)}>Home</NavLink>

          <NavLink to="/admin/dashboard" className={linkStyle} onClick={() => setIsOpen(false)}>Dashboard</NavLink>

          <NavLink to="/admin/add-product" className={linkStyle} onClick={() => setIsOpen(false)}>Add Product</NavLink>

          <NavLink to="/admin/stock" className={linkStyle} onClick={() => setIsOpen(false)}> Stock</NavLink>

          <NavLink to="/admin/khata" className={linkStyle} onClick={() => setIsOpen(false)}> Khata</NavLink>

          <NavLink to="/admin/invoice" className={linkStyle} onClick={() => setIsOpen(false)}>Invoice</NavLink>

          {/* Mobile Profile */}
          <div className="border-t border-gray-700 pt-3 mt-2">
            <div className="text-gray-400 text-sm mb-2">Admin</div>

            <Link to="/profile" className="block py-1"> Profile</Link>
            <button className="block py-1 text-red-400" onClick={handleLogout}> Logout</button>
          </div>

        </div>
      )}
    </header>
  );
};

export default AdminHeader;