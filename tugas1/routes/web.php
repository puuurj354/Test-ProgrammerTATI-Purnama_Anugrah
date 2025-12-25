<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'Sistem Log Harian Pegawai - Pemerintah Daerah X',
        'api_docs' => '/api',
    ]);
});
