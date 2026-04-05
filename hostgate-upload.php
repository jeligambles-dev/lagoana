<?php
// ==================================================================
// Secure Upload to hostgate - Place at images.lagoana.ro/upload.php
// Uses HMAC-signed requests with timestamp (5 min expiry)
// ==================================================================

// CONFIGURE THIS VALUE (same secret as HOSTGATE_AUTH_TOKEN on Railway)
$SHARED_SECRET = "CHANGE_THIS_TO_RANDOM_SECRET";
$UPLOAD_DIR = __DIR__ . "/uploads/";
$MAX_SIZE = 15 * 1024 * 1024; // 15MB
$ALLOWED_TYPES = ["image/webp", "image/jpeg", "image/png"];
$SIGNATURE_MAX_AGE = 300; // 5 minutes
$RATE_LIMIT_PER_MINUTE = 60;
$RATE_LIMIT_FILE = __DIR__ . "/rate_limit.json";

// CORS
header("Access-Control-Allow-Origin: https://www.lagoana.ro");
header("Access-Control-Allow-Methods: POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Auth-Timestamp, X-Auth-Signature");
header("X-Content-Type-Options: nosniff");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

// ============= Rate Limiting =============
$clientIp = $_SERVER["HTTP_X_FORWARDED_FOR"] ?? $_SERVER["REMOTE_ADDR"] ?? "unknown";
$clientIp = explode(",", $clientIp)[0];

$rateLimits = file_exists($RATE_LIMIT_FILE)
    ? (json_decode(file_get_contents($RATE_LIMIT_FILE), true) ?: [])
    : [];

$now = time();
$minuteBucket = floor($now / 60);

// Clean old buckets
foreach ($rateLimits as $ip => $data) {
    if ($data["bucket"] < $minuteBucket - 1) {
        unset($rateLimits[$ip]);
    }
}

// Check current IP
if (isset($rateLimits[$clientIp]) && $rateLimits[$clientIp]["bucket"] === $minuteBucket) {
    if ($rateLimits[$clientIp]["count"] >= $RATE_LIMIT_PER_MINUTE) {
        http_response_code(429);
        echo json_encode(["error" => "Too many requests"]);
        exit;
    }
    $rateLimits[$clientIp]["count"]++;
} else {
    $rateLimits[$clientIp] = ["bucket" => $minuteBucket, "count" => 1];
}

file_put_contents($RATE_LIMIT_FILE, json_encode($rateLimits), LOCK_EX);

// ============= HMAC Signature Verification =============
$timestamp = $_SERVER["HTTP_X_AUTH_TIMESTAMP"] ?? "";
$signature = $_SERVER["HTTP_X_AUTH_SIGNATURE"] ?? "";

if (empty($timestamp) || empty($signature)) {
    http_response_code(401);
    echo json_encode(["error" => "Missing auth headers"]);
    exit;
}

// Reject old/future timestamps
if (abs($now - (int)$timestamp) > $SIGNATURE_MAX_AGE) {
    http_response_code(401);
    echo json_encode(["error" => "Signature expired"]);
    exit;
}

// Verify HMAC signature: method + path + timestamp
$method = $_SERVER["REQUEST_METHOD"];
$path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$expectedSig = hash_hmac("sha256", $method . $path . $timestamp, $SHARED_SECRET);

if (!hash_equals($expectedSig, $signature)) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid signature"]);
    exit;
}

// ============= Process Request =============
if (!is_dir($UPLOAD_DIR)) {
    mkdir($UPLOAD_DIR, 0755, true);
}

if ($method === "POST") {
    if (!isset($_FILES["file"])) {
        http_response_code(400);
        echo json_encode(["error" => "No file provided"]);
        exit;
    }

    $file = $_FILES["file"];

    if ($file["error"] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(["error" => "Upload error"]);
        exit;
    }

    if ($file["size"] > $MAX_SIZE) {
        http_response_code(400);
        echo json_encode(["error" => "File too large"]);
        exit;
    }

    // Validate MIME from file content
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file["tmp_name"]);
    finfo_close($finfo);

    if (!in_array($mimeType, $ALLOWED_TYPES)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid file type"]);
        exit;
    }

    // Verify it's actually a valid image (not just claiming to be one)
    $imageInfo = @getimagesize($file["tmp_name"]);
    if ($imageInfo === false) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid image"]);
        exit;
    }

    // Sanity check dimensions
    if ($imageInfo[0] < 10 || $imageInfo[1] < 10 || $imageInfo[0] > 10000 || $imageInfo[1] > 10000) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid image dimensions"]);
        exit;
    }

    // Generate safe filename
    $extension = $mimeType === "image/webp" ? "webp" : ($mimeType === "image/png" ? "png" : "jpg");
    $filename = bin2hex(random_bytes(16)) . "." . $extension;
    $destination = $UPLOAD_DIR . $filename;

    if (!move_uploaded_file($file["tmp_name"], $destination)) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to save"]);
        exit;
    }

    // Make sure file is readable
    chmod($destination, 0644);

    echo json_encode([
        "success" => true,
        "url" => "https://images.lagoana.ro/uploads/" . $filename,
        "filename" => $filename,
    ]);
    exit;
}

if ($method === "DELETE") {
    $input = json_decode(file_get_contents("php://input"), true);
    $filename = basename($input["filename"] ?? "");

    if (empty($filename) || !preg_match('/^[a-f0-9]+\.(webp|png|jpg)$/', $filename)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid filename"]);
        exit;
    }

    $filepath = $UPLOAD_DIR . $filename;
    if (file_exists($filepath)) {
        unlink($filepath);
    }

    echo json_encode(["success" => true]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
