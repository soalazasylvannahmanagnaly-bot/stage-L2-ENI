import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Home, Users, LogOut } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import "../../Style/mon-menu-admin.css";

export default function MenuAdmin() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { to: "", label: "Dashboard", icon: <Home size={20} /> },
    { to: "users", label: "Users", icon: <Users size={20} /> },
  ];

  // Vérification du token à chaque chargement du menu
  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin"); // redirige vers login si pas connecté
    }
  }, [navigate]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Déconnexion",
      text: "Voulez-vous vraiment vous déconnecter ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, déconnecter",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed) {
      try {
        const token = sessionStorage.getItem("admin_token");
        if (token) {
          await axios.post(
            "http://127.0.0.1:8000/api/admin/logout",
            {},
            {
              headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            }
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        // Supprimer toutes les infos de session
        sessionStorage.removeItem("admin_token");
        sessionStorage.removeItem("admin_user");
        navigate("/admin", { replace: true });
      }
    }
  };

  return (
    <div className="menu-container flex">
      {/* Hamburger */}
      <button
        className={`hamburger-btn ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span className="bar top"></span>
        <span className="bar middle"></span>
        <span className="bar bottom"></span>
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${open ? "expanded" : "collapsed"}`}>
        <h1 className="sidebar-title">{open ? "Admin Panel" : "A"}</h1>

        <nav className="nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setOpen(false)}
              end={item.to === ""}
            >
              {item.icon}
              {open && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            {open && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className={`main-content ${open ? "shifted" : "compact"}`}>
        <Outlet />
      </div>
    </div>
  );
}
