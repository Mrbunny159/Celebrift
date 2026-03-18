from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import json

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

# 1. Fetch all products (for the Home Page Mini Cards)
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

# 2. Fetch a single product WITH Reviews (For the Detail Page)
@app.route('/api/decorations/<slug>', methods=['GET'])
def get_single_decoration(slug):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Fetch the product
    cur.execute('SELECT * FROM decorations WHERE slug = %s;', (slug,))
    decoration = cur.fetchone()
    
    if decoration:
        # Add +1 view
        cur.execute('UPDATE decorations SET views = views + 1 WHERE slug = %s;', (slug,))
        conn.commit()
        
        # Fetch the reviews for this product
        cur.execute('SELECT reviewer_name, rating, review_text, created_at FROM reviews WHERE decoration_slug = %s ORDER BY created_at DESC;', (slug,))
        decoration['reviews'] = cur.fetchall()
    
    cur.close()
    conn.close()
    
    if decoration:
        return jsonify(decoration)
    return jsonify({'error': 'Not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)