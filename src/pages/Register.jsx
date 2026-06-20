import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "PATIENT" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("https://sagarthapliyal.pythonanywhere.com/accounts/register/", form);
      navigate("/login");
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const firstError = Object.values(data)[0];
        setError(Array.isArray(firstError) ? firstError[0] : JSON.stringify(data));
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/40 to-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg shadow-teal-500/20">
            💊
          </div>
          <h1 className="text-2xl font-semibold text-slate-800">Create your account</h1>
          <p className="text-sm text-slate-500 mt-1">Join MediTrack and never miss a dose</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-5 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required
                placeholder="Sagar Thapliyal" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder="you@example.com" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} required
                placeholder="9720544184" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required
                placeholder="••••••••" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>I am a</label>
              <select name="role" value={form.role} onChange={handleChange} className={`${inputClass} bg-slate-50`}>
                <option value="PATIENT">Patient</option>
                <option value="FAMILY">Family Member</option>
              </select>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium py-2.5 rounded-xl transition shadow-lg shadow-teal-500/20 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-sm text-slate-500 text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-600 font-medium hover:text-teal-700">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}