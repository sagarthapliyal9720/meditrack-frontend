import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const initials = (user.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const linkClass = (path) =>
    `relative px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
      location.pathname === path
        ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/30 scale-105"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 border-b border-slate-200/70 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center gap-10">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 flex items-center justify-center text-3xl shadow-xl shadow-teal-500/30 ring-1 ring-white">
                💊
              </div>
              <div>
                <h1 className="font-bold text-2xl tracking-tight text-slate-800">MediTrack</h1>
                <p className="text-[10px] text-slate-500 -mt-1">Stay Healthy • Never Miss a Dose</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2 bg-white/90 border border-slate-200 rounded-3xl p-1.5 shadow-inner">
              <Link to="/dashboard" className={linkClass("/dashboard")}>
                📊 Dashboard
              </Link>
              <Link to="/medicines" className={linkClass("/medicines")}>
                💊 Medicines
              </Link>
              <Link to="/family" className={linkClass("/family")}>
                👨‍👩‍👧 Family
              </Link>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* User Profile Card */}
            <div className="hidden sm:flex items-center gap-3 bg-white border border-slate-200 rounded-3xl px-4 py-2 shadow-sm hover:shadow-md transition-all">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white shadow">
                {initials}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800 leading-none">{user.name || "User"}</p>
                <p className="text-xs text-slate-500">Patient</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <span>Logout</span>
              <span className="text-base">→</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-5">
          <div className="flex items-center justify-center gap-1.5 bg-white border border-slate-200 rounded-3xl p-1.5 shadow-sm">
            <Link to="/dashboard" className={linkClass("/dashboard")}>
              📊 Dashboard
            </Link>
            <Link to="/medicines" className={linkClass("/medicines")}>
              💊 Medicines
            </Link>
            <Link to="/family" className={linkClass("/family")}>
              👨‍👩‍👧 Family
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}