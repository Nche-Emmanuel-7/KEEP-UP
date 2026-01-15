<?php
session_start();
session_destroy(); // Destroy all session data
header("Location: ../frontend/login.html"); // Redirect back to login page
exit();
?>
