from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime
import hashlib
import secrets

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

DATABASE = 'backend/disaster_management.db'

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password):
    """Simple password hashing"""
    return hashlib.sha256(password.encode()).hexdigest()

@app.route('/api/get_alerts', methods=['GET'])
def get_alerts():
    """Get current disaster alerts"""
    # Sample alerts - in real app, this would come from emergency services API
    alerts = [
        {
            "id": 1,
            "type": "flood",
            "severity": "high",
            "title": "Flash Flood Warning",
            "message": "Heavy rainfall expected. Avoid low-lying areas.",
            "area": "Downtown District",
            "timestamp": "2024-01-15T10:30:00Z"
        },
        {
            "id": 2,
            "type": "earthquake",
            "severity": "medium",
            "title": "Earthquake Aftershock Alert",
            "message": "Minor aftershocks possible in the next 24 hours.",
            "area": "Metropolitan Area",
            "timestamp": "2024-01-15T08:15:00Z"
        }
    ]
    return jsonify({"alerts": alerts, "status": "success"})

@app.route('/api/send_help', methods=['POST'])
def send_help():
    """Store user's help request"""
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO help_requests (name, location, phone, request_type, message)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            data.get('name', ''),
            data.get('location', ''),
            data.get('phone', ''),
            data.get('request_type', 'general'),
            data.get('message', '')
        ))
        
        request_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            "status": "success",
            "message": "Help request submitted successfully",
            "request_id": request_id
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/get_camps', methods=['GET'])
def get_camps():
    """Get list of relief camps with resources"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM relief_camps ORDER BY camp_name
        ''')
        
        camps = []
        for row in cursor.fetchall():
            camps.append({
                "id": row['id'],
                "camp_name": row['camp_name'],
                "location": row['location'],
                "latitude": row['latitude'],
                "longitude": row['longitude'],
                "resources": {
                    "food": row['food'],
                    "medicine": row['medicine'],
                    "shelter": row['shelter'],
                    "water": row['water']
                },
                "contact_number": row['contact_number'],
                "capacity": row['capacity'],
                "current_occupancy": row['current_occupancy'],
                "availability": "Available" if row['current_occupancy'] < row['capacity'] else "Full"
            })
        
        conn.close()
        return jsonify({"camps": camps, "status": "success"})
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/update_resources', methods=['POST'])
def update_resources():
    """Update resources in camps (admin only)"""
    try:
        data = request.get_json()
        camp_id = data.get('camp_id')
        resources = data.get('resources', {})
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Update resources
        cursor.execute('''
            UPDATE relief_camps 
            SET food = ?, medicine = ?, shelter = ?, water = ?
            WHERE id = ?
        ''', (
            resources.get('food', 0),
            resources.get('medicine', 0),
            resources.get('shelter', 0),
            resources.get('water', 0),
            camp_id
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "status": "success",
            "message": "Resources updated successfully"
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/family_status', methods=['GET', 'POST'])
def family_status():
    """Handle family status updates and queries"""
    if request.method == 'POST':
        try:
            data = request.get_json()
            
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO family_status 
                (user_id, family_member_name, status, last_known_location, contact_number)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                data.get('user_id', ''),
                data.get('family_member_name', ''),
                data.get('status', 'unknown'),
                data.get('last_known_location', ''),
                data.get('contact_number', '')
            ))
            
            conn.commit()
            conn.close()
            
            return jsonify({
                "status": "success",
                "message": "Family status updated successfully"
            })
            
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500
    
    else:  # GET request
        try:
            user_id = request.args.get('user_id', '')
            
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM family_status WHERE user_id = ? ORDER BY timestamp DESC
            ''', (user_id,))
            
            family_members = []
            for row in cursor.fetchall():
                family_members.append({
                    "id": row['id'],
                    "family_member_name": row['family_member_name'],
                    "status": row['status'],
                    "last_known_location": row['last_known_location'],
                    "contact_number": row['contact_number'],
                    "timestamp": row['timestamp']
                })
            
            conn.close()
            return jsonify({"family_members": family_members, "status": "success"})
            
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    """Admin login for dashboard access"""
    try:
        data = request.get_json()
        username = data.get('username', '')
        password = data.get('password', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM admin_users WHERE username = ?
        ''', (username,))
        
        user = cursor.fetchone()
        conn.close()
        
        # Simple password check (in production, use proper hashing)
        if user and password == 'admin123':  # Simplified for prototype
            return jsonify({
                "status": "success",
                "message": "Login successful",
                "user": {
                    "username": user['username'],
                    "role": user['role']
                }
            })
        else:
            return jsonify({"status": "error", "message": "Invalid credentials"}), 401
            
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/admin/help_requests', methods=['GET'])
def get_help_requests():
    """Get all help requests for admin dashboard"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM help_requests ORDER BY timestamp DESC
        ''')
        
        requests = []
        for row in cursor.fetchall():
            requests.append({
                "id": row['id'],
                "name": row['name'],
                "location": row['location'],
                "phone": row['phone'],
                "request_type": row['request_type'],
                "message": row['message'],
                "status": row['status'],
                "timestamp": row['timestamp']
            })
        
        conn.close()
        return jsonify({"requests": requests, "status": "success"})
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
