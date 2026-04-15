from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import json
import requests
import base64
import uuid
import io
from PIL import Image
import mimetypes

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.environ.get('DATABASE_URL')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'celebrift123') 
SECRET_TOKEN = os.environ.get('SECRET_TOKEN', 'admin_secret_token_123')
BLOB_TOKEN = os.environ.get('BLOB_READ_WRITE_TOKEN')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def process_and_upload_to_blob(b64_string):
    if not b64_string or not b64_string.startswith('data:'):
        return b64_string
        
    try:
        header, encoded = b64_string.split(',', 1)
        mime_type = header.split(';')[0].split(':')[1]
        binary_data = base64.b64decode(encoded)
        
        if mime_type.startswith('video/'):
            ext = mimetypes.guess_extension(mime_type) or '.mp4'
            filename = f"{uuid.uuid4().hex}{ext}"
            upload_data = binary_data
            content_type = mime_type
        else:
            image = Image.open(io.BytesIO(binary_data))
            if image.mode not in ("RGB", "RGBA"):
                image = image.convert("RGBA")
            output_buffer = io.BytesIO()
            image.save(output_buffer, format="WEBP", quality=80, method=4)
            upload_data = output_buffer.getvalue()
            filename = f"{uuid.uuid4().hex}.webp"
            content_type = "image/webp"

        headers = {
            "Authorization": f"Bearer {BLOB_TOKEN}",
            "x-api-version": "7",
            "x-content-type": content_type
        }
        
        res = requests.put(f"https://blob.vercel-storage.com/{filename}", data=upload_data, headers=headers)
        
        if res.status_code == 200:
            return res.json().get('url')
        else:
            return b64_string
    except Exception as e:
        print("Optimization/Upload Error:", e)
        return b64_string

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
    
    if key == 'promo_media' and content.startswith('data:'):
        content = process_and_upload_to_blob(content)
    elif key == 'hero_items':
        try:
            items = json.loads(content)
            for item in items:
                item['image'] = process_and_upload_to_blob(item.get('image', ''))
            content = json.dumps(items)
        except Exception: pass
    elif key == 'home_reviews':
        try:
            revs = json.loads(content)
            for r in revs:
                if r.get('media'): r['media'] = process_and_upload_to_blob(r['media'])
            content = json.dumps(revs)
        except Exception: pass

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute('INSERT INTO global_settings (key, content) VALUES (%s, %s) ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;', (key, content))
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
        query = 'SELECT slug, title, category, sub_category, image_url, price_range, average_rating, offer_text FROM decorations'
        
        if category and category != 'all':
            cur.execute(query + ' WHERE category LIKE %s ORDER BY views DESC;', (f'%"{category}"%',))
        else:
            cur.execute(query + ' ORDER BY views DESC;')
            
        decorations = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(decorations)

    if request.method == 'POST':
        if request.headers.get('Authorization') != f'Bearer {SECRET_TOKEN}': return jsonify({'error': 'Unauthorized'}), 401
        data = request.json
        cur = conn.cursor()
        try:
            final_primary_img = process_and_upload_to_blob(data.get('image_url', ''))
            final_images_array = [process_and_upload_to_blob(img) for img in data.get('images', [])]
            
            images_json = json.dumps(final_images_array)
            package_json = json.dumps(data.get('package_includes', []))
            faqs_json = json.dumps(data.get('faqs', []))
            offer_val = data.get('offer_text', '')

            # Convert Category to JSON Array
            cat_val = data.get('category', [])
            if not isinstance(cat_val, list): cat_val = [cat_val] if cat_val else []
            category_json = json.dumps(cat_val)

            # Convert Sub-Category to JSON Array
            sub_val = data.get('sub_category', [])
            if not isinstance(sub_val, list): sub_val = [sub_val] if sub_val else []
            sub_category_json = json.dumps(sub_val)

            cur.execute("SELECT slug FROM decorations WHERE slug = %s", (data['slug'],))
            if cur.fetchone():
                cur.execute('UPDATE decorations SET title=%s, category=%s, sub_category=%s, image_url=%s, description=%s, price_range=%s, package_includes=%s, faqs=%s, images=%s, offer_text=%s WHERE slug=%s', (data['title'], category_json, sub_category_json, final_primary_img, data['description'], data['price_range'], package_json, faqs_json, images_json, offer_val, data['slug']))
            else:
                cur.execute('INSERT INTO decorations (slug, title, category, sub_category, image_url, description, price_range, package_includes, faqs, images, offer_text) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)', (data['slug'], data['title'], category_json, sub_category_json, final_primary_img, data['description'], data['price_range'], package_json, faqs_json, images_json, offer_val))
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
        if request.headers.get('Authorization') != f'Bearer {SECRET_TOKEN}': return jsonify({'error': 'Unauthorized'}), 401
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
    if request.headers.get('Authorization') != f'Bearer {SECRET_TOKEN}': return jsonify({'error': 'Unauthorized'}), 401
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('SELECT id, decoration_slug, reviewer_name, rating, review_text, created_at FROM reviews ORDER BY created_at DESC;')
    reviews = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(reviews)

@app.route('/api/admin/reviews/<int:review_id>', methods=['DELETE', 'PUT'])
def modify_review(review_id):
    if request.headers.get('Authorization') != f'Bearer {SECRET_TOKEN}': return jsonify({'error': 'Unauthorized'}), 401
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute('SELECT decoration_slug FROM reviews WHERE id = %s', (review_id,))
        res = cur.fetchone()
        if not res: return jsonify({'error': 'Not found'}), 404
        slug = res[0]

        if request.method == 'DELETE': cur.execute('DELETE FROM reviews WHERE id = %s', (review_id,))
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

@app.route('/api/admin/analytics', methods=['GET'])
def get_analytics():
    if request.headers.get('Authorization') != f'Bearer {SECRET_TOKEN}': return jsonify({'error': 'Unauthorized'}), 401
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('SELECT SUM(views) as total_views FROM decorations;')
    total_views = cur.fetchone()['total_views'] or 0
    cur.execute('SELECT COUNT(*) as total_listings FROM decorations;')
    total_listings = cur.fetchone()['total_listings'] or 0
    cur.execute('SELECT COUNT(*) as total_reviews FROM reviews;')
    total_reviews = cur.fetchone()['total_reviews'] or 0
    cur.execute('SELECT title, views FROM decorations ORDER BY views DESC LIMIT 5;')
    top_products = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({'total_views': total_views, 'total_listings': total_listings, 'total_reviews': total_reviews, 'top_products': top_products})

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    if data and data.get('password') == ADMIN_PASSWORD: return jsonify({'success': True, 'token': SECRET_TOKEN})
    return jsonify({'success': False}), 401