import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Campaign() {
  const [campaigns, setCampaigns] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [button1, setButton1] = useState({ label: '', url: '' });
  const [button2, setButton2] = useState({ label: '', url: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchCampaigns = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/campaign', {
        headers: { Authorization: 'Bearer ' + token }
      });
      setCampaigns(res.data);
    } catch {
      setCampaigns([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const token = localStorage.getItem('token');
    try {
      await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/campaign', {
        name, message, imageUrl, button1, button2
      }, {
        headers: { Authorization: 'Bearer ' + token }
      });
      setName(''); setMessage(''); setImageUrl(''); setButton1({ label: '', url: '' }); setButton2({ label: '', url: '' });
      setSuccess('Campaign berhasil dibuat');
      fetchCampaigns();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat campaign');
    }
  };

  const handleStart = async (id) => {
    setError(''); setSuccess('');
    const token = localStorage.getItem('token');
    try {
      await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/campaign/start/' + id, {}, {
        headers: { Authorization: 'Bearer ' + token }
      });
      setSuccess('Campaign dimulai');
      fetchCampaigns();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memulai campaign');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-indigo-700">Kelola Campaign</h2>
        <form onSubmit={handleCreate} className="space-y-2 mb-6">
          <input type="text" placeholder="Nama Campaign" className="border rounded px-2 py-1 w-full" value={name} onChange={e => setName(e.target.value)} required />
          <textarea placeholder="Pesan (gunakan {{name}} untuk nama kontak)" className="border rounded px-2 py-1 w-full" value={message} onChange={e => setMessage(e.target.value)} required />
          <input type="text" placeholder="URL Gambar (opsional)" className="border rounded px-2 py-1 w-full" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
          <div className="flex gap-2">
            <input type="text" placeholder="Button 1 Label" className="border rounded px-2 py-1 flex-1" value={button1.label} onChange={e => setButton1({ ...button1, label: e.target.value })} />
            <input type="text" placeholder="Button 1 URL" className="border rounded px-2 py-1 flex-1" value={button1.url} onChange={e => setButton1({ ...button1, url: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="Button 2 Label" className="border rounded px-2 py-1 flex-1" value={button2.label} onChange={e => setButton2({ ...button2, label: e.target.value })} />
            <input type="text" placeholder="Button 2 URL" className="border rounded px-2 py-1 flex-1" value={button2.url} onChange={e => setButton2({ ...button2, url: e.target.value })} />
          </div>
          <button className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700">Buat Campaign</button>
        </form>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full border mt-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 border">Nama</th>
                <th className="px-2 py-1 border">Status</th>
                <th className="px-2 py-1 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c._id}>
                  <td className="border px-2 py-1">{c.name}</td>
                  <td className="border px-2 py-1">{c.status}</td>
                  <td className="border px-2 py-1">
                    {c.status === 'draft' && <button onClick={() => handleStart(c._id)} className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">Start</button>}
                    {c.status !== 'draft' && <span className="text-gray-400">-</span>}
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr><td colSpan={3} className="text-center text-gray-400 py-2">Belum ada campaign</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
