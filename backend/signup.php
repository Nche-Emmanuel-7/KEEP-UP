<?php
// ✅ Show errors for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

include "db.php"; // db.php is in the same folder

if($_SERVER["REQUEST_METHOD"] == "POST"){
    $full_name = trim($_POST["full_name"] ?? '');
    $email = trim($_POST["email"] ?? '');
    $password = $_POST["password"] ?? '';
    $confirm_password = $_POST["confirm_password"] ?? '';

    if(empty($full_name) || empty($email) || empty($password) || empty($confirm_password)){
        echo "Please fill in all fields!";
        exit();
    }

    if($password !== $confirm_password){
        echo "Passwords do not match!";
        exit();
    }

    // Check if email exists
    $check = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $check->bind_param("s", $email);
    $check->execute();
    $check->store_result();
    if($check->num_rows > 0){
        echo "Email already registered!";
        exit();
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $full_name, $email, $hashed_password);

    if($stmt->execute()){
        echo "Registration successful";
    } else {
        echo "Error: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
}
?>
