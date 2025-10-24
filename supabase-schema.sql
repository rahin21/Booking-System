-- Resort Booking System Database Schema
-- Run this in your Supabase SQL Editor to create all tables

-- Admin table for service management
CREATE TABLE Admin (
    a_id SERIAL PRIMARY KEY,
    a_name VARCHAR(255),
    a_email VARCHAR(255) UNIQUE,
    a_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service table for accommodations (resorts, hotels, etc.)
CREATE TABLE Service (
    s_id SERIAL PRIMARY KEY,
    s_name VARCHAR(255) NOT NULL,
    s_type VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    check_in DATE,
    check_out DATE,
    status VARCHAR(50) DEFAULT 'available',
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    amenities TEXT[], -- Array of amenities
    rating DECIMAL(2,1) DEFAULT 4.5,
    admin_id INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (admin_id) REFERENCES Admin(a_id)
);

-- Customer management
CREATE TABLE Customer (
    c_id SERIAL PRIMARY KEY,
    c_name VARCHAR(255) NOT NULL,
    c_email VARCHAR(255) UNIQUE NOT NULL,
    c_phone VARCHAR(20),
    c_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reservation tracking
CREATE TABLE Reservation (
    reservation_id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    check_in_date DATE,
    check_out_date DATE,
    guest_count INTEGER DEFAULT 1,
    special_requests TEXT,
    payment_status VARCHAR(50) DEFAULT 'pending',
    s_id INT NOT NULL,
    c_id INT NOT NULL,
    service_type VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    admin_id INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (s_id) REFERENCES Service(s_id),
    FOREIGN KEY (c_id) REFERENCES Customer(c_id),
    FOREIGN KEY (admin_id) REFERENCES Admin(a_id)
);

-- Payment records
CREATE TABLE Payment (
    payment_id SERIAL PRIMARY KEY,
    payment_method VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    reservation_id INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (reservation_id) REFERENCES Reservation(reservation_id)
);

-- Insert sample data to replace mock data
INSERT INTO Admin (a_name, a_email, a_phone) VALUES 
('John Admin', 'admin@resort.com', '+1-555-0123'),
('Sarah Manager', 'sarah@resort.com', '+1-555-0124');

-- Insert sample services (replacing mockResorts data)
INSERT INTO Service (s_name, s_type, location, check_in, check_out, status, price, description, amenities, rating, admin_id) VALUES 
('Sunset Beach Resort', 'resort', 'Maldives', '2024-03-15', '2024-03-22', 'available', 299.99, 'Luxury beachfront resort with stunning ocean views', ARRAY['WiFi', 'Pool', 'Restaurant', 'Spa'], 4.8, 1),
('Mountain View Lodge', 'lodge', 'Swiss Alps', '2024-04-01', '2024-04-08', 'available', 199.99, 'Cozy mountain lodge with breathtaking alpine scenery', ARRAY['WiFi', 'Fireplace', 'Hiking'], 4.6, 1),
('City Center Hotel', 'hotel', 'New York', '2024-03-20', '2024-03-25', 'available', 159.99, 'Modern hotel in the heart of the city', ARRAY['WiFi', 'Gym', 'Restaurant'], 4.4, 2),
('Tropical Villa', 'villa', 'Bali', '2024-05-10', '2024-05-17', 'available', 399.99, 'Private villa with pool and garden', ARRAY['WiFi', 'Pool', 'Kitchen', 'Garden'], 4.9, 1),
('Desert Oasis Resort', 'resort', 'Dubai', '2024-06-01', '2024-06-08', 'booked', 499.99, 'Luxury desert resort with world-class amenities', ARRAY['WiFi', 'Pool', 'Spa', 'Golf'], 4.7, 2),
('Lakeside Cabin', 'cabin', 'Canada', '2024-07-15', '2024-07-22', 'available', 129.99, 'Rustic cabin by the lake perfect for nature lovers', ARRAY['WiFi', 'Fireplace', 'Fishing'], 4.3, 1);

-- Insert sample customers
INSERT INTO Customer (c_name, c_email, c_phone, c_address) VALUES 
('Alice Johnson', 'alice@email.com', '+1-555-1001', '123 Main St, Anytown, USA'),
('Bob Smith', 'bob@email.com', '+1-555-1002', '456 Oak Ave, Somewhere, USA'),
('Carol Davis', 'carol@email.com', '+1-555-1003', '789 Pine Rd, Elsewhere, USA');

-- Insert sample reservations
INSERT INTO Reservation (date, check_in_date, check_out_date, guest_count, payment_status, s_id, c_id, service_type, price, admin_id) VALUES 
('2024-03-10', '2024-03-15', '2024-03-22', 2, 'completed', 1, 1, 'resort', 299.99, 1),
('2024-03-12', '2024-04-01', '2024-04-08', 4, 'pending', 2, 2, 'lodge', 199.99, 1),
('2024-03-14', '2024-05-10', '2024-05-17', 6, 'completed', 4, 3, 'villa', 399.99, 1);

-- Insert sample payments
INSERT INTO Payment (payment_method, amount, reservation_id) VALUES 
('Credit Card', 299.99, 1),
('PayPal', 399.99, 3);

-- Enable Row Level Security (RLS)
ALTER TABLE Admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE Service ENABLE ROW LEVEL SECURITY;
ALTER TABLE Customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE Reservation ENABLE ROW LEVEL SECURITY;
ALTER TABLE Payment ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to services (for browsing)
CREATE POLICY "Services are viewable by everyone" ON Service FOR SELECT USING (true);

-- Create policies for authenticated users
CREATE POLICY "Customers can view their own data" ON Customer FOR SELECT USING (auth.uid()::text = c_email);
CREATE POLICY "Customers can insert their own data" ON Customer FOR INSERT WITH CHECK (auth.uid()::text = c_email);
CREATE POLICY "Customers can update their own data" ON Customer FOR UPDATE USING (auth.uid()::text = c_email);

CREATE POLICY "Users can view their own reservations" ON Reservation FOR SELECT USING (
  EXISTS (SELECT 1 FROM Customer WHERE Customer.c_id = Reservation.c_id AND Customer.c_email = auth.uid()::text)
);

CREATE POLICY "Users can create reservations" ON Reservation FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM Customer WHERE Customer.c_id = Reservation.c_id AND Customer.c_email = auth.uid()::text)
);

-- Admin policies (you'll need to set up admin role management)
CREATE POLICY "Admins can manage everything" ON Admin FOR ALL USING (
  EXISTS (SELECT 1 FROM Admin WHERE Admin.a_email = auth.uid()::text)
);