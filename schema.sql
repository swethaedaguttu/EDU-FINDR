-- Create database (adjust charset/collation as needed)
CREATE DATABASE IF NOT EXISTS `schools_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `schools_db`;

-- Create table
CREATE TABLE IF NOT EXISTS `schools` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` TEXT NOT NULL,
  `address` TEXT NOT NULL,
  `city` TEXT NOT NULL,
  `state` TEXT NOT NULL,
  `contact` BIGINT NOT NULL,
  `image` TEXT NOT NULL,
  `email_id` TEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- Optional: Ensure unique email to prevent duplicates
-- ALTER TABLE `schools` ADD UNIQUE KEY `uniq_email` (`email_id`(191));


