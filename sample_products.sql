-- Sample Products for OnDemand Bakery
-- Run this SQL in Navicat to add sample products

USE ec;

-- Insert sample bakery products
INSERT INTO products (name, description, price, quantity, image_url, image_name) VALUES
('Chocolate Croissant', 'Buttery croissant filled with rich Belgian chocolate. Perfect for breakfast or an afternoon treat.', 3.50, 50, '/images/chocolate-croissant.jpg', 'chocolate-croissant.jpg'),
('Blueberry Muffin', 'Moist muffin packed with fresh blueberries and topped with a sweet crumble. A classic favorite!', 2.75, 40, '/images/blueberry-muffin.jpg', 'blueberry-muffin.jpg'),
('Sourdough Bread', 'Artisan sourdough bread with a crispy crust and soft, tangy interior. Made with natural starter.', 5.00, 30, '/images/sourdough-bread.jpg', 'sourdough-bread.jpg'),
('Red Velvet Cupcake', 'Delicious red velvet cupcake with cream cheese frosting. Perfect for celebrations!', 4.00, 35, '/images/red-velvet-cupcake.jpg', 'red-velvet-cupcake.jpg'),
('Cinnamon Roll', 'Soft, fluffy cinnamon roll with cream cheese icing. Warm and comforting!', 3.25, 45, '/images/cinnamon-roll.jpg', 'cinnamon-roll.jpg'),
('Bagel - Plain', 'Fresh New York style bagel. Great for sandwiches or with cream cheese.', 1.50, 60, '/images/bagel-plain.jpg', 'bagel-plain.jpg'),
('Chocolate Chip Cookie', 'Classic chocolate chip cookie with gooey chocolate chunks. Baked fresh daily!', 2.00, 80, '/images/chocolate-chip-cookie.jpg', 'chocolate-chip-cookie.jpg'),
('French Baguette', 'Traditional French baguette with a golden crust and soft interior. Perfect for any meal.', 4.50, 25, '/images/french-baguette.jpg', 'french-baguette.jpg'),
('Apple Pie Slice', 'Homemade apple pie with cinnamon and flaky crust. A timeless dessert!', 4.75, 20, '/images/apple-pie.jpg', 'apple-pie.jpg'),
('Vanilla Eclair', 'Light choux pastry filled with vanilla custard and topped with chocolate glaze.', 3.75, 30, '/images/vanilla-eclair.jpg', 'vanilla-eclair.jpg'),
('Almond Biscotti', 'Crunchy Italian biscotti with roasted almonds. Perfect with coffee or tea.', 2.50, 40, '/images/almond-biscotti.jpg', 'almond-biscotti.jpg'),
('Strawberry Tart', 'Fresh strawberries on sweet pastry cream with a buttery tart shell.', 5.50, 15, '/images/strawberry-tart.jpg', 'strawberry-tart.jpg'),
('Whole Wheat Bread', 'Healthy whole wheat bread made with premium ingredients. Great for sandwiches.', 4.25, 35, '/images/whole-wheat-bread.jpg', 'whole-wheat-bread.jpg'),
('Lemon Pound Cake', 'Moist pound cake with fresh lemon zest and sweet glaze. Light and refreshing!', 4.00, 25, '/images/lemon-pound-cake.jpg', 'lemon-pound-cake.jpg'),
('Cheese Danish', 'Flaky pastry filled with sweet cream cheese. A breakfast favorite!', 3.50, 40, '/images/cheese-danish.jpg', 'cheese-danish.jpg');

-- Verify the data
SELECT * FROM products;



