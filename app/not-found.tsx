import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
      <h1 className="text-xl font-semibold text-gray-700 mb-2">Halaman tidak ditemukan</h1>
      <p className="text-sm text-gray-500 mb-6">Halaman yang Anda cari tidak ada atau sudah dihapus.</p>
      <Link
        href="/bookings"
        className="px-4 py-2 bg-teal-700 text-white text-sm rounded-lg hover:bg-teal-800 transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
