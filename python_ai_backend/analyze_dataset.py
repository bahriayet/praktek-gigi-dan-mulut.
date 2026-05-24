"""
=================================================================
 EXPLORATORY DATA ANALYSIS (EDA) - Ranida AI Dental Dataset
=================================================================
 Script ini menghasilkan visualisasi lengkap dari dataset gigi
 untuk memahami pola dan karakteristik data sebelum pemodelan.
 
 Output: Semua grafik disimpan di folder 'eda_output/'
=================================================================
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os

# --- KONFIGURASI ---
plt.rcParams['figure.dpi'] = 150
plt.rcParams['savefig.dpi'] = 150
plt.rcParams['font.size'] = 10
sns.set_theme(style="whitegrid", palette="muted")

base_dir = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(base_dir, 'data', 'dental_ai_dataset.csv')
output_dir = os.path.join(base_dir, 'eda_output')
os.makedirs(output_dir, exist_ok=True)

# --- LOAD DATA ---
if not os.path.exists(data_path):
    print(f"Error: Dataset tidak ditemukan di {data_path}")
    print("Jalankan 'generate_dental_dataset_expanded.py' terlebih dahulu.")
    exit()

df = pd.read_csv(data_path)

# Preprocessing tekanan darah
df[['sistolik', 'diastolik']] = df['tekanan_darah'].str.split('/', expand=True).astype(float)

print("=" * 60)
print(" EXPLORATORY DATA ANALYSIS - Ranida AI Dental Dataset")
print("=" * 60)
print(f"\nTotal Sampel       : {len(df)}")
print(f"Total Kolom        : {len(df.columns)}")
print(f"Jumlah Diagnosis   : {df['nama_diagnosis'].nunique()}")
print(f"Jumlah Perawatan   : {df['rencana_perawatan'].nunique()}")
print(f"\nMissing Values:\n{df.isnull().sum()}")
print(f"\nStatistik Deskriptif (Numerik):")
print(df[['umur', 'sistolik', 'diastolik']].describe().round(2))

# =================================================================
# GRAFIK 1: Distribusi Diagnosis (Bar Chart)
# =================================================================
fig, ax = plt.subplots(figsize=(12, 6))
diag_counts = df['nama_diagnosis'].value_counts()
colors = sns.color_palette("viridis", len(diag_counts))
bars = ax.barh(diag_counts.index, diag_counts.values, color=colors)

for bar, val in zip(bars, diag_counts.values):
    ax.text(bar.get_width() + 0.3, bar.get_y() + bar.get_height()/2, 
            str(val), va='center', fontweight='bold', fontsize=9)

ax.set_xlabel('Jumlah Sampel', fontweight='bold')
ax.set_title('Distribusi Diagnosis dalam Dataset', fontweight='bold', fontsize=14, pad=15)
ax.invert_yaxis()
plt.tight_layout()
plt.savefig(os.path.join(output_dir, '1_distribusi_diagnosis.png'), bbox_inches='tight')
plt.close()
print("\n✅ Grafik 1: Distribusi Diagnosis disimpan.")

# =================================================================
# GRAFIK 2: Distribusi Umur per Diagnosis (Boxplot)
# =================================================================
fig, ax = plt.subplots(figsize=(14, 7))
order = df.groupby('nama_diagnosis')['umur'].median().sort_values().index
sns.boxplot(data=df, y='nama_diagnosis', x='umur', order=order, 
            palette="coolwarm", ax=ax, linewidth=1.2)
ax.set_xlabel('Umur (Tahun)', fontweight='bold')
ax.set_ylabel('')
ax.set_title('Distribusi Umur per Kategori Diagnosis (Boxplot)', fontweight='bold', fontsize=14, pad=15)

# Deteksi outlier
Q1 = df['umur'].quantile(0.25)
Q3 = df['umur'].quantile(0.75)
IQR = Q3 - Q1
outliers = df[(df['umur'] < Q1 - 1.5 * IQR) | (df['umur'] > Q3 + 1.5 * IQR)]
if len(outliers) > 0:
    ax.text(0.98, 0.02, f'⚠ Outlier umur terdeteksi: {len(outliers)} sampel', 
            transform=ax.transAxes, ha='right', va='bottom', fontsize=9,
            bbox=dict(boxstyle='round', facecolor='#FEF3C7', edgecolor='#F59E0B'))

plt.tight_layout()
plt.savefig(os.path.join(output_dir, '2_boxplot_umur_per_diagnosis.png'), bbox_inches='tight')
plt.close()
print("✅ Grafik 2: Boxplot Umur per Diagnosis disimpan.")

# =================================================================
# GRAFIK 3: Distribusi Jenis Kelamin per Diagnosis
# =================================================================
fig, ax = plt.subplots(figsize=(12, 6))
gender_diag = df.groupby(['nama_diagnosis', 'jenis_kelamin']).size().unstack(fill_value=0)
gender_diag.plot(kind='barh', stacked=True, ax=ax, color=['#3B82F6', '#EC4899'], edgecolor='white')
ax.set_xlabel('Jumlah Sampel', fontweight='bold')
ax.set_ylabel('')
ax.set_title('Distribusi Jenis Kelamin per Diagnosis', fontweight='bold', fontsize=14, pad=15)
ax.legend(title='Jenis Kelamin', labels=['Laki-laki (L)', 'Perempuan (P)'])
plt.tight_layout()
plt.savefig(os.path.join(output_dir, '3_gender_per_diagnosis.png'), bbox_inches='tight')
plt.close()
print("✅ Grafik 3: Distribusi Gender per Diagnosis disimpan.")

# =================================================================
# GRAFIK 4: Scatter Plot Tekanan Darah (Sistolik vs Diastolik)
# =================================================================
fig, ax = plt.subplots(figsize=(10, 8))
unique_diag = df['nama_diagnosis'].unique()
palette = sns.color_palette("husl", len(unique_diag))
for i, diag in enumerate(unique_diag):
    subset = df[df['nama_diagnosis'] == diag]
    ax.scatter(subset['sistolik'], subset['diastolik'], label=diag, 
               alpha=0.7, s=50, color=palette[i], edgecolors='white', linewidth=0.5)

ax.set_xlabel('Sistolik (mmHg)', fontweight='bold')
ax.set_ylabel('Diastolik (mmHg)', fontweight='bold')
ax.set_title('Scatter Plot: Tekanan Darah per Diagnosis', fontweight='bold', fontsize=14, pad=15)
ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left', fontsize=7, title='Diagnosis')
plt.tight_layout()
plt.savefig(os.path.join(output_dir, '4_scatter_tekanan_darah.png'), bbox_inches='tight')
plt.close()
print("✅ Grafik 4: Scatter Plot Tekanan Darah disimpan.")

# =================================================================
# GRAFIK 5: Heatmap Korelasi Fitur Numerik
# =================================================================
fig, ax = plt.subplots(figsize=(8, 6))
numeric_cols = ['umur', 'sistolik', 'diastolik']
corr_matrix = df[numeric_cols].corr()
mask = np.triu(np.ones_like(corr_matrix, dtype=bool))
sns.heatmap(corr_matrix, mask=mask, annot=True, fmt='.3f', cmap='RdYlBu_r',
            center=0, square=True, ax=ax, linewidths=2, linecolor='white',
            cbar_kws={'shrink': 0.8, 'label': 'Korelasi Pearson'},
            vmin=-1, vmax=1)
ax.set_title('Heatmap Korelasi Fitur Numerik', fontweight='bold', fontsize=14, pad=15)
plt.tight_layout()
plt.savefig(os.path.join(output_dir, '5_heatmap_korelasi.png'), bbox_inches='tight')
plt.close()
print("✅ Grafik 5: Heatmap Korelasi disimpan.")

# =================================================================
# GRAFIK 6: Distribusi Umur Keseluruhan (Histogram + KDE)
# =================================================================
fig, ax = plt.subplots(figsize=(10, 5))
sns.histplot(df['umur'], bins=20, kde=True, color='#0E7490', edgecolor='white', ax=ax, alpha=0.7)
ax.axvline(df['umur'].mean(), color='#EF4444', linestyle='--', linewidth=2, label=f"Mean: {df['umur'].mean():.1f}")
ax.axvline(df['umur'].median(), color='#F59E0B', linestyle='--', linewidth=2, label=f"Median: {df['umur'].median():.1f}")
ax.set_xlabel('Umur (Tahun)', fontweight='bold')
ax.set_ylabel('Frekuensi', fontweight='bold')
ax.set_title('Distribusi Umur Seluruh Pasien', fontweight='bold', fontsize=14, pad=15)
ax.legend()
plt.tight_layout()
plt.savefig(os.path.join(output_dir, '6_distribusi_umur.png'), bbox_inches='tight')
plt.close()
print("✅ Grafik 6: Distribusi Umur disimpan.")

# =================================================================
# GRAFIK 7: Panjang Teks Keluhan per Diagnosis
# =================================================================
df['panjang_keluhan'] = df['keluhan_subjektif'].str.len()
fig, ax = plt.subplots(figsize=(12, 6))
order = df.groupby('nama_diagnosis')['panjang_keluhan'].median().sort_values().index
sns.boxplot(data=df, y='nama_diagnosis', x='panjang_keluhan', order=order,
            palette="magma", ax=ax, linewidth=1.2)
ax.set_xlabel('Panjang Teks Keluhan (karakter)', fontweight='bold')
ax.set_ylabel('')
ax.set_title('Distribusi Panjang Keluhan Subjektif per Diagnosis', fontweight='bold', fontsize=14, pad=15)
plt.tight_layout()
plt.savefig(os.path.join(output_dir, '7_panjang_keluhan_per_diagnosis.png'), bbox_inches='tight')
plt.close()
print("✅ Grafik 7: Panjang Keluhan per Diagnosis disimpan.")

# =================================================================
# RINGKASAN
# =================================================================
print("\n" + "=" * 60)
print(f" SELESAI! {7} grafik EDA disimpan di: {output_dir}")
print("=" * 60)
print("\nDaftar file output:")
for f in sorted(os.listdir(output_dir)):
    if f.endswith('.png'):
        size_kb = os.path.getsize(os.path.join(output_dir, f)) / 1024
        print(f"  📊 {f} ({size_kb:.1f} KB)")
