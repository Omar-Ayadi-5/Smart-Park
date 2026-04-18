from app import db
from datetime import datetime

class AdminUser(db.Model):
    __tablename__ = "admin_user"

    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.Text, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Tant que `is_approved` est False, le login est refusé (contrôlé dans `login_admin`).
    is_approved = db.Column(db.Boolean, default=False, nullable=False)

    # `role` pilote l’accès aux routes sensibles (RBAC minimal dans `admin_routes`).
    # Valeurs attendues: "admin" | "super_admin" (par convention dans ce projet).
    role = db.Column(db.String(20), default="admin", nullable=False)

    # Relationship
    # Historique des changements effectués par cet admin (si `changed_by_admin_id` est renseigné).
    changes = db.relationship("SpotHistory", backref="admin", lazy=True)