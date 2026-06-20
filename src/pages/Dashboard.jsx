import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const navigate = useNavigate();
  const [doses, setDoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("access");

  const fetchDoses = async () => {
    try {
      const res = await axios.get("https://sagarthapliyal.pythonanywhere.com/medicines/doses/today/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoses(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        setError("Failed to load today's doses");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoses();
  }, []);

  const markDose = async (id, status) => {
    try {
      await axios.patch(
        `https://sagarthapliyal.pythonanywhere.com/medicines/doses/${id}/mark/`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDoses((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status, confirmed_at: new Date().toISOString() } : d))
      );
    } catch (err) {
      alert("Failed to update dose status");
    }
  };

  const statusStyles = {
    PENDING: "bg-amber-100 text-amber-700 border border-amber-200",
    TAKEN: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    MISSED: "bg-red-100 text-red-700 border border-red-200",
  };

  const labelColors = {
    MORNING: "bg-amber-500",
    AFTERNOON: "bg-orange-500",
    EVENING: "bg-indigo-500",
    NIGHT: "bg-slate-600",
  };

  const taken = doses.filter((d) => d.status === "TAKEN").length;
  const total = doses.length;
  const progress = total > 0 ? Math.round((taken / total) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 mt-4 text-sm">Loading today's doses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-600 rounded-3xl p-8 text-white shadow-2xl mb-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-20 translate-x-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-10 w-40 h-40 bg-white/10 rounded-full translate-y-12"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">👋</span>
              <h1 className="text-4xl font-bold tracking-tight">
                Welcome back, {user.name?.split(" ")[0] || "Patient"}
              </h1>
            </div>

            <p className="text-teal-100 text-lg max-w-md">
              Here's your medicine schedule for today. Stay consistent!
            </p>

            {total > 0 && (
              <div className="mt-8">
                <div className="flex justify-between items-center text-sm mb-3">
                  <span className="font-medium">Today's Progress</span>
                  <span className="font-semibold">{progress}%</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-teal-100 mt-2 text-right">
                  {taken} of {total} doses completed
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm">Total Doses</p>
                <h2 className="text-5xl font-bold text-slate-800 mt-2">{total}</h2>
              </div>
              <div className="text-5xl opacity-80 group-hover:scale-110 transition-transform">💊</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm">Taken Today</p>
                <h2 className="text-5xl font-bold text-emerald-600 mt-2">{taken}</h2>
              </div>
              <div className="text-5xl opacity-80 group-hover:scale-110 transition-transform">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm">Still Pending</p>
                <h2 className="text-5xl font-bold text-amber-600 mt-2">
                  {doses.filter(d => d.status === "PENDING").length}
                </h2>
              </div>
              <div className="text-5xl opacity-80 group-hover:scale-110 transition-transform">⏰</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
            ⚠️ {error}
          </div>
        )}

        {/* Empty State */}
        {doses.length === 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
            <div className="text-8xl mb-6">💊</div>
            <h2 className="text-2xl font-semibold text-slate-700">No doses scheduled today</h2>
            <p className="text-slate-500 mt-3 max-w-sm mx-auto">
              Add medicines in the Medicines section to start tracking your daily doses.
            </p>
          </div>
        )}

        {/* Doses List */}
        <div className="space-y-4">
          {doses.map((dose) => (
            <div
              key={dose.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Left Info */}
                <div className="flex items-start gap-5 flex-1">
                  <div className={`w-5 h-5 rounded-full mt-1.5 flex-shrink-0 ${labelColors[dose.label] || "bg-slate-400"}`}></div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-slate-800 leading-tight">
                      {dose.medicine_name}
                    </h3>
                    <p className="text-slate-500 mt-1">
                      {dose.dosage} • {dose.label} • {dose.time?.slice(0, 5)}
                    </p>

                    <div className={`inline-flex mt-4 px-4 py-1 rounded-2xl text-sm font-semibold ${statusStyles[dose.status]}`}>
                      {dose.status}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {dose.status === "PENDING" && (
                  <div className="flex flex-col sm:flex-row gap-3 lg:w-auto w-full">
                    <button
                      onClick={() => markDose(dose.id, "TAKEN")}
                      className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-2xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
                    >
                      ✅ Mark as Taken
                    </button>

                    <button
                      onClick={() => markDose(dose.id, "MISSED")}
                      className="flex-1 sm:flex-none bg-slate-100 hover:bg-red-50 hover:text-red-600 px-8 py-3.5 rounded-2xl font-semibold transition-all active:scale-95"
                    >
                      Missed
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}