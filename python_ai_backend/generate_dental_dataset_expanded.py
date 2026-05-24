import csv
import random
import os

CASES = [
    {
        "icd10": "K00.6", "diagnosis": "Disturbances in tooth eruption",
        "treatment": "Pencabutan Gigi Susu / Observasi",
        "keluhan": [
            "Gigi susu anak belum lepas padahal gigi tetap sudah tumbuh",
            "Gigi anak tumbuh dobel, gigi susu belum tanggal",
            "Gigi tetap anak tumbuh di belakang gigi susu yang masih ada",
            "Anak saya giginya tumbuh dua baris karena gigi susu belum copot",
            "Gigi susu goyang tapi tidak mau lepas, gigi baru sudah tumbuh",
            "Anak usia 7 tahun gigi susu depan belum tanggal, gigi tetap sudah terlihat",
            "Gigi susu masih bertahan padahal gigi permanen sudah erupsi",
            "Gigi anak tidak rapi karena gigi susu belum lepas",
        ],
        "temuan": [
            "Gigi susu persistensi dengan gigi permanen erupsi di lingual/palatal",
            "Gigi desidui masih in situ, gigi permanen erupsi ektopik di lingual",
            "Persistensi gigi 51, gigi 11 erupsi di palatal, mobilitas gigi susu derajat 1",
            "Gigi susu goyang derajat 2, gigi permanen sudah erupsi sebagian",
            "Persistensi gigi desidui anterior, gigi permanen malposisi",
        ]
    },
    {
        "icd10": "K01.1", "diagnosis": "Impacted teeth",
        "treatment": "Odontektomi (Operasi Gigi Bungsu)",
        "keluhan": [
            "Gigi bungsu tumbuh miring dan terasa sakit",
            "Gigi geraham bungsu sakit dan gusi di belakangnya bengkak",
            "Gigi bungsu terasa nyeri saat membuka mulut dan ada pembengkakan",
            "Gigi paling belakang sakit dan susah buka mulut",
            "Sakit di gigi bungsu bawah, gusi bengkak dan bernanah",
            "Gigi bungsu tumbuh menekan gigi sebelahnya, sakit berdenyut",
            "Gusi belakang bengkak karena gigi bungsu tumbuh tidak sempurna",
            "Gigi bungsu bawah kanan nyeri dan susah mengunyah",
        ],
        "temuan": [
            "Gigi impaksi sebagian mesioangular, operkulum kemerahan",
            "Impaksi molar 3 bawah kiri, perikoronitis akut, operkulum eritema",
            "Gigi 48 impaksi sebagian, operkulum bengkak dan merah, pus (+)",
            "Impaksi horizontal gigi 38, operkulum hiperemis, pembengkakan",
            "Gigi 48 semi-impaksi, perikoronitis, operkulum kemerahan dan lunak",
        ]
    },
    {
        "icd10": "K02", "diagnosis": "Karies gigi",
        "treatment": "Tumpatan Komposit / GIC",
        "keluhan": [
            "Gigi ngilu saat minum dingin atau manis",
            "Gigi berlubang dan terasa ngilu kalau kena makanan manis",
            "Ada lubang di gigi belakang, sakit kalau makan es",
            "Gigi sensitif saat minum air dingin, terlihat ada lubang",
            "Gigi kanan bawah berlubang dan ngilu saat makan",
            "Ada lubang di gigi geraham, sakit kalau kemasukan makanan",
            "Gigi berlubang sudah beberapa bulan, ngilu hilang timbul",
            "Ada lubang hitam di gigi, ngilu saat sikat gigi",
        ],
        "temuan": [
            "Karies media pada gigi posterior, tes vitalitas (+)",
            "Kavitas kelas II pada gigi 36, dentin lunak kecoklatan",
            "Karies oklusal pada gigi 46, kedalaman sedang, dentin terdemineralisasi",
            "Kavitas pada permukaan bukal gigi 15, mencapai dentin, vitalitas positif",
            "Karies interproksimal gigi 25-26, dentin lunak, perkusi (-)",
        ]
    },
    {
        "icd10": "K03", "diagnosis": "Other diseases of hard tissues of teeth",
        "treatment": "Restorasi / Desensitisasi + Fluoride",
        "keluhan": [
            "Gigi sensitif ketika makan makanan panas atau dingin",
            "Gigi terasa aus dan permukaan menjadi kasar",
            "Gusi terkikis di leher gigi akibat sikat gigi terlalu keras",
            "Gigi terasa ngilu di bagian leher gigi saat sikat gigi",
            "Permukaan gigi terasa tipis dan sensitif",
            "Gigi depan terlihat terkikis dan transparan di ujungnya",
            "Gigi sensitif banget di bagian dekat gusi",
            "Gigi terasa aus karena sering menggertakkan gigi saat tidur",
        ],
        "temuan": [
            "Lesi servikal dengan dentin terbuka, respons hipersensitif terhadap suhu",
            "Abrasi servikal dengan permukaan gigi kasar dan dentin terpapar",
            "Erosi email pada permukaan oklusal, enamel tipis dan transparan",
            "Atriksi pada permukaan oklusal gigi posterior, facet rata",
            "Abrasi generalisata pada regio servikal, dentin terekspos",
        ]
    },
    {
        "icd10": "K04", "diagnosis": "Penyakit Pulpa dan jaringan periapikal",
        "treatment": "Perawatan Saluran Akar (PSA)",
        "keluhan": [
            "Gigi berlubang besar dan sakit berdenyut tiba-tiba, sakit di malam hari",
            "Sakit gigi berdenyut terus menerus, tidak bisa tidur semalaman",
            "Gigi sakit spontan tanpa sebab, berdenyut sampai ke kepala",
            "Gigi berubah warna menjadi gelap dan ada benjolan di gusi",
            "Nyeri berdenyut spontan di gigi belakang, obat tidak mempan",
            "Sakit gigi hebat berdenyut, makin parah kalau berbaring",
            "Gigi hitam dan ada nanah keluar dari gusi",
            "Sakit gigi parah tiba-tiba, menjalar ke telinga dan pelipis",
        ],
        "temuan": [
            "Karies profunda mencapai pulpa, perkusi (+), palpasi (+)",
            "Kavitas dalam mendekati pulpa, tes dingin (+) berkepanjangan > 30 detik",
            "Nekrosis pulpa dengan fistula bukal, tes vitalitas (-), drainase pus",
            "Karies profunda gigi 46, pulpa hampir terpapar, tes termal prolonged",
            "Diskolorisasi korona abu-abu, tes vitalitas (-), radiolusensi periapikal",
        ]
    },
    {
        "icd10": "K05", "diagnosis": "Penyakit gusi dan periodontal",
        "treatment": "Scaling, Root Planing, Edukasi OHI",
        "keluhan": [
            "Gusi sering berdarah saat menyikat gigi",
            "Gigi terasa goyang dan nyeri saat mengunyah",
            "Gusi bengkak dan merah, mudah berdarah saat gosok gigi",
            "Gigi terasa longgar dan mudah goyang, gusi sering berdarah",
            "Gusi turun dan gigi terasa panjang, goyang saat makan",
            "Ingin membersihkan karang gigi, mulut terasa bau",
            "Gusi berdarah dan bengkak sudah beberapa minggu",
            "Gigi goyang dan ada nanah keluar dari sela gigi dan gusi",
        ],
        "temuan": [
            "Kalkulus supra dan subgingiva, gingiva hiperemis, BOP (+)",
            "Mobilitas derajat 2, resesi gingiva, poket periodontal 5mm",
            "Gingiva eritematosa dan edema, perdarahan saat probing, kalkulus melimpah",
            "Plak dan kalkulus melimpah, gingiva merah dan bengkak",
            "Kehilangan tulang alveolar 40%, mobilitas gigi, poket 5-7mm",
        ]
    },
    {
        "icd10": "K07", "diagnosis": "Dentofacial anomalies",
        "treatment": "Terapi Splint / Ortodontik / Medikasi",
        "keluhan": [
            "Sakit pada sendi rahang saat membuka mulut lebar",
            "Rahang berbunyi klik saat mengunyah atau membuka mulut",
            "Gigi tidak rata dan sulit menggigit dengan benar",
            "Sakit di rahang bawah saat mengunyah makanan keras",
            "Rahang terasa kaku dan sakit saat bangun tidur",
            "Susah membuka mulut lebar, terasa nyeri di depan telinga",
            "Gigi atas dan bawah tidak bertemu dengan rapi saat menggigit",
            "Sakit di telinga saat membuka mulut atau mengunyah",
        ],
        "temuan": [
            "Clicking pada TMJ, spasme otot maseter, deviasi mandibula",
            "Maloklusi kelas II, overjet berlebihan, deep bite",
            "Nyeri miofasial pada otot masseter dengan trigger point aktif",
            "Trismus dengan bukaan mulut maksimal 2cm, nyeri TMJ bilateral",
            "Nyeri otik saat palpasi kapsula TMJ, krepitasi saat gerakan",
        ]
    },
    {
        "icd10": "K08", "diagnosis": "Gangguan gigi dan jaringan penunjang lainnya",
        "treatment": "Gigi Tiruan / Restorasi Prostodonti",
        "keluhan": [
            "Gigi sudah banyak yang hilang dan susah mengunyah",
            "Ingin dibuatkan gigi palsu karena banyak gigi yang ompong",
            "Gigi tanggal beberapa dan ingin pasang gigi tiruan",
            "Susah makan karena gigi belakang sudah tidak ada",
            "Gigi depan hilang dan malu saat tersenyum",
            "Banyak gigi yang sudah dicabut, butuh gigi tiruan",
            "Gigi atas sudah habis dan ingin pasang gigi palsu penuh",
            "Kehilangan beberapa gigi dan rahang terasa tidak stabil",
        ],
        "temuan": [
            "Kehilangan gigi multipel pada regio posterior, edentulous sebagian",
            "Edentulous parsial rahang atas dan bawah, ridge alveolar atrofi",
            "Kehilangan gigi 36, 46, ridge alveolar cukup untuk protesa",
            "Edentulous penuh rahang atas, ridge alveolar moderat",
            "Kehilangan gigi anterior 11-21, ridge alveolar baik",
        ]
    },
    {
        "icd10": "K12", "diagnosis": "Stomatitis and related lesions",
        "treatment": "Topikal Kortikosteroid / Obat Kumur Antiseptik",
        "keluhan": [
            "Ada luka kecil sering muncul di bibir atau pipi dalam mulut",
            "Sariawan yang tidak sembuh-sembuh di dalam mulut",
            "Luka di mulut yang perih saat makan makanan pedas atau asam",
            "Sariawan berulang di lidah dan pipi bagian dalam",
            "Ada luka putih di mulut yang sangat sakit saat makan",
            "Mulut penuh sariawan dan susah makan minum",
            "Luka di gusi yang terasa perih dan tidak kunjung sembuh",
            "Sariawan besar di bibir bawah bagian dalam sudah seminggu",
        ],
        "temuan": [
            "Afta kecil dengan jaringan mukosa eritematosa di bibir inferior",
            "Ulserasi aftosa multipel pada mukosa bukal dan labial",
            "Stomatitis aftosa rekuren pada ventral lidah, diameter 5mm",
            "Lesi ulseratif pada mukosa bukal dengan halo eritematosa",
            "Afta mayor pada palatum molle, pseudomembran putih kekuningan",
        ]
    },
    {
        "icd10": "K13.0", "diagnosis": "Diseases of lips",
        "treatment": "Salep Topikal / Medikasi Bibir",
        "keluhan": [
            "Bibir kering pecah-pecah dan terasa perih",
            "Bibir bengkak dan ada luka di sudut mulut",
            "Sudut bibir pecah-pecah dan sakit saat membuka mulut",
            "Bibir terasa kering terus meskipun sudah pakai lip balm",
            "Ada bercak putih atau luka pada bibir yang tidak hilang",
            "Bibir bawah bengkak dan terasa gatal sejak beberapa hari",
            "Sudut mulut luka dan perih saat makan",
            "Bibir terasa terbakar dan kering berkepanjangan",
        ],
        "temuan": [
            "Cheilitis angularis pada komisura bibir bilateral, fisura dan eritema",
            "Bibir kering dengan deskuamasi, fisura pada vermillion border",
            "Cheilitis eksfoliatif pada bibir bawah, krusta dan pengelupasan",
            "Angular cheilitis dengan fisura dan krusta kekuningan bilateral",
            "Lesi erosif pada vermillion bibir bawah, eritema dan edema",
        ]
    },
    {
        "icd10": "L51", "diagnosis": "Erythema multiforme",
        "treatment": "Kortikosteroid Sistemik / Rawat Inap",
        "keluhan": [
            "Bibir bengkak parah dan berdarah, ada luka merah di kulit",
            "Mulut penuh luka dan bibir melepuh, tidak bisa makan sama sekali",
            "Luka merah di mulut menyebar ke kulit tangan dan badan",
            "Bibir melepuh dan berdarah, ada bercak merah target di kulit",
            "Mulut sangat sakit dengan luka luas, demam dan lemas",
            "Lesi target di kulit dan mulut penuh luka erosif yang sangat sakit",
            "Bibir bengkak berkerak darah, luka di mata dan mulut bersamaan",
            "Ruam kulit berbentuk target dengan luka oral yang sangat nyeri",
        ],
        "temuan": [
            "Lesi target pada kulit ekstremitas, erosi hemoragik pada bibir dan mukosa oral",
            "Krusta hemoragik pada bibir, erosi luas pada mukosa bukal dan palatum",
            "Lesi targetoid pada tangan dan kaki, ulserasi oral difus",
            "Erosi mukosa oral generalisata, krusta bibir, lesi target kulit",
            "Bulla dan erosi pada mukosa oral, lesi target pada kulit dorsum tangan",
        ]
    },
    {
        "icd10": "R51", "diagnosis": "Sakit kepala",
        "treatment": "Analgesik / Rujukan Neurologi",
        "keluhan": [
            "Sakit kepala terus menerus yang menjalar ke rahang dan gigi",
            "Kepala pusing dan sakit menjalar ke area wajah dan gigi",
            "Sakit kepala sebelah yang terasa sampai ke gigi atas",
            "Pusing dan nyeri kepala yang berhubungan dengan sakit gigi",
            "Sakit kepala kronis disertai nyeri pada rahang atas",
            "Kepala terasa berat dan sakit menjalar ke pelipis dan gigi",
            "Migrain yang disertai nyeri pada gigi dan rahang",
            "Sakit kepala hebat setelah pencabutan gigi beberapa hari lalu",
        ],
        "temuan": [
            "Nyeri kepala tension type, palpasi otot temporal dan masseter nyeri tekan",
            "Cephalgia dengan nyeri referal ke regio maksila, pemeriksaan gigi NAD",
            "Nyeri kepala sebelah dengan trigger point pada otot temporalis",
            "Sakit kepala post-ekstraksi, dry socket pada bekas pencabutan gigi 48",
            "Nyeri kepala kronis, pemeriksaan TMJ dan oklusi dalam batas normal",
        ]
    },
    {
        "icd10": "S02.5", "diagnosis": "Fracture of tooth",
        "treatment": "Restorasi Mahkota / Ekstraksi",
        "keluhan": [
            "Gigi patah karena kecelakaan atau jatuh",
            "Gigi depan patah setelah terbentur benda keras",
            "Gigi pecah saat menggigit makanan keras",
            "Gigi retak dan sakit tajam saat menggigit",
            "Gigi patah sebagian dan terasa tajam melukai lidah",
            "Gigi depan atas patah karena jatuh dari motor",
            "Gigi pecah dan ada bagian yang hilang setelah kecelakaan",
            "Gigi retak vertikal dan sakit saat mengunyah satu sisi",
        ],
        "temuan": [
            "Fraktur mahkota melibatkan dentin, pulpa belum terpapar",
            "Fraktur korona gigi 11 kelas II Ellis, dentin terekspos",
            "Fraktur horizontal mahkota gigi 21, fragmen masih attached",
            "Fraktur vertikal pada korona gigi 46, nyeri saat menggigit",
            "Fraktur mahkota gigi 11 dengan pulpa terpapar, perdarahan aktif",
        ]
    },
]

