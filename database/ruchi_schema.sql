-- ========================================================
-- RUCHI: Multi-Portal Food Sharing & Homemade Food Marketplace
-- Database Schema for MySQL / XAMPP (phpMyAdmin)
-- Database Name: ruchi_db
-- ========================================================

CREATE DATABASE IF NOT EXISTS `ruchi_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ruchi_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users Table
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(64) PRIMARY KEY,
  `email` VARCHAR(150) UNIQUE NULL,
  `phone` VARCHAR(30) UNIQUE NULL,
  `password_hash` VARCHAR(255) NULL,
  `name` VARCHAR(150) NOT NULL,
  `avatar` VARCHAR(500) NULL,
  `status` ENUM('ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `is_email_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_phone_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Roles Table
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` ENUM('SUPER_ADMIN', 'ADMIN', 'COOK', 'DONOR', 'COOK_DONOR', 'CUSTOMER') UNIQUE NOT NULL,
  `description` VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. User Roles (Mapping Users to Roles)
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
  `user_id` VARCHAR(64) NOT NULL,
  `role_id` INT NOT NULL,
  `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `role_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Customer Profiles
DROP TABLE IF EXISTS `customer_profiles`;
CREATE TABLE `customer_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(64) UNIQUE NOT NULL,
  `default_delivery_address` TEXT NULL,
  `area` VARCHAR(100) NOT NULL DEFAULT 'Madhapur',
  `city` VARCHAR(100) NOT NULL DEFAULT 'Hyderabad',
  `latitude` DECIMAL(10, 7) NOT NULL DEFAULT 17.4483,
  `longitude` DECIMAL(10, 7) NOT NULL DEFAULT 78.3915,
  `dietary_preference` VARCHAR(50) DEFAULT 'all',
  `notification_radius_km` INT NOT NULL DEFAULT 5,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Partner Profiles (For Home Cook, Food Donor, or Both)
DROP TABLE IF EXISTS `partner_profiles`;
CREATE TABLE `partner_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(64) UNIQUE NOT NULL,
  `business_name` VARCHAR(200) NOT NULL,
  `partner_type` ENUM('COOK', 'DONOR', 'COOK_DONOR') NOT NULL DEFAULT 'COOK',
  `bio` TEXT NULL,
  `fssai_number` VARCHAR(50) NULL,
  `kitchen_address` TEXT NOT NULL,
  `area` VARCHAR(100) NOT NULL DEFAULT 'Banjara Hills',
  `city` VARCHAR(100) NOT NULL DEFAULT 'Hyderabad',
  `latitude` DECIMAL(10, 7) NOT NULL DEFAULT 17.4156,
  `longitude` DECIMAL(10, 7) NOT NULL DEFAULT 78.4357,
  `rating` DECIMAL(3, 2) DEFAULT 5.00,
  `total_orders_served` INT DEFAULT 0,
  `verification_status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'VERIFIED',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Admin Profiles
DROP TABLE IF EXISTS `admin_profiles`;
CREATE TABLE `admin_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(64) UNIQUE NOT NULL,
  `department` VARCHAR(100) NOT NULL DEFAULT 'Platform Governance',
  `permissions` VARCHAR(255) NOT NULL DEFAULT 'ALL',
  `created_by_superadmin_id` VARCHAR(64) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Email Verifications
DROP TABLE IF EXISTS `email_verifications`;
CREATE TABLE `email_verifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `token` VARCHAR(255) UNIQUE NOT NULL,
  `otp` VARCHAR(10) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `verified_at` TIMESTAMP NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Phone Verifications
