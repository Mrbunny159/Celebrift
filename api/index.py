from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os

app = Flask(__name__)
CORS(app) # Allows your frontend to talk to your backend

# You will add your Neon DB URL here, or set it as an Environment Variable in Vercel
DATABASE_URL = os.environ.get('DATABASE_URL', 'your_neon_db_connection_string_here')

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    return conn

@app.route('/api/decorations', methods=['GET'])
def get_decorations():
    category = request.args.get('category')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # If a category is selected, filter by it. Otherwise, return all, sorted by views!
    if category and category != 'all':
        cur.execute('SELECT * FROM decorations WHERE category = %s ORDER BY views DESC;', (category,))
    else:
        cur.execute('SELECT * FROM decorations ORDER BY views DESC;')
        
    decorations = cur.fetchall()
    cur.close()
    conn.close()
    
    return jsonify(decorations)

@app.route('/api/decorations/<slug>', methods=['GET'])
def get_single_decoration(slug):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # 1. Fetch the item
    cur.execute('SELECT * FROM decorations WHERE slug = %s;', (slug,))
    decoration = cur.fetchone()
    
    if decoration:
        # 2. Add +1 to the views column (Most viewed logic!)
        cur.execute('UPDATE decorations SET views = views + 1 WHERE slug = %s;', (slug,))
        conn.commit()
    
    cur.close()
    conn.close()
    
    if decoration:
        return jsonify(decoration)
    return jsonify({'error': 'Not found'}), 404

# --- ADMIN ROUTES (Placeholder for Phase 3) ---
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    # We will build the JWT auth logic here later
    pass

# Vercel requires the app variable to be exposed
if __name__ == '__main__':
    app.run(debug=True, port=5000)