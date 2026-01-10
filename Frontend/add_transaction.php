<?php
include "db.php";
if ($_SERVER["REQUEST_METHOD"] == "POST") {
//getting data from the form
$description = $_POST['description'];
$amount = $_POST['amount'];
$type = $_POST['type'];
$user_id = $_POST['user_id'];


$sql = "INSERT INTO transactions (user_id, description, amount, type) VALUES ($user_id, '$description', $amount, '$type')";
 
if (mysqli_query($conn, $sql)) {
    header("Location: index.html");
    exit();
} else{
    echo "Error: " . mysqli_error($conn);
}
}
?>