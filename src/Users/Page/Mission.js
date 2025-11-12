import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import "../../Style/App.css";

function Mission() {
  const API_URL = "http://127.0.0.1:8000/api/missions";
  const VEHICULE_URL = "http://127.0.0.1:8000/api/vehicules";
  const CHAUFFEUR_URL = "http://127.0.0.1:8000/api/chauffeurs";

  const [missions, setMissions] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [chauffeurs, setChauffeurs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [detailMission, setDetailMission] = useState(null);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    objet: "",
    client: "",
    lieu_depart: "",
    lieu_arrivee: "",
    date_depart: "",
    date_retour: "",
    kilometrage: "",
    remarque: "",
    vehicule_id: "",
    chauffeur_id: "",
  });

  useEffect(() => {
    fetchMissions();
    fetchVehicules();
    fetchChauffeurs();
  }, []);

  const fetchMissions = async () => {
    try {
      const res = await axios.get(API_URL);
      setMissions(res.data);
    } catch {
      Swal.fire("Erreur", "Impossible de charger les missions", "error");
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

  const fetchChauffeurs = async () => {
    try {
      const res = await axios.get(CHAUFFEUR_URL);
      setChauffeurs(res.data);
    } catch {
      Swal.fire("Erreur", "Impossible de charger les chauffeurs", "error");
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = { ...formData };

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, dataToSend);
        Swal.fire("Succès", "Mission modifiée avec succès !", "success");
      } else {
        await axios.post(API_URL, dataToSend);
        Swal.fire("Succès", "Mission ajoutée avec succès !", "success");
      }
      setShowModal(false);
      setEditId(null);
      resetForm();
      fetchMissions();
    } catch (error) {
      Swal.fire(
        "Erreur",
        error.response?.data?.message || "Impossible d'enregistrer la mission",
        "error"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      objet: "",
      client: "",
      lieu_depart: "",
      lieu_arrivee: "",
      date_depart: "",
      date_retour: "",
      kilometrage: "",
      remarque: "",
      vehicule_id: "",
      chauffeur_id: "",
    });
  };

  const handleEdit = (mission) => {
    setEditId(mission.id_mission);
    setFormData({
      objet: mission.objet,
      client: mission.client,
      lieu_depart: mission.lieu_depart,
      lieu_arrivee: mission.lieu_arrivee,
      date_depart: mission.date_depart,
      date_retour: mission.date_retour,
      kilometrage: mission.kilometrage || "",
      remarque: mission.remarque || "",
      vehicule_id: mission.vehicule_id,
      chauffeur_id: mission.chauffeur_id,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Supprimer cette mission ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchMissions();
        Swal.fire("Supprimé !", "La mission a été supprimée.", "success");
      } catch {
        Swal.fire("Erreur", "Impossible de supprimer la mission", "error");
      }
    }
  };

  const handleVoirPlus = (mission) => setDetailMission(mission);
  const closeDetailModal = () => setDetailMission(null);

  const columns = [
    { name: "Objet", selector: (row) => row.objet },
    { name: "Client", selector: (row) => row.client },
    { name: "Lieu Départ", selector: (row) => row.lieu_depart },
    { name: "Lieu Arrivée", selector: (row) => row.lieu_arrivee },
    { name: "Date Départ", selector: (row) => row.date_depart },
    { name: "Date Retour", selector: (row) => row.date_retour },
    { name: "Km total", selector: (row) => row.kilometrage },
    {
      name: "Véhicule",
      selector: (row) => row.vehicule?.immatriculation || "",
    },
    {
      name: "Chauffeur",
      selector: (row) =>
        row.chauffeur ? `${row.chauffeur.nom} ${row.chauffeur.prenom}` : "",
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
    <div
      className="vehicule-container"
      style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
    >
      <h1>Gestion des Missions</h1>

      <button
        className="btn-add"
        onClick={() => {
          resetForm();
          setEditId(null);
          setShowModal(true);
        }}
      >
        ➕ Ajouter une mission
      </button>

      <DataTable
        columns={columns}
        data={missions}
        pagination
        highlightOnHover
        striped
      />

      {/* Modal Voir Plus */}
      {detailMission && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <FaTimes
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                cursor: "pointer",
                fontSize: "20px",
                color: "#e74c3c",
              }}
              onClick={closeDetailModal}
            />

            <h2 style={{ marginBottom: "15px" }}>Détails de la mission</h2>

            <table className="table table-bordered">
              <tbody>
                <tr>
                  <td>Objet</td>
                  <td>{detailMission.objet}</td>
                </tr>
                <tr>
                  <td>Client</td>
                  <td>{detailMission.client}</td>
                </tr>
                <tr>
                  <td>Lieu départ</td>
                  <td>{detailMission.lieu_depart}</td>
                </tr>
                <tr>
                  <td>Lieu arrivée</td>
                  <td>{detailMission.lieu_arrivee}</td>
                </tr>
                <tr>
                  <td>Date départ</td>
                  <td>{detailMission.date_depart}</td>
                </tr>
                <tr>
                  <td>Date retour</td>
                  <td>{detailMission.date_retour}</td>
                </tr>
                <tr>
                  <td>Total km</td>
                  <td>{detailMission.kilometrage}</td>
                </tr>
                <tr>
                  <td>Remarque</td>
                  <td>{detailMission.remarque || "Aucune"}</td>
                </tr>
                <tr>
                  <td>Véhicule</td>
                  <td>{detailMission.vehicule?.immatriculation || "-"}</td>
                </tr>
                <tr>
                  <td>Chauffeur</td>
                  <td>
                    {detailMission.chauffeur
                      ? `${detailMission.chauffeur.nom} ${detailMission.chauffeur.prenom}`
                      : "-"}
                  </td>
                </tr>
              </tbody>
            </table>

            <div
              style={{
                display: "flex",
                gap: "40px",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              <button
                onClick={() => {
                  handleEdit(detailMission);
                  closeDetailModal();
                }}
                className="btn btn-primary"
              >
                <FaEdit /> Modifier
              </button>
              <button
                onClick={() => {
                  handleDelete(detailMission.id_mission);
                  closeDetailModal();
                }}
                className="btn btn-danger"
              >
                <FaTrash /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajouter / Modifier */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <FaTimes
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                cursor: "pointer",
                fontSize: "20px",
                color: "#e74c3c",
              }}
              onClick={() => setShowModal(false)}
            />

            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
              {editId ? "Modifier une mission" : "Ajouter une mission"}
            </h2>

            <form onSubmit={handleSubmit} className="grid-form">
              <div className="form-group">
                <label>Objet :</label>
                <input
                  type="text"
                  name="objet"
                  value={formData.objet}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Client :</label>
                <input
                  type="text"
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Lieu de départ :</label>
                <input
                  type="text"
                  name="lieu_depart"
                  value={formData.lieu_depart}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Lieu d’arrivée :</label>
                <input
                  type="text"
                  name="lieu_arrivee"
                  value={formData.lieu_arrivee}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date départ :</label>
                <input
                  type="date"
                  name="date_depart"
                  value={formData.date_depart}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date retour :</label>
                <input
                  type="date"
                  name="date_retour"
                  value={formData.date_retour}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Kilométrage :</label>
                <input
                  type="number"
                  name="kilometrage"
                  value={formData.kilometrage}
                  onChange={handleChange}
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
                      {v.immatriculation}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Chauffeur :</label>
                <select
                  name="chauffeur_id"
                  value={formData.chauffeur_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Sélectionner un chauffeur --</option>
                  {chauffeurs.map((c) => (
                    <option key={c.id_chauffeur} value={c.id_chauffeur}>
                      {c.nom} {c.prenom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Remarque :</label>
                <textarea
                  name="remarque"
                  value={formData.remarque}
                  onChange={handleChange}
                  style={{ gridColumn: "span 2" }}
                />
              </div>

              <div className="form-buttons" style={{ gridColumn: "span 2" }}>
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
    </div>
  );
}

export default Mission;
