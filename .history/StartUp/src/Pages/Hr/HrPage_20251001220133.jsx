import React, { useState, useEffect } from "react";
import "./HrPage.scss";
import { IoArrowBackSharp, IoArrowForwardSharp } from "react-icons/io5";
import { IoIosArrowRoundUp } from "react-icons/io";
import { MdKeyboardArrowDown } from "react-icons/md";
import { IoMdCheckmark } from "react-icons/io";
import { Link } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

function HrPage() {
  const [data, setData] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const userId = localStorage.getItem("user_id");

        if (!token || !userId) {
          console.warn("Token və ya user_id tapılmadı!");
          return;
        }

        // 🔹 Əvvəl user-in məlumatını çəkirik
        const userRes = await axios.get(
          `${API_BASE_URL}/api/users/${userId}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const userCompany = userRes.data.company.companyName;

        // 🔹 Formları çəkirik
        const res = await axios.get(`${API_BASE_URL}/api/hr/forms/to_approve/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // 🔹 Yalnız həmin company-də olan user-lərin formaları qalsın
        const filtered = res.data.filter(
          (form) => form.user && form.user.company.companyName === userCompany
        );

        setData(filtered);
      } catch (err) {
        console.error("Error fetching HR forms:", err);
      }
    };

    fetchData();
  }, []);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = data.slice(startIndex, startIndex + rowsPerPage);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleItemClick = (id) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Təsdiq":
      case "approved":
        return "status approved";
      case "Rədd edildi":
      case "rejected":
        return "status rejected";
      case "Gözləmədə":
      case "pending":
      default:
        return "status pending";
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

  // ✅ documentType tərcümə map
  const translateType = (type) => {
    const map = {
      vacation: "Məzuniyyət",
      business_trip: "Ezamiyyət",
      illness: "Xəstəlik",
      other: "Digər",
      shinda: "Şinda",
    };
    return map[type] || type;
  };

  return (
    <div className="hrPage">
      <table>
        <thead>
          <tr>
            <th>Ad Soyad</th>
            <th>Ərizə növü</th>
            <th>Sənəd nömrəsi</th>
            <th>Şöbə</th>
            <th>Vəzifə</th>
            <th>Qalıq icazə günü</th>
            <th>İcazə müddəti</th>
            <th>Açıqlama</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((row) => {
            // ✅ Əsas istifadəçi (formun sahibi)
            const user = row.user || {};
            const fullName = `${user.first_name || ""} ${user.last_name || ""}`;
            const department = user.department || "—";
            const jobname = user.jobname || "—";
            const permissionDay = user.permission_day || 0;

            return (
              <tr key={row.id}>
                <td>{fullName.trim() || "—"}</td>
                <td>{translateType(row.documentType)}</td>
                <td>{row.document_number}</td>
                <td>{department}</td>
                <td>{jobname}</td>
                <td>{permissionDay}</td>
                <td>
                  <div>
                    {dayjs(row.date_start).format("DD.MM.YYYY")} -{" "}
                    {dayjs(row.date_end).format("DD.MM.YYYY")}
                  </div>
                  {row.time_start && row.time_end && (
                    <div>
                      ({row.time_start && row.time_start.slice(0, 5)} –{" "}
                      {row.time_end && row.time_end.slice(0, 5)})
                    </div>
                  )}
                </td>
                <td>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <p style={{ width: "130px" }}>{row.description || "—"}</p>
                  </div>
                </td>
                <td>
                  <Link
                    style={{ textDecoration: "none" }}
                    to={`/hr/permission-info-detail/${row.id}`}
                    className="statusBox"
                  >
                    <span className={getStatusClass(row.status || "pending")}>
                      {row?.status === "approved"
                        ? "Təsdiq "
                        : row?.status === "rejected"
                        ? "Rədd "
                        : "Gözləmə"}
                      <div className="icon">
                        <IoIosArrowRoundUp />
                      </div>
                    </span>
                  </Link>
                </td>
              </tr>
            );
          })}
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

export default HrPage;
