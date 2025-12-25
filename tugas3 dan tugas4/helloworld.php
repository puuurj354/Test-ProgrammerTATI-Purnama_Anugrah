<?php


function helloworld($n) {
    $hasil = [];
    
    for ($i = 1; $i <= $n; $i++) {
        // Cek kelipatan 4 dan 5 (kelipatan 20)
        if ($i % 4 == 0 && $i % 5 == 0) {
            $hasil[] = "helloworld";
        }
        // Cek kelipatan 4
        elseif ($i % 4 == 0) {
            $hasil[] = "hello";
        }
        // Cek kelipatan 5
        elseif ($i % 5 == 0) {
            $hasil[] = "world";
        }
        // Selain itu tampilkan angka
        else {
            $hasil[] = $i;
        }
    }
    
    return implode(" ", $hasil);
}




// Test sesuai contoh soal
for ($n = 1; $n <= 6; $n++) {
    echo "helloworld($n) => " . helloworld($n) . "\n";
}


// Test sampai 25 untuk melihat kelipatan 20 (helloworld)
for ($n = 7; $n <= 25; $n++) {
    echo "helloworld($n) => " . helloworld($n) . "\n";
}

?>
