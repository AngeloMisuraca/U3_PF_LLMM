<?php
session_start();
require "config.php";

header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
  echo json_encode(["success" => false, "message" => "Debes iniciar sesion"]);
  exit;
}

$data = getRequestData();
$personaje = strtolower(trim($data['personaje'] ?? ''));
$personajesPermitidos = ["maximo", "cynthia"];

if (!in_array($personaje, $personajesPermitidos, true)) {
  echo json_encode(["success" => false, "message" => "Personaje no valido"]);
  exit;
}

try {
  $connection = getDbConnection();
  $sql = "UPDATE usuarios SET personaje = ? WHERE id = ?";
  $statement = $connection->prepare($sql);
  $statement->bind_param("si", $personaje, $_SESSION['user_id']);
  $statement->execute();

  $_SESSION['personaje'] = $personaje;

  $statement->close();
  $connection->close();

  echo json_encode(["success" => true, "personaje" => $personaje]);
} catch (Throwable $e) {
  echo json_encode(["success" => false, "message" => "No se pudo guardar el personaje"]);
}
