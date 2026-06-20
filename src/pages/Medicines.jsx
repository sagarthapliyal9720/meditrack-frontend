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
      const res = await axios.get("https://sagarthapliyal.pythonanywhere.com/medicines/list/", {
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
      const res = await axios.post("https://sagarthapliyal.pythonanywhere.com/medicines/add/", payload, {
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

  const labelColors = {
    MORNING: "bg-amber-100 text-amber-700 border border-amber-200",
    AFTERNOON: "bg-orange-100 text-orange-700 border border-orange-200",
    EVENING: "bg-indigo-100 text-indigo-700 border border-indigo-200",
    NIGHT: "bg-slate-100 text-slate-700 border border-slate-200",
  };

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 mt-4">Loading medicines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">My Medicines</h1>
            <p className="text-slate-500 mt-1">Manage your medications and daily schedules</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-teal-500/30 flex items-center gap-2 active:scale-95"
          >
            {showForm ? "Cancel" : "+ Add New Medicine"}
          </button>
        </div>

        {/* Add Medicine Form */}
        {showForm && (
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 mb-10">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Add New Medicine</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Medicine Name</label>
                  <input type="text" name="name" value={form.name} onChange={handleFormChange} required
                    placeholder="Paracetamol" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Dosage</label>
                  <input type="text" name="dosage" value={form.dosage} onChange={handleFormChange} required
                    placeholder="500mg once daily" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Instructions (Optional)</label>
                <input type="text" name="instructions" value={form.instructions} onChange={handleFormChange}
                  placeholder="Take after meals with water" className={inputClass} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input type="date" name="start_date" value={form.start_date} onChange={handleFormChange} required
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>End Date (Optional)</label>
                  <input type="date" name="end_date" value={form.end_date} onChange={handleFormChange}
                    className={inputClass} />
                </div>
              </div>

              {/* Schedules Section */}
              <div>
                <label className={`${labelClass} mb-3`}>Dose Schedule</label>
                <div className="space-y-3">
                  {schedules.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <input
                        type="time"
                        value={s.time}
                        onChange={(e) => handleScheduleChange(i, "time", e.target.value)}
                        className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                      />
                      <select
                        value={s.label}
                        onChange={(e) => handleScheduleChange(i, "label", e.target.value)}
                        className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                      >
                        {LABELS.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                      {schedules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeScheduleRow(i)}
                          className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addScheduleRow}
                  className="text-teal-600 hover:text-teal-700 text-sm font-medium mt-4 flex items-center gap-1"
                >
                  + Add another dose time
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold py-4 rounded-2xl transition-all shadow-lg shadow-teal-500/30 disabled:opacity-50"
              >
                {submitting ? "Adding Medicine..." : "Add Medicine"}
              </button>
            </form>
          </div>
        )}

        {/* Empty State */}
        {medicines.length === 0 && !showForm && (
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
            <div className="text-7xl mb-6">💊</div>
            <h2 className="text-2xl font-semibold text-slate-700">No medicines added yet</h2>
            <p className="text-slate-500 mt-3">Click "Add New Medicine" to get started</p>
          </div>
        )}

        {/* Medicines List */}
        <div className="space-y-6">
          {medicines.map((med) => (
            <div
              key={med.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition-all p-7"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">{med.name}</h3>
                  <p className="text-slate-600 mt-1">{med.dosage}</p>
                  {med.instructions && (
                    <p className="text-sm text-slate-500 mt-2 italic">"{med.instructions}"</p>
                  )}
                </div>

                <span
                  className={`text-xs font-semibold px-4 py-1.5 rounded-2xl ${
                    med.is_active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {med.is_active ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>

              {/* Schedule Tags */}
              <div className="flex flex-wrap gap-2 mt-6">
                {med.schedules?.map((s) => (
                  <span
                    key={s.id}
                    className={`text-sm px-4 py-2 rounded-2xl font-medium ${labelColors[s.label]}`}
                  >
                    {s.label} • {s.time?.slice(0, 5)}
                  </span>
                ))}
              </div>

              {/* AI Insights */}
              {med.ai_info && (
                <div className="mt-6 bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-violet-600">✨</span>
                    <span className="text-xs uppercase tracking-widest font-semibold text-violet-700">AI Insights</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{med.ai_info.info}</p>

                  {med.ai_info.interaction_warning && (
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm">
                      ⚠️ {med.ai_info.interaction_warning}
                    </div>
                  )}

                  {med.ai_info.safety_tip && (
                    <p className="mt-3 text-xs text-slate-600">💡 {med.ai_info.safety_tip}</p>
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