import React, { useState, useEffect } from "react";
import { Users, UserPlus, Search, X, Trash2, Edit2 } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import "../../Style/Users.css";

export default function UsersPage() {
  const API_URL = "http://127.0.0.1:8000/api/utilisateurs";

  const [utilisateurs, setUtilisateurs] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    nom_utilisateur: "",
    email_utilisateur: "",
    password_utilisateur: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUtilisateurs();
  }, []);
  const [confirmPassword, setConfirmPassword] = useState("");


  const fetchUtilisateurs = async () => {
    try {
      const response = await axios.get(API_URL);
      setUtilisateurs(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
     // Vérifie si les mots de passe correspondent (seulement pour ajout)
  if (!currentUser && formData.password_utilisateur !== confirmPassword) {
    Swal.fire("Erreur", "Les mots de passe ne correspondent pas", "error");
    return; // Stoppe l’envoi
  }
    try {
      if (currentUser) {
        // Mise à jour
        await axios.put(`${API_URL}/${currentUser.id_utilisateur}`, formData);
        Swal.fire("Succès", "Utilisateur modifié avec succès", "success");
      } else {
        // Ajout
        await axios.post(API_URL, formData);
        Swal.fire("Succès", "Utilisateur ajouté avec succès", "success");
      }
      fetchUtilisateurs();
      closeAllModals();
    } catch (error) {
      Swal.fire("Erreur", "Impossible d’enregistrer l’utilisateur", "error");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Supprimer cet utilisateur ?",
      text: "Cette action est irréversible",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      Swal.fire("Supprimé", "Utilisateur supprimé avec succès", "success");
      fetchUtilisateurs();
      setIsDetailModalOpen(false);
    } catch (error) {
      Swal.fire("Erreur", "Impossible de supprimer cet utilisateur", "error");
      console.error(error);
    }
  };

  // Ouvre le modal "Voir plus"
  const openDetailModal = (user) => {
    setCurrentUser(user);
    setFormData({
      nom_utilisateur: user.nom_utilisateur,
      email_utilisateur: user.email_utilisateur,
      password_utilisateur: "",
    });
    setIsDetailModalOpen(true);
  };

  // Ouvre le modal "Ajouter" avec le formulaire complètement vide
  const openAddModal = () => {
    setCurrentUser(null); // Aucun utilisateur sélectionné
    setFormData({
      nom_utilisateur: "",
      email_utilisateur: "",
      password_utilisateur: "",
    }); // Réinitialisation complète du formulaire
    setIsAddModalOpen(true);
  };

  // Ferme tous les modals et réinitialise le formulaire
  const closeAllModals = () => {
    setIsAddModalOpen(false);
    setIsDetailModalOpen(false);
    setCurrentUser(null);
    setFormData({
      nom_utilisateur: "",
      email_utilisateur: "",
      password_utilisateur: "",
    });
  };

  const filteredUsers = utilisateurs.filter((u) =>
    u.nom_utilisateur?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Users /> Gestion des utilisateurs
      </h1>

      {/* Barre d’action */}
      <div className="bg-white shadow-xl rounded-2xl p-6 mb-6 flex items-center gap-4">
        <div className="flex items-center bg-gray-100 rounded-xl p-2 w-72">
          <Search size={18} className="opacity-60" />
          <input
            type="text"
            placeholder="Rechercher utilisateur..."
            className="bg-transparent outline-none ml-2 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          onClick={openAddModal} // Réinitialise avant d’ouvrir
          className="bg-blue-600 px-4 py-2 rounded-xl text-white font-semibold flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <UserPlus size={18} /> Ajouter
        </button>
      </div>

      {/* Tableau utilisateurs */}
      <table className="w-full bg-white shadow-lg rounded-2xl overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-3 text-left">Nom</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <tr key={user.id_utilisateur} className="border-b">
                <td className="p-3">{user.nom_utilisateur}</td>
                <td className="p-3">{user.email_utilisateur}</td>
                <td className="p-3">
                  <button
                    onClick={() => openDetailModal(user)}
                    className="px-3 py-1 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition"
                  >
                    Voir plus
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="p-3 text-center text-gray-500">
                Aucun utilisateur trouvé
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal Ajouter / Modifier */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{currentUser ? "Modifier utilisateur" : "Ajouter utilisateur"}</h2>
              <X
                size={20}
                style={{ cursor: "pointer" }}
                onClick={closeAllModals}
              />
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <label>Nom</label>
              <input
                type="text"
                name="nom_utilisateur"
                value={formData.nom_utilisateur}
                onChange={handleChange}
                required
              />

              <label>Email</label>
              <input
                type="email"
                name="email_utilisateur"
                value={formData.email_utilisateur}
                onChange={handleChange}
                required
              />

              <label>Mot de passe</label>
              <input
                type="password"
                name="password_utilisateur"
                value={formData.password_utilisateur}
                onChange={handleChange}
                required={!currentUser} // obligatoire si ajout
              />

              <label>Confirmer le mot de passe</label>
              <input
                type="password"
                name="confirm_password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={!currentUser} // seulement obligatoire à l'ajout
              />


              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeAllModals}>
                  Annuler
                </button>
                <button type="submit" className="submit-btn">
                  {currentUser ? "Modifier" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Voir plus */}
      {isDetailModalOpen && currentUser && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ position: "relative" }}>
            <X
              size={20}
              style={{ position: "absolute", top: "10px", right: "10px", cursor: "pointer", color: "#e74c3c" }}
              onClick={closeAllModals}
            />
            <h2>Détails de l'utilisateur</h2>
            <p><strong>Nom:</strong> {currentUser.nom_utilisateur}</p>
            <p><strong>Email:</strong> {currentUser.email_utilisateur}</p>

            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <Edit2
                size={20}
                style={{ cursor: "pointer", color: "#3498db" }}
                onClick={() => { setIsAddModalOpen(true); setIsDetailModalOpen(false); }}
                title="Modifier"
              />
              <Trash2
                size={20}
                style={{ cursor: "pointer", color: "#e74c3c" }}
                onClick={() => handleDelete(currentUser.id_utilisateur)}
                title="Supprimer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
