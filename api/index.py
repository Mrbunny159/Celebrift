from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import json

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.environ.get('DATABASE_URL')
# This is your admin password. You can change 'celebrift123' to anything you want!
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'celebrift123') 
SECRET_TOKEN = 'admin_secret_token_123'

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

# --- PUBLIC ROUTES ---
@app.route('/api/decorations', methods=['GET'])
def get_decorations():
    category = request.args.get('category')
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    if category and category != 'all':
        cur.execute('SELECT slug, title, category, image_url, price_range, average_rating FROM decorations WHERE category = %s ORDER BY views DESC;', (category,))
    else:
        cur.execute('SELECT slug, title, category, image_url, price_range, average_rating FROM decorations ORDER BY views DESC;')
    decorations = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(decorations)

@app.route('/api/decorations/<slug>', methods=['GET'])
def get_single_decoration(slug):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('SELECT * FROM decorations WHERE slug = %s;', (slug,))
    decoration = cur.fetchone()
    if decoration:
        cur.execute('UPDATE decorations SET views = views + 1 WHERE slug = %s;', (slug,))
        conn.commit()
        cur.execute('SELECT reviewer_name, rating, review_text, created_at FROM reviews WHERE decoration_slug = %s ORDER BY created_at DESC;', (slug,))
        decoration['reviews'] = cur.fetchall()
    cur.close()
    conn.close()
    if decoration:
        return jsonify(decoration)
    return jsonify({'error': 'Not found'}), 404

# --- ADMIN ROUTES ---
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    if data and data.get('password') == ADMIN_PASSWORD:
        return jsonify({'success': True, 'token': SECRET_TOKEN})
    return jsonify({'success': False, 'message': 'Invalid password'}), 401

@app.route('/api/decorations', methods=['POST'])
def add_decoration():
    if request.headers.get('Authorization') != f'Bearer {SECRET_TOKEN}':
        return jsonify({'error': 'Unauthorized'}), 401
        
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute('''
            INSERT INTO decorations (slug, title, category, image_url, description, price_range, package_includes, faqs)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ''', (
            data['slug'], data['title'], data['category'], data['image_url'],
            data['description'], data['price_range'],
            json.dumps(data.get('package_includes', [])),
            json.dumps(data.get('faqs', []))
        ))
        conn.commit()
        return jsonify({'success': True, 'message': 'Decoration added successfully'})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()

@app.route('/api/decorations/<slug>', methods=['DELETE'])
def delete_decoration(slug):
    if request.headers.get('Authorization') != f'Bearer {SECRET_TOKEN}':
        return jsonify({'error': 'Unauthorized'}), 401

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('DELETE FROM decorations WHERE slug = %s', (slug,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'success': True, 'message': 'Deleted successfully'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)