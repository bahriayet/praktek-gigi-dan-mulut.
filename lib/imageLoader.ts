export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  // Jika src kosong atau tidak ada, return string kosong
  if (!src) return '';

  // Jika src adalah path lokal (seperti /images/logo.png atau /_next/...), biarkan apa adanya
  // Penting: Di mode export, path lokal harus tetap lokal agar bisa dibaca dari folder 'out'
  if (src.startsWith('/') || src.startsWith('./') || src.startsWith('../') || src.startsWith('blob:')) {
    return src;
  }

  // Jika gambar berasal dari Supabase (URL eksternal), gunakan CDN images.weserv.nl untuk optimasi
  // Weserv lebih stabil dan fleksibel dibanding Statically untuk URL dinamis
  if (src.includes('supabase.co')) {
    // Hapus protocol agar bisa dimasukkan ke query Weserv
    const cleanUrl = src.replace(/^https?:\/\//, '');
    return `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&w=${width}&q=${quality || 75}&output=webp`;
  }

  // Fallback untuk URL eksternal lainnya
  return src;
}
