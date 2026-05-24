from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os
import csv
from datetime import datetime

app = Flask(__name__)
CORS(app)

# --- KONFIGURASI MODEL ---
base_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_dir, 'models', 'model_ai_gigi_pro.pkl')
model_diagnosis = None
model_treatment = None

try:
    if os.path.exists(model_path):
        models = joblib.load(model_path)
        if isinstance(models, dict):
            model_diagnosis = models.get('diagnosis_model')
            model_treatment = models.get('treatment_model')
            print("Model AI Ganda (Diagnosis & Perawatan) berhasil diload!")
        else:
            model_diagnosis = models
            print("Model AI Diagnosis lama berhasil diload. Model Perawatan belum tersedia.")
except Exception as e:
    print(f"Gagal meload model: {e}")

# --- HALAMAN UTAMA (BRANDING) ---
@app.route('/')
def home():
    status_color = "#10B981" if model_diagnosis else "#EF4444"
    status_text = "Operational" if model_diagnosis else "Maintenance"
    
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ranida AI Engine</title>
        <style>
            body {{ font-family: 'Inter', sans-serif; background: #F8FAFC; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; color: #1E293B; }}
            .card {{ background: white; padding: 40px; border-radius: 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.05); text-align: center; max-width: 400px; width: 90%; border: 1px solid #F1F5F9; }}
            .logo {{ background: #0E7490; color: white; width: 80px; height: 80px; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 32px; font-weight: bold; box-shadow: 0 10px 20px rgba(14, 116, 144, 0.2); }}
            h1 {{ font-size: 24px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.5px; }}
            p {{ color: #64748B; font-size: 14px; margin-bottom: 32px; }}
            .status {{ display: inline-flex; align-items: center; gap: 8px; background: {status_color}15; color: {status_color}; padding: 8px 16px; border-radius: 100px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }}
            .dot {{ width: 8px; height: 8px; background: {status_color}; border-radius: 50%; animation: pulse 2s infinite; }}
            @keyframes pulse {{ 0% {{ opacity: 1; }} 50% {{ opacity: 0.4; }} 100% {{ opacity: 1; }} }}
            .footer {{ margin-top: 32px; font-size: 10px; color: #94A3B8; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="logo">R</div>
            <h1>Ranida AI Engine</h1>
            <p>Clinical Intelligence for Dental Practice Management System.</p>
            <div class="status">
                <div class="dot"></div>
                {status_text}
            </div>
            <div class="footer">Praktek Gigi Ranida &copy; 2026</div>
        </div>
    </body>
    </html>
    """

# --- ENDPOINT DIAGNOSA ---
@app.route('/diagnosa', methods=['POST'])
def diagnosa():
    if model_diagnosis is None:
        return jsonify({
            'status': 'error', 
            'message': 'Sistem AI sedang dalam pemeliharaan. Silakan hubungi admin.'
        }), 503

    try:
        data = request.json
        
        # Ekstraksi Data
        umur = float(data.get('umur', 30))
        jenis_kelamin = str(data.get('jenis_kelamin', 'L')).upper()
        tekanan_darah = str(data.get('tekanan_darah', '120/80'))
        keluhan = str(data.get('keluhan', ''))
        temuan = str(data.get('temuan', ''))

        # Preprocessing Sederhana
        tekanan_darah_clean = tekanan_darah.replace(' ', '')
        if '/' in tekanan_darah_clean:
            parts = tekanan_darah_clean.split('/')
            sistolik, diastolik = float(parts[0]), float(parts[1])
        else:
            sistolik = float(tekanan_darah_clean) if tekanan_darah_clean.replace('.','').isdigit() else 120.0
            diastolik = 80.0
            
        teks_medis = f"{keluhan} {temuan}".strip() or "pemeriksaan rutin"

        # Buat DataFrame untuk Prediksi
        input_df = pd.DataFrame([{
            'umur': umur,
            'jenis_kelamin': jenis_kelamin,
            'sistolik': sistolik,
            'diastolik': diastolik,
            'teks_medis': teks_medis
        }])

        # 1. Prediksi Diagnosis & Confidence Score
        prediction_diag = model_diagnosis.predict(input_df)
        diagnosa_result = str(prediction_diag[0])
        
        confidence = 0.0
        if hasattr(model_diagnosis.named_steps['clf'], "predict_proba"):
            proba = model_diagnosis.predict_proba(input_df)[0]
            raw_confidence = max(proba) * 100
            
            # Tampilkan confidence score yang murni untuk kepentingan akademis & keandalan medis
            confidence = raw_confidence
            
        # 2. Prediksi Rencana Perawatan
        plan_rekomendasi = "Pemeriksaan klinis lebih lanjut dan konsultasi dokter gigi."
        if model_treatment:
            prediction_treat = model_treatment.predict(input_df)
            plan_rekomendasi = str(prediction_treat[0])
        else:
            plan_rekomendasi += " (Model perawatan belum dilatih)"

        # 3. Log Data untuk Retraining (Perekam Jejak)
        log_file = os.path.join(base_dir, 'riwayat_pasien_nyata.csv')
        log_exists = os.path.isfile(log_file)
        with open(log_file, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            if not log_exists:
                writer.writerow(['timestamp', 'umur', 'jenis_kelamin', 'tekanan_darah', 'keluhan', 'temuan', 'prediksi_diagnosis', 'prediksi_perawatan', 'confidence'])
            writer.writerow([datetime.now().strftime("%Y-%m-%d %H:%M:%S"), umur, jenis_kelamin, tekanan_darah, keluhan, temuan, diagnosa_result, plan_rekomendasi, f"{confidence:.2f}"])
        
        return jsonify({
            'status': 'success',
            'diagnosa': diagnosa_result,
            'confidence': f"{confidence:.2f}%",
            'plan': plan_rekomendasi,
            'provider': 'Ranida Local Engine (Pro)'
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f"Terjadi kesalahan pemrosesan: {str(e)}"
        }), 400

# --- ENDPOINT FEEDBACK (BELAJAR DARI KOREKSI DOKTER) ---
@app.route('/feedback', methods=['POST'])
def feedback():
    try:
        data = request.json
        log_file = os.path.join(base_dir, 'data', 'koreksi_dokter.csv')
        log_exists = os.path.isfile(log_file)
        
        with open(log_file, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            if not log_exists:
                writer.writerow(['timestamp', 'umur', 'jenis_kelamin', 'tekanan_darah', 'keluhan', 'temuan', 'diagnosa_ai', 'diagnosa_benar_dokter', 'perawatan_benar_dokter'])
            
            writer.writerow([
                datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                data.get('umur'),
                data.get('jenis_kelamin'),
                data.get('tekanan_darah'),
                data.get('keluhan'),
                data.get('temuan'),
                data.get('diagnosa_ai'),
                data.get('diagnosa_benar'),
                data.get('perawatan_benar')
            ])
            
        return jsonify({'status': 'success', 'message': 'Terima kasih! Koreksi Anda telah disimpan untuk melatih AI menjadi lebih pintar.'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

if __name__ == '__main__':
    # Mode produksi: debug=False
    app.run(debug=False)
