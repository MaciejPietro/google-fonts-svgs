<?php

require_once __DIR__ . '/../vendor/autoload.php';

use eftec\bladeone\BladeOne;

$views = __DIR__ . '/../resources/views';
$cache = __DIR__ . '/../cache/views';

// Create cache directory if it doesn't exist
if (!is_dir($cache)) {
    mkdir($cache, 0777, true);
}

$blade = new BladeOne($views, $cache, BladeOne::MODE_DEBUG);

// Define helper function
if (!function_exists('public_path')) {
    function public_path($path = '') {
        return __DIR__ . ($path ? DIRECTORY_SEPARATOR . $path : $path);
    }
}

// Render the view
try {
    echo $blade->run('index', []);
} catch (Exception $e) {
    echo '<h1>Error rendering view</h1>';
    echo '<pre>' . $e->getMessage() . '</pre>';
    echo '<pre>' . $e->getTraceAsString() . '</pre>';
}