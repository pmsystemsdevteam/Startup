import "./LeadRequest.scss";
import { IoCalendarClearOutline } from "react-icons/io5";
import dayjs from "dayjs";
import "dayjs/locale/az";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { BsDownload } from "react-icons/bs";
import React, { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { IoMdCheckmark } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { IoCheckmark } from "react-icons/io5";
import { AiOutlineExclamation } from "react-icons/ai";
import Back from "../../Video/back.gif";
import api, { isAuthenticated, getUserId, logout } from "../../api";

function LeadRequest({ multiple = true, onSelect }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState({
    requestType: true,
    priority: true,
    calendar: true,
    deadline: true,
  });

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  async function fetchUserData(userId) {
    try {
      const res = await api.get(`/api/users/${userId}/`, {});
      setUserData(res.data);
      return res.data;
    } catch (err) {
      console.error("Employee fetch error:", err);
      setError("Məlumat alına bilmədi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    const userId = getUserId();
    if (!userId) {
      logout();
      navigate("/login");
      return;
    }
    fetchUserData(userId);
  }, [navigate]);

  const [popup, setPopup] = useState(null);
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);
  const [requestTitle, setRequestTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState("Müraciət növü seçin");
  const [selectedPriority, setSelectedPriority] = useState("Prioritet seçin");
  const [date, setDate] = useState(dayjs());
  const [deadlineDate, setDeadlineDate] = useState("");
  const [assignedPeople, setAssignedPeople] = useState([]);
  const [selectedAssigned, setSelectedAssigned] = useState([]);

  dayjs.locale("az");

  async function fetchTeamMembers(companyId, currentUserJobType) {
    try {
      const res = await api.get(`/api/users/`, {});

      let filtered = [];

      // Əgər login olan CEO-dursa, yalnız BOSS göstər
      if (currentUserJobType?.toLowerCase() === "ceo") {
        filtered = res.data
          .filter(
            (u) =>
            
              u.jobtype?.toLowerCase() === "boss"
          )
          .map((u) => ({
            id: u.id,
            name: `${u.first_name} ${u.last_name}`,
            jobname: u.jobname,
            jobtype: u.jobtype,
          }));
      }
      // Əgər login olan CEO deyilsə, yalnız CEO göstər
      else {
        filtered = res.data
          .filter(
            (u) =>
              u.company?.id === companyId &&
              u.jobtype?.toLowerCase() === "ceo"
          )
          .map((u) => ({
            id: u.id,
            name: `${u.first_name} ${u.last_name}`,
            jobname: u.jobname,
            jobtype: u.jobtype,
          }));
      }

      setAssignedPeople(filtered);
    } catch (err) {
      console.error("Team members fetch error:", err);
    }
  }

  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      fetchUserData(userId).then((data) => {
        if (data?.company?.id && data?.jobtype) {
          fetchTeamMembers(data.company.id, data.jobtype);
        }
      });
    }
  }, [navigate]);

  const toggleAssigned = (id) => {
    setSelectedAssigned((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        return prev.filter((personId) => personId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const getSelectedAssignedNames = () => {
    return selectedAssigned
      .map((id) => {
        const person = assignedPeople.find((p) => p.id === id);
        return person ? person.name : null;
      })
      .filter(Boolean)
      .join(", ");
  };

  const isPersonAssigned = (id) => selectedAssigned.includes(id);

  const openPicker = () => inputRef.current?.click();
  const handleChange = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles(picked);
    onSelect?.(picked);
  };
  const toggle = (id) => setOpen((p) => ({ ...p, [id]: !p[id] }));

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setOpen((p) => ({ ...p, requestType: false }));
  };

  const handlePrioritySelect = (priority) => {
    setSelectedPriority(priority);
    setOpen((p) => ({ ...p, priority: false }));
  };

  const handleSubmit = async () => {
    const errors = [];

    if (!requestTitle.trim()) {
      errors.push("• Müraciət başlığı daxil edilməyib.");
    }

    if (selectedType === "Müraciət növü seçin") {
      errors.push("• Müraciət növü seçilməyib.");
    }

    if (selectedPriority === "Prioritet seçin") {
      errors.push("• Prioritet seçilməyib.");
    }

    if (!date) {
      errors.push("• Müraciət tarixi seçilməyib.");
    }

    if (!deadlineDate) {
      errors.push("• Son tarix daxil edilməyib.");
    }

    if (!description.trim()) {
      errors.push("• Açıqlama sahəsi boş buraxıla bilməz.");
    }

    if (selectedAssigned.length === 0) {
      errors.push("• Təsdiq edəcək şəxs seçilməyib.");
    }

    if (errors.length > 0) {
      alert("Formu göndərmək üçün xətaları düzəldin:\n\n" + errors.join("\n"));
      return;
    }

    setSubmitLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", requestTitle);
      formData.append("requestType", selectedType);
      formData.append("priority", selectedPriority);
      formData.append("request_date", date ? date.format("YYYY-MM-DD") : "");
      formData.append(
        "deadline_date",
        deadlineDate ? deadlineDate.split(".").reverse().join("-") : ""
      );
      formData.append("description", description);

      selectedAssigned.forEach((id) => {
        formData.append("assigned_to", id);
      });

      files.forEach((file) => {
        formData.append("document", file);
      });

      const res = await api.post(`/api/lead/requests/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPopup("approve");
      setTimeout(() => {
        navigate("/lead/request-history");
      }, 2000);
    } catch (err) {
      console.error("Form submit error:", err.response?.data || err);
      setPopup("cancel");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="loader"></div>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <section id="staffPage">
      {submitLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9998,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div className="loader" style={{ position: "relative" }}></div>
        </div>
      )}

      <h1>Rəhbər Müraciət Formu</h1>

      <div
        className={`popUp ${popup ? "open" : ""}`}
        onClick={() => setPopup(null)}
      >
        <div className="button">
          <div
            className="icon"
            style={{
              color: popup === "approve" ? "#128c3c" : "#FF3D00",
              border:
                popup === "approve"
                  ? "1.5px solid #128c3c"
                  : "1.5px solid #FF3D00",
            }}
          >
            {popup === "approve" && <IoCheckmark />}
            {popup === "cancel" && <AiOutlineExclamation />}
          </div>
          {popup === "approve" && (
            <p style={{ color: "#128c3c" }}>Müraciət uğurla göndərildi</p>
          )}
          {popup === "cancel" && (
            <p style={{ color: "#FF3D00" }}>Müraciət ləğv edildi</p>
          )}
        </div>
      </div>

      <div className="restBalance">
        <h2>Aktiv tapşırıqlar:</h2>
        <div className="box" style={{ backgroundImage: `url(${Back})` }}>
          <div className="blur">
            <span>Cari tapşırıqlar</span>
            <p>{userData?.active_tasks ?? "0"}</p>
            <span>tapşırıq</span>
          </div>
        </div>
      </div>

      <div className="userInfo">
        <h2>Rəhbər məlumatları:</h2>
        <form>
          <div className="box">
            <label>Ad soyad</label>
            <p>
              {userData?.first_name || "—"} {userData?.last_name || "—"}
            </p>
          </div>
          <div className="box">
            <label>İşçi nömrəsi</label>
            <p>{userData?.staffnumber || "—"}</p>
          </div>
          <div className="box">
            <label>Vəzifə</label>
            <p>{userData?.jobname || "—"}</p>
          </div>
          <div className="box">
            <label>Şöbə</label>
            <p>{userData?.department || "—"}</p>
          </div>
        </form>
      </div>

      <div className="allowInfo">
        <h2>Müraciət məlumatı:</h2>
        <form>
          <div className="box">
            <label>Müraciət başlığı</label>
            <input
              type="text"
              placeholder="Müraciət başlığını daxil edin"
              value={requestTitle}
              onChange={(e) => setRequestTitle(e.target.value)}
              required
            />
          </div>

          <div
            className="box1 hasSubmenu"
            style={{ cursor: "pointer" }}
            onClick={() => toggle("requestType")}
          >
            <label>Müraciət növü</label>
            <div className={`icon ${open.requestType ? "" : "active"}`}>
              <MdOutlineKeyboardArrowDown />
            </div>
            <p>{selectedType}</p>
            <div
              className={`submenu1 ${open.requestType ? "open" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              <ul>
                {[
                  "Texniki dəstək",
                  "Layihə sorğusu",
                  "Resurs tələbi",
                  "Məlumat sorğusu",
                  "Problemin həlli",
                  "Digər",
                ].map((item, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      handleTypeSelect(item);
                      toggle("requestType");
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className="box2 hasSubmenu"
            style={{ cursor: "pointer" }}
            onClick={() => toggle("priority")}
          >
            <label>Prioritet</label>
            <div className={`icon ${open.priority ? "" : "active"}`}>
              <MdOutlineKeyboardArrowDown />
            </div>
            <p>{selectedPriority}</p>
            <div
              className={`submenu1 ${open.priority ? "open" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              <ul>
                {["Aşağı", "Orta", "Yüksək", "Kritik"].map((item, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      handlePrioritySelect(item);
                      toggle("priority");
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="box5">
            <label>Müraciət tarixi</label>
            <div className="icon" onClick={() => toggle("calendar")}>
              <IoCalendarClearOutline />
            </div>
            <div className={`datebox ${open.calendar ? "open" : ""}`}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="az"
              >
                <DateCalendar
                  value={date}
                  onChange={setDate}
                  views={["day"]}
                  sx={{
                    "& .MuiPickersDay-root": { borderRadius: "8px" },
                    "& .MuiPickersCalendarHeader-root": { mb: 1 },
                  }}
                />
              </LocalizationProvider>
            </div>
            <p>{date ? date.format("DD.MM.YYYY") : "—"}</p>
          </div>

          <div className="box4">
            <label>Son tarix</label>
            <input
              type="text"
              placeholder="dd.mm.yyyy"
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
              required
            />
          </div>

          <div className="box6">
            <label>Açıqlama</label>
            <textarea
              placeholder="Müraciət haqqında ətraflı məlumat..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
        </form>
      </div>

      <div className="documentSend">
        <h2>Qoşma sənədlər</h2>
        <div className="doxBox">
          <div className="icon">
            <BsDownload />
          </div>
          <p>Sənədləri seçin və ya buraya atın (pdf, Docx)</p>
          <Box className="fileItem">
            <Button
              variant="contained"
              onClick={openPicker}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Sənədləri seçin
            </Button>
            <input
              ref={inputRef}
              hidden
              type="file"
              multiple={multiple}
              onChange={handleChange}
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
            {files.length > 0 && (
              <Box mt={1}>
                {files.map((f, i) => (
                  <Typography key={i} variant="body2" component="div">
                    {f.name} — {(f.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        </div>
      </div>

      <div className="confirmBox">
        <h2>Təsdiq edəcək şəxs</h2>
        <div className="chosenPerson" onClick={() => toggle("deadline")}>
          <label>Təsdiq</label>
          <div className="icon">
            <MdOutlineKeyboardArrowDown />
          </div>
          <p>
            {selectedAssigned.length > 0
              ? getSelectedAssignedNames()
              : assignedPeople.length > 0
              ? "Təsdiq edəcək şəxsi seçin"
              : "Təsdiqləyici tapılmadı"}
          </p>
          <div
            className={`subMenu ${open.deadline ? "open" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            {assignedPeople.length > 0 ? (
              assignedPeople.map((person) => {
                const isSelected = isPersonAssigned(person.id);

                return (
                  <div
                    key={person.id}
                    className={`littleBox ${isSelected ? "onclick" : ""}`}
                    onClick={() => {
                      toggleAssigned(person.id);
                    }}
                  >
                    <div className={`square ${isSelected ? "onclickBox" : ""}`}>
                      {isSelected && <IoMdCheckmark />}
                    </div>
                    <span>
                      {person.name} — {person.jobname}
                    </span>
                  </div>
                );
              })
            ) : (
              <p style={{ padding: "10px", color: "#888" }}>
                Təsdiqləyici tapılmadı
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="summaryBox">
        <h2>Müraciətin xülasəsi</h2>
        <div className="info">
          <div className="little">
            <p>Ad, soyad:</p>
            <p>
              {userData?.first_name || "—"} {userData?.last_name || "—"}
            </p>
          </div>
          <div className="little">
            <p>Vəzifə:</p>
            <p>{userData?.jobname}</p>
          </div>
          <div className="little">
            <p>Müraciət başlığı:</p>
            <p>{requestTitle || "—"}</p>
          </div>
          <div className="little">
            <p>Müraciət növü:</p>
            <p>{selectedType}</p>
          </div>
          <div className="little">
            <p>Prioritet:</p>
            <p>{selectedPriority}</p>
          </div>
          <div className="little">
            <p>Müraciət tarixi:</p>
            <p>{date ? date.format("DD.MM.YYYY") : "—"}</p>
          </div>
          <div className="little">
            <p>Son tarix:</p>
            <p>{deadlineDate || "—"}</p>
          </div>
          <div className="little">
            <p>Yüklənmiş sənədlər:</p>
            <p
              style={{
                color: files.length > 0 ? "#128C3C" : "#f01717ff",
                fontWeight: "bold",
              }}
            >
              {files.length > 0 ? "Yüklənib" : "Yoxdur"}
            </p>
          </div>
          <div className="little">
            <p>Təsdiq edəcək şəxs:</p>
            <p style={{ fontWeight: "bold" }}>
              {selectedAssigned.length > 0
                ? selectedAssigned
                    .map((id) => {
                      const person = assignedPeople.find((p) => p.id === id);
                      return person ? person.name : null;
                    })
                    .filter(Boolean)
                    .join(", ")
                : "—"}
            </p>
          </div>
          <div className="buttons">
            <div className="button" onClick={() => setPopup("cancel")}>
              Sil
            </div>
            <div className="button" onClick={handleSubmit}>
              Göndər
            </div>
          </div>
          <div className="copy">
            © {new Date().getFullYear()}{" "}
            <Link
              to={"https://pmsystems.az/"}
              target="_blank"
              className="linkk"
            >
              PM Systems
            </Link>{" "}
            tərəfindən hazırlanmışdır.
          </div>
        </div>
      </div>
    </section>
  );
}

export default LeadRequest;
