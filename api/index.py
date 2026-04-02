from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import json

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.environ.get('DATABASE_URL')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'celebrift123') 
SECRET_TOKEN = os.environ.get('SECRET_TOKEN', 'admin_secret_token_123')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

@app.route('/api/settings', methods=['GET'])
def get_all_settings():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('SELECT key, content FROM global_settings;')
    settings = {row['key']: row['content'] for row in cur.fetchall()}
    cur.close()
    conn.close()
    return jsonify(settings)

@app.route('/api/settings/<key>', methods=['POST'])
def update_setting(key):
    if request.headers.get('Authorization') != f'Bearer {SECRET_TOKEN}':
        return jsonify({'error': 'Unauthorized'}), 401
    content = request.json.get('content', '')
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute('''
            INSERT INTO global_settings (key, content) VALUES (%s, %s)
            ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;
        ''', (key, content))
        conn.commit()
        return jsonify({'success': True})
    finally:
        cur.close()
        conn.close()

@app.route('/api/decorations', methods=['GET', 'POST'])
def manage_decorations():
    conn = get_db_connection()
    if request.method == 'GET':
        cur = conn.cursor(cursor_factory=RealDictCursor)
        category = request.args.get('category')
        
        # Optimized query includes offer_text
        query = 'SELECT slug, title, category, image_url, price_range, average_rating, offer_text FROM decorations'
        
        if category and category != 'all':
            cur.execute(query + ' WHERE category = %s ORDER BY views DESC;', (category,))
        else:
            cur.execute(query + ' ORDER BY views DESC;')
            
        decorations = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(decorations)

    if request.method == 'POST':
        if request.headers.get('Authorization') != f'Bearer {SECRET_TOKEN}':
            return jsonify({'error': 'Unauthorized'}), 401
        data = request.json
        cur = conn.cursor()
        try:
            images_json = json.dumps(data.get('images', []))
            package_json = json.dumps(data.get('package_includes', []))
            faqs_json = json.dumps(data.get('faqs', []))
            offer_val = data.get('offer_text', '')

            cur.execute("SELECT slug FROM decorations WHERE slug = %s", (data['slug'],))
            if cur.fetchone():
                cur.execute('''
                    UPDATE decorations SET title=%s, category=%s, image_url=%s, description=%s, 
                    price_range=%s, package_includes=%s, faqs=%s, images=%s, offer_text=%s WHERE slug=%s
                ''', (data['title'], data['category'], data['image_url'], data['description'], 
                      data['price_range'], package_json, faqs_json, images_json, offer_val, data['slug']))
            else:
                cur.execute('''
                    INSERT INTO decorations (slug, title, category, image_url, description, price_range, package_includes, faqs, images, offer_text)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ''', (data['slug'], data['title'], data['category'], data['image_url'], data['description'], 
                      data['price_range'], package_json, faqs_json, images_json, offer_val))
            conn.commit()
            return jsonify({'success': True})
        except Exception as e:
            conn.rollback()
            return jsonify({'error': str(e)}), 400
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
            cur.execute('UPDATE decorations SET views = views + 1 WHERE slug = %s;', (slug,))
            conn.commit()
            cur.execute('SELECT * FROM reviews WHERE decoration_slug = %s ORDER BY created_at DESC;', (slug,))
            decoration['reviews'] = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(decoration) if decoration else (jsonify({'error': 'Not found'}), 404)

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

@app.route('/api/admin/reviews', methods=['GET'])
def get_all_reviews():
    if request.headers.get('Authorization') != f'Bearer {SECRET_TOKEN}':
        return jsonify({'error': 'Unauthorized'}), 401
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('SELECT id, decoration_slug, reviewer_name, rating, review_text, created_at FROM reviews ORDER BY created_at DESC;')
    reviews = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(reviews)

@app.route('/api/admin/reviews/<int:review_id>', methods=['DELETE', 'PUT'])
def modify_review(review_id):
    if request.headers.get('Authorization') != f'Bearer {SECRET_TOKEN}':
        return jsonify({'error': 'Unauthorized'}), 401
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute('SELECT decoration_slug FROM reviews WHERE id = %s', (review_id,))
        res = cur.fetchone()
        if not res:
            return jsonify({'error': 'Not found'}), 404
        slug = res[0]

        if request.method == 'DELETE':
            cur.execute('DELETE FROM reviews WHERE id = %s', (review_id,))
        elif request.method == 'PUT':
            data = request.json
            cur.execute('UPDATE reviews SET reviewer_name = %s, rating = %s, review_text = %s WHERE id = %s', (data['name'], data['rating'], data['review'], review_id))

        cur.execute('UPDATE decorations SET average_rating = (SELECT ROUND(AVG(rating), 2) FROM reviews WHERE decoration_slug = %s) WHERE slug = %s', (slug, slug))
        conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    if data and data.get('password') == ADMIN_PASSWORD:
        return jsonify({'success': True, 'token': SECRET_TOKEN})
    return jsonify({'success': False}), 401

if __name__ == '__main__':
    app.run(debug=True)