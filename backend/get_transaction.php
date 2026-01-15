<?php
session_start();
include "db.php";

if (!isset($_SESSION["user_id"])) {
    echo json_encode([]);
    exit();
}

$user_id = $_SESSION["user_id"];

$stmt = $conn->prepare(
    "SELECT id, description, amount, type, status,
            DATE_FORMAT(created_at, '%a %d %b %Y, %r') AS created_time,
            DATE_FORMAT(deleted_at, '%a %d %b %Y, %r') AS deleted_time
     FROM transactions
     WHERE user_id = ?
     ORDER BY created_at DESC"
);

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$transactions = [];

while ($row = $result->fetch_assoc()) {
    $transactions[] = [
        "id" => $row["id"],
        "description" => $row["description"],
        "amount" => $row["amount"],
        "type" => $row["type"],
        "status" => $row["status"],
        "created_at" => $row["created_time"],
        "deleted_at" => $row["deleted_time"] // will show NULL if not deleted
    ];
}

echo json_encode($transactions);

$stmt->close();
$conn->close();
?>