import re
from collections import defaultdict
from app.models.parking_spot import ParkingSpot

def _code_sort_key(code: str):
    match = re.match(r"^([A-Za-z]+)(\d+)$", code or "")
    if not match:
        return ("", 0)
    prefix = match.group(1).upper()
    number = int(match.group(2))
    return (prefix, number)

def _chunk(lst, size=2):
    return [lst[i:i + size] for i in range(0, len(lst), size)]

def public_dashboard():
    spots = ParkingSpot.query.order_by(ParkingSpot.id).all()

    total = len(spots)
    available = sum(1 for s in spots if s.status == "FREE")
    occupied = sum(1 for s in spots if s.status == "OCCUPIED")
    out_of_service = sum(1 for s in spots if s.status == "OUT_OF_SERVICE")

    grouped = defaultdict(list)

    for s in spots:
        code = s.code or ""
        prefix_match = re.match(r"^([A-Za-z]+)\d+$", code)
        prefix = prefix_match.group(1).upper() if prefix_match else "A"

        grouped[prefix].append({
            "id": s.id,
            "code": s.code,
            "status": s.status,
        })

    left_side = sorted(grouped.get("A", []), key=lambda x: _code_sort_key(x["code"]))
    right_side = sorted(grouped.get("B", []), key=lambda x: _code_sort_key(x["code"]))

    left_rows = _chunk(left_side, 2)
    right_rows = _chunk(right_side, 2)

    max_rows = max(len(left_rows), len(right_rows))
    rows = []

    for i in range(max_rows):
        rows.append({
            "left": left_rows[i] if i < len(left_rows) else [],
            "right": right_rows[i] if i < len(right_rows) else [],
        })

    return {
        "totalSpots": total,
        "availableSpots": available,
        "occupiedSpots": occupied,
        "outOfServiceSpots": out_of_service,
        "rows": rows
    }