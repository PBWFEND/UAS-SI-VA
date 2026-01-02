import { useState } from "react";
import { login } from "../services/api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const data = await login(email, password);

    if (!data.token) {
      setError("Email atau password salah");
      return;
    }

    localStorage.setItem("token", data.token);
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in">

        {/* ICON + TITLE */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🔐</div>
          <h1 className="text-2xl font-bold text-indigo-700">
            Login Sistem Lab
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Silakan masuk untuk mengelola peminjaman
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="contoh@email.com"
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white py-3 rounded-lg font-semibold mt-2"
          >
            Masuk
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Sistem Peminjaman Alat Laboratorium
        </p>
      </div>
    </div>
  );
}