def generate_data(num_samples=100):
    data = []
    samples_per_case = num_samples // len(CASES)
    remainder = num_samples % len(CASES)

    for i, case in enumerate(CASES):
        count = samples_per_case + (1 if i < remainder else 0)
        for _ in range(count):
            keluhan = random.choice(case["keluhan"])
            temuan = random.choice(case["temuan"])

            if case["icd10"] == "K00.6":
                age = random.randint(6, 12)
            elif case["icd10"] in ("K01.1", "S02.5"):
                age = random.randint(15, 35)
            else:
                age = random.randint(15, 70)

            gender = random.choice(["L", "P"])
            systolic = random.randint(100, 145)
            diastolic = random.randint(65, 95)

            data.append({
                "umur": age,
                "jenis_kelamin": gender,
                "tekanan_darah": f"{systolic}/{diastolic}",
                "keluhan_subjektif": keluhan,
                "temuan_objektif": temuan,
                "diagnosis_icd10": case["icd10"],
                "nama_diagnosis": case["diagnosis"],
                "rencana_perawatan": case["treatment"]
            })

    random.shuffle(data)
    return data

def save_to_csv(data, filename=None):
    if filename is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.join(base_dir, 'data')
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
        filename = os.path.join(data_dir, 'dental_ai_dataset.csv')
        
    if not data:
        return
    keys = data[0].keys()
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(data)
    print(f"Dataset '{filename}' berhasil dibuat: {len(data)} baris.")
    from collections import Counter
    dist = Counter(row['nama_diagnosis'] for row in data)
    print("\nDistribusi Diagnosis:")
    for d, c in dist.most_common():
        print(f"  {d}: {c} sampel")

if __name__ == "__main__":
    print("DATASET V3 - 13 DIAGNOSIS SESUAI ICD-X KLINIK")
    dataset = generate_data(100)
    save_to_csv(dataset)
