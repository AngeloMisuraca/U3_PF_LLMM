<?php

// Abre la conexion principal de MySQL y asegura que la base del juego exista.
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

// Crea y migra las tablas necesarias para usuarios, partidas y capturas.
function crearTablasSiFaltan(mysqli $connection): void {
  // Guarda credenciales, personaje elegido y datos basicos del entrenador.
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

  // Migra instalaciones antiguas que usaban password_hash como nombre de columna.
  if ($passwordResult->num_rows === 0 && $passwordHashResult->num_rows > 0) {
    $connection->query("ALTER TABLE usuarios CHANGE password_hash password VARCHAR(255) NOT NULL");
  }

  $emailResult = $connection->query("SHOW COLUMNS FROM usuarios LIKE 'email'");

  // Asegura email unico aunque la tabla se hubiera creado antes sin ese campo.
  if ($emailResult->num_rows === 0) {
    $connection->query("ALTER TABLE usuarios ADD email VARCHAR(100) DEFAULT NULL AFTER username");
    $connection->query("UPDATE usuarios SET email = CONCAT(username, '@local.invalid') WHERE email IS NULL OR email = ''");
    $connection->query("ALTER TABLE usuarios MODIFY email VARCHAR(100) NOT NULL");
  }

  $emailIndexResult = $connection->query("SHOW INDEX FROM usuarios WHERE Key_name = 'email'");

  if ($emailIndexResult->num_rows === 0) {
    $connection->query("ALTER TABLE usuarios ADD UNIQUE KEY email (email)");
  }

  $result = $connection->query("SHOW COLUMNS FROM usuarios LIKE 'personaje'");

  // Guarda si el jugador usa Maximo o Cynthia al iniciar partida.
  if ($result->num_rows === 0) {
    $connection->query("ALTER TABLE usuarios ADD personaje VARCHAR(20) DEFAULT NULL AFTER password");
  }

  $createdAtResult = $connection->query("SHOW COLUMNS FROM usuarios LIKE 'created_at'");

  if ($createdAtResult->num_rows === 0) {
    $connection->query("ALTER TABLE usuarios ADD created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  }

  // Guarda el estado completo serializado del juego para restaurar posicion, nivel y combate.
  $connection->query(
    "CREATE TABLE IF NOT EXISTS partidas_guardadas (
      user_id INT UNSIGNED PRIMARY KEY,
      estado_json LONGTEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_partidas_usuario
        FOREIGN KEY (user_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
    )"
  );

  // Guarda cada Pokemon capturado con su nivel para mostrarlo en la bolsa.
  $connection->query(
    "CREATE TABLE IF NOT EXISTS pokemones_capturados (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNSIGNED NOT NULL,
      nombre VARCHAR(50) NOT NULL,
      nivel INT DEFAULT NULL,
      fecha VARCHAR(40) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_pokemones_usuario
        FOREIGN KEY (user_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
    )"
  );
}

// Lee JSON enviado por fetch y conserva compatibilidad con formularios POST normales.
function getRequestData(): array {
  $rawInput = file_get_contents("php://input");
  $jsonData = json_decode($rawInput, true);

  if (is_array($jsonData)) {
    return $jsonData;
  }

  return $_POST;
}
