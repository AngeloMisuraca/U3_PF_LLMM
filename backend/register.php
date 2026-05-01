<?php
session_start();
require "config.php";

header("Content-Type: application/json");

$data = getRequestData();

$username = trim($data['username'] ?? $data['usuario'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if ($username === '' || $email === '' || $password === '') {
  echo json_encode(["success" => false, "message" => "Todos los campos son obligatorios"]);
  exit;
}

try {
  $connection = getDbConnection();
  $checkSql = "SELECT id FROM usuarios WHERE username = ? OR email = ? LIMIT 1";
  $checkStatement = $connection->prepare($checkSql);
  $checkStatement->bind_param("ss", $username, $email);
  $checkStatement->execute();

  $checkResult = $checkStatement->get_result();
  $exists = $checkResult->fetch_assoc();

  if ($exists) {
    echo json_encode(["success" => false, "message" => "El usuario o email ya existe"]);
    $checkStatement->close();
    $connection->close();
    exit;
  }

  $passwordHash = password_hash($password, PASSWORD_DEFAULT);
  $insertSql = "INSERT INTO usuarios (username, email, password_hash) VALUES (?, ?, ?)";
  $insertStatement = $connection->prepare($insertSql);
  $insertStatement->bind_param("sss", $username, $email, $passwordHash);
  $insertStatement->execute();

  $_SESSION['user_id'] = $connection->insert_id;
  $_SESSION['user'] = $username;

  $checkStatement->close();
  $insertStatement->close();
  $connection->close();

  echo json_encode(["success" => true, "message" => "Usuario registrado correctamente"]);
} catch (Throwable $e) {
  echo json_encode(["success" => false, "message" => "No se pudo registrar el usuario"]);
}
