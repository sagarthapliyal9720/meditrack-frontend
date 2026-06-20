import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const RELATIONS = ["FATHER", "MOTHER", "SPOUSE", "DAUGHTER", "OTHER"];

export default function Family() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ name: "", email: "", phone: "", relation: "FATHER" });

  const fetchMembers = async () => {
    try {
      const res = await axios.get("https://sagarthapliyal.pythonanywhere.com/accounts/family/list/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(res.data);
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
    fetchMembers();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await axios.post("https://sagarthapliyal.pythonanywhere.com/accounts/family/add/", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers((prev) => [...prev, res.data]);
      setShowForm(false);
      setForm({ name: "", email: "", phone: "", relation: "FATHER" });
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const firstError = Object.values(data)[0];
        setError(Array.isArray(firstError) ? firstError[0] : JSON.stringify(data));
      } else {
        setError("Failed to add family member");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this family member?")) return;
    try {
      await axios.delete(`https://sagarthapliyal.pythonanywhere.com/accounts/family/${id}/remove/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert("Failed to remove member");
    }
  };

  const relationStyles = {
    FATHER: "bg-blue-100 text-blue-700 border border-blue-200",
    MOTHER: "bg-pink-100 text-pink-700 border border-pink-200",
    SPOUSE: "bg-rose-100 text-rose-700 border border-rose-200",
    DAUGHTER: "bg-purple-100 text-purple-700 border border-purple-200",
    OTHER: "bg-slate-100 text-slate-700 border border-slate-200",
  };

  const relationEmoji = {
    FATHER: "👨", MOTHER: "👩", SPOUSE: "💑", DAUGHTER: "👧", OTHER: "👤",
  };

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 mt-4">Loading family members...</p>
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
            <h1 className="text-3xl font-bold text-slate-800">Family Circle</h1>
            <p className="text-slate-500 mt-1">They'll receive alerts if you miss any dose</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-teal-500/30 flex items-center gap-2 active:scale-95"
          >
            {showForm ? "Cancel" : "+ Add Family Member"}
          </button>
        </div>

        {/* Add Member Form */}
        {showForm && (
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 mb-10">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Add New Family Member</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Ramesh Thapliyal"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="ramesh@example.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="97200 00000"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Relation</label>
                <select
                  name="relation"
                  value={form.relation}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {RELATIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold py-4 rounded-2xl transition-all shadow-lg shadow-teal-500/30 disabled:opacity-50"
              >
                {submitting ? "Adding Member..." : "Add Family Member"}
              </button>
            </form>
          </div>
        )}

        {/* Empty State */}
        {members.length === 0 && !showForm && (
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
            <div className="text-7xl mb-6">👨‍👩‍👧</div>
            <h2 className="text-2xl font-semibold text-slate-700">No family members yet</h2>
            <p className="text-slate-500 mt-3 max-w-xs mx-auto">
              Add loved ones so they can stay updated about your medicine schedule
            </p>
          </div>
        )}

        {/* Family Members List */}
        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition-all p-6 flex items-center justify-between group"
            >
              <div className="flex items-center gap-5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${relationStyles[member.relation]}`}
                >
                  {relationEmoji[member.relation] || "👤"}
                </div>

                <div>
                  <h3 className="font-semibold text-xl text-slate-800">{member.name}</h3>
                  <p className="text-slate-500 text-sm mt-0.5">
                    {member.email} • {member.phone}
                  </p>
                  <span
                    className={`inline-block mt-2 text-xs font-semibold px-4 py-1 rounded-2xl ${relationStyles[member.relation]}`}
                  >
                    {member.relation}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleRemove(member.id)}
                className="text-slate-400 hover:text-red-600 hover:bg-red-50 px-5 py-3 rounded-2xl transition-all opacity-60 group-hover:opacity-100"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}