import React, { useState } from "react";
import "./LeadSchedule.scss";
import { IoArrowBackSharp, IoArrowForwardSharp } from "react-icons/io5";
import { IoIosArrowRoundUp } from "react-icons/io";
import { MdKeyboardArrowDown } from "react-icons/md";
import { IoMdCheckmark } from "react-icons/io";

function LeadSchedule() {
  const data = [
    {
      ad: "Əli İsmail",
      nov: "Məzuniyyət",
      sened: "1234A56",
      soba: "İT Dev Team",
      vezife: "Front-end Developer",
      qaligGun: 23,
      muddet: "19.05.2025\n11.06.2025",
      sebeb: "-------",
      status: "Gözləmədə",
    },
    {
      ad: "Aytac Məhərrəmova",
      nov: "Xəstəlik",
      sened: "1234A56",
      soba: "İT Dev Team",
      vezife: "UX/UI Dizayner",
      qaligGun: 12,
      muddet: "19.05.2025 (10:00–12:00)",
      sebeb: "Bu həftə task çox olduğuna görə",
      status: "Rədd edildi",
    },
    {
      ad: "Ferhad Sultanov",
      nov: "Məcburi səbəb",
      sened: "1234A56",
      soba: "İT Dev Team",
      vezife: "Front-end Developer",
      qaligGun: 14,
      muddet: "19.05.2025 (10:00–12:00)",
      sebeb: "Ferhad bəy məzuniyyətdədir.",
      status: "Rədd edildi",
    },
    {
      ad: "Rəşad Səmədli",
      nov: "Digər",
      sened: "1234A56",
      soba: "İT Dev Team",
      vezife: "UX/UI Dizayner",
      qaligGun: 30,
      muddet: "19.05.2025\n11.06.2025",
      sebeb: "-------",
      status: "Gözləmədə",
    },
    {
      ad: "Həsən Rzayev",
      nov: "Məzuniyyət",
      sened: "1234A56",
      soba: "İT Dev Team",
      vezife: "Back-end Developer",
      qaligGun: 10,
      muddet: "19.05.2025 (10:00–12:00)",
      sebeb: "Aytac xanım əvəzlənməlidir.",
      status: "Rədd edildi",
    },
    {
      ad: "Həsən Rzayev",
      nov: "Məzuniyyət",
      sened: "1234A56",
      soba: "İT Dev Team",
      vezife: "Back-end Developer",
      qaligGun: 10,
      muddet: "19.05.2025  11.06.2025",
      sebeb: "-------",
      status: "Təsdiq",
    },
  ];

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = data.slice(startIndex, startIndex + rowsPerPage);

  // Submenu açılıb/bağlanma state
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  // Submenu seçimləri id-yə görə
  const [selectedItems, setSelectedItems] = useState({});

  const handleItemClick = (id) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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
    <div className="leadPage">
      <table>
        <thead>
          <tr>
            <th>
              <div className="menu" onClick={() => toggleMenu("ad")}>
                Ad Soyad{" "}
                <div className="icon">
                  <MdKeyboardArrowDown />
                </div>
              </div>
            </th>
            <th>
              <div className="menu" onClick={() => toggleMenu("nov")}>
                Ərizə növü{" "}
                <div className="icon">
                  <MdKeyboardArrowDown />
                </div>
                {openMenu === "nov" && (
                  <div className="submenu">
                    <ul>
                      {[
                        { id: 1, name: "Məzuniyyət" },
                        { id: 2, name: "Xəstəlik" },
                        { id: 3, name: "Ezamiyyət" },
                        { id: 4, name: "Məcburi səbəb" },
                      ].map((item) => (
                        <li
                          key={item.id}
                          className={selectedItems[item.id] ? "onclick" : ""}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick(item.id);
                          }}
                        >
                          <p>{item.name}</p>
                          <div
                            className={`square ${
                              selectedItems[item.id] ? "onclickBox" : ""
                            }`}
                          >
                            {selectedItems[item.id] && <IoMdCheckmark />}
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
                Şöbə{" "}
                <div className="icon">
                  <MdKeyboardArrowDown />
                </div>
                {openMenu === "soba" && (
                  <div className="submenu">
                    <ul>
                      {[
                        { id: 5, name: "İT Dev Team" },
                        { id: 6, name: "HR" },
                        { id: 7, name: "Maliyyə" },
                      ].map((item) => (
                        <li
                          key={item.id}
                          className={selectedItems[item.id] ? "onclick" : ""}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick(item.id);
                          }}
                        >
                          <p>{item.name}</p>
                          <div
                            className={`square ${
                              selectedItems[item.id] ? "onclickBox" : ""
                            }`}
                          >
                            {selectedItems[item.id] && <IoMdCheckmark />}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </th>
            <th>
              <div className="menu" onClick={() => toggleMenu("vezife")}>
                Vəzifə{" "}
                <div className="icon">
                  <MdKeyboardArrowDown />
                </div>
                {openMenu === "vezife" && (
                  <div className="submenu">
                    <ul>
                      {[
                        { id: 9, name: "Front-end Developer" },
                        { id: 10, name: "Back-end Developer" },
                        { id: 11, name: "UX/UI Dizayner" },
                      ].map((item) => (
                        <li
                          key={item.id}
                          className={selectedItems[item.id] ? "onclick" : ""}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick(item.id);
                          }}
                        >
                          <p>{item.name}</p>
                          <div
                            className={`square ${
                              selectedItems[item.id] ? "onclickBox" : ""
                            }`}
                          >
                            {selectedItems[item.id] && <IoMdCheckmark />}
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
              <div className="menu" onClick={() => toggleMenu("status")}>
                Status{" "}
                <div className="icon">
                  <MdKeyboardArrowDown />
                </div>
                {openMenu === "status" && (
                  <div className="submenu">
                    <ul>
                      {[
                        { id: 9, name: "Təsdiq" },
                        { id: 10, name: "Rədd edildi" },
                        { id: 11, name: "Gözləmədə" },
                      ].map((item) => (
                        <li
                          key={item.id}
                          className={selectedItems[item.id] ? "onclick" : ""}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick(item.id);
                          }}
                        >
                          <p>{item.name}</p>
                          <div
                            className={`square ${
                              selectedItems[item.id] ? "onclickBox" : ""
                            }`}
                          >
                            {selectedItems[item.id] && <IoMdCheckmark />}
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
              <td>{row.ad}</td>
              <td>{row.nov}</td>
              <td>{row.sened}</td>
              <td>{row.soba}</td>
              <td>{row.vezife}</td>
              <td>{row.qaligGun}</td>
              <td>
                {row.muddet.split("\n").map((line, idx) => (
                  <div className="time" key={idx}>
                    <p>{line}</p>
                  </div>
                ))}
              </td>
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
                <div className="statusBox">
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

export default LeadSchedule;
