import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa"; // Ajout de FaTimes pour le X
import "../../Style/App.css";

function Vehicule() {
  const [formData, setFormData] = useState({
    immatriculation: "",
    marque: "",
    modele: "",
    annee: "",
  });
  const [vehicules, setVehicules] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [detailVehicule, setDetailVehicule] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://127.0.0.1:8000/api/vehicules";

  const fetchVehicules = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setVehicules(res.data);
    } catch (error) {
      console.error("Erreur chargement:", error);
      Swal.fire("Erreur", "Impossible de charger les véhicules", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicules();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const addVehicule = async () => {
    try {
      setLoading(true);
      await axios.post(API_URL, formData);
      Swal.fire("Succès", "Véhicule ajouté avec succès !", "success");
      setShowModal(false);
      resetForm();
      fetchVehicules();
    } catch (error) {
      console.error("Erreur ajout:", error);
      Swal.fire("Erreur", "Impossible d'ajouter le véhicule !", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateVehicule = async (id) => {
    try {
      setLoading(true);
      await axios.put(`${API_URL}/${id}`, formData);
      Swal.fire("Succès", "Véhicule modifié avec succès !", "success");
      setShowModal(false);
      resetForm();
      setEditId(null);
      fetchVehicules();
    } catch (error) {
      console.error("Erreur modification:", error);
      Swal.fire("Erreur", "Impossible de modifier le véhicule !", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      immatriculation: "",
      marque: "",
      modele: "",
      annee: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      updateVehicule(editId);
    } else {
      addVehicule();
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Supprimer ce véhicule ?",
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
        fetchVehicules();
        Swal.fire("Supprimé !", "Le véhicule a été supprimé.", "success");
      } catch (error) {
        console.error("Erreur suppression:", error);
        Swal.fire("Erreur", "Échec de la suppression.", "error");
      }
    }
  };

  const handleEdit = (vehicule) => {
    setFormData({
      immatriculation: vehicule.immatriculation,
      marque: vehicule.marque,
      modele: vehicule.modele,
      annee: vehicule.annee,
    });
    setEditId(vehicule.id_vehicule);
    setShowModal(true);
  };

  const handleVoirPlus = (vehicule) => setDetailVehicule(vehicule);
  const closeDetailModal = () => setDetailVehicule(null);

  const columns = [
    { name: "Immatriculation", selector: (row) => row.immatriculation, sortable: true },
    { name: "Marque", selector: (row) => row.marque, sortable: true },
    { name: "Modèle", selector: (row) => row.modele, sortable: true },
    { name: "Année", selector: (row) => row.annee, sortable: true },
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
      <h1>Gestion des Véhicules</h1>
      <button
        className="btn-add"
        onClick={() => {
          resetForm();
          setEditId(null);
          setShowModal(true);
        }}
        disabled={loading}
      >
        {loading ? "Chargement..." : "Ajouter un véhicule"}
      </button>

      <DataTable
        columns={columns}
        data={vehicules}
        pagination
        highlightOnHover
        striped
        progressPending={loading}
      />

      {/* Modal pour ajout / modification */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editId ? "Modifier le véhicule" : "Ajouter un véhicule"}</h2>
            <form className="vehicule-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Immatriculation :</label>
                <input type="text" name="immatriculation" value={formData.immatriculation} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Marque :</label>
                <input type="text" name="marque" value={formData.marque} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Modèle :</label>
                <input type="text" name="modele" value={formData.modele} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Année :</label>
                <input type="number" name="annee" value={formData.annee} onChange={handleChange} required />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-submit">{editId ? "Modifier" : "Ajouter"}</button>
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal pour voir plus */}
      {detailVehicule && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ position: "relative" }}>
            {/* X pour fermer */}
            <FaTimes
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                cursor: "pointer",
                fontSize: "20px",
                color: "#e74c3c"
              }}
              onClick={closeDetailModal}
              title="Fermer"
            />

<table className="w-full bg-white shadow-lg rounded-2xl overflow-hidden">
  <thead className="bg-gray-400 text-white">
      <tr>
        <th>Détails du véhicule</th>
        <th></th>
      </tr>
  </thead>
  <tbody>
    <tr className="border-b">
      <td><span>Immatriculation :</span> </td>
      <td>{detailVehicule.immatriculation}</td>
    </tr>
    <tr className="border-b">
      <td><span>Marque :</span></td>
      <td>{detailVehicule.marque}</td>
    </tr>
    <tr className="border-b">
      <td><span>Modèle :</span></td>
      <td>{detailVehicule.modele}</td>
    </tr>
    <tr className="border-b">
      <td><span>Année :</span></td>
      <td>{detailVehicule.annee}</td>

    </tr>
    <tr className="border-b">
      <td><span>Statut :</span></td>
      <td>{detailVehicule.statut ? "Actif" : "Inactif"}</td>
    </tr>
  </tbody>
  <tfoot>
    <div style={{ display: "flex", gap: "50px", marginTop: "15px" }}>
        <button>      
              <FaEdit
                style={{ cursor: "pointer", color: "#3498db" }}
                onClick={() => { handleEdit(detailVehicule); closeDetailModal(); }}
                title="Modifier"
              />
        </button>
        <button>
              <FaTrash
                style={{ cursor: "pointer", color: "#e74c3c" }}
                onClick={() => { handleDelete(detailVehicule.id_vehicule); closeDetailModal(); }}
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

export default Vehicule;
