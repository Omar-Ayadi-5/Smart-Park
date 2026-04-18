import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../admin.css";
import { updateUsername, deleteAccount } from "@smart-park/shared/services/api";

export default function Settings() {
  const [username, setUsername] = useState("");

  // 🔁 UPDATE USERNAME
  const handleUpdate = async () => {
    if (!username) return alert("Enter a username");

    try {
      const res = await updateUsername({ username });

      if (res.success) {
        // On met à jour le storage local pour refléter immédiatement le changement
        // dans les composants qui lisent `localStorage` (ex: Topbar).
        localStorage.setItem("user", username);
        alert("Username updated!");
        // Recharge simple pour resynchroniser les composants sans state global.
        window.location.reload();
      } else {
        alert(res.error || "Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating username");
    }
  };

  // 🚪 LOGOUT
  const handleLogout = () => {
    // Nettoyage minimal de session côté client.
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  // ❌ DELETE ACCOUNT
  const handleDelete = async () => {
    // Action destructive: on force une confirmation explicite.
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      const res = await deleteAccount();

      if (res.success) {
        alert("Account deleted");
        localStorage.clear();
        window.location.href = "/";
      } else {
        alert(res.error || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting account");
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <main className="main-content">
        <Topbar />

        <div className="settings-wrapper">

          {/* 🔧 ACCOUNT SETTINGS */}
          <div className="settings-card">
            <h3>Account Settings</h3>

            <div className="form-group">
              <label>Change Username</label>
              <input
                type="text"
                placeholder="New username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <button className="btn primary" onClick={handleUpdate}>
              Update Username
            </button>
          </div>

          {/* 🚪 LOGOUT */}
          <div className="settings-card">
            <h3>Session</h3>

            <button className="btn secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>

          {/* ❌ DANGER ZONE */}
          <div className="settings-card danger-zone">
            <h3>Danger Zone</h3>

            <p>This action is irreversible.</p>

            <button className="btn danger" onClick={handleDelete}>
              Delete Account
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}