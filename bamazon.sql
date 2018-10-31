create database bamazon_db;

Use bamazon_db;

CREATE TABLE products (
  item_id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(100) not NULL,
  department_name VARCHAR(100) not NULL,
  price decimal (6,2) not null,
  stock_quantity int (5) not null
);

SELECT * FROM products
