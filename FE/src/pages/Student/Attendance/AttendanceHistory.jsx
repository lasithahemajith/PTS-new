import React, { useEffect, useState } from "react";
import API from "@/api/axios";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function AttendanceHistory() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/attendance/my");
        setRecords(res.data);
      } catch (err) {
        console.error("Error loading attendance:", err);
      }
    })();
  }, []);

  const exportCSV = () => {
    if (!records || records.length === 0) return;
    const headers = ["Date", "Type", "Status", "Reason"];
    const rows = records.map((r) => [
      new Date(r.createdAt).toLocaleString(),
      r.type,
      r.attended,
      r.reason || "",
    ]);
    const csvContent =
      [headers, ...rows]
        .map((row) =>
          row
            .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\r\n") + "\r\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "attendance.csv");
  };

  const exportXLSX = () => {
    if (!records || records.length === 0) return;
    const data = records.map((r) => ({
      Date: new Date(r.createdAt).toLocaleString(),
      Type: r.type,
      Status: r.attended,
      Reason: r.reason || "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "attendance.xlsx");
  };

  const exportPDF = () => {
    if (!records || records.length === 0) return;
    const doc = new jsPDF();
    const rows = records.map((r) => [
      new Date(r.createdAt).toLocaleString(),
      r.type,
      r.attended,
      r.reason || "-",
    ]);
    doc.autoTable({
      head: [["Date", "Type", "Status", "Reason"]],
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [63, 81, 181] },
      margin: { top: 10 },
    });
    doc.save("attendance.pdf");
  };

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-4">
        <button
          onClick={exportCSV}
          className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Export CSV
        </button>
        <button
          onClick={exportXLSX}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Export Excel
        </button>
        <button
          onClick={exportPDF}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Export PDF
        </button>
      </div>

      {records.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No attendance records yet.</p>
      ) : (
        <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Reason</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b hover:bg-indigo-50 transition-all">
                <td className="p-3">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="p-3">{r.type}</td>
                <td
                  className={`p-3 font-semibold ${
                    r.attended === "Yes" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {r.attended}
                </td>
                <td className="p-3">{r.reason || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}