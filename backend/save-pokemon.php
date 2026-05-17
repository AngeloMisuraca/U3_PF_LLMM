<?php
session_start();
require "config.php";

header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
  echo json_encode(["success" => false, "message" => "Debes iniciar sesion"]);
  exit;
}

$data = getRequestData();

// Recibe una captura individual para persistirla al terminar una captura.
$pokemon = null;
if (isset($data["pokemon"])) {
  $pokemon = $data["pokemon"];
}

if (!is_array($pokemon)) {
  echo json_encode(["success" => false, "message" => "Pokemon no valido"]);
  exit;
}

$nombre = "";
if (isset($pokemon["nombre"])) {
  $nombre = trim((string) $pokemon["nombre"]);
}

if ($nombre === "") {
  echo json_encode(["success" => false, "message" => "Nombre de pokemon obligatorio"]);
  exit;
}

try {
  $connection = getDbConnection();
  $userId = (int) $_SESSION['user_id'];

  $nivel = null;
  if (isset($pokemon["nivel"]) && $pokemon["nivel"] !== "") {
    $nivel = (int) $pokemon["nivel"];
  }

  $fecha = null;
  if (isset($pokemon["fecha"])) {
    $fecha = (string) $pokemon["fecha"];
  }

  // Inserta la captura con su nivel y fecha asociados al usuario en sesion.
  $sql = "INSERT INTO pokemones_capturados (user_id, nombre, nivel, fecha) VALUES (?, ?, ?, ?)";
  $statement = $connection->prepare($sql);
  $statement->bind_param("isis", $userId, $nombre, $nivel, $fecha);
  $statement->execute();

  $statement->close();
  $connection->close();

  echo json_encode(["success" => true, "message" => "Pokemon guardado correctamente"]);
} catch (Throwable $e) {
  echo json_encode(["success" => false, "message" => "No se pudo guardar el pokemon"]);
}
