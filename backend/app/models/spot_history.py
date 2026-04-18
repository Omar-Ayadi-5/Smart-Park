from app import db
from datetime import datetime

class SpotHistory(db.Model):
    __tablename__ = "spot_history"

    id = db.Column(db.Integer, primary_key=True)
    changed_at = db.Column(db.DateTime, default=datetime.utcnow)

    old_status = db.Column(db.String(20))
    new_status = db.Column(db.String(20))

    # Source du changement:
    # - SENSOR: mise à jour automatique (capteur)
    # - ADMIN: action manuelle depuis l’interface admin
    # - SYSTEM: autre automatisation (batch, maintenance, etc.)
    source = db.Column(db.String(20))  # SENSOR / ADMIN / SYSTEM
    note = db.Column(db.Text)

    spot_id = db.Column(db.Integer, db.ForeignKey("parking_spot.id"), nullable=False)
    # Nullable car un changement peut provenir d’un capteur (pas d’admin à tracer).
    changed_by_admin_id = db.Column(db.Integer, db.ForeignKey("admin_user.id"), nullable=True)