DROP TABLE IF EXISTS `phone_verifications`;
CREATE TABLE `phone_verifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `otp` VARCHAR(10) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `verified_at` TIMESTAMP NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Password Reset Tokens
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `token` VARCHAR(255) UNIQUE NOT NULL,
  `otp` VARCHAR(10) NOT NULL,
  `is_used` BOOLEAN NOT NULL DEFAULT FALSE,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Refresh Tokens
DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE `refresh_tokens` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL,
  `revoked` BOOLEAN NOT NULL DEFAULT FALSE,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Food Posts (Homemade Pre-Orders)
DROP TABLE IF EXISTS `food_posts`;
CREATE TABLE `food_posts` (
  `id` VARCHAR(64) PRIMARY KEY,
  `cook_id` VARCHAR(64) NOT NULL,
  `dish_name` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `dietary` ENUM('VEG', 'NON_VEG', 'VEGAN', 'JAIN') NOT NULL DEFAULT 'VEG',
  `price_per_plate` DECIMAL(10, 2) NOT NULL,
  `total_plates` INT NOT NULL,
  `remaining_plates` INT NOT NULL,
  `active_customer_bookings_count` INT NOT NULL DEFAULT 0,
  `cooking_starts_at` TIMESTAMP NOT NULL,
  `order_closes_at` TIMESTAMP NOT NULL,
  `pickup_address` TEXT NOT NULL,
  `area` VARCHAR(100) NOT NULL,
  `latitude` DECIMAL(10, 7) NOT NULL,
  `longitude` DECIMAL(10, 7) NOT NULL,
  `delivery_available` BOOLEAN DEFAULT FALSE,
  `delivery_fee` DECIMAL(10, 2) DEFAULT 0.00,
  `ingredients` TEXT NULL,
  `allergens` VARCHAR(255) NULL,
  `status` ENUM('ACTIVE', 'SOLD_OUT', 'CLOSED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
  `image_url` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_food_posts_status` (`status`),
  INDEX `idx_food_posts_area` (`area`),
  FOREIGN KEY (`cook_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Food Donations (Free Surplus Sharing)
DROP TABLE IF EXISTS `food_donations`;
CREATE TABLE `food_donations` (
  `id` VARCHAR(64) PRIMARY KEY,
  `donor_id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `dietary` ENUM('VEG', 'NON_VEG', 'VEGAN', 'JAIN') NOT NULL DEFAULT 'VEG',
  `total_servings` INT NOT NULL,
  `remaining_servings` INT NOT NULL,
  `prepared_at` TIMESTAMP NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `pickup_address` TEXT NOT NULL,
  `area` VARCHAR(100) NOT NULL,
  `latitude` DECIMAL(10, 7) NOT NULL,
  `longitude` DECIMAL(10, 7) NOT NULL,
  `storage_instructions` TEXT NOT NULL,
  `allergens` VARCHAR(255) NULL,
  `status` ENUM('AVAILABLE', 'RESERVED', 'COLLECTED', 'EXPIRED') NOT NULL DEFAULT 'AVAILABLE',
  `image_url` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_donations_status` (`status`),
  FOREIGN KEY (`donor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Food Orders
DROP TABLE IF EXISTS `food_orders`;
CREATE TABLE `food_orders` (
  `id` VARCHAR(64) PRIMARY KEY,
  `post_id` VARCHAR(64) NOT NULL,
  `customer_id` VARCHAR(64) NOT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(30) NOT NULL,
  `plate_quantity` INT NOT NULL,
  `unit_price` DECIMAL(10, 2) NOT NULL,
  `delivery_fee` DECIMAL(10, 2) DEFAULT 0.00,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `fulfillment_type` ENUM('PICKUP', 'DELIVERY') NOT NULL DEFAULT 'PICKUP',
  `delivery_address` TEXT NULL,
  `status` ENUM('PENDING_PAYMENT', 'CONFIRMED', 'PREPARING', 'READY', 'COLLECTED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'CONFIRMED',
  `payment_method` VARCHAR(50) DEFAULT 'UPI',
  `payment_status` VARCHAR(50) DEFAULT 'PAID',
  `cooking_starts_at` TIMESTAMP NOT NULL,
  `order_closes_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_orders_status` (`status`),
  FOREIGN KEY (`post_id`) REFERENCES `food_posts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Food Order Items
DROP TABLE IF EXISTS `food_order_items`;
CREATE TABLE `food_order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(64) NOT NULL,
  `item_reference` VARCHAR(200) NOT NULL,
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(10, 2) NOT NULL,
  `line_total` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `food_orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Reservations (Free food claims)
DROP TABLE IF EXISTS `reservations`;
CREATE TABLE `reservations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `donation_id` VARCHAR(64) NOT NULL,
  `claimant_id` VARCHAR(64) NOT NULL,
  `servings` INT NOT NULL DEFAULT 1,
  `status` ENUM('CLAIMED', 'COLLECTED', 'CANCELLED') NOT NULL DEFAULT 'CLAIMED',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`donation_id`) REFERENCES `food_donations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`claimant_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Notifications
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `portal_target` ENUM('ADMIN', 'PARTNER', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notif_user` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Reviews
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(64) NOT NULL,
  `reviewer_id` VARCHAR(64) NOT NULL,
  `cook_id` VARCHAR(64) NOT NULL,
  `rating` INT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `comment` TEXT NULL,
  `moderation_status` ENUM('APPROVED', 'FLAGGED', 'HIDDEN') DEFAULT 'APPROVED',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `food_orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`cook_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Favourites
DROP TABLE IF EXISTS `favourites`;
CREATE TABLE `favourites` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` VARCHAR(64) NOT NULL,
  `cook_id` VARCHAR(64) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_fav` (`customer_id`, `cook_id`),
  FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`cook_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. Audit Logs
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `actor_id` VARCHAR(64) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `portal` ENUM('ADMIN', 'PARTNER', 'CUSTOMER') NOT NULL DEFAULT 'ADMIN',
  `target_type` VARCHAR(50) NOT NULL,
  `target_id` VARCHAR(64) NOT NULL,
  `metadata` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
