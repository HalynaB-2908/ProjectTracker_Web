<?php
require_once '../config/database.php';

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Отримання всіх проектів для користувача
    $userId = $_GET['userId'] ?? null;

    if ($userId) {
        try {
            $pdo = getConnection();
            $stmt = $pdo->prepare("SELECT * FROM projects WHERE UserId = :userId");
            $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
            $stmt->execute();
            $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($projects);
        } catch (PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    } else {
        echo json_encode(['error' => 'Missing userId parameter']);
    }
} elseif ($method === 'POST') {
    // Додавання нового проекту
    $data = json_decode(file_get_contents("php://input"), true);
    $userId = $data['userId'] ?? null;
    $projectName = $data['projectName'] ?? null;

    if ($userId && $projectName) {
        try {
            $pdo = getConnection();
            $stmt = $pdo->prepare("INSERT INTO projects (UserId, ProjectName) VALUES (:userId, :projectName)");
            $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
            $stmt->bindParam(':projectName', $projectName, PDO::PARAM_STR);
            $stmt->execute();
            echo json_encode(['success' => true, 'projectId' => $pdo->lastInsertId()]);
        } catch (PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    } else {
        echo json_encode(['error' => 'Invalid input data']);
    }
} elseif ($method === 'PATCH') {
    $data = json_decode(file_get_contents("php://input"), true);
    $projectId = $data['projectId'] ?? null;
    $userId = $data['userId'] ?? null;
    $totalTime = $data['totalTime'] ?? null;
    $isCompleted = $data['isCompleted'] ?? null;

    if ($projectId && $totalTime !== null) {
        // Оновлення часу проекту
        try {
            $pdo = getConnection();
            $stmt = $pdo->prepare("UPDATE projects SET TotalTime = :totalTime WHERE ProjectID = :projectId AND UserId = :userId");
            $stmt->bindParam(':totalTime', $totalTime, PDO::PARAM_INT);
            $stmt->bindParam(':projectId', $projectId, PDO::PARAM_INT);
            $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
            $stmt->execute();
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    } elseif ($projectId !== null && $isCompleted !== null) {
        // Оновлення статусу завершення проекту
        try {
            $pdo = getConnection();
            $stmt = $pdo->prepare("UPDATE projects SET IsCompleted = :isCompleted WHERE ProjectID = :projectId");
            $stmt->bindValue(':isCompleted', $isCompleted ? 1 : 0, PDO::PARAM_INT); // Перетворити у 1 або 0
            $stmt->bindParam(':projectId', $projectId, PDO::PARAM_INT);
            $stmt->execute();
    
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['error' => 'No rows updated.']);
            }
        } catch (PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    } else {
        echo json_encode(['error' => 'Invalid input data']);
    }
} elseif ($method === 'DELETE') {
    // Видалення проекту
    $data = json_decode(file_get_contents("php://input"), true);
    $projectId = $data['projectId'] ?? null;
    $userId = $data['userId'] ?? null;

    if ($projectId && $userId) {
        try {
            $pdo = getConnection();
            $stmt = $pdo->prepare("DELETE FROM projects WHERE ProjectID = :projectId AND UserId = :userId");
            $stmt->bindParam(':projectId', $projectId, PDO::PARAM_INT);
            $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['error' => 'Project not found or unauthorized']);
            }
        } catch (PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    } else {
        echo json_encode(['error' => 'Invalid input data']);
    }
} else {
    echo json_encode(['error' => 'Unsupported HTTP method']);
}
