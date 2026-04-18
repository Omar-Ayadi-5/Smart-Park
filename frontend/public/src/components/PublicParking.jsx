import React, { useEffect, useState } from "react";
import "./public.css";
import { getPublicDashboard } from "@smart-park/shared/services/api";

function ParkingSpot({ code, status }) {
  const isFree = status === "FREE";
  const isOutOfService = status === "OUT_OF_SERVICE";
  const spotClass = isOutOfService ? "out-of-service" : isFree ? "free" : "occupied";
  const label = isOutOfService ? "Out of service" : isFree ? "Free" : "Occupied";

  return (
    <div
      className={`spot ${spotClass}`}
      aria-label={`Spot ${code}, ${label}`}
    >
      {code}
    </div>
  );
}

export default function SmartParkDashboard() {
  // `stats` est volontairement un tableau (plutôt qu’un objet) pour simplifier le rendu
  // via `map()` et garder un ordre d’affichage stable dans l’UI.
  const [stats, setStats] = useState([
    { value: 0, label: "Total Spots", className: "text-primary" },
    { value: 0, label: "Available", className: "text-success" },
    { value: 0, label: "Occupied", className: "text-danger" },
    { value: 0, label: "Out of Service", className: "text-muted" },
  ]);

  const [parkingRows, setParkingRows] = useState([]);

  const loadData = async () => {
    try {
      // Dashboard public: ne nécessite pas d’authentification, mais doit rester robuste
      // (ex: backend indisponible → on garde la page affichée et on signale l’erreur).
      const data = await getPublicDashboard();

      setStats([
        { value: data.totalSpots, label: "Total Spots", className: "text-primary" },
        { value: data.availableSpots, label: "Available", className: "text-success" },
        { value: data.occupiedSpots, label: "Occupied", className: "text-danger" },
        { value: data.outOfServiceSpots ?? 0, label: "Out of Service", className: "text-muted" },
      ]);

      // Le backend renvoie des "rows" (gauche/droite) déjà prêtes pour l’affichage
      // afin d’éviter de dupliquer la logique de mise en page côté frontend.
      setParkingRows(data.rows || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load public dashboard");
    }
  };

  useEffect(() => {
    // Chargement initial + rafraîchissement périodique.
    // 180000ms = 3 minutes: compromis entre “quasi temps réel” et charge serveur.
    loadData();

    const interval = setInterval(loadData, 180000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="smartpark-page">
      <header className="header">
        <h1>SmartPark Dashboard</h1>

        <div className="live-badge">
          <div className="live-dot" />
          <span>Live Public Availability</span>
        </div>
      </header>

      <div className="stats-container">
        {stats.map((item) => (
          <div className="stat-card" key={item.label}>
            <h3 className={item.className}>{item.value}</h3>
            <p>{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid-wrapper">
        <div className="grid-header">
          <div>
            <h2>Zone A Layout</h2>
            <p>Ground Floor - Sector 1</p>
          </div>

          <div className="legend">
            <div className="legend-item">
              <div className="legend-dot free" />
              Free
            </div>
            <div className="legend-item">
              <div className="legend-dot occ" />
              Occupied
            </div>
            <div className="legend-item">
              <div className="legend-dot oos" />
              Out of service
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: "10px", color: "#0F4C81" }}>
          ⬇ Entrance
        </div>

        <div className="parking-lot">
          {parkingRows.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {row.left.map((spot) => (
                <ParkingSpot
                  key={spot.id}
                  code={spot.code}
                  status={spot.status}
                />
              ))}

              <div className="aisle" aria-hidden="true">
                <div className="lane-marker" />
              </div>

              {row.right.map((spot) => (
                <ParkingSpot
                  key={spot.id}
                  code={spot.code}
                  status={spot.status}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}