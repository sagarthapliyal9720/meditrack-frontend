import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const linkClass = (path) =>
    `text-sm font-medium px-3.5 py-2 rounded-full transition-all ${
      location.pathname === path
        ? "bg-teal-50 text-teal-700"
        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
    }`;

  const initials = (user.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm">
            💊
          </div>
          <span className="text-base font-semibold text-slate-800 mr-2 hidden sm:block">
            MediTrack
          </span>
          <div className="flex items-center gap-1 ml-1">
            <Link to="/dashboard" className={linkClass("/dashboard")}>Dashboard</Link>
            <Link to="/medicines" className={linkClass("/medicines")}>Medicines</Link>
            <Link to="/family" className={linkClass("/family")}>Family</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center">
            {initials}
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-slate-400 hover:text-red-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}