<?php


function predikat_kinerja($hasil_kerja, $perilaku) {
    // Normalisasi input (lowercase dan trim)
    $hasil_kerja = strtolower(trim($hasil_kerja));
    $perilaku = strtolower(trim($perilaku));
    
    // Matriks predikat kinerja
    $matriks = [
        'diatas ekspektasi' => [
            'dibawah ekspektasi' => 'Kurang/misconduct',
            'sesuai ekspektasi'  => 'Baik',
            'diatas ekspektasi'  => 'Sangat Baik'
        ],
        'sesuai ekspektasi' => [
            'dibawah ekspektasi' => 'Kurang/misconduct',
            'sesuai ekspektasi'  => 'Baik',
            'diatas ekspektasi'  => 'Baik'
        ],
        'di bawah ekspektasi' => [
            'dibawah ekspektasi' => 'Sangat Kurang',
            'sesuai ekspektasi'  => 'Butuh perbaikan',
            'diatas ekspektasi'  => 'Butuh perbaikan'
        ]
    ];
    
    // Cek apakah input valid
    if (!isset($matriks[$hasil_kerja])) {
        return "Error: Hasil kerja tidak valid. Gunakan: 'diatas ekspektasi', 'sesuai ekspektasi', atau 'di bawah ekspektasi'";
    }
    
    if (!isset($matriks[$hasil_kerja][$perilaku])) {
        return "Error: Perilaku tidak valid. Gunakan: 'diatas ekspektasi', 'sesuai ekspektasi', atau 'dibawah ekspektasi'";
    }
    
    return $matriks[$hasil_kerja][$perilaku];
}

// ==================== CONTOH PENGGUNAAN ====================

echo "=== PREDIKAT KINERJA PERIODIK PEGAWAI ===\n\n";

// Contoh 1: Sesuai soal
$hasil_kerja = 'diatas ekspektasi';
$perilaku = 'diatas ekspektasi';
echo "Contoh 1:\n";
echo "Hasil Kerja: $hasil_kerja\n";
echo "Perilaku: $perilaku\n";
echo "Output predikat kinerja: " . predikat_kinerja($hasil_kerja, $perilaku) . "\n\n";

// Contoh 2
$hasil_kerja = 'sesuai ekspektasi';
$perilaku = 'dibawah ekspektasi';
echo "Contoh 2:\n";
echo "Hasil Kerja: $hasil_kerja\n";
echo "Perilaku: $perilaku\n";
echo "Output predikat kinerja: " . predikat_kinerja($hasil_kerja, $perilaku) . "\n\n";

// Contoh 3
$hasil_kerja = 'di bawah ekspektasi';
$perilaku = 'sesuai ekspektasi';
echo "Contoh 3:\n";
echo "Hasil Kerja: $hasil_kerja\n";
echo "Perilaku: $perilaku\n";
echo "Output predikat kinerja: " . predikat_kinerja($hasil_kerja, $perilaku) . "\n\n";

// ==================== TEST SEMUA KOMBINASI ====================

echo "=== TEST SEMUA KOMBINASI ===\n\n";

$hasil_kerja_options = ['diatas ekspektasi', 'sesuai ekspektasi', 'di bawah ekspektasi'];
$perilaku_options = ['dibawah ekspektasi', 'sesuai ekspektasi', 'diatas ekspektasi'];

foreach ($hasil_kerja_options as $hk) {
    foreach ($perilaku_options as $p) {
        $predikat = predikat_kinerja($hk, $p);
        echo "Hasil Kerja: '$hk' | Perilaku: '$p' => $predikat\n";
    }
    echo "\n";
}

?>
