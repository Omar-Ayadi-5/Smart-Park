import re
from collections import defaultdict
from app.models.parking_spot import ParkingSpot

def _code_sort_key(code: str):
    """
    Clé de tri pour les codes de place (ex: A1, A2, B10).
    On trie d’abord par préfixe (lettres), puis par numéro (int) pour éviter:
    A1, A10, A2 (tri lexicographique) → A1, A2, A10 (tri naturel).
    """
    match = re.match(r"^([A-Za-z]+)(\d+)$", code or "")
    if not match:
        return ("", 0)
    prefix = match.group(1).upper()
    number = int(match.group(2))
    return (prefix, number)

def _chunk(lst, size=2):
    # Regroupe la liste en sous-listes de taille `size` pour construire des rangées.
    return [lst[i:i + size] for i in range(0, len(lst), size)]

def public_dashboard():
    """
    Construit la réponse du dashboard public.

    - Calcule les KPI (total, libres, occupées, hors service)
    - Prépare une structure en "rows" gauche/droite afin que le frontend rende
      directement une maquette type parking (sans logique de regroupement côté UI)
    """
    spots = ParkingSpot.query.order_by(ParkingSpot.id).all()

    total = len(spots)
    available = sum(1 for s in spots if s.status == "FREE")
    occupied = sum(1 for s in spots if s.status == "OCCUPIED")
    out_of_service = sum(1 for s in spots if s.status == "OUT_OF_SERVICE")

    grouped = defaultdict(list)

    for s in spots:
        code = s.code or ""
        # Convention: les places sont préfixées par une lettre de zone/couloir
        # (ex: A1..An à gauche, B1..Bn à droite). Si le code ne matche pas,
        # on les met par défaut dans "A" pour ne pas casser l’affichage.
        prefix_match = re.match(r"^([A-Za-z]+)\d+$", code)
        prefix = prefix_match.group(1).upper() if prefix_match else "A"

        grouped[prefix].append({
            "id": s.id,
            "code": s.code,
            "status": s.status,
        })

    # Le frontend public affiche uniquement 2 colonnes principales (A à gauche, B à droite).
    left_side = sorted(grouped.get("A", []), key=lambda x: _code_sort_key(x["code"]))
    right_side = sorted(grouped.get("B", []), key=lambda x: _code_sort_key(x["code"]))

    # 2 places par "rangée" de chaque côté pour coller au layout visuel.
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