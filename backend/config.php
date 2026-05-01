<?php

function getDbConnection(): mysqli {
  $host = "127.0.0.1";
  $dbName = "pokemon_daw";
  $dbUser = "root";
  $dbPassword = "";

  mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

  $connection = new mysqli($host, $dbUser, $dbPassword);

  $connection->set_charset("utf8mb4");
  $connection->query("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
  $connection->select_db($dbName);
  crearTablasSiFaltan($connection);

  return $connection;
}

function crearTablasSiFaltan(mysqli $connection): void {
  $connection->query(
    "CREATE TABLE IF NOT EXISTS usuarios (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )"
  );
}

function getRequestData(): array {
  $rawInput = file_get_contents("php://input");
  $jsonData = json_decode($rawInput, true);

  if (is_array($jsonData)) {
    return $jsonData;
  }

  return $_POST;
}
