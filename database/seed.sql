-- ========================================================
-- RUCHI: Multi-Portal Seed Data (Hyderabad Pilot)
-- All default seed accounts have password: password123
-- ========================================================

USE `ruchi_db`;

-- 1. Insert Roles
INSERT IGNORE INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'SUPER_ADMIN', 'Platform owner with full system and administrative authority'),
(2, 'ADMIN', 'Operational administrator for verification, reports and moderation'),
(3, 'COOK', 'Registered Home Cook offering planned meals'),
(4, 'DONOR', 'Registered Food Donor offering free surplus food'),
(5, 'COOK_DONOR', 'Dual partner participating as both Home Cook and Food Donor'),
(6, 'CUSTOMER', 'Registered community citizen ordering food or claiming surplus');

-- 2. Insert Users (Password: password123)
-- Hash: $2a$10$OisZVNWv4RyrK4hfknGAmusATOs68XrOnQmxOcTd1wVfoXo4nRKmi
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `avatar`, `status`, `is_email_verified`, `is_phone_verified`) VALUES
('usr_superadmin', 'Dr. Radhika Rao (Super Admin)', 'superadmin@ruchi.com', '+91 90000 00000', '$2a$10$OisZVNWv4RyrK4hfknGAmusATOs68XrOnQmxOcTd1wVfoXo4nRKmi', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80', 'ACTIVE', TRUE, TRUE),
('usr_admin_1', 'Kavitha Nambiar (Moderator)', 'admin@ruchi.com', '+91 90000 00001', '$2a$10$OisZVNWv4RyrK4hfknGAmusATOs68XrOnQmxOcTd1wVfoXo4nRKmi', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80', 'ACTIVE', TRUE, TRUE),
('usr_partner_both', 'Smt. Lakshmi Rao (Cook & Donor)', 'partner@ruchi.com', '+91 98480 12345', '$2a$10$OisZVNWv4RyrK4hfknGAmusATOs68XrOnQmxOcTd1wVfoXo4nRKmi', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80', 'ACTIVE', TRUE, TRUE),
('usr_partner_donor', 'Rajesh Varma (Kakatiya Banquets)', 'donor@ruchi.com', '+91 94400 55443', '$2a$10$OisZVNWv4RyrK4hfknGAmusATOs68XrOnQmxOcTd1wVfoXo4nRKmi', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80', 'ACTIVE', TRUE, TRUE),
('usr_customer_1', 'Aarav Sharma', 'customer@ruchi.com', '+91 98765 43210', '$2a$10$OisZVNWv4RyrK4hfknGAmusATOs68XrOnQmxOcTd1wVfoXo4nRKmi', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80', 'ACTIVE', TRUE, TRUE);

-- 3. Assign User Roles
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
('usr_superadmin', 1), -- SUPER_ADMIN
('usr_admin_1', 2),    -- ADMIN
('usr_partner_both', 5), -- COOK_DONOR (Both cook & donor!)
('usr_partner_donor', 4), -- DONOR
('usr_customer_1', 6);    -- CUSTOMER

-- 4. Admin Profiles
INSERT INTO `admin_profiles` (`user_id`, `department`, `permissions`) VALUES
('usr_superadmin', 'Executive Governance', 'ALL,USER_MANAGE,ROLE_ASSIGN,FINANCE,SECURITY'),
('usr_admin_1', 'Trust, Safety & Moderation', 'VERIFY_COOKS,VIEW_REPORTS,MODERATE_POSTS');

-- 5. Partner Profiles
INSERT INTO `partner_profiles` 
(`user_id`, `business_name`, `partner_type`, `bio`, `fssai_number`, `kitchen_address`, `area`, `city`, `latitude`, `longitude`, `rating`, `total_orders_served`, `verification_status`) 
VALUES
('usr_partner_both', 'Lakshmi Amma Kitchen & Care Foundation', 'COOK_DONOR', 
 'Authentic Telangana & Andhra homemade specialties. Also donating weekend surplus meals to community shelters.',
 '23623032000845', 'Road No. 12, Banjara Hills, near Cancer Hospital, Hyderabad', 'Banjara Hills', 'Hyderabad', 17.4156, 78.4357, 4.95, 52, 'VERIFIED'),

('usr_partner_donor', 'Kakatiya Grand Banquets & Catering', 'DONOR',
 'Catering premium corporate and wedding banquets in Begumpet. Donating surplus clean prepared food.',
 '23624009001123', 'Kakatiya Banquet Lane, opp. Shoppers Stop, Begumpet, Hyderabad', 'Begumpet', 'Hyderabad', 17.4447, 78.4664, 4.88, 30, 'VERIFIED');

-- 6. Customer Profiles
INSERT INTO `customer_profiles` (`user_id`, `default_delivery_address`, `area`, `city`, `latitude`, `longitude`, `dietary_preference`, `notification_radius_km`) VALUES
('usr_customer_1', 'Flat 402, Green Meadows, Madhapur, Hyderabad', 'Madhapur', 'Hyderabad', 17.4483, 78.3915, 'all', 5);

-- 7. Pre-Order Food Posts (With 4-customer booking ceiling & 30-minute cutoff)
INSERT INTO `food_posts` 
(`id`, `cook_id`, `dish_name`, `description`, `category`, `dietary`, `price_per_plate`, `total_plates`, `remaining_plates`, `active_customer_bookings_count`, `cooking_starts_at`, `order_closes_at`, `pickup_address`, `area`, `latitude`, `longitude`, `delivery_available`, `delivery_fee`, `ingredients`, `allergens`, `status`, `image_url`)
VALUES
('post_preorder_1', 'usr_partner_both', 'Andhra Pappu & Gongura Rice Thali', 
 'Fresh organic Gongura leaves simmered with Toor Dal, ghee tadka, Avakaya pickle, Gunpowder, and hot Sona Masoori rice.',
 'Traditional South Indian', 'VEG', 160.00, 8, 5, 2, 
 DATE_ADD(NOW(), INTERVAL 90 MINUTE), DATE_ADD(NOW(), INTERVAL 60 MINUTE),
 'Road No. 12, Banjara Hills, near Cancer Hospital, Hyderabad', 'Banjara Hills', 17.4156, 78.4357, TRUE, 35.00,
 'Toor Dal, Gongura leaves, Pure Ghee, Sona Masoori Rice, Mustard seeds, Curry leaves', 'Dairy (Ghee)', 'ACTIVE',
 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80'),

('post_preorder_2', 'usr_partner_both', 'Heritage Nizami Dum Gosht Biryani & Salan',
 'Tender marinated mutton layered with fragrant long-grain Basmati rice, saffron-infused milk, fried onions and slow cooked over charcoal dum.',
 'Biryani & Nizami', 'NON_VEG', 320.00, 10, 4, 3,
 DATE_ADD(NOW(), INTERVAL 60 MINUTE), DATE_ADD(NOW(), INTERVAL 30 MINUTE),
 'Plot 44, Road No. 36, Jubilee Hills, Hyderabad', 'Jubilee Hills', 17.4319, 78.4073, TRUE, 40.00,
 'Mutton, Basmati Rice, Pure Ghee, Saffron, Mint, Yogurt, Cardamom', 'Dairy (Yogurt, Ghee), Peanuts (Mirchi Ka Salan)', 'ACTIVE',
 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80');

-- 8. Food Donations (Free Surplus Sharing)
INSERT INTO `food_donations`
(`id`, `donor_id`, `title`, `description`, `category`, `dietary`, `total_servings`, `remaining_servings`, `prepared_at`, `expires_at`, `pickup_address`, `area`, `latitude`, `longitude`, `storage_instructions`, `allergens`, `status`, `image_url`)
VALUES
('don_post_1', 'usr_partner_donor', 'Surplus Steamed Bagara Rice & Dal Tadka (Packaged)',
 'Freshly prepared for a corporate event luncheon at 1:00 PM today. Kept heated in food-grade insulated warmers, packed into hygienic boxes.',
 'Cooked Meals', 'VEG', 25, 18,
 DATE_SUB(NOW(), INTERVAL 120 MINUTE), DATE_ADD(NOW(), INTERVAL 180 MINUTE),
 'Kakatiya Banquet Kitchen, Lane opp. Shoppers Stop, Begumpet, Hyderabad', 'Begumpet', 17.4447, 78.4664,
 'Hot holding maintained at >65°C. Consume within 4 hours or refrigerate immediately upon pickup.', 'Dairy (Ghee in Dal)', 'AVAILABLE',
 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'),

('don_post_2', 'usr_partner_both', 'Fresh Homemade Wheat Chapatis & Aloo Gobi (20 Packs)',
 'Made fresh alongside our afternoon cooking session. Wholesome and neatly packed in food paper.',
 'Roti & Sabzi', 'VEG', 20, 20,
 DATE_SUB(NOW(), INTERVAL 45 MINUTE), DATE_ADD(NOW(), INTERVAL 240 MINUTE),
 'Road No. 12, Banjara Hills, Hyderabad', 'Banjara Hills', 17.4156, 78.4357,
 'Ambient storage. Consume before 9:00 PM.', 'Gluten (Wheat)', 'AVAILABLE',
 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80');

-- 9. Sample Customer Order
INSERT INTO `food_orders`
(`id`, `post_id`, `customer_id`, `customer_name`, `customer_phone`, `plate_quantity`, `unit_price`, `delivery_fee`, `total_amount`, `fulfillment_type`, `delivery_address`, `status`, `payment_method`, `payment_status`, `cooking_starts_at`, `order_closes_at`)
VALUES
('ord_sample_101', 'post_preorder_1', 'usr_customer_1', 'Aarav Sharma', '+91 98765 43210', 2, 160.00, 35.00, 355.00, 'DELIVERY', 'Flat 402, Green Meadows, Madhapur, Hyderabad', 'CONFIRMED', 'UPI', 'PAID', DATE_ADD(NOW(), INTERVAL 90 MINUTE), DATE_ADD(NOW(), INTERVAL 60 MINUTE));

-- 10. Sample Notifications
INSERT INTO `notifications` (`id`, `user_id`, `portal_target`, `title`, `message`, `type`, `is_read`) VALUES
('notif_1', 'usr_customer_1', 'CUSTOMER', '🍲 New Pre-Order in Banjara Hills!', 'Smt. Lakshmi Rao announced Andhra Pappu & Gongura Rice Thali. Booking closes in 60 mins!', 'NEW_DISH', FALSE),
('notif_2', 'usr_partner_both', 'PARTNER', '🔔 New Booking Slot Filled (2/4)', 'Aarav Sharma booked 2 plates of Andhra Pappu Thali. 5 plates remain.', 'ORDER_STATUS', FALSE),
('notif_3', 'usr_admin_1', 'ADMIN', '🛡️ New Partner Onboarded', 'Smt. Lakshmi Rao verified with FSSAI #23623032000845', 'SECURITY', TRUE);
