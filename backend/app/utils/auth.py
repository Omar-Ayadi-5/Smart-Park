from functools import wraps
import jwt
from flask import g, jsonify, request, current_app
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError


def token_required(f):
    """
    Middleware d’authentification (décorateur) pour les routes admin.

    - Attend un header `Authorization: Bearer <jwt>`
    - Vérifie la signature et l’expiration
    - Hydrate le contexte Flask `g` (admin_id/email/role) pour l’autorisation (RBAC)

    Note: les routes publiques (ex: `/api/parking/*`) ne doivent pas utiliser ce décorateur.
    """
    @wraps(f)
    def decorated(*args, **kwargs):

        if request.method == "OPTIONS":
            # Préflight CORS: on répond rapidement sans exiger de token.
            return jsonify({"message": "OK"}), 200

        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Token missing"}), 401

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return (
                jsonify(
                    {
                        "error": "Invalid Authorization header. Expected: Bearer <token>"
                    }
                ),
                401,
            )

        token = parts[1]
        secret = current_app.config.get("SECRET_KEY")
        if not secret:
            # Si la clé n’est pas configurée, on ne peut pas valider les JWT.
            current_app.logger.error("SECRET_KEY is not configured")
            return jsonify({"error": "Server misconfiguration"}), 500

        try:
            payload = jwt.decode(
                token,
                secret,
                algorithms=["HS256"],
                options={"require": ["exp", "admin_id"]},
            )
        except ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        # Contexte utilisateur accessible dans les routes contrôlées.
        g.admin_id = payload.get("admin_id")
        g.admin_email = payload.get("email")
        g.role = payload.get("role") 

        return f(*args, **kwargs)

    return decorated