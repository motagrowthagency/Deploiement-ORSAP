-- =======================================================
-- ORSAP Database Schema for MySQL / phpMyAdmin (Heberjahiz)
-- Charset: utf8mb4 (support for French accents, special characters, etc.)
-- =======================================================

CREATE TABLE IF NOT EXISTS `submissions` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `created_at` DATETIME NOT NULL,
  `client_type` VARCHAR(32) NOT NULL DEFAULT 'professional',
  `name` VARCHAR(255) NOT NULL,
  `company` VARCHAR(255) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(64) NOT NULL,
  `solutions` JSON DEFAULT NULL,
  `sectors` JSON DEFAULT NULL,
  `message` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `applications` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `created_at` DATETIME NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(64) NOT NULL,
  `position` VARCHAR(255) NOT NULL,
  `message` TEXT DEFAULT NULL,
  `cv` LONGTEXT NOT NULL,
  `cv_name` VARCHAR(255) NOT NULL DEFAULT 'cv.pdf'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `blogs` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `date` DATETIME NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `summary` TEXT NOT NULL,
  `content` LONGTEXT NOT NULL,
  `image` LONGTEXT DEFAULT NULL,
  `pdf` LONGTEXT DEFAULT NULL,
  `pdf_name` VARCHAR(255) DEFAULT NULL,
  `updated_at` DATETIME DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
