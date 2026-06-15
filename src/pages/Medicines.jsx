import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const LABELS = ["MORNING", "AFTERNOON", "EVENING", "NIGHT"];

export default function Medicines() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", dosage: "", instructions: "", start_date: "", end_date: "",
  });
  const [schedules, setSchedules] = useState([{ time: "08:00", label: "MORNING" }]);

  const fetchMedicines = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/medicines/list/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedicines(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleScheduleChange = (index, field, value) => {
    const updated = [...schedules];
    updated[index][field] = value;
    setSchedules(updated);
  };

  const addScheduleRow = () => setSchedules([...schedules, { time: "08:00", label: "MORNING" }]);

  const removeScheduleRow = (index) => {
    if (schedules.length === 1) return;
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      ...form,
      end_date: form.end_date || null,
      schedules: schedules.map((s) => ({ time: `${s.time}:00`, label: s.label })),
    };

    try {
      const res = await axios.post("http://127.0.0.1:8000/medicines/add/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedicines((prev) => [...prev, res.data.data]);
      setShowForm(false);
      setForm({ name: "", dosage: "", instructions: "", start_date: "", end_date: "" });
      setSchedules([{ time: "08:00", label: "MORNING" }]);
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const firstError = Object.values(data)[0];
        setError(Array.isArray(firstError) ? firstError[0] : JSON.stringify(data));
      } else {
        setError("Failed to add medicine");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  const labelColors = {
    MORNING: "bg-amber-100 text-amber-700",
    AFTERNOON: "bg-orange-100 text-orange-700",
    EVENING: "bg-indigo-100 text-indigo-700",
    NIGHT: "bg-slate-200 text-slate-700",
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">My Medicines</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your medications and schedules</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition shadow-lg shadow-teal-500/20"
          >
            {showForm ? "Cancel" : "+ Add Medicine"}
          </button>
        </div>

        {/* Add Medicine Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
            <h2 className="font-medium text-slate-800 mb-4">Add New Medicine</h2>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-4 border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Medicine Name</label>
                  <input type="text" name="name" value={form.name} onChange={handleFormChange} required
                    placeholder="Paracetamol" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Dosage</label>
                  <input type="text" name="dosage" value={form.dosage} onChange={handleFormChange} required
                    placeholder="500mg" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Instructions (optional)</label>
                <input type="text" name="instructions" value={form.instructions} onChange={handleFormChange}
                  placeholder="Take after food" className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input type="date" name="start_date" value={form.start_date} onChange={handleFormChange} required
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>End Date (optional)</label>
                  <input type="date" name="end_date" value={form.end_date} onChange={handleFormChange}
                    className={inputClass} />
                </div>
              </div>

              {/* Schedules */}
              <div>
                <label className={`${labelClass} mb-2`}>Dose Schedule</label>
                <div className="space-y-2">
                  {schedules.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="time" value={s.time}
                        onChange={(e) => handleScheduleChange(i, "time", e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
                      <select value={s.label}
                        onChange={(e) => handleScheduleChange(i, "label", e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition">
                        {LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                      {schedules.length > 1 && (
                        <button type="button" onClick={() => removeScheduleRow(i)}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 px-2.5 py-2 rounded-xl text-sm transition">
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addScheduleRow}
                  className="text-teal-600 text-sm font-medium mt-2 hover:text-teal-700">
                  + Add another time
                </button>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium py-2.5 rounded-xl transition shadow-lg shadow-teal-500/20 disabled:opacity-50">
                {submitting ? "Adding... (AI is checking interactions)" : "Add Medicine"}
              </button>
            </form>
          </div>
        )}

        {/* Medicine List */}
        {medicines.length === 0 && !showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
            <div className="text-4xl mb-2">💊</div>
            <p className="text-slate-600 font-medium">No medicines added yet</p>
          </div>
        )}

        <div className="space-y-4">
          {medicines.map((med) => (
            <div key={med.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-slate-800">{med.name}</h3>
                  <p className="text-sm text-slate-500">{med.dosage}</p>
                  {med.instructions && (
                    <p className="text-xs text-slate-400 mt-1">{med.instructions}</p>
                  )}
                </div>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${med.is_active ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-100 text-slate-500"}`}>
                  {med.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Schedules */}
              <div className="flex flex-wrap gap-2 mt-3">
                {med.schedules?.map((s) => (
                  <span key={s.id} className={`text-xs font-medium px-2.5 py-1 rounded-full ${labelColors[s.label] || "bg-slate-100 text-slate-600"}`}>
                    {s.label} · {s.time?.slice(0, 5)}
                  </span>
                ))}
              </div>

              {/* AI Info */}
              {med.ai_info && (
                <div className="mt-4 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-4 space-y-2 border border-violet-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-violet-600 text-sm">✨</span>
                    <span className="text-xs font-semibold text-violet-700 uppercase tracking-wide">AI Insights</span>
                  </div>
                  <p className="text-sm text-slate-700">{med.ai_info.info}</p>
                  {med.ai_info.interaction_warning && (
                    <div className="bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                      <p className="text-xs font-medium text-amber-700">⚠️ {med.ai_info.interaction_warning}</p>
                    </div>
                  )}
                  {med.ai_info.safety_tip && (
                    <p className="text-xs text-slate-500">💡 {med.ai_info.safety_tip}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}