/**
 * Local AI Model Integration (Python Flask API)
 * Digunakan untuk prediksi diagnosa berdasarkan keluhan, temuan, dll.
 */
export async function callLocalModelAi(data: {
  umur: number;
  jenis_kelamin: string;
  tekanan_darah: string;
  keluhan: string;
  temuan: string;
}) {
  try {
    // URL ini adalah URL lokal saat development,
    // Saat deploy ke production, ganti dengan URL server cloud Anda (misal PythonAnywhere)
    const FLASK_API_URL = process.env.NEXT_PUBLIC_FLASK_API_URL || "http://127.0.0.1:5000/diagnosa"; 
    
    const response = await fetch(FLASK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error("Gagal terhubung ke Server AI Lokal");
    
    const result = await response.json();
    return result; 
  } catch (error) {
    console.error("[LOCAL-AI] Error:", error);
    return null;
  }
}
