<?php
session_start();
header('Content-Type: application/json');

if(isset($_SESSION['user_id']) && isset($_SESSION['full_name'])){
    echo json_encode([
        "loggedIn" => true,
        "full_name" => $_SESSION['full_name']
    ]);
} else {
    echo json_encode([
        "loggedIn" => false
    ]);
}
?>
