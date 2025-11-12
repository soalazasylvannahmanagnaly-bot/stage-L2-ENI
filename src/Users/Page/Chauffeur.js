import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import "../../Style/App.css";

function Chauffeur() {
  const [formData, setFormData] = useState({ nom: "", prenom: "", telephone: "" });
  const [chauffeurs, setChauffeurs] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [detailChauffeur, setDetailChauffeur] = useState(null);

  const API_URL = "http://127.0.0.1:8000/api/chauffeurs";

  useEffect(() => {
    fetchChauffeurs();
  }, []);

  const fetchChauffeurs = async () => {
    try {
      const res = await axios.get(API_URL);
      setChauffeurs(res.data);
    } catch {
      Swal.fire("Erreur", "Impossible de charger les chauffeurs", "error");
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
        Swal.fire("Succès", "Chauffeur modifié !", "success");
      } else {
        await axios.post(API_URL, formData);
        Swal.fire("Succès", "Chauffeur ajouté !", "success");
      }
      setShowModal(false);
      setFormData({ nom: "", prenom: "", telephone: "" });
      setEditId(null);
      fetchChauffeurs();
    } catch {
      Swal.fire("Erreur", "Vérifie les champs ou le numéro unique.", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Supprimer ce chauffeur ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchChauffeurs();
        Swal.fire("Supprimé !", "Le chauffeur a été supprimé.", "success");
      } catch {
        Swal.fire("Erreur", "Échec de la suppression.", "error");
      }
    }
  };

  const handleEdit = (chauffeur) => {
    setFormData({ nom: chauffeur.nom, prenom: chauffeur.prenom, telephone: chauffeur.telephone });
    setEditId(chauffeur.id_chauffeur);
    setShowModal(true);
  };

  const handleVoirPlus = (chauffeur) => setDetailChauffeur(chauffeur);
  const closeDetailModal = () => setDetailChauffeur(null);

  const toggleStatut = async (chauffeur) => {
    try {
      const newStatut = !chauffeur.statut;
      await axios.patch(`${API_URL}/${chauffeur.id_chauffeur}`, { statut: newStatut });
      fetchChauffeurs();
      Swal.fire("Succès", "Statut mis à jour", "success");
    } catch {
      Swal.fire("Erreur", "Impossible de changer le statut", "error");
    }
  };

  const columns = [
    { name: "Nom", selector: (row) => row.nom },
    { name: "Prénom", selector: (row) => row.prenom },
    { name: "Téléphone", selector: (row) => row.telephone },
    {
      name: "Statut",
      cell: (row) => (
        <input type="checkbox" checked={row.statut} onChange={() => toggleStatut(row)} />
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <button className="btn-voir-plus" onClick={() => handleVoirPlus(row)}>
          Voir plus
        </button>
      ),
    },
  ];

  return (
    <div className="vehicule-container">
      <h1>Gestion des Chauffeurs</h1>
      <button className="btn-add" onClick={() => setShowModal(true)}>Ajouter un chauffeur</button>

      <DataTable
        columns={columns}
        data={chauffeurs}
        pagination
        highlightOnHover
        striped
      />

      {/* Modal ajout / modification */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editId ? "Modifier le chauffeur" : "Ajouter un chauffeur"}</h2>
            <form className="vehicule-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom :</label>
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Prénom :</label>
                <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Téléphone :</label>
                <input type="text" name="telephone" value={formData.telephone} onChange={handleChange} required />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-submit">{editId ? "Modifier" : "Ajouter"}</button>
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Voir plus - même style que Véhicule & Carburant */}
      {detailChauffeur && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ position: "relative" }}>
            <FaTimes
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                cursor: "pointer",
                fontSize: "20px",
                color: "#e74c3c",
              }}
              onClick={closeDetailModal}
              title="Fermer"
            />

            <table className="w-full bg-white shadow-lg rounded-2xl overflow-hidden">
              <thead className="bg-gray-400 text-white">
                <tr>
                  <th>Détails du chauffeur</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Nom :</td><td>{detailChauffeur.nom}</td></tr>
                <tr><td>Prénom :</td><td>{detailChauffeur.prenom}</td></tr>
                <tr><td>Téléphone :</td><td>{detailChauffeur.telephone}</td></tr>
                <tr><td>Statut :</td><td>{detailChauffeur.statut ? "Actif" : "Inactif"}</td></tr>
              </tbody>
              <tfoot>
                <div style={{ display: "flex", gap: "50px", marginTop: "15px" }}>
                  <button>
                    <FaEdit
                      style={{ cursor: "pointer", color: "#3498db" }}
                      onClick={() => { handleEdit(detailChauffeur); closeDetailModal(); }}
                      title="Modifier"
                    />
                  </button>
                  <button>
                    <FaTrash
                      style={{ cursor: "pointer", color: "#e74c3c" }}
                      onClick={() => { handleDelete(detailChauffeur.id_chauffeur); closeDetailModal(); }}
                      title="Supprimer"
                    />
                  </button>
                </div>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chauffeur;
