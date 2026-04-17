from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

db = SQLAlchemy()

def create_app():
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

    # ✅ IMPORTANT: ADD THIS (DO NOT REMOVE ANYTHING ABOVE)
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_react(path):
        build_dir = os.path.join(os.getcwd(), "frontend", "dist")

        full_path = os.path.join(build_dir, path)

        # If file exists → serve it
        if path != "" and os.path.exists(full_path):
            return send_from_directory(build_dir, path)

        # Otherwise → serve React app
        return send_from_directory(build_dir, "index.html")

    return app