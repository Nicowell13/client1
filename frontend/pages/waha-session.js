import { useEffect, useState } from 'react';
import axios from 'axios';

export default function WahaSession() {
  const [qr, setQr] = useState('');
  const [img, setImg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQr = async () => {
    setLoading(true);
    setError('');
    setQr('');
    setImg('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/waha/qr', {
        headers: { Authorization: 'Bearer ' + token }
      });
      setQr(res.data.qr);
    } catch {
      // fallback ke screenshot
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/waha/qr-screenshot', {
          headers: { Authorization: 'Bearer ' + token },
          responseType: 'arraybuffer'
        });
        setImg('data:image/png;base64,' + Buffer.from(res.data, 'binary').toString('base64'));
      } catch (err) {
        setError('Gagal mengambil QR code');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQr();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow rounded p-8 w-full max-w-md text-center">
        <h2 className="text-xl font-bold mb-4 text-indigo-700">Koneksi WhatsApp</h2>
        <p className="mb-4 text-gray-600">Scan QR code di bawah ini dengan aplikasi WhatsApp Anda.</p>
        {loading && <div className="text-gray-500">Memuat QR code...</div>}
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {qr && (
          <div className="flex flex-col items-center">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=200x200`} alt="QR Code" className="mx-auto mb-2" />
            <div className="text-xs break-all bg-gray-100 p-2 rounded">{qr}</div>
          </div>
        )}
        {img && <img src={img} alt="QR Screenshot" className="mx-auto mb-2" />}
        <button onClick={fetchQr} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Refresh QR</button>
      </div>
    </div>
  );
}
