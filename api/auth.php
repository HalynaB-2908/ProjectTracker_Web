<?php
require_once '../config/database.php';

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST' && isset($_GET['action'])) {
    $action = $_GET['action'];
    $data = json_decode(file_get_contents("php://input"), true);

    if ($action === 'register') {
        $username = $data['username'] ?? null;
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;

        if ($username && $email && $password) {
            try {
                $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
                $pdo = getConnection();
                $stmt = $pdo->prepare("INSERT INTO users (Username, Email, PasswordHash) VALUES (:username, :email, :passwordHash)");
                $stmt->bindParam(':username', $username, PDO::PARAM_STR);
                $stmt->bindParam(':email', $email, PDO::PARAM_STR);
                $stmt->bindParam(':passwordHash', $hashedPassword, PDO::PARAM_STR);
                $stmt->execute();
                echo json_encode(['success' => true, 'userId' => $pdo->lastInsertId()]);
            } catch (PDOException $e) {
                echo json_encode(['error' => $e->getMessage()]);
            }
        } else {
            echo json_encode(['error' => 'Invalid input data']);
        }
    } elseif ($action === 'login') {
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;

        if ($email && $password) {
            try {
                $pdo = getConnection();
                $stmt = $pdo->prepare("SELECT * FROM users WHERE Email = :email");
                $stmt->bindParam(':email', $email, PDO::PARAM_STR);
                $stmt->execute();
                $user = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($user && password_verify($password, $user['PasswordHash'])) {
                    echo json_encode(['success' => true, 'userId' => $user['UserID']]);
                } else {
                    echo json_encode(['error' => 'Invalid credentials']);
                }
            } catch (PDOException $e) {
                echo json_encode(['error' => $e->getMessage()]);
            }
        } else {
            echo json_encode(['error' => 'Invalid input data']);
        }
    }
}
?>
