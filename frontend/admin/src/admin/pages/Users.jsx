import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../admin.css";
import {
    getAdmins,
    approveAdmin,
    deleteAdmin
} from "@smart-park/shared/services/api";

export default function Users() {
    const [admins, setAdmins] = useState([]);
    const currentUserId = Number(localStorage.getItem("user_id"));
    const role = localStorage.getItem("role");
  
    const loadAdmins = async () => {
      try {
        // La route backend applique déjà un contrôle RBAC,
        // mais on adapte aussi l’UI en fonction du rôle côté client.
        const data = await getAdmins();
        setAdmins(data);
      } catch (err) {
        alert("Failed to load admins");
      }
    };
  
    useEffect(() => {
      loadAdmins();
    }, []);
  
    const handleApprove = async (id) => {
      // Action réservée au super_admin (le bouton n’est rendu que pour ce rôle).
      const res = await approveAdmin(id);
      if (res.success) loadAdmins();
    };
  
    const handleDelete = async (id) => {
      if (!window.confirm("Delete this user?")) return;
      const res = await deleteAdmin(id);
      if (res.success) loadAdmins();
    };
  
    // On sépare "pending" vs "approved" pour un affichage plus lisible
    // et pour éviter de mélanger les comptes non validés avec les actifs.
    const pending = admins.filter(a => !a.is_approved);
    const approved = admins.filter(a => a.is_approved);
  
    return (
      <div className="layout">
        <Sidebar />
  
        <main className="main-content">
          <Topbar />
  
          <div className="users-wrapper">
  
            {/* 🔴 ONLY SUPER ADMIN SEES PENDING */}
            {role === "super_admin" && (
              <>
                <h2>Pending Admins</h2>
  
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
  
                  <tbody>
                    {pending.length === 0 ? (
                      <tr>
                        <td colSpan="5">No pending users</td>
                      </tr>
                    ) : (
                      pending.map((admin) => (
                        <tr key={admin.id}>
                          <td>{admin.username}</td>
                          <td>{admin.email}</td>
                          <td>{admin.role}</td>
                          <td>
                            <span className="badge pending">Pending</span>
                          </td>
                          <td>
                            <button
                              className="btn success"
                              onClick={() => handleApprove(admin.id)}
                            >
                              Approve
                            </button>
  
                            <button
                              className="btn danger"
                              onClick={() => handleDelete(admin.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </>
            )}
  
            {/* 🟢 APPROVED (VISIBLE TO ALL ADMINS) */}
            <h2 style={{ marginTop: "40px" }}>Approved Admins</h2>
  
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  {role === "super_admin" && <th>Actions</th>}
                </tr>
              </thead>
  
              <tbody>
                {approved.length === 0 ? (
                  <tr>
                    <td colSpan={role === "super_admin" ? 5 : 4}>
                      No approved users
                    </td>
                  </tr>
                ) : (
                  approved.map((admin) => (
                    <tr key={admin.id}>
                      <td>
                        {admin.id === currentUserId && (
                          <span className="badge you">You</span>
                        )}
                        {admin.username}
                      </td>
  
                      <td>{admin.email}</td>
  
                      {/* 🆕 ROLE COLUMN */}
                      <td>
                        <span className={`badge role ${admin.role}`}>
                          {admin.role}
                        </span>
                      </td>
  
                      <td>
                        <span className="badge approved">Active</span>
                      </td>
  
                      {/* 🔐 ONLY SUPER ADMIN CAN DELETE */}
                      {role === "super_admin" && (
                        <td>
                          {admin.id !== currentUserId && (
                            <button
                              className="btn danger"
                              onClick={() => handleDelete(admin.id)}
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
  
          </div>
        </main>
      </div>
    );
  }