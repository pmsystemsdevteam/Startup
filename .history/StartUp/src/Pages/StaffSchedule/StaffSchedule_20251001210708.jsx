import React, { useState, useEffect } from "react";
import "./StaffSchedule.scss";
import { IoArrowBackSharp, IoArrowForwardSharp } from "react-icons/io5";
import axios from "axios";
import dayjs from "dayjs";

function StaffSchedule() {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState({}); // id → user məlumatı
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // 🔹 Tək user fetch
  const fetchUser = async (id) => {
    try {
      if (users[id]) return; // artıq var
      const token = localStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE_URL}/api/users/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => ({ ...prev, [id]: res.data }));
    } catch (err) {
      console.error("User fetch error:", err);
    }
  };

  // 🔹 Formları fetch et
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const userId = localStorage.getItem("user_id");
        if (!token || !userId) return;

        const res = await axios.get(`${API_BASE_URL}/api/hr/forms/my_requests/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userForms = res.data.filter(
          (f) => f.user && f.user.id === parseInt(userId)
        );
        setData(userForms);
        console.log("userForms:", userForms);

        // 🔹 Bütün accept_person_detail id-ləri topla
        const allIds = [
          ...new Set(
            userForms.flatMap(
              (form) => (form.accept_person_detail || []).map((p) => p.id) // <-- burda .id əlavə elə
            )
          ),
        ];
        // 🔹 Onları fetch et
        allIds.forEach((id) => fetchUser(id));
      } catch (err) {
        console.error("API error:", err.response?.data || err.message);
      }
    };
    fetchData();
  }, []);

  // Pagination
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;

  const getStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "status approved";
      case "rejected":
        return "status rejected";
      case "pending":
        return "status pending";
      default:
        return "status";
    }
  };
  const reversedData = [...data].reverse();

  // pagination hesablanması
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentData = reversedData.slice(indexOfFirst, indexOfLast);
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= Math.min(3, totalPages); i++) {
      pages.push(
        <span
          key={i}
          className={currentPage === i ? "active" : ""}
          onClick={() => goToPage(i)}
        >
          {i.toString().padStart(2, "0")}
        </span>
      );
    }
    if (totalPages > 4) {
      pages.push(<span key="dots">...</span>);
      pages.push(
        <span
          key={totalPages}
          className={currentPage === totalPages ? "active" : ""}
          onClick={() => goToPage(totalPages)}
        >
          {totalPages.toString().padStart(2, "0")}
        </span>
      );
    }
    return pages;
  };

  return (
    <div className="staffSchedule">
      <table>
        <thead>
          <tr>
            <th>Ərizə növü</th>
            <th>Sənəd nömrəsi</th>
            <th>Təsdiqləyici</th>
            <th>Rədd səbəbi</th>
            <th>İcazə müddəti</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((row, i) => (
              <tr key={i}>
                <td>{row.documentType}</td>
                <td>{row.document_number}</td>
                <td>
                  <div style={{ width: "130px" }}>
                    {row?.accept_person_detail
                      ?.map((p) => `${p.first_name} ${p.last_name}`)
                      .join(", ")}
                  </div>
                </td>
                <td>
                  {row.status === "rejected"
                    ? row.approvals?.find((a) => a.status === "rejected")
                        ?.reason || "—"
                    : "—"}
                </td>
                <td>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {dayjs(row.date_start).format("DD.MM.YYYY")} –{" "}
                    {dayjs(row.date_end).format("DD.MM.YYYY")}
                  </div>
                  {row.time_start && row.time_end && (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      ({row.time_start.slice(0, 5)} – {row.time_end.slice(0, 5)}
                      )
                    </div>
                  )}
                </td>
                <td>
                  <span className={getStatusClass(row.status)}>
                    {row?.status === "approved"
                      ? "Təsdiq"
                      : row?.status === "rejected"
                      ? "Rədd"
                      : "Gözləmə"}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                Heç bir məlumat tapılmadı
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ color: "#94A3AC" }}
          >
            <IoArrowBackSharp /> Əvvəl
          </button>
          <div className="pages">{renderPagination()}</div>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sonra <IoArrowForwardSharp />
          </button>
        </div>
      )}
    </div>
  );
}

export default StaffSchedule;
