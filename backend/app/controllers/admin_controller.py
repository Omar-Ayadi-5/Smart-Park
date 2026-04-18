from app.models import AdminUser,ParkingSpot,SpotHistory
from app import db
from sqlalchemy import func, case ,extract
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from flask import current_app, g
# REGISTER
def register_admin(data):
    """
    Création d’un compte admin.
    Note: l’approbation (is_approved) est gérée séparément (super_admin),
    donc l’inscription ne donne pas automatiquement accès au dashboard.
    """
    email = data.get("email")
    password = data.get("password")
    username = data.get("username")

    if not email or not password or not username:
        return {"error": "Missing fields"}, 400

    # Check if user exists
    existing = AdminUser.query.filter_by(email=email).first()
    if existing:
        return {"error": "Email already exists"}, 400

    # Create new admin
    new_admin = AdminUser(
        username=username,
        email=email,
        password_hash=generate_password_hash(password)
    )

    db.session.add(new_admin)
    db.session.commit()

    return {"success": True}, 201


# LOGIN
def login_admin(data):
    """
    Authentification admin.
    - Vérifie l’existence du compte, le mot de passe, puis l’approbation.
    - Émet un JWT signé avec expiration (24h) utilisé en Bearer token.
    """
    email = data.get("email")
    password = data.get("password")

    admin = AdminUser.query.filter_by(email=email).first()

    if not admin:
        return {"error": "User not found"}, 404

    if not check_password_hash(admin.password_hash, password):
        return {"error": "Invalid credentials"}, 401
    
    if not admin.is_approved:
        return {
            "error": "Account pending approval. Contact super admin."
        }, 403
    
    # Le payload JWT contient le minimum utile à l’API (id + rôle),
    # et permet à `token_required` d’hydrater `g` pour l’autorisation.
    payload = {
        "admin_id": admin.id,
        "username": admin.username,
        "email": admin.email,
        "role": admin.role,
        "exp": datetime.utcnow() + timedelta(hours=24),
    }

    secret = current_app.config["SECRET_KEY"]
    token = jwt.encode(payload, secret, algorithm="HS256")
    if isinstance(token, bytes):
        token = token.decode("utf-8")

    return {
        "token": token,
        "user": {
            "id": admin.id,
            "email": admin.email,
            "username": admin.username,
            "role" : admin.role
        },
    }, 200


def get_dashboard_data():
    try:
        # =============================
        # KPI DATA
        # =============================
        # KPI globaux calculés depuis l’état courant des places.
        total_spots = db.session.query(func.count(ParkingSpot.id)).scalar()

        available_spots = db.session.query(func.count(ParkingSpot.id)) \
            .filter(ParkingSpot.status == "FREE").scalar()

        occupied_spots = db.session.query(func.count(ParkingSpot.id)) \
            .filter(ParkingSpot.status == "OCCUPIED").scalar()

        out_of_service_spots = db.session.query(func.count(ParkingSpot.id)) \
            .filter(ParkingSpot.status == "OUT_OF_SERVICE").scalar()

        occupancy_rate = 0
        if total_spots:
            occupancy_rate = round((occupied_spots / total_spots) * 100)

        # =============================
        # BAR CHART → by zone
        # =============================
        # Pour le graphe "occupation par zone", on calcule un taux (occupied/total) par zone_id.
        zones = db.session.query(
            ParkingSpot.zone_id,
            func.count(ParkingSpot.id).label("total"),
            func.sum(
                case((ParkingSpot.status == "OCCUPIED", 1), else_=0)
            ).label("occupied")
        ).group_by(ParkingSpot.zone_id).all()

        zones_data = [
            {
                "name": f"Zone {z.zone_id}",
                "occupied": int((z.occupied / z.total) * 100) if z.total else 0
            }
            for z in zones
        ]

        # =============================
        # TIMEZONE CONVERSION (UTC → UTC+1)
        # =============================
        # Les timestamps sont stockés en UTC. On convertit à UTC+1 pour des graphiques "humains".
        # Attention: ceci ne gère pas l’heure d’été (DST) — c’est un choix de simplicité.
        local_time = func.timezone('UTC', SpotHistory.changed_at) + timedelta(hours=1)

        # =============================
        # DAILY TRAFFIC (last 24h)
        # =============================
        last_24h = datetime.utcnow() - timedelta(hours=24)

        daily = db.session.query(
            extract("hour", local_time).label("hour"),
            func.count(SpotHistory.id).label("count")
        ).filter(
            SpotHistory.changed_at >= last_24h,
            SpotHistory.new_status == "OCCUPIED"
        ).group_by(
            extract("hour", local_time)
        ).order_by(
            extract("hour", local_time)
        ).all()

        daily_data = [
            {"hour": int(d.hour), "count": d.count}
            for d in daily
        ]

        # =============================
        # WEEKLY TREND (last 7 days)
        # =============================
        last_7d = datetime.utcnow() - timedelta(days=7)

        weekly = db.session.query(
            func.date(local_time).label("day"),
            func.count(SpotHistory.id).label("count")
        ).filter(
            SpotHistory.changed_at >= last_7d,
            SpotHistory.new_status == "OCCUPIED"
        ).group_by(
            func.date(local_time)
        ).order_by(
            func.date(local_time)
        ).all()

        weekly_data = [
            {"day": str(w.day), "count": w.count}
            for w in weekly
        ]

        # =============================
        # HEATMAP (Mon → Today)
        # =============================
        # Heatmap: distribution des arrivées (passages en OCCUPIED) par jour/heure depuis lundi.
        today = datetime.utcnow()
        weekday = today.weekday()
        start_of_week = today - timedelta(days=weekday)

        heatmap = db.session.query(
            extract("dow", local_time).label("day"),
            extract("hour", local_time).label("hour"),
            func.count(SpotHistory.id).label("count")
        ).filter(
            SpotHistory.changed_at >= start_of_week,
            SpotHistory.changed_at <= today,
            SpotHistory.new_status == "OCCUPIED"
        ).group_by(
            extract("dow", local_time),
            extract("hour", local_time)
        ).all()

        # Normalisation: selon la DB, dow peut être 0=Dimanche; on remappe pour avoir Lundi=0.
        heatmap_data = [
            {
                "day": (int(h.day) - 1) % 7,
                "hour": int(h.hour),
                "count": h.count
            }
            for h in heatmap
        ]

        # On renvoie une grille complète (7x24) pour simplifier le rendu côté frontend
        # (pas besoin de combler les trous).
        full_heatmap = []

        for day in range(7):
            for hour in range(24):
                if day <= weekday:
                    cell = next(
                        (d for d in heatmap_data if d["day"] == day and d["hour"] == hour),
                        None
                    )
                    count = cell["count"] if cell else 0
                else:
                    count = 0

                full_heatmap.append({
                    "day": day,
                    "hour": hour,
                    "count": count
                })

        # =============================
        # FINAL RESPONSE
        # =============================
        return {
            "totalSpots": total_spots,
            "availableSpots": available_spots,
            "occupiedSpots": occupied_spots,
            "outOfServiceSpots": out_of_service_spots,
            "occupancyRate": occupancy_rate,
            "zones": zones_data,
            "dailyTraffic": daily_data,
            "weeklyTrend": weekly_data,
            "heatmap": full_heatmap
        }

    except Exception as e:
        return {"error": str(e)}
        
