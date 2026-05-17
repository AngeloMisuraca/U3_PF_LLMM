<?php
session_start();
require "config.php";

header("Content-Type: application/json");

$data = getRequestData();

// Normaliza los datos del formulario de registro antes de validar.
$username = "";
if (isset($data['username'])) {
  $username = trim($data['username']);
} elseif (isset($data['usuario'])) {
  $username = trim($data['usuario']);
}

$email = "";
if (isset($data['email'])) {
  $email = trim($data['email']);
}

$password = "";
if (isset($data['password'])) {
  $password = $data['password'];
}

if ($username === '' || $email === '' || $password === '') {
  echo json_encode(["success" => false, "message" => "Todos los campos son obligatorios"]);
  exit;
}

try {
  $connection = getDbConnection();

  // Evita usuarios duplicados antes de insertar la nueva cuenta.
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

  // Crea el entrenador y deja la sesion iniciada para elegir personaje.
  $insertSql = "INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)";
  $insertStatement = $connection->prepare($insertSql);
  $insertStatement->bind_param("sss", $username, $email, $password);
  $insertStatement->execute();

  $_SESSION['user_id'] = $connection->insert_id;
  $_SESSION['user'] = $username;
  unset($_SESSION['personaje']);

  $checkStatement->close();
  $insertStatement->close();
  $connection->close();

  echo json_encode(["success" => true, "message" => "Usuario registrado correctamente"]);
} catch (Throwable $e) {
  echo json_encode(["success" => false, "message" => "No se pudo registrar el usuario"]);
}

