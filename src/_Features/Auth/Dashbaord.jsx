// Dashboard.jsx
import React from "react";
// import { useAuth } from "../context/AuthContext"; // adjust path if needed
import { useAuth } from "./AuthContext";
const Dashboard = () => {
  const { auth, logout } = useAuth();
  const admin = auth?.admin || {};

  return (
    <div style={{ maxWidth: 900, margin: "36px auto", padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Dashboard</h1>
        <div>
          <strong>{admin?.name || admin?.email || "Admin"}</strong>
          <button style={{ marginLeft: 12 }} onClick={logout}>Logout</button>
        </div>
      </header>

      <main style={{ marginTop: 20 }}>
        <p>Welcome to the admin dashboard.</p>
        <pre style={{ background: "#f5f5f5", padding: 12 }}>
          {JSON.stringify({ admin, college: auth?.college }, null, 2)}
        </pre>
      </main>
    </div>
  );
};

export default Dashboard;
