import React, { useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "../../Style/App.css";

function Consommation() {
  const [rapport, setRapport] = useState([]);
  const [dates, setDates] = useState({ date_debut: "", date_fin: "" });

  const handleChange = (e) =>
    setDates({ ...dates, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/rapport/consommation-carburant",
        dates,
        { withCredentials: false } // ✅ désactive CSRF pour API
      );

      console.log("Réponse API :", res.data);
      setRapport(res.data);
    } catch (err) {
      console.error("Erreur API :", err.response?.data || err);

      alert(
        "Erreur : " +
          (err.response?.data?.message ||
            "Impossible de charger les données ! Vérifiez les dates.")
      );
    }
  };

  // 📄 Génération PDF
  const genererPDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("fr-FR");

    doc.setFontSize(16);
    doc.text("Rapport de Consommation Carburant", 14, 15);
    doc.setFontSize(11);
    doc.text(`Période : du ${dates.date_debut} au ${dates.date_fin}`, 14, 22);
    doc.text(`Date d’édition : ${today}`, 14, 28);

    const tableData = rapport.map((row, index) => [
      index + 1,
      row.vehicule,
      row.marque,
      row.modele,
      row.total_quantite.toLocaleString(),
      row.prix_unitaire.toLocaleString(),
      row.total_carburant.toLocaleString(),
    ]);

    doc.autoTable({
      startY: 35,
      head: [["#", "Véhicule", "Marque", "Modèle", "Quantité (L)", "Prix unitaire (Ar)", "Coût total (Ar)"]],
      body: tableData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 102, 204] },
    });

    doc.save("rapport_consommation.pdf");
  };

  // 📊 Génération Excel
  const genererExcel = () => {
    const data = rapport.map((row, index) => ({
      "#": index + 1,
      Véhicule: row.vehicule,
      Marque: row.marque,
      Modèle: row.modele,
      "Quantité (L)": row.total_quantite,
      "Prix unitaire (Ar)": row.prix_unitaire,
      "Coût total (Ar)": row.total_carburant,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Consommation Carburant");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "rapport_consommation.xlsx");
  };

  const columns = [
    { name: "#", selector: (row, i) => i + 1, sortable: true, width: "50px" },
    { name: "Véhicule", selector: (row) => row.vehicule, sortable: true },
    { name: "Marque", selector: (row) => row.marque, sortable: true },
    { name: "Modèle", selector: (row) => row.modele, sortable: true },
    { name: "Quantité (L)", selector: (row) => row.total_quantite.toLocaleString(), right: true },
    { name: "Prix unitaire (Ar)", selector: (row) => row.prix_unitaire.toLocaleString(), right: true },
    { name: "Coût total (Ar)", selector: (row) => row.total_carburant.toLocaleString(), right: true },
  ];

  return (
    <div className="page-container">
      <div className="header-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h2>Consommation carburant par véhicule</h2>
        {rapport.length > 0 && (
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-submit" onClick={genererPDF}>
              📄 Exporter en PDF
            </button>
            <button className="btn-submit" onClick={genererExcel}>
              📊 Exporter en Excel
            </button>
          </div>
        )}
      </div>

      <form className="rapport-form" onSubmit={handleSubmit} style={{ marginBottom: "15px" }}>
        <div className="form-group">
          <label>Date début :</label>
          <input
            type="date"
            name="date_debut"
            value={dates.date_debut}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Date fin :</label>
          <input
            type="date"
            name="date_fin"
            value={dates.date_fin}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-submit">
          Afficher
        </button>
      </form>

      {rapport.length === 0 && (
        <p style={{ color: "red" }}>Aucune donnée disponible pour cette période.</p>
      )}

      <DataTable
        columns={columns}
        data={rapport}
        pagination
        paginationPerPage={5}
        highlightOnHover
        striped
        responsive
      />
    </div>
  );
}

export default Consommation;
