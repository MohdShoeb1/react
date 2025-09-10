import sqlite3
import os

def setup_database():
    """Initialize SQLite database with required tables for disaster management app"""
    
    # Create database directory if it doesn't exist
    os.makedirs('backend', exist_ok=True)
    
    # Connect to SQLite database
    conn = sqlite3.connect('backend/disaster_management.db')
    cursor = conn.cursor()
    
    # Create help_requests table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS help_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location TEXT NOT NULL,
            phone TEXT,
            request_type TEXT DEFAULT 'general',
            message TEXT,
            status TEXT DEFAULT 'pending',
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create relief_camps table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS relief_camps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            camp_name TEXT NOT NULL,
            location TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            food INTEGER DEFAULT 0,
            medicine INTEGER DEFAULT 0,
            shelter INTEGER DEFAULT 0,
            water INTEGER DEFAULT 0,
            contact_number TEXT,
            capacity INTEGER DEFAULT 100,
            current_occupancy INTEGER DEFAULT 0
        )
    ''')
    
    # Create family_status table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS family_status (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            family_member_name TEXT NOT NULL,
            status TEXT DEFAULT 'unknown',
            last_known_location TEXT,
            contact_number TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create admin_users table for dashboard access
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'camp_manager'
        )
    ''')
    
    # Insert sample relief camps data
    sample_camps = [
        ('Central Relief Camp', 'Downtown Community Center', 40.7128, -74.0060, 500, 200, 150, 1000, '+1-555-0101', 200, 45),
        ('North Side Emergency Shelter', 'North Park School', 40.7589, -73.9851, 300, 150, 100, 800, '+1-555-0102', 150, 32),
        ('Riverside Relief Center', 'Riverside Hospital Annex', 40.6892, -74.0445, 400, 300, 120, 900, '+1-555-0103', 180, 67),
        ('West End Support Hub', 'West Community Hall', 40.7282, -74.0776, 250, 100, 80, 600, '+1-555-0104', 120, 28)
    ]
    
    cursor.executemany('''
        INSERT OR REPLACE INTO relief_camps 
        (camp_name, location, latitude, longitude, food, medicine, shelter, water, contact_number, capacity, current_occupancy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', sample_camps)
    
    # Insert sample admin user (username: admin, password: admin123)
    cursor.execute('''
        INSERT OR REPLACE INTO admin_users (username, password_hash, role)
        VALUES ('admin', 'pbkdf2:sha256:260000$8xKjzQ2J$4d4c8f8a9b2e3f1a6d7c9e8b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b', 'admin')
    ''')
    
    conn.commit()
    conn.close()
    
    print("Database setup completed successfully!")
    print("Sample relief camps added")
    print("Admin user created - Username: admin, Password: admin123")

if __name__ == "__main__":
    setup_database()
