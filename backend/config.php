<?php

function getDbConnection(): mysqli {
  $host = "127.0.0.1";
  $dbName = "pokemon_daw";
  $dbUser = "root";
  $dbPassword = "";

  // $host = "sql101.infinityfree.com";
  // $dbName = "if0_41887200_pokemon_daw";
  // $dbUser = "if0_41887200";
  // $dbPassword = "iBcXMqlKPm3";

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
      password VARCHAR(255) NOT NULL,
      personaje VARCHAR(20) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )"
  );

  $passwordResult = $connection->query("SHOW COLUMNS FROM usuarios LIKE 'password'");
  $passwordHashResult = $connection->query("SHOW COLUMNS FROM usuarios LIKE 'password_hash'");

  if ($passwordResult->num_rows === 0 && $passwordHashResult->num_rows > 0) {
    $connection->query("ALTER TABLE usuarios CHANGE password_hash password VARCHAR(255) NOT NULL");
  }

  $result = $connection->query("SHOW COLUMNS FROM usuarios LIKE 'personaje'");

  if ($result->num_rows === 0) {
    $connection->query("ALTER TABLE usuarios ADD personaje VARCHAR(20) DEFAULT NULL AFTER password");
  }
}

function getRequestData(): array {
  $rawInput = file_get_contents("php://input");
  $jsonData = json_decode($rawInput, true);

  if (is_array($jsonData)) {
    return $jsonData;
  }

  return $_POST;
}
