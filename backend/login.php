<?php
session_start();
require "config.php";

header("Content-Type: application/json");

$data = getRequestData();

$username = trim($data['username'] ?? $data['usuario'] ?? '');
$password = $data['password'] ?? '';

if ($username === '' || $password === '') {
  echo json_encode(["success" => false, "message" => "Usuario y password obligatorios"]);
  exit;
}

try {
  $connection = getDbConnection();
  $sql = "SELECT id, username, password_hash FROM usuarios WHERE username = ? LIMIT 1";
  $statement = $connection->prepare($sql);
  $statement->bind_param("s", $username);
  $statement->execute();

  $result = $statement->get_result();
  $user = $result->fetch_assoc();

  if ($user && password_verify($password, $user['password_hash'])) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user'] = $user['username'];
    echo json_encode(["success" => true]);
  } else {
    echo json_encode(["success" => false, "message" => "Credenciales incorrectas"]);
  }

  $statement->close();
  $connection->close();
} catch (Throwable $e) {
  echo json_encode(["success" => false, "message" => "Error de conexion con la base de datos"]);
}
