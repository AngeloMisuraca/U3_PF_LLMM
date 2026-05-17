<?php
session_start();
require "config.php";

header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
  echo json_encode(["success" => false, "message" => "Debes iniciar sesion"]);
  exit;
}

try {
  $connection = getDbConnection();
  $userId = (int) $_SESSION['user_id'];

  // Lee el JSON completo de la partida guardada para restaurar mapa, jugador y batalla.
  $estado = null;
  $estadoSql = "SELECT estado_json FROM partidas_guardadas WHERE user_id = ? LIMIT 1";
  $estadoStatement = $connection->prepare($estadoSql);
  $estadoStatement->bind_param("i", $userId);
  $estadoStatement->execute();
  $estadoResult = $estadoStatement->get_result();
  $estadoRow = $estadoResult->fetch_assoc();

  if ($estadoRow) {
    $estado = json_decode($estadoRow["estado_json"], true);
  }

  // Lee los Pokemon capturados en tabla propia para listarlos y mantener su nivel.
  $pokemones = [];
  $pokemonSql = "SELECT nombre, nivel, fecha FROM pokemones_capturados WHERE user_id = ? ORDER BY id ASC";
  $pokemonStatement = $connection->prepare($pokemonSql);
  $pokemonStatement->bind_param("i", $userId);
  $pokemonStatement->execute();
  $pokemonResult = $pokemonStatement->get_result();

  while ($pokemon = $pokemonResult->fetch_assoc()) {
    $pokemones[] = [
      "nombre" => $pokemon["nombre"],
      "nivel" => $pokemon["nivel"] === null ? null : (int) $pokemon["nivel"],
      "fecha" => $pokemon["fecha"]
    ];
  }

  if (is_array($estado)) {
    $estado["pokemonesCapturados"] = $pokemones;
  }

  $estadoStatement->close();
  $pokemonStatement->close();
  $connection->close();

  echo json_encode([
    "success" => true,
    "estado" => $estado,
    "pokemonesCapturados" => $pokemones
  ]);
} catch (Throwable $e) {
  echo json_encode(["success" => false, "message" => "No se pudo cargar la partida"]);
}
