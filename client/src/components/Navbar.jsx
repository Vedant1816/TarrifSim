import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Settings } from "lucide-react";
import logo from "../assets/logo.png"; // ✅ import logo

export default function Navbar({ isSignedIn, setIsSignedIn }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ consistent name + try/catch
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3000/api/auth/signout", {
        method: "POST",
        credentials: "include",
      });
      setIsSignedIn(false);
      setIsOpen(false);
      navigate("/signin"); // optional redirect after logout
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  return (
    <div className="h-16 w-full bg-black flex items-center text-white justify-between px-4">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src={logo} alt="Tariff Sim Logo" className="h-12 w-12" />
        <span className="font-semibold text-lg tracking-wide">TariffSim</span>
      </div>

      {/* Links */}
      <div className="flex items-center gap-8 text-white">
        <Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link>
        <Link to="/trends" className="hover:text-indigo-400 transition-colors">Trends</Link>
        <Link to="/dashboard" className="hover:text-indigo-400 transition-colors">Dashboard</Link>
      </div>

      {/* Right side: Profile / Log In */}
      <div className="relative">
        {isSignedIn ? (
          <>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 group focus:outline-none"
              aria-haspopup="menu"
              aria-expanded={isOpen}
            >
              <User className="w-6 h-6 text-slate-800 group-hover:text-indigo-400 transition-colors" />
              <span className="hidden sm:inline text-sm text-slate-800 group-hover:text-indigo-400 transition-colors">
                Profile
              </span>
            </button>

            {isOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden z-20"
                role="menu"
              >
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 transition"
                  role="menuitem"
                >
                  <Settings className="inline w-4 h-8 mr-2" /> Account Settings
                </Link>

                <Link
                  onClick={handleLogout}
                  className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 transition"
                  role="menuitem"
                >
                  <LogOut className="inline w-4 h-8 mr-2" /> Log Out
                </Link>
              </div>
            )}
          </>
        ) : (
          <Link to="/signin" className="flex items-center gap-2 group">
            <User className="w-6 h-6 text-slate-300 group-hover:text-indigo-400 transition-colors" />
            <span className="hidden sm:inline text-sm text-slate-300 group-hover:text-indigo-400 transition-colors">
              Log In
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
