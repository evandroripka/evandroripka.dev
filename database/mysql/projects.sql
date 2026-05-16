CREATE DATABASE IF NOT EXISTS evandroripka_projects_cms
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE evandroripka_projects_cms;

CREATE TABLE IF NOT EXISTS projects (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(120) NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  is_featured TINYINT(1) NOT NULL DEFAULT 1,
  title VARCHAR(190) NOT NULL,
  label VARCHAR(255) NOT NULL,
  meta_title VARCHAR(255) NOT NULL,
  meta_description TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  role TEXT NOT NULL,
  cta_label VARCHAR(190) NOT NULL,
  cover JSON NOT NULL,
  stack JSON NOT NULL,
  home_copy JSON NOT NULL,
  hero_copy JSON NOT NULL,
  snapshot JSON NOT NULL,
  sections JSON NOT NULL,
  built JSON NOT NULL,
  integrations JSON NOT NULL,
  media JSON NOT NULL,
  outcome JSON NOT NULL,
  final_cta JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY projects_slug_unique (slug),
  KEY projects_featured_sort_index (is_featured, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
