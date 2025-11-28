import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/auth/me', {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(res => {
        const userId = res.data.user.id;
        return axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/message/billing/' + userId, {
          headers: { Authorization: 'Bearer ' + token }
        });
      })
      .then(res => {
        setBills(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-indigo-700">Billing & Tagihan</h2>
        {loading ? <div>Memuat...</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full border mt-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 border">Periode</th>
                  <th className="px-2 py-1 border">Pesan Sukses</th>
                  <th className="px-2 py-1 border">Total Tagihan</th>
                  <th className="px-2 py-1 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b._id}>
                    <td className="border px-2 py-1">{b.period}</td>
                    <td className="border px-2 py-1">{b.totalSuccess}</td>
                    <td className="border px-2 py-1">Rp {b.amount.toLocaleString()}</td>
                    <td className="border px-2 py-1">{b.isPaid ? <span className="text-green-600">Lunas</span> : <span className="text-red-500">Belum</span>}</td>
                  </tr>
                ))}
                {bills.length === 0 && (
                  <tr><td colSpan={4} className="text-center text-gray-400 py-2">Belum ada tagihan</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
