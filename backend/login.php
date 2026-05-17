<?php
session_start();
require "config.php";

header("Content-Type: application/json");

$data = getRequestData();

// Acepta username o usuario para mantener compatibilidad con formularios anteriores.
$username = "";
if (isset($data['username'])) {
  $username = trim($data['username']);
} elseif (isset($data['usuario'])) {
  $username = trim($data['usuario']);
}

$password = "";
if (isset($data['password'])) {
  $password = $data['password'];
}

if ($username === '' || $password === '') {
  echo json_encode(["success" => false, "message" => "Usuario y password obligatorios"]);
  exit;
}

try {
  $connection = getDbConnection();

  // Recupera el usuario para comprobar credenciales y restaurar la sesion.
  $sql = "SELECT id, username, password, personaje FROM usuarios WHERE username = ? LIMIT 1";
  $statement = $connection->prepare($sql);
  $statement->bind_param("s", $username);
  $statement->execute();

  $result = $statement->get_result();
  $user = $result->fetch_assoc();

  if ($user && $password === $user['password']) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user'] = $user['username'];
    $_SESSION['personaje'] = $user['personaje'];
    echo json_encode(["success" => true, "personaje" => $user['personaje']]);
  } else {
    echo json_encode(["success" => false, "message" => "Credenciales incorrectas"]);
  }

  $statement->close();
  $connection->close();
} catch (Throwable $e) {
  echo json_encode(["success" => false, "message" => "Error de conexion con la base de datos"]);
}
