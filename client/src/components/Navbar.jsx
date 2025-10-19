import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import { UserCircle } from "lucide-react"; // user profile icon

export default function Navbar() {
  return (
    <>
      <div className="h-16 w-full bg-black flex items-center text-white justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="Tariff Sim Logo" className="h-12 w-12" />
          <span className="font-semibold text-lg tracking-wide">TariffSim</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-8 text-white">
          <Link to="/" className="hover:text-indigo-400 transition-colors">
            Home
          </Link>
          <Link to="/trends" className="hover:text-indigo-400 transition-colors">
            Trends
          </Link>
          <Link to="/dashboard" className="hover:text-indigo-400 transition-colors">
            Dashboard
          </Link>
        </div>

        {/* Profile Icon */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <UserCircle className="h-8 w-8 text-white group-hover:text-indigo-400 transition-colors" />
          <span className="hidden sm:inline text-sm text-slate-300 group-hover:text-indigo-400 transition-colors">
            Profile
          </span>
        </div>
      </div>
    </>
  );
}
