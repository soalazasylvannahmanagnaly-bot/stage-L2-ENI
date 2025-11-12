import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../Style/Acceuil.css";
import { FaCar, FaUserTie, FaTasks, FaWrench, FaGasPump } from "react-icons/fa";

function Acceuil() {
  const [vehicules, setVehicules] = useState(0);
  const [chauffeurs, setChauffeurs] = useState(0);
  const [missions, setMissions] = useState(0);
  const [entretiens, setEntretiens] = useState(0);
  const [carburants, setCarburants] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vehRes, chaufRes, misRes, entRes, carbRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/vehicules"),
        axios.get("http://127.0.0.1:8000/api/chauffeurs"),
        axios.get("http://127.0.0.1:8000/api/missions"),
        axios.get("http://127.0.0.1:8000/api/entretiens"),
        axios.get("http://127.0.0.1:8000/api/carburants"),
      ]);

      animateCount(setVehicules, vehRes.data.length);
      animateCount(setChauffeurs, chaufRes.data.length);
      animateCount(setMissions, misRes.data.length);
      animateCount(setEntretiens, entRes.data.length);
      animateCount(setCarburants, carbRes.data.length);
    } catch (error) {
      console.error("Impossible de charger les données :", error);
    }
  };

  // Fonction pour compter avec animation
  const animateCount = (setter, target) => {
    let start = 0;
    const duration = 800; // durée en ms
    const increment = target / (duration / 20); // intervalle 20ms
    const counter = setInterval(() => {
      start += increment;
      if (start >= target) {
        start = target;
        clearInterval(counter);
      }
      setter(Math.floor(start));
    }, 20);
  };

  const cards = [
    { title: "Véhicules", value: vehicules, icon: <FaCar />, className: "vehicule-card" },
    { title: "Chauffeurs", value: chauffeurs, icon: <FaUserTie />, className: "chauffeur-card" },
    { title: "Missions", value: missions, icon: <FaTasks />, className: "mission-card" },
    { title: "Entretiens", value: entretiens, icon: <FaWrench />, className: "entretien-card" },
    { title: "Carburants", value: carburants, icon: <FaGasPump />, className: "carburant-card" },
  ];

  return (
    <div className="acceuil-container">
      {/* Section de bienvenue */}
      <div className="welcome-section">
        <h1>Bienvenue sur votre Dashboard !</h1>
        <p className="welcome-text">
          Gérez facilement vos véhicules, chauffeurs, missions et consommations.
        </p>
      </div>

      {/* Dashboard avec compteurs */}
      <div className="cards-container">
        {cards.map((card, index) => (
          <div key={index} className={`card ${card.className}`}>
            <div className="card-icon">{card.icon}</div>
            <h2>{card.title}</h2>
            <p>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Footer minimaliste */}
      <footer className="footer-section">
        <p>© 2025 MonApplication. Tous droits réservés.</p>
      </footer>
    </div>
  );
}

export default Acceuil;
