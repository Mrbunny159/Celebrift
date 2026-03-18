from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import json

app = Flask(__name__)
CORS(app)

# Pull secure variables from Vercel
DATABASE_URL = os.environ.get('DATABASE_URL')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'celebrift123') 
SECRET_TOKEN = os.environ.get('SECRET_TOKEN', 'admin_secret_token_123')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

# 1. COMBINED GET & POST ROUTE (Fixes the 405 Method Not Allowed Error)
@app.route('/api/decorations', methods=['GET', 'POST'])
def manage_decorations():
    conn = get_db_connection()
    
    # If the frontend is asking FOR data...
    if request.method == 'GET':
        cur = conn.cursor(cursor_factory=RealDictCursor)
        category = request.args.get('category')
        if category and category != 'all':
            cur.execute('SELECT slug, title, category, image_url, price_range, average_rating FROM decorations WHERE category = %s ORDER BY views DESC;', (category,))
        else:
            cur.execute('SELECT slug, title, category, image_url, price_range, average_rating FROM decorations ORDER BY views DESC;')
        decorations = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(decorations)

    # If the admin dashboard is SENDING data...
    if request.method == 'POST':
        # Security Check
        if request.headers.get('Authorization') != f'Bearer {SECRET_TOKEN}':
            return jsonify({'error': 'Unauthorized'}), 401
            
        data = request.json
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

# 2. Get Single Product (For Details Page)
@app.route('/api/decorations/<slug>', methods=['GET'])
def get_single_decoration(slug):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('SELECT * FROM decorations WHERE slug = %s;', (slug,))
    decoration = cur.fetchone()
    if decoration:
        # Add +1 to Views Tracker!
        cur.execute('UPDATE decorations SET views = views + 1 WHERE slug = %s;', (slug,))
        conn.commit()
        # Get Reviews
        cur.execute('SELECT reviewer_name, rating, review_text, created_at FROM reviews WHERE decoration_slug = %s ORDER BY created_at DESC;', (slug,))
        decoration['reviews'] = cur.fetchall()
    cur.close()
    conn.close()
    if decoration:
        return jsonify(decoration)
    return jsonify({'error': 'Not found'}), 404

# 3. Delete Product Route
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

# 4. Admin Login Verification
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    if data and data.get('password') == ADMIN_PASSWORD:
        return jsonify({'success': True, 'token': SECRET_TOKEN})
    return jsonify({'success': False, 'message': 'Invalid password'}), 401

# 5. Customer Review Submission
@app.route('/api/reviews/<slug>', methods=['POST'])
def add_review(slug):
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute('''
            INSERT INTO reviews (decoration_slug, reviewer_name, rating, review_text)
            VALUES (%s, %s, %s, %s)
        ''', (slug, data['name'], data['rating'], data['review']))
        
        # Recalculate Average Rating
        cur.execute('''
            UPDATE decorations 
            SET average_rating = (
                SELECT ROUND(AVG(rating), 2) FROM reviews WHERE decoration_slug = %s
            )
            WHERE slug = %s
        ''', (slug, slug))
        
        conn.commit()
        return jsonify({'success': True, 'message': 'Review added!'})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)