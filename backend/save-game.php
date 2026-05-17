<?php
session_start();
require "config.php";

header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
  echo json_encode(["success" => false, "message" => "Debes iniciar sesion"]);
  exit;
}

$data = getRequestData();

// Recibe el estado completo que genera el frontend al guardar partida.
$estado = null;
if (isset($data["estado"])) {
  $estado = $data["estado"];
}

$pokemones = [];
if (isset($data["pokemonesCapturados"])) {
  $pokemones = $data["pokemonesCapturados"];
} elseif (is_array($estado) && isset($estado["pokemonesCapturados"])) {
  $pokemones = $estado["pokemonesCapturados"];
}

if (!is_array($estado)) {
  echo json_encode(["success" => false, "message" => "Estado de partida no valido"]);
  exit;
}

if (!is_array($pokemones)) {
  $pokemones = [];
}

try {
  $connection = getDbConnection();
  $userId = (int) $_SESSION['user_id'];
  $estadoJson = json_encode($estado, JSON_UNESCAPED_UNICODE);

  $connection->begin_transaction();

  // Inserta o actualiza una unica partida por usuario.
  $saveSql = "INSERT INTO partidas_guardadas (user_id, estado_json)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE estado_json = VALUES(estado_json)";
  $saveStatement = $connection->prepare($saveSql);
  $saveStatement->bind_param("is", $userId, $estadoJson);
  $saveStatement->execute();

  $deleteStatement = $connection->prepare("DELETE FROM pokemones_capturados WHERE user_id = ?");
  $deleteStatement->bind_param("i", $userId);
  $deleteStatement->execute();

  // Reescribe la lista completa para que la bolsa refleje exactamente el estado actual.
  $pokemonSql = "INSERT INTO pokemones_capturados (user_id, nombre, nivel, fecha) VALUES (?, ?, ?, ?)";
  $pokemonStatement = $connection->prepare($pokemonSql);

  foreach ($pokemones as $pokemon) {
    if (is_array($pokemon)) {
      $nombre = "";
      if (isset($pokemon["nombre"])) {
        $nombre = trim((string) $pokemon["nombre"]);
      }
    } else {
      $nombre = trim((string) $pokemon);
    }

    if ($nombre === "") {
      continue;
    }

    $nivel = null;
    if (is_array($pokemon) && isset($pokemon["nivel"]) && $pokemon["nivel"] !== "") {
      $nivel = (int) $pokemon["nivel"];
    }

    $fecha = null;
    if (is_array($pokemon) && isset($pokemon["fecha"])) {
      $fecha = (string) $pokemon["fecha"];
    }

    $pokemonStatement->bind_param("isis", $userId, $nombre, $nivel, $fecha);
    $pokemonStatement->execute();
  }

  $connection->commit();

  $saveStatement->close();
  $deleteStatement->close();
  $pokemonStatement->close();
  $connection->close();

  echo json_encode(["success" => true, "message" => "Partida guardada correctamente"]);
} catch (Throwable $e) {
  if (isset($connection)) {
    $connection->rollback();
  }

  echo json_encode(["success" => false, "message" => "No se pudo guardar la partida"]);
}
