// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Users site
import Login from "./Users/Login/Loginuser";
import MenuUser from "./Users/MenuUser/MenuUser";
import Acceuil from "./Users/Page/Acceuil";
import Vehicule from "./Users/Page/Vehicule";
import Chauffeur from "./Users/Page/Chauffeur";
import Mission from "./Users/Page/Mission";
import Entretien from "./Users/Page/Entretien";
import Carburant from "./Users/Page/Carburant";
import Rapport from "./Users/Page/Rapport";
import Liste from "./Users/Page/Liste";
import Consommation from "./Users/Page/Consommation";

// Admin site
import LoginAdmin from "./Admin/LoginAdmin/LoginAdmin";
import MenuAdmin from "./Admin/Menu/MenuAdmin";
import AcceuilAdmin from "./Admin/Page/Acceuil";
import UsersPage from "./Admin/Page/Users";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Homepage: User login */}
        <Route path="/" element={<Login />} />

        {/* User routes with menu */}
        <Route path="/user/dashboard" element={<MenuUser />}>
          <Route index element={<Acceuil />} /> {/* Page d'accueil avec totaux */}
          <Route path="vehicule" element={<Vehicule />} />
          <Route path="chauffeur" element={<Chauffeur />} />
          <Route path="mission" element={<Mission />} />
          <Route path="entretien" element={<Entretien />} />
          <Route path="carburant" element={<Carburant />} />
          <Route path="rapport" element={<Rapport />} />
          <Route path="liste" element={<Liste />} />
          <Route path="consommation" element={<Consommation />} />
        </Route>

        {/* Admin login */}
        <Route path="/admin" element={<LoginAdmin />} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<MenuAdmin />}>
          <Route index element={<AcceuilAdmin />} />
          <Route path="users" element={<UsersPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
