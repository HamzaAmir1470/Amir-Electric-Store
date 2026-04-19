import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const AdminHeader = () => {
  const [isOpen, setIsOpen] = useState(false);

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

          {/* 🏠 Home */}
          <NavLink to="/" className={linkStyle}>
            🏠 Home
          </NavLink>

          {/* 📊 Admin Dashboard */}
          <NavLink to="/admin/dashboard" className={linkStyle}>
            📊 Dashboard
          </NavLink>

          <NavLink to="/admin/add-product" className={linkStyle}>
            ➕ Add Product
          </NavLink>

          <NavLink to="/admin/stock" className={linkStyle}>
            📦 Stock
          </NavLink>

          <NavLink to="/admin/khata" className={linkStyle}>
            📒 Khata
          </NavLink>

          <NavLink to="/admin/invoice" className={linkStyle}>
            🧾 Invoice
          </NavLink>
        </nav>

        {/* Right Info */}
        <div className="text-sm text-gray-400 hidden md:block">
          Admin Control Panel
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

          <NavLink to="/" className={linkStyle} onClick={() => setIsOpen(false)}>
            🏠 Home
          </NavLink>

          <NavLink to="/admin/dashboard" className={linkStyle} onClick={() => setIsOpen(false)}>
            📊 Dashboard
          </NavLink>

          <NavLink to="/admin/add-product" className={linkStyle} onClick={() => setIsOpen(false)}>
            ➕ Add Product
          </NavLink>

          <NavLink to="/admin/stock" className={linkStyle} onClick={() => setIsOpen(false)}>
            📦 Stock
          </NavLink>

          <NavLink to="/admin/khata" className={linkStyle} onClick={() => setIsOpen(false)}>
            📒 Khata
          </NavLink>

          <NavLink to="/admin/invoice" className={linkStyle} onClick={() => setIsOpen(false)}>
            🧾 Invoice
          </NavLink>

          <div className="text-xs text-gray-400 pt-2">
            Admin Control Panel
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminHeader;