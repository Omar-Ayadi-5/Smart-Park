from flask import Blueprint, jsonify
from app.controllers.parking_controller import public_dashboard

parking_bp = Blueprint("parking", __name__, url_prefix="/api/parking")

@parking_bp.route("/dashboard", methods=["GET"])
def fetch_spots():
    return jsonify(public_dashboard())