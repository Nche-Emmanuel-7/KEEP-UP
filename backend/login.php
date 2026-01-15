<?php
// Show errors for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start(); // start session for user login

include "db.php";

if($_SERVER["REQUEST_METHOD"] == "POST"){
    $email = trim($_POST["email"] ?? '');
    $password = $_POST["password"] ?? '';

    if(empty($email) || empty($password)){
        echo "Please fill in all fields!";
        exit();
    }

    // Check if email exists
    $stmt = $conn->prepare("SELECT id, full_name, password FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if($stmt->num_rows == 0){
        echo "Email not registered!";
        exit();
    }

    $stmt->bind_result($id, $full_name, $hashed_password);
    $stmt->fetch();

    if(password_verify($password, $hashed_password)){
        // Store user info in session
        $_SESSION['user_id'] = $id;
        $_SESSION['full_name'] = $full_name; // matches index.php username
        echo "Login successful";
    } else {
        echo "Incorrect password!";
    }

    $stmt->close();
    $conn->close();
}
?>
