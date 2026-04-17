import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../admin.css";

import { getPublicDashboard, toggleSpotOOS } from "../../../../shared/services/api";

function ParkingSpot({ id, code, status, onClick }) {
  const isFree = status === "FREE";
  const isOut = status === "OUT_OF_SERVICE";

  const spotClass = isOut
    ? "spot-oos"
    : isFree
    ? "spot-free"
    : "spot-occupied";

  return (
    <div
      className={`admin-spot ${spotClass}`}
      onClick={() => onClick(id, status)}
      title="Click to toggle availability"
    >
      {code}
    </div>
  );
}

export default function AdminParking() {
  const [stats, setStats] = useState({
    total: 0,
    free: 0,
    occupied: 0,
    oos: 0,
  });

  const [rows, setRows] = useState([]);

  const loadData = async () => {
    try {
      const data = await getPublicDashboard();

      setStats({
        total: data.totalSpots,
        free: data.availableSpots,
        occupied: data.occupiedSpots,
        oos: data.outOfServiceSpots || 0,
      });

      setRows(data.rows || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSpotClick = async (id, status) => {
    try {
      if (status === "OCCUPIED") {
        alert("Cannot modify occupied spot");
        return;
      }

      const res = await toggleSpotOOS(id);

      if (res.success) {
        loadData();
      }
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <main className="main-content">
        <Topbar />

        <div className="admin-parking-wrapper">
          {/* KPI */}
          <div className="admin-stats">
            <div className="admin-stat primary">
              <h3>{stats.total}</h3>
              <p>Total</p>
            </div>

            <div className="admin-stat success">
              <h3>{stats.free}</h3>
              <p>Free</p>
            </div>

            <div className="admin-stat danger">
              <h3>{stats.occupied}</h3>
              <p>Occupied</p>
            </div>

            <div className="admin-stat muted">
              <h3>{stats.oos}</h3>
              <p>Out of Service</p>
            </div>
          </div>

          {/* GRID */}
          <div className="admin-grid-card">
            <div className="admin-grid-header">
              <h2>Parking Control</h2>

              <div className="legend">
                <span><div className="legend-dot free" /> Free</span>
                <span><div className="legend-dot occ" /> Occupied</span>
                <span><div className="legend-dot oos" /> Out</span>
              </div>
            </div>

            {/* ENTRANCE */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "10px",
                color: "#0F4C81",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              ⬇ Entrance
            </div>

            <div className="admin-parking-grid">
              {rows.map((row, i) => (
                <React.Fragment key={i}>
                  {/* LEFT */}
                  {row.left.map((spot) => (
                    <ParkingSpot
                      key={spot.id}
                      id={spot.id}
                      code={spot.code}
                      status={spot.status}
                      onClick={handleSpotClick}
                    />
                  ))}

                  {/* AISLE */}
                  <div className="admin-aisle">
                    <div className="lane" />
                  </div>

                  {/* RIGHT */}
                  {row.right.map((spot) => (
                    <ParkingSpot
                      key={spot.id}
                      id={spot.id}
                      code={spot.code}
                      status={spot.status}
                      onClick={handleSpotClick}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}