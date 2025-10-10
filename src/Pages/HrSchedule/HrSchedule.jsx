import React, { useEffect, useState } from "react";
import "./HrSchedule.scss";
import { IoArrowBackSharp, IoArrowForwardSharp } from "react-icons/io5";
import { MdKeyboardArrowDown } from "react-icons/md";
import { IoMdCheckmark } from "react-icons/io";
import axios from "axios";
import dayjs from "dayjs";

function HrSchedule() {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const rowsPerPage = 6;

  // ✅ forms API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/hr/forms/my_requests/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setData(res.data);
      } catch (error) {
        console.error("Forms fetch error:", error);
      }
    };
    fetchData();
  }, []);

  // ✅ users API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(`${API_BASE_URL}/api/users/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Users fetch error:", err);
      }
    };
    fetchUsers();
  }, []);

  // Users-i qruplaşdırırıq (A-Z)
  const groupedUsers = users.reduce((acc, user) => {
    const fullName = `${user.first_name} ${user.last_name}`;
    const firstLetter = fullName.charAt(0).toUpperCase();

    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push({ id: user.id, info: fullName });

    return acc;
  }, {});

  const name = Object.keys(groupedUsers)
    .sort()
    .map((letter) => ({
      letter,
      names: groupedUsers[letter],
    }));

  // ✅ Filtrlər
  const [filters, setFilters] = useState({
    fullName: null,
    documentType: null,
    department: null,
    jobname: null,
    status: null,
  });

  const handleFilterClick = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value, // eyni seçilsə silinsin
    }));
    setOpenMenu(null);
  };

  // ✅ Filter olunmuş data
  const filteredData = data.filter((row) => {
    let matches = true;

    const fullName = `${row.user?.first_name || ""} ${
      row.user?.last_name || ""
    }`;

    if (filters.fullName && fullName !== filters.fullName) matches = false;
    if (filters.documentType && row.documentType !== filters.documentType)
      matches = false;
    if (filters.department && row.user?.department !== filters.department)
      matches = false;
    if (filters.jobname && row.user?.jobname !== filters.jobname)
      matches = false;
    if (filters.status && row.status !== filters.status) matches = false;

    return matches;
  });

  // ✅ Pagination filteredData ilə
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "status approved";
      case "rejected":
        return "status rejected";
      default:
        return "status pending";
    }
  };

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
    <div className="leadPage">
      <table>
        <thead>
          <tr>
            {/* Ad Soyad */}
            <th>
              <div className="menu" onClick={() => toggleMenu("ad")}>
                Ad Soyad
                <div className="icon">
                  <MdKeyboardArrowDown />
                </div>
                {openMenu === "ad" && (
                  <div className="submenu">
                    {name.map((group) => (
                      <div key={group.letter}>
                        <div
                          className="group-header"
                          style={{
                            width: "10px",
                            fontWeight: 600,
                            color: "#b1b5c3",
                            margin: "5px 0",
                            borderRadius: "4px",
                          }}
                        >
                          {group.letter}
                        </div>
                        <ul>
                          {group.names.map((item) => (
                            <li
                              key={item.id}
                              className={
                                filters.fullName === item.info ? "onclick" : ""
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFilterClick("fullName", item.info);
                              }}
                            >
                              <p>{item.info}</p>
                              <div
                                className={`square ${
                                  filters.fullName === item.info
                                    ? "onclickBox"
                                    : ""
                                }`}
                              >
                                {filters.fullName === item.info && (
                                  <IoMdCheckmark />
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </th>

            <th>
              {" "}
              <div className="menu" onClick={() => toggleMenu("nov")}>
                Ərizə növü
                <div className="icon">
                  <MdKeyboardArrowDown />
                </div>
                {openMenu === "nov" && (
                  <div className="submenu">
                    <ul>
                      {[
                        "Məzuniyyət",
                        "Xəstəlik",
                        "Ezamiyyət",
                        "Məcburi səbəb",
                      ].map((type, idx) => (
                        <li
                          key={idx}
                          className={
                            filters.documentType === type ? "onclick" : ""
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFilterClick("documentType", type);
                          }}
                        >
                          <p>{type}</p>
                          <div
                            className={`square ${
                              filters.documentType === type ? "onclickBox" : ""
                            }`}
                          >
                            {filters.documentType === type && <IoMdCheckmark />}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </th>
            <th>Sənəd nömrəsi</th>
            <th>
              <div className="menu" onClick={() => toggleMenu("soba")}>
                Şöbə
                <div className="icon">
                  <MdKeyboardArrowDown />
                </div>
                {openMenu === "soba" && (
                  <div className="submenu">
                    <ul>
                      {Array.from(
                        new Set(data.map((r) => r.user?.department))
                      ).map((dep, idx) => (
                        <li
                          key={idx}
                          className={
                            filters.department === dep ? "onclick" : ""
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFilterClick("department", dep);
                          }}
                        >
                          <p>{dep}</p>
                          <div
                            className={`square ${
                              filters.department === dep ? "onclickBox" : ""
                            }`}
                          >
                            {filters.department === dep && <IoMdCheckmark />}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </th>
            <th>
              {" "}
              <div className="menu" onClick={() => toggleMenu("vezife")}>
                Vəzifə
                <div className="icon">
                  <MdKeyboardArrowDown />
                </div>
                {openMenu === "vezife" && (
                  <div className="submenu">
                    <ul>
                      {Array.from(
                        new Set(data.map((r) => r.user?.jobname))
                      ).map((job, idx) => (
                        <li
                          key={idx}
                          className={filters.jobname === job ? "onclick" : ""}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFilterClick("jobname", job);
                          }}
                        >
                          <p>{job}</p>
                          <div
                            className={`square ${
                              filters.jobname === job ? "onclickBox" : ""
                            }`}
                          >
                            {filters.jobname === job && <IoMdCheckmark />}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </th>
            <th>Qalıq icazə günü</th>
            <th>İcazə müddəti</th>
            <th>Rədd səbəbi</th>
            <th>
              {" "}
              <div className="menu" onClick={() => toggleMenu("status")}>
                Status
                <div className="icon">
                  <MdKeyboardArrowDown />
                </div>
                {openMenu === "status" && (
                  <div className="submenu">
                    <ul>
                      {[
                        { value: "approved", label: "Gözləmə" },
                        { value: "rejected", label: "Rədd" },
                        { value: "pending", label: "Gözləmə" },
                      ].map((item, idx) => (
                        <li
                          key={idx}
                          className={
                            filters.status === item.value ? "onclick" : ""
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFilterClick("status", item.value);
                          }}
                        >
                          <p>{item.label}</p>{" "}
                          {/* İstifadəçiyə göstərilən hissə */}
                          <div
                            className={`square ${
                              filters.status === item.value ? "onclickBox" : ""
                            }`}
                          >
                            {filters.status === item.value && <IoMdCheckmark />}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {currentData.map((row, i) => (
            <tr key={i}>
              <td>
                {row?.user?.first_name} {row?.user?.last_name}
              </td>
              <td>{row?.documentType || "--"}</td>
              <td>{row?.document_number || "--"}</td>
              <td>{row?.user?.department || "--"}</td>
              <td>{row?.user?.jobname || "--"}</td>
              <td>{row?.user?.permission_day || "--"}</td>
              <td>
                <div>
                  {row?.date_start &&
                    dayjs(row.date_start).format("DD.MM.YYYY")}{" "}
                  - {row?.date_end && dayjs(row.date_end).format("DD.MM.YYYY")}
                </div>
                {row?.time_start && row?.time_end && (
                  <div>
                    ({row.time_start.slice(0, 5)} – {row.time_end.slice(0, 5)})
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
                  <p style={{ width: "130px" }}>{row?.description || "--"}</p>
                </div>
              </td>
              <td>
                <div className="statusBox">
                  <span className={getStatusClass(row.status)}>
                    {row?.status === "approved"
                      ? "Təsdiq"
                      : row?.status === "rejected"
                      ? "Rədd"
                      : "Gözləmə"}
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

export default HrSchedule;
