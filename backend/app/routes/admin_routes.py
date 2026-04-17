from flask import Blueprint, request, jsonify , g , current_app
from app.controllers.admin_controller import register_admin, login_admin,get_dashboard_data, update_username,delete_admin , get_all_admins , approve_admin , toggle_spot_oos
from app.utils.auth import token_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@admin_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    response, status = register_admin(data)
    return jsonify(response), status


@admin_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    response, status = login_admin(data)
    return jsonify(response), status


@admin_bp.route("/dashboard", methods=["GET"])
@token_required
def dashboard():
    data = get_dashboard_data()
    return jsonify(data)

@admin_bp.route("/update-username", methods=["PUT"])
@token_required
def update_username_route():
    data = request.get_json()

    admin_id = g.admin_id

    response, status = update_username(admin_id, data)
    return jsonify(response), status

@admin_bp.route("/delete-account", methods=["DELETE"])
@token_required
def delete_account_route():
    admin_id = g.admin_id

    response, status = delete_admin(admin_id)
    return jsonify(response), status


@admin_bp.route("/get-admins", methods=["GET"])
@token_required
def admins():
    if g.role not in ["admin","super_admin"]:
        return {"error": "Forbidden"}, 403

    return jsonify(get_all_admins())


@admin_bp.route("/approve-admin/<int:id>", methods=["PUT"])
@token_required
def approve(id):
    if g.role != "super_admin":
        return {"error": "Forbidden"}, 403

    return approve_admin(id)


@admin_bp.route("/delete-admin/<int:id>", methods=["DELETE"])
@token_required
def delete(id):
    if g.role != "super_admin":
        return {"error": "Forbidden"}, 403

    return delete_admin(id)

@admin_bp.route("/spot/<int:spot_id>/toggle-oos", methods=["PATCH"])
@token_required
def change_state(spot_id):

    if g.role not in ["super_admin", "admin"]:
        return {"error": "Forbidden"}, 403

    return toggle_spot_oos(spot_id)