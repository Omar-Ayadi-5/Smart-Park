from app import db
from datetime import datetime

class ParkingZone(db.Model):
    __tablename__ = "parking_zone"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.Text)
    city = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship
    spots = db.relationship("ParkingSpot", backref="zone", lazy=True)