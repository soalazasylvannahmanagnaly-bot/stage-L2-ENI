import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx"; // ✅ pour Excel
import { saveAs } from "file-saver"; // ✅ pour télécharger le fichier
import "../../Style/Rapport.css";

function Rapport() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [rapport, setRapport] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://127.0.0.1:8000/api/rapport/cout-par-vehicule";

  const genererRapport = async () => {
    if (!dateDebut || !dateFin) {
      alert("Veuillez sélectionner les deux dates !");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(API_URL, {
        date_debut: dateDebut,
        date_fin: dateFin,
      });
      setRapport(response.data);
    } catch (error) {
      console.error(error);
      alert("Erreur lors du chargement du rapport.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Génération PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Rapport des Coûts par Véhicule", 14, 15);
    doc.setFontSize(11);
    doc.text(`Période : ${dateDebut} au ${dateFin}`, 14, 22);
    doc.text(`Date de génération : ${new Date().toLocaleDateString()}`, 14, 28);

    const tableColumn = [
      "Immatriculation",
      "Marque",
      "Modèle",
      "Total Carburant (Ar)",
      "Total Entretien (Ar)",
      "Total Général (Ar)",
    ];

    const tableRows = rapport.map((item) => [
      item.vehicule,
      item.marque,
      item.modele,
      item.total_carburant.toLocaleString(),
      item.total_entretien.toLocaleString(),
      item.total_general.toLocaleString(),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(
        `Page ${i} / ${pageCount}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save("rapport_cout_par_vehicule.pdf");
  };

  // ✅ Génération Excel
  const generateExcel = () => {
    const data = rapport.map((item) => ({
      Immatriculation: item.vehicule,
      Marque: item.marque,
      Modèle: item.modele,
      "Total Carburant (Ar)": item.total_carburant,
      "Total Entretien (Ar)": item.total_entretien,
      "Total Général (Ar)": item.total_general,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rapport");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "rapport_cout_par_vehicule.xlsx");
  };

  return (
    <div className="rapport-container">
      <h1>Rapport et Statistique</h1>

      <div className="rapport-filtres">
        <div>
          <label>Date Début :</label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
          />
        </div>
        <div>
          <label>Date Fin :</label>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
          />
        </div>
        <button onClick={genererRapport} disabled={loading}>
          {loading ? "Chargement..." : "Générer le rapport"}
        </button>
      </div>

      {rapport.length > 0 && (
        <div className="rapport-actions">
          <button className="btn-pdf" onClick={generatePDF}>
            📄 Télécharger PDF
          </button>
          <button className="btn-excel" onClick={generateExcel}>
            📊 Télécharger Excel
          </button>
        </div>
      )}

      <table className="rapport-table">
        <thead>
          <tr>
            <th>Immatriculation</th>
            <th>Marque</th>
            <th>Modèle</th>
            <th>Total Carburant (Ar)</th>
            <th>Total Entretien (Ar)</th>
            <th>Total Général (Ar)</th>
          </tr>
        </thead>
        <tbody>
          {rapport.length > 0 ? (
            rapport.map((item, index) => (
              <tr key={index}>
                <td>{item.vehicule}</td>
                <td>{item.marque}</td>
                <td>{item.modele}</td>
                <td>{item.total_carburant.toLocaleString()}</td>
                <td>{item.total_entretien.toLocaleString()}</td>
                <td>{item.total_general.toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                Aucun résultat
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Rapport;
