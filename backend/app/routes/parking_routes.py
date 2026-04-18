from flask import Blueprint, jsonify
from app.controllers.parking_controller import public_dashboard

parking_bp = Blueprint("parking", __name__, url_prefix="/api/parking")

@parking_bp.route("/dashboard", methods=["GET"])
def fetch_spots():
    # Endpoint public: expose uniquement les infos nécessaires à l’affichage
    # (pas de données sensibles, pas d’identifiants d’admin, etc.).
    return jsonify(public_dashboard())