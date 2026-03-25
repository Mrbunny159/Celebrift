from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import json

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.environ.get('DATABASE_URL')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD') 
SECRET_TOKEN = os.environ.get('SECRET_TOKEN')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

@app.route('/api/decorations', methods=['GET', 'POST'])
def manage_decorations():
    conn = get_db_connection()
    if request.method == 'GET':
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute('SELECT * FROM decorations ORDER BY views DESC;')
        decorations = cur.fetchall()
        cur.close()
        conn.close()
        
        for d in decorations:
            try:
                d['images'] = json.loads(d['image_url']) if d['image_url'].startswith('[') else [d['image_url']]
            except:
                d['images'] = [d['image_url']]
        return jsonify(decorations)

    if request.method == 'POST':
        if request.headers.get('Authorization') != f'Bearer {SECRET_TOKEN}':
            return jsonify({'error': 'Unauthorized'}), 401
        data = request.json
        cur = conn.cursor()
        try:
            cur.execute("SELECT slug FROM decorations WHERE slug = %s", (data['slug'],))
            if cur.fetchone():
                cur.execute('''UPDATE decorations SET title=%s, category=%s, image_url=%s, description=%s, price_range=%s WHERE slug=%s''',
                            (data['title'], data['category'], json.dumps(data['images']), data['description'], data['price_range'], data['slug']))
            else:
                cur.execute('''INSERT INTO decorations (slug, title, category, image_url, description, price_range, package_includes, faqs)
                               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)''', 
                            (data['slug'], data['title'], data['category'], json.dumps(data['images']), data['description'], data['price_range'], json.dumps(data.get('package_includes', [])), json.dumps(data.get('faqs', []))))
            conn.commit()
            return jsonify({'success': True})
        finally:
            cur.close()
            conn.close()

@app.route('/api/decorations/<slug>', methods=['GET', 'DELETE'])
def single_decoration(slug):
    conn = get_db_connection()
    if request.method == 'GET':
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute('SELECT * FROM decorations WHERE slug = %s;', (slug,))
        decoration = cur.fetchone()
        if decoration:
            try:
                decoration['images'] = json.loads(decoration['image_url']) if decoration['image_url'].startswith('[') else [decoration['image_url']]
            except:
                decoration['images'] = [decoration['image_url']]
            cur.execute('UPDATE decorations SET views = views + 1 WHERE slug = %s;', (slug,))
            conn.commit()
            cur.execute('SELECT * FROM reviews WHERE decoration_slug = %s ORDER BY created_at DESC;', (slug,))
            decoration['reviews'] = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(decoration) if decoration else ({'error': 'Not found'}, 404)

    if request.method == 'DELETE':
        if request.headers.get('Authorization') != f'Bearer {SECRET_TOKEN}':
            return jsonify({'error': 'Unauthorized'}), 401
        cur = conn.cursor()
        cur.execute('DELETE FROM decorations WHERE slug = %s', (slug,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True})

@app.route('/api/reviews/<slug>', methods=['POST'])
def add_review(slug):
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('INSERT INTO reviews (decoration_slug, reviewer_name, rating, review_text) VALUES (%s, %s, %s, %s)', (slug, data['name'], data['rating'], data['review']))
    cur.execute('UPDATE decorations SET average_rating = (SELECT ROUND(AVG(rating), 2) FROM reviews WHERE decoration_slug = %s) WHERE slug = %s', (slug, slug))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/home-reviews', methods=['GET'])
def home_reviews():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('SELECT * FROM reviews WHERE rating >= 4 ORDER BY created_at DESC LIMIT 5;')
    revs = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(revs)

@app.route('/api/admin/reviews', methods=['GET', 'DELETE'])
def admin_reviews():
    if request.headers.get('Authorization') != f'Bearer {SECRET_TOKEN}':
        return jsonify({'error': 'Unauthorized'}), 401
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    if request.method == 'GET':
        cur.execute('SELECT * FROM reviews ORDER BY created_at DESC;')
        revs = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(revs)
        
    if request.method == 'DELETE':
        data = request.json
        cur.execute('DELETE FROM reviews WHERE id = %s', (data['id'],))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True})

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    if request.json and request.json.get('password') == ADMIN_PASSWORD:
        return jsonify({'success': True, 'token': SECRET_TOKEN})
    return jsonify({'success': False}), 401

if __name__ == '__main__':
    app.run(debug=True)