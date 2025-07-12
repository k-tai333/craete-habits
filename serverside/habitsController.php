<?php
require_once 'database.php';

class HabitsController
{
  private $db;
  private $conn;

  public function __construct()
  {
    $this->db = new Database();
    $this->conn = $this->db->connect();
  }

  public function getHabitsByUserId($userId)
  {
    $sql = "SELECT * FROM habits WHERE user_id = ?";
    $stmt = $this->conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $habits = [];
    while ($row = $result->fetch_assoc()) {
      $habits[] = $row;
    }
    return $habits;
  }

  public function getHabitById($habitId)
  {
    $sql = "SELECT * FROM habits WHERE id = ?";
    $stmt = $this->conn->prepare($sql);
    $stmt->bind_param("i", $habitId);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_assoc();
  }

  public function createHabit($title, $toDo, $userId)
  {
    $sql = "INSERT INTO habits (title, to_do, user_id) VALUES (?, ?, ?)";
    $stmt = $this->conn->prepare($sql);
    $stmt->bind_param("ssi", $title, $toDo, $userId);
    return $stmt->execute();
  }

  public function updateHabit($habitId, $title, $toDo)
  {
    $sql = "UPDATE habits SET title = ?, to_do = ? WHERE id = ?";
    $stmt = $this->conn->prepare($sql);
    $stmt->bind_param("ssi", $title, $toDo, $habitId);
    return $stmt->execute();
  }

  public function deleteHabit($habitId)
  {
    $sql = "DELETE FROM habits WHERE id = ?";
    $stmt = $this->conn->prepare($sql);
    $stmt->bind_param("i", $habitId);
    return $stmt->execute();
  }

  public function getHabitRecords($habitId, $date = null)
  {
    // 日付が指定されている場合は、その日のレコードのみを取得
    if ($date) {
      $sql = "SELECT * FROM habit_records WHERE habit_id = ? AND DATE(date) = DATE(?) LIMIT 1";
      $stmt = $this->conn->prepare($sql);
      $stmt->bind_param("is", $habitId, $date);
    } else {
      $sql = "SELECT * FROM habit_records WHERE habit_id = ? ORDER BY date DESC";
      $stmt = $this->conn->prepare($sql);
      $stmt->bind_param("i", $habitId);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    if ($date) {
      // 特定の日付のレコードを取得する場合は1件のみ返す
      return $result->fetch_assoc();
    } else {
      // 日付指定がない場合は全てのレコードを返す
      $records = [];
      while ($row = $result->fetch_assoc()) {
        $records[] = $row;
      }
      return $records;
    }
  }

  public function createHabitRecord($habitId, $achievementLevel, $date)
  {
    $sql = "INSERT INTO habit_records (habit_id, achievement_level, date) VALUES (?, ?, ?)";
    $stmt = $this->conn->prepare($sql);
    $stmt->bind_param("iis", $habitId, $achievementLevel, $date);
    if ($stmt->execute()) {
      // 挿入したレコードを取得して返す
      $sql = "SELECT * FROM habit_records WHERE id = LAST_INSERT_ID()";
      $result = $this->conn->query($sql);
      return $result->fetch_assoc();
    }
    return false;
  }

  public function updateHabitRecord($recordId, $achievementLevel)
  {
    $sql = "UPDATE habit_records SET achievement_level = ? WHERE id = ?";
    $stmt = $this->conn->prepare($sql);
    $stmt->bind_param("ii", $achievementLevel, $recordId);
    return $stmt->execute();
  }

  public function deleteHabitRecord($recordId)
  {
    $sql = "DELETE FROM habit_records WHERE id = ?";
    $stmt = $this->conn->prepare($sql);
    $stmt->bind_param("i", $recordId);
    return $stmt->execute();
  }
}
