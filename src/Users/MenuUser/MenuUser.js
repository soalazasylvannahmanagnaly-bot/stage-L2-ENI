import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Car,
  Users,
  FileText,
  Wrench,
  Fuel,
  List,
  BarChart2,
  LogOut,
} from "lucide-react";
import "../../Style/mon-menu.css";
import Swal from "sweetalert2";

export default function MenuUser() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { to: "/user/dashboard", label: "Accueil", icon: <Home size={20} /> },
    { to: "/user/dashboard/vehicule", label: "Véhicule", icon: <Car size={20} /> },
    { to: "/user/dashboard/chauffeur", label: "Chauffeur", icon: <Users size={20} /> },
    { to: "/user/dashboard/mission", label: "Mission", icon: <FileText size={20} /> },
    { to: "/user/dashboard/entretien", label: "Entretien", icon: <Wrench size={20} /> },
    { to: "/user/dashboard/carburant", label: "Carburant", icon: <Fuel size={20} /> },
    { to: "/user/dashboard/rapport", label: "Rapport", icon: <BarChart2 size={20} /> },
    { to: "/user/dashboard/liste", label: "Top Entretiens", icon: <List size={20} /> },
    { to: "/user/dashboard/consommation", label: "Consommation", icon: <Fuel size={20} /> },
  ];

  // ✅ Vérification du token pour protéger la route
  useEffect(() => {
    const token = sessionStorage.getItem("user_token");
    if (!token) {
      navigate("/"); // redirige vers login si pas connecté
    }
  }, [navigate]);

  const handleLogout = () => {
    Swal.fire({
      title: "Se déconnecter ?",
      text: "Vous allez être déconnecté de votre compte.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, me déconnecter",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.removeItem("user_token");
        sessionStorage.removeItem("user_data");
        navigate("/", { replace: true });
      }
    });
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
        <h1 className="sidebar-title">{open ? "GPM" : "G"}</h1>

        <nav className="nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setOpen(false)}
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
