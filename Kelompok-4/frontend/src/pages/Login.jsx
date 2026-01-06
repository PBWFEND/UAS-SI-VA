import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api'; // Pastikan path ini benar

const Login = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log("Mengirim data...", formData);
      
      // 1. Request ke Backend
      const response = await authService.login(formData);
      
      // Lihat isi respon di Console Browser (F12)
      console.log("Respon Backend:", response.data); 

      // --- PERBAIKAN LOGIKA PENGAMBILAN TOKEN ---
      // Kita cari token di dua kemungkinan tempat:
      // 1. response.data.data.token (Struktur Backend Anda saat ini)
      // 2. response.data.token (Struktur standar)
      const serverData = response.data;
      const token = serverData.data?.token || serverData.token;
      const user = serverData.data?.user || serverData.user;

      if (token) {
          // Simpan Token & User
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          alert('Login Sukses! Selamat datang.');
          navigate('/dashboard'); 
      } else {
          // Jika status 200 OK tapi tidak ada token
          console.error("Token tidak ditemukan di:", serverData);
          setError("Login berhasil, namun data token tidak ditemukan. Cek Console.");
      }

    } catch (err) {
      console.error("Login Error:", err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Login gagal.');
      } else if (err.message === "Network Error") {
        setError("Gagal koneksi ke server. Pastikan Backend nyala.");
      } else {
        setError("Terjadi kesalahan sistem.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
          Sistem UMKM
        </h2>
        
        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded border border-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="owner@umkm.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-bold text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="password123"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-4 py-2 font-bold text-white rounded-lg transition-colors
              ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            {isLoading ? 'Sedang Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;