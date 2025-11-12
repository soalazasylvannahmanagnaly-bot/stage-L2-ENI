import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import "../../Style/App.css";

function Entretien() {
  const API_URL = "http://127.0.0.1:8000/api/entretiens";
  const VEHICULE_URL = "http://127.0.0.1:8000/api/vehicules";

  const [entretiens, setEntretiens] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [formData, setFormData] = useState({
    date_entretien: "",
    description: "",
    cout: "",
    garage: "",
    vehicule_id: "",
  });

  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [detailEntretien, setDetailEntretien] = useState(null);
  const [loading, setLoading] = useState(false);

  // Charger les données
  useEffect(() => {
    fetchEntretiens();
    fetchVehicules();
  }, []);

  const fetchEntretiens = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setEntretiens(res.data);
    } catch (error) {
      Swal.fire("Erreur", "Impossible de charger les entretiens", "error");
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

  // Formulaire
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () =>
    setFormData({
      date_entretien: "",
      description: "",
      cout: "",
      garage: "",
      vehicule_id: "",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
        Swal.fire("Succès", "Entretien modifié avec succès", "success");
      } else {
        await axios.post(API_URL, formData);
        Swal.fire("Succès", "Entretien ajouté avec succès", "success");
      }
      resetForm();
      setShowModal(false);
      setEditId(null);
      fetchEntretiens();
    } catch {
      Swal.fire("Erreur", "Impossible d'enregistrer l'entretien", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entretien) => {
    setEditId(entretien.id_entretien);
    setFormData({
      date_entretien: entretien.date_entretien,
      description: entretien.description,
      cout: entretien.cout,
      garage: entretien.garage,
      vehicule_id: entretien.vehicule_id,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Supprimer cet entretien ?",
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
        fetchEntretiens();
        Swal.fire("Supprimé !", "L'entretien a été supprimé.", "success");
      } catch {
        Swal.fire("Erreur", "Impossible de supprimer l'entretien", "error");
      }
    }
  };

  const handleVoirPlus = (entretien) => setDetailEntretien(entretien);
  const closeDetailModal = () => setDetailEntretien(null);

  // Colonnes du tableau
  const columns = [
    { name: "Date", selector: (row) => row.date_entretien, sortable: true },
    { name: "Description", selector: (row) => row.description, sortable: true },
    { name: "Coût", selector: (row) => row.cout, sortable: true },
    { name: "Garage", selector: (row) => row.garage, sortable: true },
    {
      name: "Véhicule",
      selector: (row) => row.vehicule?.immatriculation || "",
      sortable: true,
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
      <h1>Gestion des Entretiens</h1>
      <button
        className="btn-add"
        onClick={() => {
          resetForm();
          setEditId(null);
          setShowModal(true);
        }}
        disabled={loading}
      >
        {loading ? "Chargement..." : "Ajouter un entretien"}
      </button>

      <DataTable
        columns={columns}
        data={entretiens}
        pagination
        highlightOnHover
        striped
        progressPending={loading}
      />

      {/* Modal Ajout / Modification */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editId ? "Modifier un entretien" : "Ajouter un entretien"}</h2>
            <form className="vehicule-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Date :</label>
                <input
                  type="date"
                  name="date_entretien"
                  value={formData.date_entretien}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description :</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Coût :</label>
                <input
                  type="number"
                  name="cout"
                  value={formData.cout}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Garage :</label>
                <input
                  type="text"
                  name="garage"
                  value={formData.garage}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Véhicule :</label>
                <select
                  name="vehicule_id"
                  value={formData.vehicule_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Sélectionner un véhicule --</option>
                  {vehicules.map((v) => (
                    <option key={v.id_vehicule} value={v.id_vehicule}>
                      {v.immatriculation} - {v.marque}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-buttons">
                <button type="submit" className="btn-submit">
                  {editId ? "Modifier" : "Ajouter"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Voir Plus */}
      {detailEntretien && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative" }}
          >
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
                  <th>Détails de l'entretien</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td>Date :</td>
                  <td>{detailEntretien.date_entretien}</td>
                </tr>
                <tr className="border-b">
                  <td>Description :</td>
                  <td>{detailEntretien.description}</td>
                </tr>
                <tr className="border-b">
                  <td>Coût :</td>
                  <td>{detailEntretien.cout}</td>
                </tr>
                <tr className="border-b">
                  <td>Garage :</td>
                  <td>{detailEntretien.garage}</td>
                </tr>
                <tr className="border-b">
                  <td>Véhicule :</td>
                  <td>{detailEntretien.vehicule?.immatriculation}</td>
                </tr>
              </tbody>
              <tfoot>
                <div style={{ display: "flex", gap: "50px", marginTop: "15px" }}>
                  <button>
                    <FaEdit
                      style={{ cursor: "pointer", color: "#3498db" }}
                      onClick={() => {
                        handleEdit(detailEntretien);
                        closeDetailModal();
                      }}
                      title="Modifier"
                    />
                  </button>
                  <button>
                    <FaTrash
                      style={{ cursor: "pointer", color: "#e74c3c" }}
                      onClick={() => {
                        handleDelete(detailEntretien.id_entretien);
                        closeDetailModal();
                      }}
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

export default Entretien;
