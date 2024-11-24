<?php
require_once '../config/database.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = $_GET['userId'] ?? null;
    $period = $_GET['period'] ?? 'weekly';

    if ($userId) {
        try {
            $pdo = getConnection();
            $query = $period === 'weekly'
                ? "SELECT ProjectName, SUM(Duration) AS TotalTime
                   FROM timeentries
                   JOIN projects ON timeentries.ProjectID = projects.ProjectID
                   WHERE timeentries.UserID = :userId AND EntryDate >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)
                   GROUP BY ProjectName"
                : "SELECT ProjectName, SUM(Duration) AS TotalTime
                   FROM timeentries
                   JOIN projects ON timeentries.ProjectID = projects.ProjectID
                   WHERE timeentries.UserID = :userId AND EntryDate >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
                   GROUP BY ProjectName";

            $stmt = $pdo->prepare($query);
            $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
            $stmt->execute();
            $statistics = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($statistics);
        } catch (PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    } else {
        echo json_encode(['error' => 'Missing userId parameter']);
    }
}
