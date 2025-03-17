-- orders table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  taxes NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP WITH TIME ZONE,
  table_number TEXT,
  customer_name TEXT
);

-- inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    product_name TEXT NOT NULL UNIQUE,
    description TEXT,
    quantity NUMERIC NOT NULL DEFAULT 0,
    price NUMERIC NOT NULL,
    category TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- menu table
CREATE TABLE menu (
  id SERIAL PRIMARY KEY,
  item_name TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC NOT NULL,
  category TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- sales table (for analytics)
CREATE TABLE sales (
  id SERIAL PRIMARY KEY,
  order_id TEXT REFERENCES orders(id),
  amount NUMERIC NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    image_url TEXT,
    recommended BOOLEAN DEFAULT false,
    veg BOOLEAN DEFAULT true,
    sizes JSONB DEFAULT '{}',
    unavailable BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for menu_items
CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
    ON menu_items FOR SELECT
    USING (true);

-- Allow only admin users to insert
CREATE POLICY "Allow admin users to insert"
    ON menu_items FOR INSERT
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Allow only admin users to update
CREATE POLICY "Allow admin users to update"
    ON menu_items FOR UPDATE
    USING (
        auth.jwt() ->> 'role' = 'admin'
    )
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Allow only admin users to delete
CREATE POLICY "Allow admin users to delete"
    ON menu_items FOR DELETE
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_name ON menu_items(name);
CREATE INDEX IF NOT EXISTS idx_menu_items_recommended ON menu_items(recommended);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(unavailable);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    items JSONB NOT NULL,
    subtotal NUMERIC NOT NULL,
    taxes NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    table_number TEXT,
    customer_name TEXT
);

-- Create menu table
CREATE TABLE IF NOT EXISTS menu (
    id SERIAL PRIMARY KEY,
    item_name TEXT NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC NOT NULL,
    category TEXT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    order_id TEXT REFERENCES orders(id),
    amount NUMERIC NOT NULL,
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on all tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Orders table policies
CREATE POLICY "Allow public to view orders"
    ON orders FOR SELECT
    USING (true);

CREATE POLICY "Allow admin to manage orders"
    ON orders FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Inventory table policies
CREATE POLICY "Allow public to view inventory"
    ON inventory FOR SELECT
    USING (true);

CREATE POLICY "Allow admin to manage inventory"
    ON inventory FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Menu table policies
CREATE POLICY "Allow public to view menu"
    ON menu FOR SELECT
    USING (true);

CREATE POLICY "Allow admin to manage menu"
    ON menu FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Sales table policies
CREATE POLICY "Allow public to view sales"
    ON sales FOR SELECT
    USING (true);

CREATE POLICY "Allow admin to manage sales"
    ON sales FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_menu_category ON menu(category);
CREATE INDEX IF NOT EXISTS idx_menu_available ON menu(is_available);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_order_id ON sales(order_id);

-- Create trigger for inventory
CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_available ON inventory(is_available); 