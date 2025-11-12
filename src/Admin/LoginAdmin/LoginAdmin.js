import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "../../Style/Login.css";

export default function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/admin/login", {
        email,
        password,
      });

      // Stocker le token et les infos admin dans sessionStorage
      sessionStorage.setItem("admin_token", response.data.token);
      sessionStorage.setItem("admin_user", JSON.stringify(response.data.user));

      Swal.fire("Succès", "Connexion réussie !", "success");

      // Réinitialiser les champs pour éviter l'autofill
      setEmail("");
      setPassword("");

      // Redirection vers dashboard
      navigate("/admin/dashboard");
    } catch (error) {
      Swal.fire(
        "Erreur",
        error.response?.data?.message || "Impossible de se connecter",
        "error"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
        <h1>Admin Login</h1>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Entrez votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="new-email"
          />
        </div>

        <div className="form-group">
          <label>Mot de passe</label>
          <input
            type="password"
            placeholder="Entrez votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="btn-login" disabled={loading}>
          {loading ? "⏳ Connexion..." : "Se connecter"}
        </button>

        <a href="#" className="forgot-password">
          Mot de passe oublié ?
        </a>
      </form>
    </div>
  );
}
