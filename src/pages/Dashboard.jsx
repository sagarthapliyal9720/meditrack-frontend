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
      const res = await axios.get("http://127.0.0.1:8000/medicines/doses/today/", {
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
        `http://127.0.0.1:8000/medicines/doses/${id}/mark/`,
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
    PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    TAKEN: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    MISSED: "bg-red-50 text-red-700 ring-1 ring-red-200",
  };

  const labelColors = {
    MORNING: "bg-amber-400",
    AFTERNOON: "bg-orange-400",
    EVENING: "bg-indigo-400",
    NIGHT: "bg-slate-500",
  };

  const taken = doses.filter((d) => d.status === "TAKEN").length;
  const total = doses.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header card */}
        <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-2xl p-6 mb-6 text-white shadow-lg shadow-teal-500/20">
          <h1 className="text-xl font-semibold">Hi, {user.name || "there"} 👋</h1>
          <p className="text-sm text-teal-50 mt-1">Here's your medicine schedule for today</p>

          {total > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-teal-50 mb-1.5">
                <span>{taken} of {total} doses taken</span>
                <span>{Math.round((taken / total) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${(taken / total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-4 border border-red-100">
            {error}
          </div>
        )}

        {doses.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-slate-600 font-medium">No doses scheduled for today</p>
            <p className="text-sm text-slate-400 mt-1">Add a medicine to get started</p>
          </div>
        )}

        <div className="space-y-3">
          {doses.map((dose) => (
            <div
              key={dose.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${labelColors[dose.label] || "bg-slate-300"}`} />
                <div className="min-w-0">
                  <h3 className="font-medium text-slate-800 truncate">{dose.medicine_name}</h3>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {dose.dosage} · {dose.label} · {dose.time?.slice(0, 5)}
                  </p>
                  <span className={`inline-block mt-2 text-xs font-medium px-2.5 py-0.5 rounded-full ${statusStyles[dose.status]}`}>
                    {dose.status}
                  </span>
                </div>
              </div>

              {dose.status === "PENDING" && (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => markDose(dose.id, "TAKEN")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition shadow-sm"
                  >
                    Taken ✅
                  </button>
                  <button
                    onClick={() => markDose(dose.id, "MISSED")}
                    className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 text-sm font-medium px-4 py-2 rounded-xl transition"
                  >
                    Missed
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}