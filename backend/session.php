<?php
session_start();

header("Content-Type: application/json");

// Informa al frontend si existe una sesion activa y que personaje debe cargar.
if (isset($_SESSION['user'])) {
  $userId = null;
  if (isset($_SESSION['user_id'])) {
    $userId = $_SESSION['user_id'];
  }

  $personaje = null;
  if (isset($_SESSION['personaje'])) {
    $personaje = $_SESSION['personaje'];
  }

  echo json_encode([
    "logged" => true,
    "user_id" => $userId,
    "user" => $_SESSION['user'],
    "personaje" => $personaje
  ]);
} else {
  echo json_encode(["logged" => false]);
}
