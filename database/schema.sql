CREATE DATABASE IF NOT EXISTS home_needs_store;

USE home_needs_store;


-- =====================================
-- USERS TABLE
-- =====================================

CREATE TABLE users (

    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(150) UNIQUE NOT NULL,

    phone VARCHAR(20),

    password VARCHAR(255) NOT NULL,

    role ENUM('customer','admin') DEFAULT 'customer',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);



-- =====================================
-- CATEGORIES TABLE
-- =====================================

CREATE TABLE categories (

    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    image VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);



-- =====================================
-- PRODUCTS TABLE
-- =====================================

CREATE TABLE products (

    id INT AUTO_INCREMENT PRIMARY KEY,

    category_id INT,

    name VARCHAR(150) NOT NULL,

    description TEXT,

    price DECIMAL(10,2) NOT NULL,

    discount DECIMAL(5,2) DEFAULT 0,

    stock INT DEFAULT 0,

    image VARCHAR(255),

    rating DECIMAL(2,1) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY(category_id)

    REFERENCES categories(id)

    ON DELETE SET NULL

);



-- =====================================
-- CART TABLE
-- =====================================

CREATE TABLE cart (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    product_id INT NOT NULL,

    quantity INT DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY(user_id)

    REFERENCES users(id)

    ON DELETE CASCADE,


    FOREIGN KEY(product_id)

    REFERENCES products(id)

    ON DELETE CASCADE

);



-- =====================================
-- ORDERS TABLE
-- =====================================

CREATE TABLE orders (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    total_amount DECIMAL(10,2) NOT NULL,

    status ENUM(

        'pending',

        'processing',

        'shipped',

        'delivered',

        'cancelled'

    )

    DEFAULT 'pending',


    payment_status ENUM(

        'pending',

        'paid',

        'failed'

    )

    DEFAULT 'pending',


    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY(user_id)

    REFERENCES users(id)

    ON DELETE CASCADE

);



-- =====================================
-- ORDER ITEMS TABLE
-- =====================================

CREATE TABLE order_items (

    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,

    product_id INT NOT NULL,

    quantity INT NOT NULL,

    price DECIMAL(10,2) NOT NULL,


    FOREIGN KEY(order_id)

    REFERENCES orders(id)

    ON DELETE CASCADE,


    FOREIGN KEY(product_id)

    REFERENCES products(id)

    ON DELETE CASCADE

);



-- =====================================
-- REVIEWS TABLE
-- =====================================

CREATE TABLE reviews (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    product_id INT NOT NULL,

    rating INT CHECK(

        rating BETWEEN 1 AND 5

    ),

    comment TEXT,


    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY(user_id)

    REFERENCES users(id)

    ON DELETE CASCADE,


    FOREIGN KEY(product_id)

    REFERENCES products(id)

    ON DELETE CASCADE

);

INSERT INTO categories(name,image)

VALUES

('Kitchen',
'https://images.unsplash.com/photo-1556911220-bff31c812dba'),

('Storage',
'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85'),

('Bathroom',
'https://images.unsplash.com/photo-1620626011761-996317b8d101'),

('Cleaning',
'https://images.unsplash.com/photo-1581578731548-c64695cc6952'),

('Dining',
'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'),

('Decor',
'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800');


INSERT INTO products
(category_id, name, description, price, stock, image, rating)
VALUES
(
1,
'Premium Kitchen Organizer',
'Modern kitchen storage organizer',
49.99,
50,
'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=700',
4.8
),
(
2,
'Wood Storage Shelf',
'Beautiful wooden shelf for home',
79.99,
30,
'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=700',
4.9
),
(
3,
'Bathroom Organizer',
'Space saving bathroom organizer',
39.99,
40,
'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=700',
4.6
),
(
6,
'Luxury Lamp',
'Premium decorative lamp for modern homes',
39.99,
25,
'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=700',
4.9
);