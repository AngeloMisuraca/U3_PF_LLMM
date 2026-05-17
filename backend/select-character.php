<?php
session_start();
require "config.php";

header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
  echo json_encode(["success" => false, "message" => "Debes iniciar sesion"]);
  exit;
}

$data = getRequestData();

// Valida que el personaje solicitado sea uno de los disponibles.
$personaje = "";
if (isset($data['personaje'])) {
  $personaje = strtolower(trim($data['personaje']));
}

$personajesPermitidos = ["maximo", "cynthia"];

if (!in_array($personaje, $personajesPermitidos, true)) {
  echo json_encode(["success" => false, "message" => "Personaje no valido"]);
  exit;
}

try {
  $connection = getDbConnection();

  // Persiste la eleccion para que el juego cargue el sprite correcto.
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
