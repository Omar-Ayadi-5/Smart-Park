from app import db
from datetime import datetime

class AdminUser(db.Model):
    __tablename__ = "admin_user"

    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.Text, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    is_approved = db.Column(db.Boolean, default=False, nullable=False)

    role = db.Column(db.String(20), default="admin", nullable=False)

    # Relationship
    changes = db.relationship("SpotHistory", backref="admin", lazy=True)