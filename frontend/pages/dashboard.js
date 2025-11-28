import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }
    // Optionally, fetch user profile or just decode from token
    axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/auth/me', {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(res => {
        setUser(res.data.user);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        window.location.href = '/';
      });
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-lg text-gray-600">Memuat dashboard...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <span className="font-bold text-indigo-700 text-xl">WhatsApp Panel</span>
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/';
          }}
        >Logout</button>
      </nav>
      <main className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-4">Selamat datang, {user?.name || user?.email}!</h1>
        <div className="bg-white rounded shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Menu Utama</h2>
          <ul className="space-y-2">
            <li><a href="/campaign" className="text-indigo-600 hover:underline">Kelola Campaign</a></li>
            <li><a href="/contact" className="text-indigo-600 hover:underline">Kelola Kontak</a></li>
            <li><a href="/billing" className="text-indigo-600 hover:underline">Lihat Billing</a></li>
            <li><a href="/waha-session" className="text-indigo-600 hover:underline">Koneksi WhatsApp (QR)</a></li>
          </ul>
        </div>
        <div className="text-gray-500 text-sm">Panel WhatsApp API by Anda</div>
      </main>
    </div>
  );
}
