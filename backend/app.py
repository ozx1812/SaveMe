from flask import Flask, request, jsonify
from flask_cors import CORS  # Import Flask-CORS
import sqlite3

app = Flask(__name__)
CORS(app)

# Configure the SQLite database file
DB_NAME = "saved_pages.db"


# Initialize the database table
def initialize_database():
    with sqlite3.connect(DB_NAME) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS saved_pages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                url TEXT NOT NULL,
                type TEXT NOT NULL
            )
            """
        )
        conn.commit()


# Save data to the database
def save_to_database(title, url, type):
    with sqlite3.connect(DB_NAME) as conn:
        conn.execute(
            "INSERT INTO saved_pages (title, url, type) VALUES (?, ?, ?)",
            (title, url, type),
        )
        conn.commit()


def is_url_exists(url):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.execute("SELECT COUNT(*) FROM saved_pages WHERE url = ?", (url,))
        count = cursor.fetchone()[0]
        return count > 0


def get_last_10_saved_items():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.execute("SELECT title, url, type FROM saved_pages ORDER BY id DESC LIMIT 10")
        items = [{"title": row[0], "url": row[1], "type": row[2]} for row in cursor.fetchall()]
        return items


@app.route("/last-10-saved", methods=["GET"])
def last_10_saved_items():
    items = get_last_10_saved_items()
    return jsonify(items), 200


@app.route("/save", methods=["POST"])
def save_page():
    data = request.get_json()
    title = data.get("title")
    url = data.get("url")
    type = data.get("type")

    if not title or not url or not type:
        return jsonify({"message": "Invalid data. Please provide title, url, and type."}), 400

    # Check if the URL already exists
    if is_url_exists(url):
        return jsonify({"message": "URL already exists. No update needed."}), 200

    # If URL is unique, save the data to the database
    save_to_database(title, url, type)
    return jsonify({"message": "Data saved successfully!"}), 200


if __name__ == "__main__":
    initialize_database()
    app.run(host="0.0.0.0", port=5000)
