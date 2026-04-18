import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../admin.css";
import { dashboardData } from "@smart-park/shared/services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
  AreaChart, Area,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

const HEATMAP_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Dashboard() {

  // `pageData` correspond directement à la réponse du backend (`/api/admin/dashboard`).
  // On initialise avec des valeurs neutres pour éviter les "undefined" au premier rendu.
  const [pageData, setPageData] = useState({
    totalSpots: 0,
    availableSpots: 0,
    occupiedSpots: 0,
    outOfServiceSpots: 0,
    occupancyRate: 0
  });
  

  const getData = async () => {
    try {
      const data = await dashboardData();

      if (data?.error) {
        console.error(data.error);
        alert("Could not load dashboard data");
        return;
      }
      if (data) {
        // On merge: le backend renvoie aussi des structures optionnelles (`zones`, `heatmap`, etc.)
        // et on veut conserver les clés existantes si certaines ne sont pas présentes.
        setPageData((prev) => ({ ...prev, ...data }));
      } else {
        alert("Invalid dashboard load");
      }
    } catch (err) {
      console.error(err);
      alert("Error loading dashboard");
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <Topbar />

        <div className="dashboard-wrapper">

          {/* ================= KPI CARDS ================= */}
          <div className="stats-grid">

            <div className="stat-card bg-1">
              <div className="stat-value">{pageData.totalSpots}</div>
              <div className="stat-label">Total Spots</div>
            </div>

            <div className="stat-card bg-2">
              <div className="stat-value">{pageData.availableSpots}</div>
              <div className="stat-label">Available</div>
            </div>

            <div className="stat-card bg-3">
              <div className="stat-value">{pageData.occupiedSpots}</div>
              <div className="stat-label">Occupied</div>
            </div>

            <div className="stat-card bg-5">
              <div className="stat-value">{pageData.outOfServiceSpots ?? 0}</div>
              <div className="stat-label">Out of Service</div>
            </div>

            <div className="stat-card bg-4">
              <div className="stat-value">{pageData.occupancyRate}%</div>
              <div className="stat-label">Occupancy Rate</div>
            </div>

          </div>

          {/* ================= CHARTS ================= */}
          <div className="charts-grid">

            <div className="chart-box blue">
              <h3 className="chart-box-title">Occupancy by Zone</h3>
              <div className="chart-surface">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={pageData.zones || []}
                    margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8eef4" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: "#cbd5e1" }} />
                    <YAxis tickLine={false} axisLine={false} width={36} />
                    <Tooltip wrapperClassName="chart-tooltip-wrap" cursor={{ fill: "rgba(15, 76, 129, 0.06)" }} />
                    <Bar dataKey="occupied" fill="var(--primary-lt)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-box green">
              <h3 className="chart-box-title">Spot status</h3>
              <div className="chart-surface chart-surface--pie">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Free", value: pageData.availableSpots },
                        { name: "Occupied", value: pageData.occupiedSpots },
                        { name: "Out of service", value: pageData.outOfServiceSpots ?? 0 }
                      ]}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={54}
                      outerRadius={82}
                      paddingAngle={2}
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      <Cell fill="var(--success)" />
                      <Cell fill="var(--danger)" />
                      <Cell fill="#64748b" />
                    </Pie>
                    <Tooltip wrapperClassName="chart-tooltip-wrap" />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-box orange">
              <h3 className="chart-box-title">Daily Traffic</h3>
              <div className="chart-surface">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart
                    data={pageData.dailyTraffic || []}
                    margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8eef4" />
                    <XAxis dataKey="hour" tickLine={false} axisLine={{ stroke: "#cbd5e1" }} />
                    <YAxis tickLine={false} axisLine={false} width={36} />
                    <Tooltip wrapperClassName="chart-tooltip-wrap" />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="var(--secondary)"
                      strokeWidth={2.5}
                      dot={{ r: 3, strokeWidth: 2, fill: "#fff" }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-box red">
              <h3 className="chart-box-title">Weekly Trend</h3>
              <div className="chart-surface">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart
                    data={pageData.weeklyTrend || []}
                    margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
                  >
                    <defs>
                      <linearGradient id="areaFillRed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--danger)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--danger)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8eef4" />
                    <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: "#cbd5e1" }} />
                    <YAxis tickLine={false} axisLine={false} width={36} />
                    <Tooltip wrapperClassName="chart-tooltip-wrap" />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="var(--danger)"
                      strokeWidth={2}
                      fill="url(#areaFillRed)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 🟣 ACTIVITY HEATMAP — spans 2 columns */}
            <div className="chart-box purple heatmap-chart-wide">
              <div className="heatmap-header">
                <h3 className="chart-box-title">Activity Heatmap</h3>
                <div className="heatmap-legend">
                  <span><span className="heat-swatch hc-empty" /> None</span>
                  <span><span className="heat-swatch hc-low" /> Low</span>
                  <span><span className="heat-swatch hc-med" /> Med</span>
                  <span><span className="heat-swatch hc-high" /> High</span>
                </div>
              </div>

              <div className="heatmap-frame">
                <div className="heatmap-corner" aria-hidden="true" />
                <div className="heatmap-hour-axis" aria-label="Hour of day">
                  {Array.from({ length: 24 }).map((_, h) => (
                    <span key={h} className="heatmap-hour-tick">
                      {[0, 6, 12, 18, 23].includes(h) ? h : "\u00a0"}
                    </span>
                  ))}
                </div>

                <div className="heatmap-day-axis" aria-label="Day of week">
                  {HEATMAP_DAYS.map((d) => (
                    <span key={d} className="heatmap-day-tick">
                      {d}
                    </span>
                  ))}
                </div>

                <div className="heatmap-grid">
                  {Array.from({ length: 7 }).flatMap((_, day) =>
                    Array.from({ length: 24 }).map((_, hour) => {
                      // Le backend renvoie une grille 7x24 (day=0..6, hour=0..23).
                      // On retrouve la cellule correspondante pour calculer son "niveau" visuel.
                      const cell = pageData.heatmap?.find(
                        d => d.day === day && d.hour === hour
                      );
                      const value = cell ? cell.count : 0;

                      let level = "hc-empty";
                      if (value > 0 && value <= 5) level = "hc-low";
                      else if (value > 5 && value <= 20) level = "hc-med";
                      else if (value > 20) level = "hc-high";

                      const dayName = HEATMAP_DAYS[day];
                      return (
                        <div
                          key={`${day}-${hour}`}
                          className={`heat-cell ${level}`}
                          title={`${dayName} ${hour}:00 — ${value} events`}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}