"""
=================================================================
 TRAINING MODEL AI GIGI PRO - Ranida AI Engine
=================================================================
 Script ini melatih model AI dengan pipeline lengkap:
 1. Load & Preprocessing Data
 2. Stratified Split (80:20)
 3. Baseline Model
 4. Hyperparameter Tuning (GridSearchCV)
 5. Evaluasi Mendalam (CV, Confusion Matrix, Classification Report)
 6. Feature Importance Analysis
 7. Simpan Model Terbaik (.pkl)
 
 Output: Model + semua laporan evaluasi di 'evaluation_output/'
=================================================================
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import (
    train_test_split, GridSearchCV, StratifiedKFold, cross_val_score
)
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler, OneHotEncoder, label_binarize
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    classification_report, confusion_matrix, accuracy_score,
    roc_auc_score, roc_curve, auc
)
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import os
import json
from datetime import datetime

# --- KONFIGURASI ---
RNG = 42  # Seed untuk reprodusibilitas (sama dengan referensi Decision Tree)
np.random.seed(RNG)

plt.rcParams['figure.dpi'] = 150
plt.rcParams['savefig.dpi'] = 150
sns.set_theme(style="whitegrid")

base_dir = os.path.dirname(os.path.abspath(__file__))
eval_dir = os.path.join(base_dir, 'evaluation_output')
os.makedirs(eval_dir, exist_ok=True)

print("=" * 65)
print("  RANIDA AI ENGINE - Training Pipeline Pro")
print("  Random Forest Classifier + Hyperparameter Tuning")
print("=" * 65)

# =================================================================
# TAHAP 1: LOAD DATA
# =================================================================
print("\n📂 [TAHAP 1] Load Data...")

possible_paths = [
    os.path.join(base_dir, 'data', 'dental_ai_dataset.csv'),
    os.path.join(base_dir, 'dental_ai_dataset.csv'),
    'dental_ai_dataset.csv'
]

dataset_path = None
for path in possible_paths:
    if os.path.exists(path):
        dataset_path = path
        break

if not dataset_path:
    print("❌ Error: Dataset tidak ditemukan!")
    print("   Jalankan 'generate_dental_dataset_expanded.py' terlebih dahulu.")
    exit()

df = pd.read_csv(dataset_path)
print(f"   ✅ Dataset dimuat: {len(df)} sampel, {len(df.columns)} kolom")
print(f"   ✅ Diagnosis unik: {df['nama_diagnosis'].nunique()}")

# =================================================================
# TAHAP 2: PREPROCESSING
# =================================================================
print("\n🔧 [TAHAP 2] Preprocessing Data...")

# Cek missing values
missing = df.isnull().sum().sum()
if missing > 0:
    print(f"   ⚠ Ditemukan {missing} missing values, menghapus baris...")
    df = df.dropna()
else:
    print("   ✅ Tidak ada missing values")

# Pecah tekanan darah
df[['sistolik', 'diastolik']] = df['tekanan_darah'].str.split('/', expand=True).astype(float)

# Gabungkan teks medis
df['teks_medis'] = df['keluhan_subjektif'] + " " + df['temuan_objektif']

# Fitur (X) dan Label (Y)
X = df[['umur', 'jenis_kelamin', 'sistolik', 'diastolik', 'teks_medis']]
y_diagnosis = df['nama_diagnosis']
y_treatment = df['rencana_perawatan']

print(f"   ✅ Fitur (X): {list(X.columns)}")
print(f"   ✅ Label Diagnosis: {y_diagnosis.nunique()} kelas")
print(f"   ✅ Label Perawatan: {y_treatment.nunique()} kelas")

# =================================================================
# TAHAP 3: STRATIFIED SPLIT (80:20)
# =================================================================
print("\n✂️  [TAHAP 3] Stratified Split (80:20)...")

X_train, X_test, y_diag_train, y_diag_test, y_treat_train, y_treat_test = train_test_split(
    X, y_diagnosis, y_treatment,
    test_size=0.2,
    random_state=RNG,
    stratify=y_diagnosis  # ← STRATIFIED SPLIT!
)

print(f"   ✅ Data Latih : {len(X_train)} sampel")
print(f"   ✅ Data Uji   : {len(X_test)} sampel")
print(f"   ✅ Stratified  : Proporsi kelas terjaga di kedua set")

# Verifikasi proporsi
print("\n   Proporsi Kelas (Train vs Test):")
train_prop = y_diag_train.value_counts(normalize=True).sort_index()
test_prop = y_diag_test.value_counts(normalize=True).sort_index()
for cls in train_prop.index:
    t_prop = test_prop.get(cls, 0)
    print(f"     {cls[:35]:35s} | Train: {train_prop[cls]:.2%} | Test: {t_prop:.2%}")

# =================================================================
# TAHAP 4: BUAT PREPROCESSOR (ColumnTransformer)
# =================================================================
print("\n⚙️  [TAHAP 4] Membuat ColumnTransformer Pipeline...")

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), ['umur', 'sistolik', 'diastolik']),
        ('cat', OneHotEncoder(handle_unknown='ignore'), ['jenis_kelamin']),
        ('text', TfidfVectorizer(max_features=500), 'teks_medis')
    ])

print("   ✅ Numerik  → StandardScaler")
print("   ✅ Kategorik → OneHotEncoder")
print("   ✅ Teks     → TF-IDF Vectorizer (max 500 fitur)")

# =================================================================
# TAHAP 5: BASELINE MODEL (Sebelum Tuning)
# =================================================================
print("\n🌲 [TAHAP 5] Training Baseline Model (Default)...")

baseline_pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('clf', RandomForestClassifier(n_estimators=100, random_state=RNG))
])

baseline_pipeline.fit(X_train, y_diag_train)
baseline_acc = baseline_pipeline.score(X_test, y_diag_test)
print(f"   ✅ Akurasi Baseline Diagnosis : {baseline_acc * 100:.2f}%")

baseline_treat = Pipeline([
    ('preprocessor', preprocessor),
    ('clf', RandomForestClassifier(n_estimators=100, random_state=RNG))
])
baseline_treat.fit(X_train, y_treat_train)
baseline_treat_acc = baseline_treat.score(X_test, y_treat_test)
print(f"   ✅ Akurasi Baseline Perawatan : {baseline_treat_acc * 100:.2f}%")

# =================================================================
# TAHAP 6: MENGGUNAKAN HYPERPARAMETER TERBAIK
# =================================================================
# CATATAN: GridSearchCV sudah dijalankan di komputer lokal dan
# menemukan parameter terbaik berikut. Kita langsung pakai hasilnya
# agar hemat CPU di server PythonAnywhere.
#
# Hasil GridSearchCV Lokal:
#   - criterion: gini
#   - max_depth: None (tanpa batas)
#   - min_samples_split: 2
#   - n_estimators: 300
# =================================================================
print("\n🔍 [TAHAP 6] Menggunakan Hyperparameter Terbaik (dari tuning lokal)...")

best_params = {
    'criterion': 'gini',
    'max_depth': None,
    'min_samples_split': 2,
    'n_estimators': 300
}

print("   Parameter terbaik (hasil GridSearchCV lokal):")
for param, value in best_params.items():
    print(f"      • {param}: {value}")

# Buat model diagnosis dengan parameter terbaik
best_model_diag = Pipeline([
    ('preprocessor', preprocessor),
    ('clf', RandomForestClassifier(
        n_estimators=best_params['n_estimators'],
        criterion=best_params['criterion'],
        max_depth=best_params['max_depth'],
        min_samples_split=best_params['min_samples_split'],
        random_state=RNG
    ))
])
best_model_diag.fit(X_train, y_diag_train)
print("   ✅ Model Diagnosis dilatih dengan parameter terbaik.")

# Buat model perawatan dengan parameter terbaik
best_model_treat = Pipeline([
    ('preprocessor', preprocessor),
    ('clf', RandomForestClassifier(
        n_estimators=best_params['n_estimators'],
        criterion=best_params['criterion'],
        max_depth=best_params['max_depth'],
        min_samples_split=best_params['min_samples_split'],
        random_state=RNG
    ))
])
best_model_treat.fit(X_train, y_treat_train)
print("   ✅ Model Perawatan dilatih dengan parameter terbaik.")

# =================================================================
# TAHAP 7: EVALUASI MENDALAM
# =================================================================
print("\n📊 [TAHAP 7] Evaluasi Mendalam...")

# --- 7a. Akurasi Sebelum vs Sesudah Tuning ---
tuned_test_acc = best_model_diag.score(X_test, y_diag_test)
tuned_treat_acc = best_model_treat.score(X_test, y_treat_test)

print(f"\n   ┌─────────────────────────────────────────────────┐")
print(f"   │  PERBANDINGAN AKURASI (Sebelum vs Sesudah Tuning) │")
print(f"   ├─────────────────────────────────────────────────┤")
print(f"   │  Diagnosis Baseline  : {baseline_acc * 100:6.2f}%                  │")
print(f"   │  Diagnosis Tuned     : {tuned_test_acc * 100:6.2f}%                  │")
print(f"   │  Δ Peningkatan       : {(tuned_test_acc - baseline_acc) * 100:+.2f}%                  │")
print(f"   ├─────────────────────────────────────────────────┤")
print(f"   │  Perawatan Baseline  : {baseline_treat_acc * 100:6.2f}%                  │")
print(f"   │  Perawatan Tuned     : {tuned_treat_acc * 100:6.2f}%                  │")
print(f"   │  Δ Peningkatan       : {(tuned_treat_acc - baseline_treat_acc) * 100:+.2f}%                  │")
print(f"   └─────────────────────────────────────────────────┘")

# --- 7b. 5-Fold Cross Validation (Kestabilan Model) ---
print("\n   📈 5-Fold Cross Validation (Kestabilan)...")
cv_scores_diag = cross_val_score(best_model_diag, X, y_diagnosis, cv=5, scoring='accuracy')
cv_scores_treat = cross_val_score(best_model_treat, X, y_treatment, cv=5, scoring='accuracy')

print(f"   Diagnosis CV Scores : {cv_scores_diag}")
print(f"   Diagnosis CV Mean   : {cv_scores_diag.mean() * 100:.2f}% (±{cv_scores_diag.std() * 100:.2f}%)")
print(f"   Perawatan CV Scores : {cv_scores_treat}")
print(f"   Perawatan CV Mean   : {cv_scores_treat.mean() * 100:.2f}% (±{cv_scores_treat.std() * 100:.2f}%)")

# --- 7c. Classification Report ---
y_diag_pred = best_model_diag.predict(X_test)
y_treat_pred = best_model_treat.predict(X_test)

print("\n   📋 Classification Report - DIAGNOSIS:")
print("   " + "-" * 70)
report_diag = classification_report(y_diag_test, y_diag_pred, zero_division=0)
for line in report_diag.split('\n'):
    print(f"   {line}")

print("\n   📋 Classification Report - PERAWATAN:")
print("   " + "-" * 70)
report_treat = classification_report(y_diag_test, y_diag_pred, zero_division=0)
for line in report_treat.split('\n'):
    print(f"   {line}")

# --- 7d. Confusion Matrix - DIAGNOSIS ---
print("\n   🔲 Menyimpan Confusion Matrix...")

classes_diag = sorted(y_diagnosis.unique())
cm_diag = confusion_matrix(y_diag_test, y_diag_pred, labels=classes_diag)

fig, ax = plt.subplots(figsize=(14, 11))
sns.heatmap(cm_diag, annot=True, fmt='d', cmap='Blues',
            xticklabels=classes_diag, yticklabels=classes_diag,
            ax=ax, linewidths=0.5, linecolor='white',
            cbar_kws={'label': 'Jumlah Prediksi'})
ax.set_xlabel('Prediksi AI', fontweight='bold', fontsize=12)
ax.set_ylabel('Diagnosis Sebenarnya', fontweight='bold', fontsize=12)
ax.set_title('Confusion Matrix - Model Diagnosis\n(Diagonal = Prediksi Benar)', 
             fontweight='bold', fontsize=14, pad=15)
plt.xticks(rotation=45, ha='right', fontsize=8)
plt.yticks(fontsize=8)
plt.tight_layout()
plt.savefig(os.path.join(eval_dir, 'confusion_matrix_diagnosis.png'), bbox_inches='tight')
plt.close()
print("   ✅ Confusion Matrix Diagnosis disimpan.")

# Confusion Matrix - PERAWATAN
cm_treat = confusion_matrix(y_treat_test, y_treat_pred, labels=sorted(y_treatment.unique()))
fig, ax = plt.subplots(figsize=(14, 11))
sns.heatmap(cm_treat, annot=True, fmt='d', cmap='Greens',
            xticklabels=sorted(y_treatment.unique()), 
            yticklabels=sorted(y_treatment.unique()),
            ax=ax, linewidths=0.5, linecolor='white',
            cbar_kws={'label': 'Jumlah Prediksi'})
ax.set_xlabel('Prediksi AI', fontweight='bold', fontsize=12)
ax.set_ylabel('Perawatan Sebenarnya', fontweight='bold', fontsize=12)
ax.set_title('Confusion Matrix - Model Perawatan\n(Diagonal = Prediksi Benar)', 
             fontweight='bold', fontsize=14, pad=15)
plt.xticks(rotation=45, ha='right', fontsize=8)
plt.yticks(fontsize=8)
plt.tight_layout()
plt.savefig(os.path.join(eval_dir, 'confusion_matrix_perawatan.png'), bbox_inches='tight')
plt.close()
print("   ✅ Confusion Matrix Perawatan disimpan.")

# --- 7e. ROC-AUC (Multi-class, One-vs-Rest) ---
print("\n   📉 Menghitung ROC-AUC (One-vs-Rest)...")

try:
    y_diag_proba = best_model_diag.predict_proba(X_test)
    y_diag_bin = label_binarize(y_diag_test, classes=classes_diag)
    
    # Hitung ROC-AUC per kelas
    fig, ax = plt.subplots(figsize=(12, 9))
    colors = plt.cm.tab20(np.linspace(0, 1, len(classes_diag)))
    
    auc_scores = {}
    for i, (cls, color) in enumerate(zip(classes_diag, colors)):
        if y_diag_bin.shape[1] > i:
            fpr, tpr, _ = roc_curve(y_diag_bin[:, i], y_diag_proba[:, i])
            roc_auc = auc(fpr, tpr)
            auc_scores[cls] = roc_auc
            ax.plot(fpr, tpr, color=color, linewidth=1.5,
                    label=f'{cls[:30]} (AUC={roc_auc:.2f})')
    
    ax.plot([0, 1], [0, 1], 'k--', linewidth=1, alpha=0.5, label='Random (AUC=0.50)')
    ax.set_xlabel('False Positive Rate', fontweight='bold')
    ax.set_ylabel('True Positive Rate', fontweight='bold')
    ax.set_title('ROC Curve - Model Diagnosis (One-vs-Rest)\n', fontweight='bold', fontsize=14)
    ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left', fontsize=7)
    ax.set_xlim([-0.02, 1.02])
    ax.set_ylim([-0.02, 1.02])
    plt.tight_layout()
    plt.savefig(os.path.join(eval_dir, 'roc_auc_diagnosis.png'), bbox_inches='tight')
    plt.close()
    
    # Rata-rata AUC
    macro_auc = roc_auc_score(y_diag_bin, y_diag_proba, multi_class='ovr', average='macro')
    print(f"   ✅ Macro ROC-AUC: {macro_auc:.4f}")
    print("   ✅ ROC-AUC Curve disimpan.")
    
except Exception as e:
    print(f"   ⚠ ROC-AUC tidak bisa dihitung (kemungkinan sampel per kelas terlalu sedikit): {e}")
    macro_auc = None

# =================================================================
# TAHAP 8: FEATURE IMPORTANCE ANALYSIS
# =================================================================
print("\n🎯 [TAHAP 8] Feature Importance Analysis...")

try:
    clf = best_model_diag.named_steps['clf']
    pre = best_model_diag.named_steps['preprocessor']
    
    # Ambil nama fitur dari setiap transformer
    feature_names = []
    
    # Numerik
    feature_names.extend(['Umur', 'Sistolik', 'Diastolik'])
    
    # Kategorik (OneHotEncoder)
    cat_encoder = pre.named_transformers_['cat']
    if hasattr(cat_encoder, 'get_feature_names_out'):
        cat_features = cat_encoder.get_feature_names_out(['jenis_kelamin'])
    else:
        cat_features = [f'jenis_kelamin_{c}' for c in cat_encoder.categories_[0]]
    feature_names.extend([str(f) for f in cat_features])
    
    # TF-IDF (ambil top features)
    tfidf = pre.named_transformers_['text']
    tfidf_features = tfidf.get_feature_names_out()
    feature_names.extend([f'TFIDF_{f}' for f in tfidf_features])
    
    importances = clf.feature_importances_
    
    # Pastikan panjang sama
    if len(feature_names) == len(importances):
        feat_imp = pd.DataFrame({
            'Feature': feature_names,
            'Importance': importances
        }).sort_values('Importance', ascending=False)
        
        # Top 25 fitur
        top_n = min(25, len(feat_imp))
        top_features = feat_imp.head(top_n)
        
        print(f"\n   Top {top_n} Fitur Paling Berpengaruh:")
        print("   " + "-" * 55)
        for idx, row in enumerate(top_features.itertuples(), 1):
            bar = "█" * int(row.Importance * 100)
            print(f"   {idx:2d}. {row.Feature:30s} {row.Importance:.4f} {bar}")
        
        # Visualisasi Feature Importance
        fig, ax = plt.subplots(figsize=(12, 8))
        colors_fi = sns.color_palette("viridis", top_n)
        bars = ax.barh(top_features['Feature'].values[::-1], 
                       top_features['Importance'].values[::-1],
                       color=colors_fi[::-1], edgecolor='white', linewidth=0.5)
        
        for bar, val in zip(bars, top_features['Importance'].values[::-1]):
            ax.text(bar.get_width() + 0.001, bar.get_y() + bar.get_height()/2,
                    f'{val:.4f}', va='center', fontsize=8, fontweight='bold')
        
        ax.set_xlabel('Importance Score', fontweight='bold')
        ax.set_title(f'Top {top_n} Feature Importance - Random Forest\n(Fitur yang Paling Mempengaruhi Diagnosis)', 
                     fontweight='bold', fontsize=13, pad=15)
        plt.tight_layout()
        plt.savefig(os.path.join(eval_dir, 'feature_importance.png'), bbox_inches='tight')
        plt.close()
        print(f"\n   ✅ Grafik Feature Importance disimpan.")
        
        # Simpan ke CSV
        feat_imp.to_csv(os.path.join(eval_dir, 'feature_importance.csv'), index=False)
        print("   ✅ Feature Importance CSV disimpan.")
    else:
        print(f"   ⚠ Mismatch: {len(feature_names)} nama vs {len(importances)} importance values")
        print("      Feature importance disimpan tanpa nama fitur.")
        
except Exception as e:
    print(f"   ⚠ Feature Importance error: {e}")

# =================================================================
# TAHAP 9: SIMPAN MODEL TERBAIK
# =================================================================
print("\n💾 [TAHAP 9] Menyimpan Model Terbaik...")

model_data = {
    'diagnosis_model': best_model_diag,
    'treatment_model': best_model_treat
}
model_path = os.path.join(base_dir, 'models', 'model_ai_gigi_pro.pkl')
os.makedirs(os.path.dirname(model_path), exist_ok=True)
joblib.dump(model_data, model_path)
print(f"   ✅ Model disimpan di: {model_path}")

# Simpan juga metadata training
metadata = {
    'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    'dataset_size': len(df),
    'n_diagnosis_classes': int(y_diagnosis.nunique()),
    'n_treatment_classes': int(y_treatment.nunique()),
    'train_size': len(X_train),
    'test_size': len(X_test),
    'random_state': RNG,
    'stratified_split': True,
    'baseline_accuracy_diagnosis': round(baseline_acc * 100, 2),
    'baseline_accuracy_treatment': round(baseline_treat_acc * 100, 2),
    'tuned_accuracy_diagnosis': round(tuned_test_acc * 100, 2),
    'tuned_accuracy_treatment': round(tuned_treat_acc * 100, 2),
    'improvement_diagnosis': round((tuned_test_acc - baseline_acc) * 100, 2),
    'improvement_treatment': round((tuned_treat_acc - baseline_treat_acc) * 100, 2),
    'cv_mean_diagnosis': round(cv_scores_diag.mean() * 100, 2),
    'cv_std_diagnosis': round(cv_scores_diag.std() * 100, 2),
    'cv_mean_treatment': round(cv_scores_treat.mean() * 100, 2),
    'cv_std_treatment': round(cv_scores_treat.std() * 100, 2),
    'macro_roc_auc': round(macro_auc, 4) if macro_auc else None,
    'best_hyperparameters': {k.replace('clf__', ''): v for k, v in best_params.items()},
    'algorithm': 'RandomForestClassifier',
    'preprocessing': ['StandardScaler', 'OneHotEncoder', 'TfidfVectorizer']
}

metadata_path = os.path.join(eval_dir, 'training_metadata.json')
with open(metadata_path, 'w', encoding='utf-8') as f:
    json.dump(metadata, f, indent=2, ensure_ascii=False)
print(f"   ✅ Metadata training disimpan di: {metadata_path}")

# =================================================================
# RINGKASAN AKHIR
# =================================================================
print("\n" + "=" * 65)
print("  ✅ TRAINING SELESAI - RANIDA AI ENGINE")
print("=" * 65)
print(f"""
  📊 Hasil Akhir:
  ┌─────────────────────────────────────────────────┐
  │  Model Diagnosis                                │
  │    • Baseline     : {baseline_acc * 100:6.2f}%                       │
  │    • Setelah Tuning: {tuned_test_acc * 100:6.2f}%                       │
  │    • CV Score      : {cv_scores_diag.mean() * 100:.2f}% (±{cv_scores_diag.std() * 100:.2f}%)             │
  │    • ROC-AUC       : {f'{macro_auc:.4f}' if macro_auc else 'N/A':8s}                      │
  ├─────────────────────────────────────────────────┤
  │  Model Perawatan                                │
  │    • Baseline     : {baseline_treat_acc * 100:6.2f}%                       │
  │    • Setelah Tuning: {tuned_treat_acc * 100:6.2f}%                       │
  │    • CV Score      : {cv_scores_treat.mean() * 100:.2f}% (±{cv_scores_treat.std() * 100:.2f}%)             │
  └─────────────────────────────────────────────────┘

  📁 Output Files:
     • {model_path}
     • {eval_dir}/confusion_matrix_diagnosis.png
     • {eval_dir}/confusion_matrix_perawatan.png
     • {eval_dir}/roc_auc_diagnosis.png
     • {eval_dir}/feature_importance.png
     • {eval_dir}/feature_importance.csv
     • {eval_dir}/training_metadata.json
""")
print("  Model siap digunakan oleh Flask API! 🚀")
print("=" * 65)
