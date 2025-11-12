import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import "../../Style/App.css";

function Carburant() {
  const API_URL = "http://127.0.0.1:8000/api/carburants";
  const VEHICULE_URL = "http://127.0.0.1:8000/api/vehicules";

  const [carburants, setCarburants] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [detailCarburant, setDetailCarburant] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    station: "",
    emplacement: "",
    produit: "essence",
    quantite: "",
    prix_total: "",
    date_achat: "",
    scan_recu: "",
    vehicule_id: "",
  });

  useEffect(() => {
    fetchCarburants();
    fetchVehicules();
  }, []);

  const fetchCarburants = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setCarburants(res.data);
    } catch {
      Swal.fire("Erreur", "Impossible de charger les carburants", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicules = async () => {
    try {
      const res = await axios.get(VEHICULE_URL);
      setVehicules(res.data);
    } catch {
      Swal.fire("Erreur", "Impossible de charger les véhicules", "error");
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setFormData({
      station: "",
      emplacement: "",
      produit: "essence",
      quantite: "",
      prix_total: "",
      date_achat: "",
      scan_recu: "",
      vehicule_id: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicule_id) {
      Swal.fire("Erreur", "Vous devez sélectionner un véhicule", "error");
      return;
    }

    try {
      setLoading(true);
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
        Swal.fire("Succès", "Carburant modifié !", "success");
      } else {
        await axios.post(API_URL, formData);
        Swal.fire("Succès", "Carburant ajouté !", "success");
      }
      resetForm();
      setEditId(null);
      setShowModal(false);
      fetchCarburants();
    } catch {
      Swal.fire("Erreur", "Impossible d'enregistrer le carburant", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (c) => {
    setEditId(c.id_carburant);
    setFormData({
      station: c.station,
      emplacement: c.emplacement,
      produit: c.produit,
      quantite: c.quantite,
      prix_total: c.prix_total,
      date_achat: c.date_achat,
      scan_recu: c.scan_recu || "",
      vehicule_id: c.vehicule_id,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Supprimer ce carburant ?",
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
        fetchCarburants();
        Swal.fire("Supprimé !", "Carburant supprimé.", "success");
      } catch {
        Swal.fire("Erreur", "Échec de la suppression.", "error");
      }
    }
  };

  const handleVoirPlus = (c) => setDetailCarburant(c);
  const closeDetailModal = () => setDetailCarburant(null);

  const columns = [
    { name: "Station", selector: row => row.station },
    
    { name: "Emplacement", selector: row => row.emplacement },
    { name: "Produit", selector: row => row.produit },
    { name: "Quantité", selector: row => row.quantite },
    { name: "Prix total", selector: row => row.prix_total },
    { name: "Date Achat", selector: row => row.date_achat },
    { name: "Véhicule", selector: row => row.vehicule?.immatriculation || "" },
    {
      name: "Actions",
      cell: row => (
        <button className="btn-voir-plus" onClick={() => handleVoirPlus(row)}>
          Voir plus
        </button>
      )
    }
  ];

  return (
    <div className="vehicule-container">
      <h1>Gestion des Carburants</h1>
      <button
        className="btn-add"
        onClick={() => { resetForm(); setEditId(null); setShowModal(true); }}
        disabled={loading}
      >
        {loading ? "Chargement..." : "Ajouter un carburant"}
      </button>

      <DataTable
        columns={columns}
        data={carburants}
        pagination
        highlightOnHover
        striped
        progressPending={loading}
      />

      {/* Modal ajout / modification */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editId ? "Modifier Carburant" : "Ajouter Carburant"}</h2>
            <form className="vehicule-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Station :</label>
                <input type="text" name="station" value={formData.station} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Emplacement :</label>
                <input type="text" name="emplacement" value={formData.emplacement} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Produit :</label>
                <select name="produit" value={formData.produit} onChange={handleChange} required>
                  <option value="essence">Essence</option>
                  <option value="gasoil">Gasoil</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quantité :</label>
                <input type="number" step="0.01" name="quantite" value={formData.quantite} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Prix total :</label>
                <input type="number" step="0.01" name="prix_total" value={formData.prix_total} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Date Achat :</label>
                <input type="date" name="date_achat" value={formData.date_achat} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Scan reçu :</label>
                <input type="text" name="scan_recu" value={formData.scan_recu} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Véhicule :</label>
                <select name="vehicule_id" value={formData.vehicule_id} onChange={handleChange} required>
                  <option value="">-- Sélectionner un véhicule --</option>
                  {vehicules.map(v => (
                    <option key={v.id_vehicule} value={v.id_vehicule}>
                      {v.immatriculation} - {v.marque}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-submit">{editId ? "Modifier" : "Ajouter"}</button>
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Voir plus — même style que Véhicule */}
      {detailCarburant && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ position: "relative" }}>
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
                  <th>Détails du carburant</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Station :</td><td>{detailCarburant.station}</td></tr>
                <tr><td>Emplacement :</td><td>{detailCarburant.emplacement}</td></tr>
                <tr><td>Produit :</td><td>{detailCarburant.produit}</td></tr>
                <tr><td>Quantité :</td><td>{detailCarburant.quantite}</td></tr>
                <tr><td>Prix total :</td><td>{detailCarburant.prix_total}</td></tr>
                <tr><td>Date Achat :</td><td>{detailCarburant.date_achat}</td></tr>
                <tr><td>Véhicule :</td><td>{detailCarburant.vehicule?.immatriculation || "N/A"}</td></tr>
              </tbody>
              <tfoot>
                <div style={{ display: "flex", gap: "50px", marginTop: "15px" }}>
                  <button>
                    <FaEdit
                      style={{ cursor: "pointer", color: "#3498db" }}
                      onClick={() => { handleEdit(detailCarburant); closeDetailModal(); }}
                      title="Modifier"
                    />
                  </button>
                  <button>
                    <FaTrash
                      style={{ cursor: "pointer", color: "#e74c3c" }}
                      onClick={() => { handleDelete(detailCarburant.id_carburant); closeDetailModal(); }}
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

export default Carburant;
