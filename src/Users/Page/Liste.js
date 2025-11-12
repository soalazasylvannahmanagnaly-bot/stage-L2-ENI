import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx"; // ✅ pour Excel
import { saveAs } from "file-saver"; // ✅ pour télécharger le fichier
import "../../Style/App.css";

function Liste() {
  const [entretiens, setEntretiens] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/rapport/top-entretiens")
      .then((res) => setEntretiens(res.data))
      .catch((err) => console.error("Erreur lors du chargement :", err));
  }, []);

  // 🧾 Génération PDF
  const genererPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Top 5 des entretiens les plus coûteux", 14, 15);

    const tableData = entretiens.slice(0, 5).map((item, index) => [
      index + 1,
      item.vehicule
        ? `${item.vehicule.marque} ${item.vehicule.modele} (${item.vehicule.immatriculation})`
        : "Non défini",
      item.garage,
      item.description,
      item.date_entretien,
      item.cout.toLocaleString() + " Ar",
    ]);

    doc.autoTable({
      startY: 25,
      head: [["#", "Véhicule", "Garage", "Description", "Date", "Coût (Ar)"]],
      body: tableData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 102, 204] },
    });

    doc.save("Top_5_Entretiens.pdf");
  };

  // 🧾 Génération Excel
  const genererExcel = () => {
    const data = entretiens.slice(0, 5).map((item, index) => ({
      "#": index + 1,
      Véhicule: item.vehicule
        ? `${item.vehicule.marque} ${item.vehicule.modele} (${item.vehicule.immatriculation})`
        : "Non défini",
      Garage: item.garage,
      Description: item.description,
      "Date Entretien": item.date_entretien,
      "Coût (Ar)": item.cout,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Top Entretiens");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Top_5_Entretiens.xlsx");
  };

  const columns = [
    {
      name: "Véhicule",
      selector: (row) =>
        row.vehicule
          ? `${row.vehicule.marque} ${row.vehicule.modele} (${row.vehicule.immatriculation})`
          : "Non défini",
      sortable: true,
    },
    {
      name: "Garage",
      selector: (row) => row.garage,
      sortable: true,
    },
    {
      name: "Description",
      selector: (row) => row.description,
      grow: 2,
    },
    {
      name: "Date entretien",
      selector: (row) => row.date_entretien,
      sortable: true,
    },
    {
      name: "Coût (Ar)",
      selector: (row) => row.cout,
      sortable: true,
      right: true,
    },
  ];

  return (
    <div className="page-container">
      <div className="header-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h2>Top 05 des entretiens les plus coûteux</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-submit" onClick={genererPDF}>
            📄 Exporter en PDF
          </button>
          <button className="btn-submit" onClick={genererExcel}>
            📊 Exporter en Excel
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={entretiens.slice(0, 5)}
        highlightOnHover
        striped
        responsive
      />
    </div>
  );
}

export default Liste;
