<?php
session_start();

// Cierra la sesion del entrenador sin borrar sus datos guardados.
session_destroy();

header("Content-Type: application/json");

echo json_encode(["success" => true]);
