import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

const navItems = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    title: "Dashboard overview",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    to: "/admin/zones",
    label: "Parking zones",
    title: "Manage parking zones",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 21s-6.5-4.8-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 16.2 12 21 12 21z" />
        <circle cx="12" cy="10.5" r="2.2" />
      </svg>
    ),
  },
  {
    to: "/admin/users",
    label: "Users & staff",
    title: "Users and staff",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    to: "/admin/settings",
    label: "Settings",
    title: "Admin settings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
];

function ChevronIcon({ collapsed }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {collapsed ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
    </svg>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        {!collapsed ? (
          <button type="button" className="sidebar-brand" onClick={() => navigate("/admin/dashboard")}>
            <span className="sidebar-logo-mark">SP</span>
            <span className="sidebar-logo-text">
              Smart<span className="sidebar-logo-accent">Park</span>
            </span>
          </button>
        ) : (
          <button type="button" className="sidebar-brand sidebar-brand--collapsed" onClick={() => navigate("/admin/dashboard")} aria-label="Smart Park admin home">
            <span className="sidebar-logo-mark">SP</span>
          </button>
        )}

        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          <ChevronIcon collapsed={collapsed} />
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Admin">
        {!collapsed && <p className="sidebar-nav-heading">Navigation</p>}
        <ul className="sidebar-nav-list">
          {navItems.map(({ to, label, title, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/admin/dashboard"}
                className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
                title={collapsed ? title : undefined}
              >
                <span className="nav-item-icon">{icon}</span>
                {!collapsed && <span className="nav-item-label">{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
