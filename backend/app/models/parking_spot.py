from app import db
from datetime import datetime

class ParkingSpot(db.Model):
    __tablename__ = "parking_spot"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(10), nullable=False)
    status = db.Column(db.String(20), default="FREE")
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

    zone_id = db.Column(db.Integer, db.ForeignKey("parking_zone.id"), nullable=False)

    # Relationship
    histories = db.relationship("SpotHistory", backref="spot", lazy=True)