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
    FATHER: "bg-blue-100 text-blue-700",
    MOTHER: "bg-pink-100 text-pink-700",
    SPOUSE: "bg-rose-100 text-rose-700",
    DAUGHTER: "bg-purple-100 text-purple-700",
    OTHER: "bg-slate-100 text-slate-700",
  };

  const relationEmoji = {
    FATHER: "👨", MOTHER: "👩", SPOUSE: "💑", DAUGHTER: "👧", OTHER: "👤",
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Family Members</h1>
            <p className="text-sm text-slate-500 mt-1">They'll be alerted if you miss a dose</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition shadow-lg shadow-teal-500/20"
          >
            {showForm ? "Cancel" : "+ Add Member"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
            <h2 className="font-medium text-slate-800 mb-4">Add Family Member</h2>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-4 border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required
                  placeholder="Ramesh Thapliyal" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required
                  placeholder="ramesh@gmail.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input type="text" name="phone" value={form.phone} onChange={handleChange} required
                  placeholder="9720000000" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Relation</label>
                <select name="relation" value={form.relation} onChange={handleChange} className={inputClass}>
                  {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium py-2.5 rounded-xl transition shadow-lg shadow-teal-500/20 disabled:opacity-50">
                {submitting ? "Adding..." : "Add Member"}
              </button>
            </form>
          </div>
        )}

        {members.length === 0 && !showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
            <div className="text-4xl mb-2">👨‍👩‍👧</div>
            <p className="text-slate-600 font-medium">No family members added yet</p>
            <p className="text-sm text-slate-400 mt-1">Add someone to get missed dose alerts</p>
          </div>
        )}

        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${relationStyles[member.relation] || "bg-slate-100"}`}>
                  {relationEmoji[member.relation] || "👤"}
                </div>
                <div>
                  <h3 className="font-medium text-slate-800">{member.name}</h3>
                  <p className="text-sm text-slate-400">{member.email} · {member.phone}</p>
                  <span className={`inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${relationStyles[member.relation] || "bg-slate-100 text-slate-600"}`}>
                    {member.relation}
                  </span>
                </div>
              </div>
              <button onClick={() => handleRemove(member.id)}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 text-sm font-medium px-3 py-1.5 rounded-xl transition">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}