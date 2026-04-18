import "./topbar.css";

export default function Topbar() {
  // Les infos user sont stockées dans le localStorage au login.
  // On sécurise l’accès pour éviter un crash si la valeur est absente.
  const username = localStorage.getItem("user") || "";
  const initial = username ? username.charAt(0).toUpperCase() : "?";

  return (
    <header className="topbar">
      <h2>Overview</h2>

      <div className="admin-profile">
        <span>{username}</span>
        <div className="avatar">{initial}</div>
      </div>
    </header>
  );
}