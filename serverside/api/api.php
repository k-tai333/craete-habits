<?php
require_once '../config/database.php';
require_once '../habitsController.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', $uri);

$requestMethod = $_SERVER["REQUEST_METHOD"];

// Habits routing
if ($uri[3] === 'habits') {
  $controller = new HabitsController();

  // ユーザーIDによる習慣の取得
  if (count($uri) === 5 && is_numeric($uri[4])) {
    $userId = $uri[4];
    switch ($requestMethod) {
      case 'GET':
        $habits = $controller->getHabitsByUserId($userId);
        echo json_encode($habits);
        break;
      default:
        header("HTTP/1.1 405 Method Not Allowed");
        exit();
    }
  }
  // 習慣の登録
  else if (count($uri) === 4 && $requestMethod === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    if (!isset($data->title) || !isset($data->to_do) || !isset($data->user_id)) {
      http_response_code(400);
      echo json_encode(["message" => "Missing required fields"]);
      return;
    }
    $result = $controller->createHabit($data->title, $data->to_do, $data->user_id);
    if ($result) {
      http_response_code(201);
      echo json_encode([
        "message" => "Habit created successfully",
        "habit" => [
          "title" => $data->title,
          "to_do" => $data->to_do,
          "user_id" => $data->user_id
        ]
      ]);
    } else {
      http_response_code(500);
      echo json_encode(["message" => "Error creating habit"]);
    }
  }
  // 習慣のレコード操作
  else if (count($uri) >= 6 && $uri[5] === 'records') {
    $habitId = $uri[4];

    switch ($requestMethod) {
      case 'GET':
        // クエリパラメータから日付を取得
        $date = isset($_GET['date']) ? $_GET['date'] : null;
        $records = $controller->getHabitRecords($habitId, $date);
        echo json_encode($records);
        break;

      case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        if (!isset($data->achievement_level) || !isset($data->date)) {
          http_response_code(400);
          echo json_encode(["message" => "Missing required fields"]);
          return;
        }
        $result = $controller->createHabitRecord($habitId, $data->achievement_level, $data->date);
        if ($result) {
          http_response_code(201);
          echo json_encode($result);
        } else {
          http_response_code(500);
          echo json_encode(["message" => "Error creating record"]);
        }
        break;

      default:
        header("HTTP/1.1 405 Method Not Allowed");
        exit();
    }
  } else {
    header("HTTP/1.1 404 Not Found");
    exit();
  }
}
