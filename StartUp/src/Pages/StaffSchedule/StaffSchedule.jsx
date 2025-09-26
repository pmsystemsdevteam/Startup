import React, { useState } from "react";
import "./StaffSchedule.scss";
import { IoArrowBackSharp, IoArrowForwardSharp } from "react-icons/io5";

function StaffSchedule() {
  const data = [
    {
      nov: "Məzuniyyət",
      sened: "1234A56",
      tesdiqleyici: "HR Meneceri",
      sebeb: "Bu həftə task çox olduğuna görə",
      muddet: "19.05.2025\n11.06.2025",
      status: "Təsdiq",
    },
    {
      nov: "Xəstəlik",
      sened: "1234A56",
      tesdiqleyici: "Direktor",
      sebeb: "-------",
      muddet: "19.05.2025 (10:00–12:00)",
      status: "Rədd edildi",
    },
    {
      nov: "Ezamiyyət",
      sened: "1234A56",
      tesdiqleyici: "Team Lead",
      sebeb: "-------",
      muddet: "19.05.2025 (10:00–12:00)",
      status: "Gözləmədə",
    },
    {
      nov: "Məcburi səbəb",
      sened: "1234A56",
      tesdiqleyici: "Lead Service",
      sebeb: "Fərhad bəy məzuniyyətdədir.",
      muddet: "19.05.2025 (10:00–12:00)",
      status: "Rədd edildi",
    },
    {
      nov: "Digər",
      sened: "1234A56",
      tesdiqleyici: "HR Meneceri",
      sebeb: "-------",
      muddet: "19.05.2025\n11.06.2025",
      status: "Təsdiq",
    },
    {
      nov: "Məzuniyyət",
      sened: "1234A56",
      tesdiqleyici: "Lead Service",
      sebeb: "Aytac xanım əvəzlənməlidir.",
      muddet: "19.05.2025",
      status: "Rədd edildi",
    },
    // test üçün əlavə
    {
      nov: "Xəstəlik",
      sened: "999",
      tesdiqleyici: "Direktor",
      sebeb: "---",
      muddet: "20.05.2025",
      status: "Təsdiq",
    },
    {
      nov: "Ezamiyyət",
      sened: "888",
      tesdiqleyici: "Team Lead",
      sebeb: "---",
      muddet: "21.05.2025",
      status: "Gözləmədə",
    },
    {
      nov: "Digər",
      sened: "777",
      tesdiqleyici: "HR Meneceri",
      sebeb: "---",
      muddet: "22.05.2025",
      status: "Rədd edildi",
    },
    {
      nov: "Məzuniyyət",
      sened: "666",
      tesdiqleyici: "Lead Service",
      sebeb: "---",
      muddet: "23.05.2025",
      status: "Təsdiq",
    },
    {
      nov: "Xəstəlik",
      sened: "999",
      tesdiqleyici: "Direktor",
      sebeb: "---",
      muddet: "20.05.2025",
      status: "Təsdiq",
    },
    {
      nov: "Ezamiyyət",
      sened: "888",
      tesdiqleyici: "Team Lead",
      sebeb: "---",
      muddet: "21.05.2025",
      status: "Gözləmədə",
    },
    {
      nov: "Digər",
      sened: "777",
      tesdiqleyici: "HR Meneceri",
      sebeb: "---",
      muddet: "22.05.2025",
      status: "Rədd edildi",
    },
    {
      nov: "Məzuniyyət",
      sened: "666",
      tesdiqleyici: "Lead Service",
      sebeb: "---",
      muddet: "23.05.2025",
      status: "Təsdiq",
    },
    {
      nov: "Xəstəlik",
      sened: "999",
      tesdiqleyici: "Direktor",
      sebeb: "---",
      muddet: "20.05.2025",
      status: "Təsdiq",
    },
    {
      nov: "Ezamiyyət",
      sened: "888",
      tesdiqleyici: "Team Lead",
      sebeb: "---",
      muddet: "21.05.2025",
      status: "Gözləmədə",
    },
    {
      nov: "Digər",
      sened: "777",
      tesdiqleyici: "HR Meneceri",
      sebeb: "---",
      muddet: "22.05.2025",
      status: "Rədd edildi",
    },
    {
      nov: "Məzuniyyət",
      sened: "666",
      tesdiqleyici: "Lead Service",
      sebeb: "---",
      muddet: "23.05.2025",
      status: "Təsdiq",
    },
  ];

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = data.slice(startIndex, startIndex + rowsPerPage);

  const getStatusClass = (status) => {
    switch (status) {
      case "Təsdiq":
        return "status approved";
      case "Rədd edildi":
        return "status rejected";
      case "Gözləmədə":
        return "status pending";
      default:
        return "status";
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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
          {currentData.map((row, i) => (
            <tr key={i}>
              <td>{row.nov}</td>
              <td>{row.sened}</td>
              <td>{row.tesdiqleyici}</td>
              <td>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <p style={{ width: "130px" }}>{row.sebeb}</p>
                </div>
              </td>
              <td>
                {row.muddet.split("\n").map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </td>
              <td>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <span className={getStatusClass(row.status)}>
                    {row.status}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
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
    </div>
  );
}

export default StaffSchedule;
