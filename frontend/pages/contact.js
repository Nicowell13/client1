import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Contact() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchContacts = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/contact', {
        headers: { Authorization: 'Bearer ' + token }
      });
      setContacts(res.data);
    } catch {
      setContacts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const token = localStorage.getItem('token');
    try {
      await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/contact', { name, phonenumber }, {
        headers: { Authorization: 'Bearer ' + token }
      });
      setName(''); setPhonenumber('');
      setSuccess('Kontak berhasil ditambah');
      fetchContacts();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambah kontak');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!file) return setError('Pilih file CSV');
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/contact/upload', formData, {
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'multipart/form-data' }
      });
      setFile(null);
      setSuccess('Kontak berhasil diupload');
      fetchContacts();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal upload kontak');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-indigo-700">Kelola Kontak</h2>
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input type="text" placeholder="Nama" className="border rounded px-2 py-1 flex-1" value={name} onChange={e => setName(e.target.value)} required />
          <input type="text" placeholder="No. HP" className="border rounded px-2 py-1 flex-1" value={phonenumber} onChange={e => setPhonenumber(e.target.value)} required />
          <button className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700">Tambah</button>
        </form>
        <form onSubmit={handleUpload} className="mb-4 flex gap-2 items-center">
          <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} className="" />
          <button className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700">Upload CSV</button>
        </form>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full border mt-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 border">Nama</th>
                <th className="px-2 py-1 border">No. HP</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(c => (
                <tr key={c._id}>
                  <td className="border px-2 py-1">{c.name}</td>
                  <td className="border px-2 py-1">{c.phonenumber}</td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr><td colSpan={2} className="text-center text-gray-400 py-2">Belum ada kontak</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
