const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  console.log('🔄 Connecting to MySQL to create Curry & Rice Marketplace tables...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    database: process.env.DB_NAME || 'ruchi_db',
    multipleStatements: true,
  });

  try {
    console.log('📦 Creating curry_rice_items table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS curry_rice_items (
        id VARCHAR(50) PRIMARY KEY,
        cook_id VARCHAR(50) NOT NULL,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        category ENUM('CURRY', 'RICE', 'CURRY_RICE', 'DAILY_MEALS') NOT NULL,
        dietary ENUM('VEG', 'NON_VEG', 'VEGAN', 'JAIN') DEFAULT 'VEG',
        price DECIMAL(10,2) NOT NULL,
        serving_size VARCHAR(100) NOT NULL,
        stock_quantity INT NOT NULL DEFAULT 10,
        is_available_daily BOOLEAN DEFAULT TRUE,
        is_sold_out BOOLEAN DEFAULT FALSE,
        order_type ENUM('INSTANT', 'ADVANCE', 'BOTH') DEFAULT 'INSTANT',
        prep_time_minutes INT DEFAULT 25,
        pickup_time_window VARCHAR(120) DEFAULT '12:00 PM - 3:30 PM & 7:00 PM - 10:00 PM',
        pickup_address VARCHAR(255),
        area VARCHAR(100),
        image_url TEXT,
        status ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_cook (cook_id),
        INDEX idx_category (category),
        INDEX idx_status (status),
        INDEX idx_order_type (order_type),
        FOREIGN KEY (cook_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('📦 Creating marketplace_orders table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS marketplace_orders (
        id VARCHAR(50) PRIMARY KEY,
        order_number VARCHAR(30) UNIQUE NOT NULL,
        customer_id VARCHAR(50) NOT NULL,
        cook_id VARCHAR(50) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        items_count INT NOT NULL DEFAULT 1,
        status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
        order_type ENUM('INSTANT', 'ADVANCE') DEFAULT 'INSTANT',
        scheduled_time DATETIME NULL,
        fulfillment_type ENUM('PICKUP', 'DELIVERY') DEFAULT 'PICKUP',
        delivery_address TEXT NULL,
        delivery_fee DECIMAL(10,2) DEFAULT 0.00,
        customer_name VARCHAR(150),
        customer_phone VARCHAR(30),
        customer_note TEXT NULL,
        rejection_reason TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_cust (customer_id),
        INDEX idx_cook_order (cook_id),
        INDEX idx_order_status (status),
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (cook_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('📦 Creating marketplace_order_items table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS marketplace_order_items (
        id VARCHAR(50) PRIMARY KEY,
        order_id VARCHAR(50) NOT NULL,
        item_id VARCHAR(50) NOT NULL,
        item_name VARCHAR(150) NOT NULL,
        item_category VARCHAR(50),
        serving_size VARCHAR(100),
        unit_price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_order (order_id),
        FOREIGN KEY (order_id) REFERENCES marketplace_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES curry_rice_items(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Check if items already exist
    const [existing] = await connection.query('SELECT COUNT(*) as cnt FROM curry_rice_items');
    if (existing[0].cnt === 0) {
      console.log('🌱 Seeding initial Curry & Rice marketplace items...');
      const items = [
        {
          id: 'cr_item_1',
          cook_id: 'usr_partner_both',
          name: 'Authentic Andhra Gongura Pappu (Dal)',
          description: 'Tangy sorrel leaves slow-cooked with toor dal, tempered with garlic, dried red chillies, and mustard seeds in country ghee.',
          category: 'CURRY',
          dietary: 'VEG',
          price: 130.00,
          serving_size: '500ml container (Serves 2)',
          stock_quantity: 15,
          is_available_daily: 1,
          is_sold_out: 0,
          order_type: 'INSTANT',
          prep_time_minutes: 20,
          pickup_time_window: '11:30 AM - 3:30 PM & 6:30 PM - 9:30 PM',
          pickup_address: 'Road No. 12, Banjara Hills, Hyderabad',
          area: 'Banjara Hills',
          image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'
        },
        {
          id: 'cr_item_2',
          cook_id: 'usr_partner_both',
          name: 'Hyderabadi Bagara Rice with Mint & Spices',
          description: 'Aromatic basmati rice tempered with whole spices (shahi jeera, cloves, cardamom), caramelized onions, and fresh mint leaves.',
          category: 'RICE',
          dietary: 'VEGAN',
          price: 120.00,
          serving_size: '750ml box (Serves 2)',
          stock_quantity: 20,
          is_available_daily: 1,
          is_sold_out: 0,
          order_type: 'INSTANT',
          prep_time_minutes: 25,
          pickup_time_window: '12:00 PM - 4:00 PM & 7:00 PM - 10:00 PM',
          pickup_address: 'Road No. 12, Banjara Hills, Hyderabad',
          area: 'Banjara Hills',
          image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800'
        },
        {
          id: 'cr_item_3',
          cook_id: 'usr_partner_both',
          name: 'Telangana Gutti Vankaya Koora (Stuffed Brinjal Curry)',
          description: 'Tender baby brinjals stuffed with freshly roasted peanut, sesame, and coconut spice paste, cooked in rich tamarind gravy.',
          category: 'CURRY',
          dietary: 'VEG',
          price: 160.00,
          serving_size: '500ml container (Serves 2-3)',
          stock_quantity: 12,
          is_available_daily: 1,
          is_sold_out: 0,
          order_type: 'ADVANCE',
          prep_time_minutes: 40,
          pickup_time_window: '12:30 PM - 3:30 PM & 7:30 PM - 9:30 PM',
          pickup_address: 'Road No. 12, Banjara Hills, Hyderabad',
          area: 'Banjara Hills',
          image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800'
        },
        {
          id: 'cr_item_4',
          cook_id: 'usr_partner_both',
          name: 'Classic Bagara Rice + Dal Tadka Combo',
          description: 'Hearty combo meal: piping hot fragrant Bagara rice paired with yellow dal tadka, roasted papad, and fresh onion salad.',
          category: 'CURRY_RICE',
          dietary: 'VEG',
          price: 210.00,
          serving_size: 'Complete Combo Box (Serves 1-2)',
          stock_quantity: 18,
          is_available_daily: 1,
          is_sold_out: 0,
          order_type: 'INSTANT',
          prep_time_minutes: 20,
          pickup_time_window: '11:30 AM - 3:30 PM & 7:00 PM - 10:00 PM',
          pickup_address: 'Road No. 12, Banjara Hills, Hyderabad',
          area: 'Banjara Hills',
          image_url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800'
        },
        {
          id: 'cr_item_5',
          cook_id: 'usr_partner_both',
          name: 'South Indian Homestyle Daily Meals (Executive Thali)',
          description: 'Full wholesome daily meals: Steamed Sona Masoori Rice, 2 Seasonal Curries (Pappu + Poriyal), Sambar, Pepper Rasam, Curd, and Sweet Semiya Payasam.',
          category: 'DAILY_MEALS',
          dietary: 'VEG',
          price: 250.00,
          serving_size: 'Multi-Compartment Meal Box (Serves 1 hearty portion)',
          stock_quantity: 25,
          is_available_daily: 1,
          is_sold_out: 0,
          order_type: 'BOTH',
          prep_time_minutes: 30,
          pickup_time_window: '12:00 PM - 3:00 PM & 7:30 PM - 9:30 PM',
          pickup_address: 'Road No. 12, Banjara Hills, Hyderabad',
          area: 'Banjara Hills',
          image_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800'
        },
        {
          id: 'cr_item_6',
          cook_id: 'usr_partner_both',
          name: 'Steamed Sona Masoori Rice with Ghee',
          description: 'Fluffy, pristine long-grain Sona Masoori rice steamed to perfection with a light dollop of pure buffalo ghee.',
          category: 'RICE',
          dietary: 'VEG',
          price: 80.00,
          serving_size: '750ml container (Serves 2)',
          stock_quantity: 30,
          is_available_daily: 1,
          is_sold_out: 0,
          order_type: 'INSTANT',
          prep_time_minutes: 15,
          pickup_time_window: '11:00 AM - 10:00 PM',
          pickup_address: 'Road No. 12, Banjara Hills, Hyderabad',
          area: 'Banjara Hills',
          image_url: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800'
        }
      ];

      for (const item of items) {
        await connection.query(`
          INSERT INTO curry_rice_items (
            id, cook_id, name, description, category, dietary,
            price, serving_size, stock_quantity, is_available_daily,
            is_sold_out, order_type, prep_time_minutes, pickup_time_window,
            pickup_address, area, image_url, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
        `, [
          item.id, item.cook_id, item.name, item.description, item.category, item.dietary,
          item.price, item.serving_size, item.stock_quantity, item.is_available_daily,
          item.is_sold_out, item.order_type, item.prep_time_minutes, item.pickup_time_window,
          item.pickup_address, item.area, item.image_url
        ]);
      }
      console.log('✅ 6 Curry & Rice marketplace items seeded.');
    }

    console.log('🎉 Curry & Rice Marketplace migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    throw err;
  } finally {
    await connection.end();
  }
}

migrate();
