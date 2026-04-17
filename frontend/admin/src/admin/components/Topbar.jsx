import "./topbar.css";

export default function Topbar() {
  return (
    <header className="topbar">
      <h2>Overview</h2>

      <div className="admin-profile">
        <span>{localStorage.getItem("user")}</span>
        <div className="avatar">{localStorage.getItem("user").charAt(0).toUpperCase()}</div>
      </div>
    </header>
  );
}