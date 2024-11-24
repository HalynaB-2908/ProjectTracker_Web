<?php
function getConnection() {
    $host = 'localhost';
    $dbname = 'taskmanagement';
    $username = 'Hb_2908';
    $password = '4347#hB';

    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); 
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC); 
        return $pdo; 
    } catch (PDOException $e) {
        die("Database connection failed: " . $e->getMessage());
    }
}
?>