# UPDATE USERNAME
def update_username(admin_id, data):
    try:
        new_username = data.get("username")

        if not new_username:
            return {"error": "Username is required"}, 400

        admin = AdminUser.query.get(admin_id)

        if not admin:
            return {"error": "Admin not found"}, 404

        admin.username = new_username
        db.session.commit()

        return {"success": True, "username": admin.username}, 200

    except Exception as e:
        return {"error": str(e)}, 500


# DELETE ACCOUNT
def delete_admin(admin_id):
    try:
        admin = AdminUser.query.get(admin_id)

        if not admin:
            return {"error": "Admin not found"}, 404

        # Suppression directe: si tu veux un “soft delete”, il faudra ajouter un flag en DB.
        db.session.delete(admin)
        db.session.commit()

        return {"success": True}, 200

    except Exception as e:
        return {"error": str(e)}, 500

def get_all_admins():
    admins = AdminUser.query.all()

    return [
        {
            "id": a.id,
            "email": a.email,
            "username": a.username,
            "role" : a.role,
            "is_approved": a.is_approved
        }
        for a in admins
    ]

def approve_admin(admin_id):
    admin = AdminUser.query.get(admin_id)

    if not admin:
        return {"error": "Not found"}, 404

    # L’approbation débloque le login (voir `login_admin`).
    admin.is_approved = True
    db.session.commit()

    return {"success": True}, 200

def toggle_spot_oos(spot_id):
    try:
        spot = ParkingSpot.query.get(spot_id)

        if not spot:
            return {"error": "Spot not found"}, 404

        old_status = spot.status

        # Règle métier: on ne permet pas de mettre une place OCCUPIED en “hors service”
        # pour éviter des incohérences (voiture présente mais place désactivée).
        if old_status == "OCCUPIED":
            return {"error": "Cannot modify occupied spot"}, 400

        # Bascule: OUT_OF_SERVICE ↔ FREE uniquement.
        if old_status == "OUT_OF_SERVICE":
            new_status = "FREE"
            note = "Restored to service by admin"
        else:
            new_status = "OUT_OF_SERVICE"
            note = "Marked out of service by admin"

        # =============================
        # INSERT HISTORY (LIKE YOUR SQL)
        # =============================
        history = SpotHistory(
            changed_at=datetime.utcnow(),
            old_status=old_status,
            new_status=new_status,
            source="ADMIN",
            note=note,
            spot_id=spot.id,
            # `g.admin_id` vient du JWT (middleware `token_required`).
            changed_by_admin_id=g.admin_id
        )

        db.session.add(history)

        # =============================
        # UPDATE SPOT
        # =============================
        spot.status = new_status
        spot.last_updated = datetime.utcnow()

        db.session.commit()

        return {
            "success": True,
            "status": new_status
        }, 200

    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500