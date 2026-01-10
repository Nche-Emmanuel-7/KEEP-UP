<?php
include "db.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $full_name = $_POST["full_name"];
    $email = $_POST["email"];
    $password = $_POST["password"];
    $confirm_password = $_POST["confirm_password"];

//checking if connection is succesfull
if ($password !== $confirm_password) {
    echo "Passwords do not matcsh!";
    exit();
}

//hash password for security
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

//insert into database
$sql = "INSERT INTO users (full_name, email, password) VALUES ('$full_name', '$email', '$hashed_password')";

if (mysqli_query($conn, $sql)) {
    echo "Registration succesfull";
    echo "<br><a href='login.html'>Go to login </a>";
} else{
    echo "Error: " .mysqli_error($conn);
}

}
?>