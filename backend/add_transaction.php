<?php
session_start();
include "db.php";

if (!isset($_SESSION["user_id"])) {
    echo "Unauthorized access!";
    exit();
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $user_id = $_SESSION["user_id"];
    $description = $_POST["description"];
    $amount = $_POST["amount"];
    $type = $_POST["type"]; // income or expense

    $stmt = $conn->prepare(
        "INSERT INTO transactions (user_id, description, amount, type)
         VALUES (?, ?, ?, ?)"
    );

    $stmt->bind_param("isds", $user_id, $description, $amount, $type);

    if ($stmt->execute()) {
        echo "success";
    } else {
        echo "error";
    }

    $stmt->close();
    $conn->close();
}
?>