from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

db = SQLAlchemy()

def create_app():
    """
    Factory Flask.

    - Charge la config (`Config`), initialise SQLAlchemy, CORS
    - Enregistre les blueprints API (`/api/parking`, `/api/admin`)

    Ce pattern facilite les tests et évite les effets de bord à l’import.
    """
    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        allow_headers=["Authorization", "Content-Type"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    db.init_app(app)

    from app.routes.parking_routes import parking_bp
    from app.routes.admin_routes import admin_bp

    app.register_blueprint(parking_bp)
    app.register_blueprint(admin_bp)


    return app