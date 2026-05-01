<?php
session_start();

header("Content-Type: application/json");

if (isset($_SESSION['user'])) {
  echo json_encode([
    "logged" => true,
    "user_id" => $_SESSION['user_id'] ?? null,
    "user" => $_SESSION['user']
  ]);
} else {
  echo json_encode(["logged" => false]);
}
