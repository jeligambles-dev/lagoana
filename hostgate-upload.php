<?php
// ==================================================================
// Upload to hostgate - Place this file at images.lagoana.ro/upload.php
// ==================================================================

// CONFIGURE THESE VALUES
$AUTH_TOKEN = "CHANGE_THIS_TO_A_RANDOM_SECRET_TOKEN";
$UPLOAD_DIR = __DIR__ . "/uploads/";
$MAX_SIZE = 15 * 1024 * 1024; // 15MB
$ALLOWED_TYPES = ["image/webp", "image/jpeg", "image/png"];

// CORS for API calls from lagoana.ro
header("Access-Control-Allow-Origin: https://www.lagoana.ro");
header("Access-Control-Allow-Methods: POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Auth-Token");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

// Auth check
$token = $_SERVER["HTTP_X_AUTH_TOKEN"] ?? "";
if ($token !== $AUTH_TOKEN) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

// Ensure upload directory exists
if (!is_dir($UPLOAD_DIR)) {
    mkdir($UPLOAD_DIR, 0755, true);
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Handle upload
    if (!isset($_FILES["file"])) {
        http_response_code(400);
        echo json_encode(["error" => "No file provided"]);
        exit;
    }

    $file = $_FILES["file"];

    if ($file["error"] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(["error" => "Upload error: " . $file["error"]]);
        exit;
    }

    if ($file["size"] > $MAX_SIZE) {
        http_response_code(400);
        echo json_encode(["error" => "File too large"]);
        exit;
    }

    // Validate MIME type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file["tmp_name"]);
    finfo_close($finfo);

    if (!in_array($mimeType, $ALLOWED_TYPES)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid file type: " . $mimeType]);
        exit;
    }

    // Use filename from client or generate one
    $filename = $_POST["filename"] ?? (bin2hex(random_bytes(16)) . ".webp");

    // Sanitize filename - only allow safe characters
    $filename = preg_replace("/[^a-zA-Z0-9._-]/", "", $filename);
    if (empty($filename)) {
        $filename = bin2hex(random_bytes(16)) . ".webp";
    }

    $destination = $UPLOAD_DIR . $filename;

    if (!move_uploaded_file($file["tmp_name"], $destination)) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to save file"]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "url" => "https://images.lagoana.ro/uploads/" . $filename,
        "filename" => $filename,
    ]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "DELETE") {
    // Handle delete
    $input = json_decode(file_get_contents("php://input"), true);
    $filename = $input["filename"] ?? "";

    // Sanitize - prevent directory traversal
    $filename = basename($filename);
    if (empty($filename)) {
        http_response_code(400);
        echo json_encode(["error" => "Filename required"]);
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
