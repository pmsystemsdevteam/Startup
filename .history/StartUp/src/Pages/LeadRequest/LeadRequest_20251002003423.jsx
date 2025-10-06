import "./StaffPage.scss";
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
    hourly: true,
    daily: true,
    calendar: true,
    timer: true,
    type: true,
  });

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

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
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [dailyStart, setDailyStart] = useState("");
  const [dailyEnd, setDailyEnd] = useState("");
  const [people, setPeople] = useState([]);
  const [description, setDescription] = useState("");
  const [selectedOrder, setSelectedOrder] = useState([]);

  async function fetchApprovers(companyId, currentUserJobType) {
    try {
      const res = await api.get(`/api/users/`, {});

      let filtered = [];

      // Əgər login olan CEO-dursa, yalnız BOSS göstərilsin
      if (currentUserJobType?.toLowerCase() === "ceo") {
        filtered = res.data
          .filter((u) => u.jobtype?.toLowerCase() === "boss")
          .map((u) => ({
            id: u.id,
            name: `${u.first_name} ${u.last_name}`,
            jobname: u.jobname,
            jobtype: u.jobtype,
          }));
      }
      // Əgər login olan CEO deyilsə, yalnız CEO göstərilsin
      else {
        filtered = res.data
          .filter(
            (u) =>
              u.company?.id === companyId && u.jobtype?.toLowerCase() === "ceo"
          )
          .map((u) => ({
            id: u.id,
            name: `${u.first_name} ${u.last_name}`,
            jobname: u.jobname,
            jobtype: u.jobtype,
          }));
      }

      setPeople(filtered);
    } catch (err) {
      console.error("Approvers fetch error:", err);
    }
  }

  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      fetchUserData(userId).then((data) => {
        if (data?.company?.id) {
          fetchApprovers(data.company.id, data.jobtype);
        }
      });
    }
  }, [navigate]);

  const toggleTick = (id) => {
    setSelectedOrder((prevOrder) => {
      const exists = prevOrder.includes(id);
      if (exists) {
        return prevOrder.filter((personId) => personId !== id);
      } else {
        return [...prevOrder, id];
      }
    });
  };

  const getSelectedPeopleNames = () => {
    return selectedOrder
      .map((id) => {
        const person = people.find((p) => p.id === id);
        return person ? person.name : null;
      })
      .filter(Boolean)
      .join(", ");
  };

  const isPersonSelected = (id) => selectedOrder.includes(id);

  const getPersonOrderNumber = (id) => {
    const index = selectedOrder.indexOf(id);
    return index !== -1 ? index + 1 : null;
  };

  const openPicker = () => inputRef.current?.click();
  const handleChange = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles(picked);
    onSelect?.(picked);
  };
  const toggle = (id) => setOpen((p) => ({ ...p, [id]: !p[id] }));

  const [date, setDate] = useState(dayjs());
  dayjs.locale("az");

  const [selectedType, setSelectedType] = useState("Ərizə növü seçin");
  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setOpen((p) => ({ ...p, type: false }));
  };

  const handleSubmit = async () => {
    const errors = [];

    if (selectedType === "Ərizə növü seçin") {
      errors.push("• Ərizə növü seçilməyib.");
    }

    if (selectedType === "Saatlıq") {
      if (!startTime) errors.push("• Başlama vaxtı daxil edilməyib.");
      if (!endTime) errors.push("• Bitmə vaxtı daxil edilməyib.");
    }

    if (!dailyStart) {
      errors.push("• Başlama tarixi daxil edilməyib.");
    }
    if (!dailyEnd) {
      errors.push("• Bitmə tarixi daxil edilməyib.");
    }

    if (!date) {
      errors.push("• İşə çıxma tarixi seçilməyib.");
    }

    if (!description.trim()) {
      errors.push("• Açıqlama sahəsi boş buraxıla bilməz.");
    }

    if (files.length === 0) {
      errors.push("• Qoşma sənəd yüklənməyib.");
    }

    if (selectedOrder.length === 0) {
      errors.push("• Təsdiq edəcək şəxs seçilməyib.");
    }

    if (errors.length > 0) {
      alert("Formu göndərmək üçün xətaları düzəldin:\n\n" + errors.join("\n"));
      setSubmitLoading(false);
      return;
    }

    setSubmitLoading(true);

    try {
      const formData = new FormData();
      formData.append("documentType", selectedType || "");

      if (selectedType === "Saatlıq") {
        formData.append("time_start", startTime);
        formData.append("time_end", endTime);
      }

      formData.append(
        "date_start",
        dailyStart ? dailyStart.split(".").reverse().join("-") : ""
      );
      formData.append(
        "date_end",
        dailyEnd ? dailyEnd.split(".").reverse().join("-") : ""
      );
      formData.append("start_job_date", date ? date.format("YYYY-MM-DD") : "");
      formData.append(
        "calendar_count",
        dailyStart && dailyEnd
          ? Math.ceil(
              (new Date(dailyEnd.split(".").reverse().join("-")) -
                new Date(dailyStart.split(".").reverse().join("-"))) /
                (1000 * 60 * 60 * 24)
            )
          : 0
      );
      formData.append("document_number", "444");
      formData.append("description", description || "");
      selectedOrder.forEach((id) => {
        formData.append("accept_person", id);
      });
      files.forEach((file) => {
        formData.append("document", file);
      });

      const res = await api.post(`/api/hr/forms/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPopup("approve");
      setTimeout(() => {
        navigate("/staff/permission-history");
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

      <h1>İcazə tələb formu</h1>

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
            <p style={{ color: "#128c3c" }}>
              Müraciətlər təsdiqləyiciyə göndərildi
            </p>
          )}
          {popup === "cancel" && (
            <p style={{ color: "#FF3D00" }}>Müraciətlər ləğv edildi</p>
          )}
        </div>
      </div>

      <div className="restBalance">
        <h2>İllik məzuniyyət balansı:</h2>
        <div className="box" style={{ backgroundImage: `url(${Back})` }}>
          <div className="blur">
            <span>Qalıq icazə günləri</span>
            <p>{userData?.permission_day ?? "—"}</p>
            <span>gün qalıb</span>
          </div>
        </div>
      </div>

      <div className="userInfo">
        <h2>İstifadəçi məlumatları:</h2>
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
        <h2>Ərizə məlumatı:</h2>
        <form>
          <div
            className="box1 hasSubmenu"
            style={{ cursor: "pointer" }}
            onClick={() => toggle("type")}
          >
            <label>Ərizə növü</label>
            <div className={`icon ${open.type ? "" : "active"}`}>
              <MdOutlineKeyboardArrowDown />
            </div>
            <p>{selectedType}</p>
            <div
              className={`submenu1 ${open.type ? "open" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              <ul>
                {[
                  "Məzuniyyət",
                  "Saatlıq",
                  "Ezamiyyət",
                  "Xəstəlik məzuniyyəti",
                  "Ödənişsiz məzuniyyət",
                  "Təlim",
                ].map((item, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      handleTypeSelect(item);
                      toggle("type");
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="box2">
            <label>Sənəd nömrəsi</label>
            <p>{userData?.documents?.[0]?.doc_num || "—"}</p>
          </div>

          {selectedType === "Saatlıq" && (
            <div
              className="box3 hasSubmenu"
              style={{ cursor: "pointer" }}
              onClick={() => toggle("hourly")}
            >
              <label>Saatlıq</label>
              <div className={`icon ${open.hourly ? "" : "active"}`}>
                <MdOutlineKeyboardArrowDown />
              </div>
              <p>
                {startTime && endTime
                  ? `${startTime} - ${endTime}`
                  : "Başlama və bitmə vaxtını seçin"}
              </p>
              <div
                className={`submenu ${open.hourly ? "open" : ""}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="littleBox">
                  <label>Başlama vaxtı</label>
                  <input
                    type="text"
                    placeholder="15:30"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="littleBox">
                  <label>Bitmə vaxtı</label>
                  <input
                    type="text"
                    placeholder="16:30"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div
            className="box4 hasSubmenu"
            style={{ cursor: "pointer" }}
            onClick={() => toggle("daily")}
          >
            <label>Günlük və aylıq</label>
            <div className={`icon ${open.daily ? "" : "active"}`}>
              <MdOutlineKeyboardArrowDown />
            </div>
            <p>
              {dailyStart && dailyEnd
                ? `${dailyStart} - ${dailyEnd}`
                : "Başlama və bitmə tarixini seçin"}
            </p>
            <div
              className={`submenu ${open.daily ? "open" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="littleBox">
                <label>Başlama tarixi</label>
                <input
                  type="text"
                  placeholder="dd.mm.yyyy"
                  value={dailyStart}
                  onChange={(e) => setDailyStart(e.target.value)}
                  required
                />
              </div>
              <div className="littleBox">
                <label>Bitmə tarixi</label>
                <input
                  type="text"
                  placeholder="dd.mm.yyyy"
                  value={dailyEnd}
                  onChange={(e) => setDailyEnd(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="box5">
            <label>İşə çıxma tarixi</label>
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

          <div className="box">
            <label>Təqvim günü sayı</label>
            <p>
              {dailyStart && dailyEnd
                ? `${Math.ceil(
                    (new Date(dailyEnd.split(".").reverse().join("-")) -
                      new Date(dailyStart.split(".").reverse().join("-"))) /
                      (1000 * 60 * 60 * 24)
                  )} gün`
                : ""}
            </p>
          </div>

          <div className="box6">
            <label>Açıqlama</label>
            <textarea
              placeholder="İcazə səbəbi və əlavə məlumatlar....."
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
              required
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
        <h2>Təsdiq edəcək şəxslər</h2>
        <div className="chosenPerson" onClick={() => toggle("timer")}>
          <label>Təsdiq</label>
          <div className="icon">
            <MdOutlineKeyboardArrowDown />
          </div>
          <p>
            {selectedOrder.length > 0
              ? getSelectedPeopleNames()
              : people.length > 0
              ? "Təsdiq edəcək şəxsi seçin"
              : "Uyğun təsdiqləyici yoxdur"}
          </p>
          <div
            className={`subMenu ${open.timer ? "open" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            {people.length > 0 ? (
              people.map((person) => {
                const isSelected = isPersonSelected(person.id);
                const orderNum = getPersonOrderNumber(person.id);

                return (
                  <div
                    key={person.id}
                    className={`littleBox ${isSelected ? "onclick" : ""}`}
                    onClick={() => {
                      toggleTick(person.id);
                    }}
                  >
                    <div className={`square ${isSelected ? "onclickBox" : ""}`}>
                      {isSelected && <IoMdCheckmark />}
                    </div>
                    <span>
                      {person.name} — {person.jobname}
                      {orderNum && (
                        <span
                          style={{
                            marginLeft: "8px",
                            fontWeight: "bold",
                            color: "#128c3c",
                          }}
                        >
                          (Sıra: {orderNum})
                        </span>
                      )}
                    </span>
                  </div>
                );
              })
            ) : (
              <p style={{ padding: "10px", color: "#888" }}>
                Yüklənir və ya təsdiqləyici tapılmadı
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="summaryBox">
        <h2>Ərizənin xülasəsi</h2>
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
            <p>İcazə növü:</p>
            <p>{selectedType}</p>
          </div>
          <div className="little">
            <p>Başlama tarixi:</p>
            <p>
              {dailyStart || "—"} / {startTime || "—"}
            </p>
          </div>
          <div className="little">
            <p>Bitmə tarixi:</p>
            <p>
              {dailyEnd || "—"} / {endTime || "—"}
            </p>
          </div>
          <div className="little">
            <p>İşə çıxma tarixi:</p>
            <p>{date ? date.format("DD.MM.YYYY") : "—"}</p>
          </div>
          <div className="little">
            <p>Təqvim günü sayı:</p>
            <p>
              {dailyStart && dailyEnd
                ? `${Math.ceil(
                    (new Date(dailyEnd.split(".").reverse().join("-")) -
                      new Date(dailyStart.split(".").reverse().join("-"))) /
                      (1000 * 60 * 60 * 24)
                  )} gün`
                : "—"}
            </p>
          </div>
          <div className="little">
            <p>Sənəd nömrəsi:</p>
            <p>{userData?.document || "—"}</p>
          </div>
          <div className="little">
            <p>Şöbə:</p>
            <p>{userData?.department}</p>
          </div>
          <div className="little">
            <p>Yüklənmiş sənədlər:</p>
            <p
              style={{
                color:
                  files.length > 0 || userData?.documents?.length > 0
                    ? "#128C3C"
                    : "#f01717ff",
                fontWeight: "bold",
              }}
            >
              {files.length > 0 || userData?.documents?.length > 0
                ? "Yüklənib"
                : "Yoxdur"}
            </p>
          </div>
          <div className="little">
            <p>Təsdiq edəcək şəxslər:</p>
            <p style={{ fontWeight: "bold" }}>
              {selectedOrder.length > 0
                ? selectedOrder
                    .map((id, index) => {
                      const person = people.find((p) => p.id === id);
                      return person ? `${index + 1}. ${person.jobname}` : null;
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
