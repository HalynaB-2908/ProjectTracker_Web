<?php
require_once '../config/database.php';

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Отримання завдань для конкретного проекту
    $projectId = $_GET['projectId'] ?? null;

    if ($projectId) {
        try {
            $pdo = getConnection();
            $stmt = $pdo->prepare("SELECT * FROM tasks WHERE ProjectID = :projectId");
            $stmt->bindParam(':projectId', $projectId, PDO::PARAM_INT);
            $stmt->execute();
            $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($tasks);
        } catch (PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    } else {
        echo json_encode(['error' => 'Missing projectId parameter']);
    }
} elseif ($method === 'POST') {
    // Додавання нового завдання
    $data = json_decode(file_get_contents("php://input"), true);
    $projectId = $data['projectId'] ?? null;
    $taskName = $data['taskName'] ?? null;

    if ($projectId && $taskName) {
        try {
            $pdo = getConnection();
            $stmt = $pdo->prepare("INSERT INTO tasks (ProjectID, TaskName) VALUES (:projectId, :taskName)");
            $stmt->bindParam(':projectId', $projectId, PDO::PARAM_INT);
            $stmt->bindParam(':taskName', $taskName, PDO::PARAM_STR);
            $stmt->execute();
            echo json_encode(['success' => true, 'taskId' => $pdo->lastInsertId()]);
        } catch (PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    } else {
        echo json_encode(['error' => 'Invalid input data']);
    }
} elseif ($method === 'DELETE') {
    // Видалення завдання
    $data = json_decode(file_get_contents("php://input"), true);
    $taskId = $data['taskId'] ?? null;

    if ($taskId) {
        try {
            $pdo = getConnection();
            $stmt = $pdo->prepare("DELETE FROM tasks WHERE TaskID = :taskId");
            $stmt->bindParam(':taskId', $taskId, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['error' => 'Task not found']);
            }
        } catch (PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    } else {
        echo json_encode(['error' => 'Invalid input data']);
    }
} else {
    // Непідтримуваний метод
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
