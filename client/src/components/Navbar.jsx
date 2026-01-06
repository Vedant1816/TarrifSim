import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Settings, Menu, X } from "lucide-react";
import { supabase } from "../supabaseClient";
import logo from "../assets/logo.png";

export default function Navbar({ isSignedIn }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);


  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsOpen(false);
      navigate("/signin");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  return (
    <div className="h-16 w-full bg-black flex items-center text-white justify-between px-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition">
        <img src={logo} alt="Tariff Sim Logo" className="h-12 w-12" />
        <span className="font-semibold text-lg tracking-wide">TariffSim</span>
      </Link>

      {/* Links */}
      <div className="hidden md:flex items-center gap-8 text-white">
         <Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link>
         <Link to="/input" className="hover:text-indigo-400 transition-colors">Simulate</Link>
         <Link to="/trends" className="hover:text-indigo-400 transition-colors">Trends</Link>
         <Link to="/dashboard" className="hover:text-indigo-400 transition-colors">Dashboard</Link>
         <Link to="/NMEOP" className="hover:text-indigo-400 transition-colors">NMEOP</Link>
      </div>
      {/* Right side */}      
      <div className="relative flex items-center gap-3">
        {/* Mobile button */}
        <button
       onClick={() => setIsMobileOpen(!isMobileOpen)}
       className="md:hidden! text-white! focus:outline-none! bg-transparent! p-1!"
       aria-label="Open menu"
      >

         {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
        {isSignedIn ? (
          <>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex! items-center! gap-2! group! focus:outline-none! bg-white!"
              aria-haspopup="menu"
              aria-expanded={isOpen}
            >
              <User className="w-6 h-6 text-black group-hover:text-indigo-400 transition-colors" />
            </button>

            {isOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-48 bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden z-20"
                role="menu"
              >
                {/* <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 transition"
                  role="menuitem"
                >
                  <Settings className="inline w-4 h-4 mr-2" /> Account Settings
                </Link> */}

                <button
                  onClick={handleLogout}
                  className="w-full! text-left! px-3! py-1! text-black! transition! bg-white!"
                  role="menuitem"
                >
                    <LogOut className="inline w-3.5 h-3.5 mr-2" /> Log Out
                </button>
              </div>
            )}
          </>
        ) : (
          <Link to="/signin" className="flex items-center gap-2 group">
            <User className="w-6 h-6 text-slate-300 group-hover:text-indigo-400 transition-colors" />
            <span className="inline text-sm text-slate-300 group-hover:text-indigo-400 transition-colors">
              Log In
            </span>
          </Link>
        )}
      </div>
      {isMobileOpen && (
         <div className="absolute top-16 left-0 w-full bg-slate-900 border-t border-slate-700 md:hidden z-30">
           <Link
            to="/"
            onClick={() => setIsMobileOpen(false)}
            className="block px-4 py-3 text-white hover:bg-slate-800"
           >
             Home
           </Link>
           <Link
            to="/input"
            onClick={() => setIsMobileOpen(false)}
            className="block px-4 py-3 text-white hover:bg-slate-800"
           >
             Simulate
           </Link>
           <Link
            to="/trends"
            onClick={() => setIsMobileOpen(false)}
            className="block px-4 py-3 text-white hover:bg-slate-800"
           >
            Trends
           </Link>
           <Link
            to="/dashboard"
            onClick={() => setIsMobileOpen(false)}
            className="block px-4 py-3 text-white hover:bg-slate-800"
           >
            Dashboard
           </Link>
           <Link
            to="/NMEOP"
            onClick={() => setIsMobileOpen(false)}
            className="block px-4 py-3 text-white hover:bg-slate-800"
           >
            NMEOP
           </Link>
         </div>
        )}

    </div>
  );
}
