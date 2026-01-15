P<?php
session_start();
include "db.php";

// Check if user is logged in
if (!isset($_SESSION["user_id"])) {
    echo "Unauthorized access!";
    exit();
}

// Only allow POST requests
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Validate ID
    if (!isset($_POST["id"]) || empty($_POST["id"])) {
        echo "Transaction ID is required!";
        exit();
    }

    $id = $_POST["id"];
    $user_id = $_SESSION["user_id"];

    // Soft delete: set status = 'deleted' and record deletion time
    $stmt = $conn->prepare(
        "UPDATE transactions
         SET status = 'deleted', deleted_at = CURRENT_TIMESTAMP
         WHERE id = ? AND user_id = ?"
    );

    $stmt->bind_param("ii", $id, $user_id);

    if ($stmt->execute()) {
        echo "success";
    } else {
        echo "Error deleting transaction: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
}
?>