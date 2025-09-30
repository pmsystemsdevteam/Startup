import dayjs from "dayjs";
import "dayjs/locale/az";
import { useEffect, useRef, useState } from "react";
import { AiOutlineExclamation } from "react-icons/ai";
import { FaFileContract } from "react-icons/fa";
import { IoCheckmark } from "react-icons/io5";
import { LiaDownloadSolid } from "react-icons/lia";
import { Link, useParams } from "react-router-dom";
import "./PermissionDetail.scss";
import axios from "axios";

function PermissionDetail({ multiple = true, onSelect }) {
  const [open, setOpen] = useState({
    hourly: true,
    daily: true,
    calendar: true,
    timer: true,
    type: true,
  });
  const { id } = useParams();
  const [data, setData] = useState(null);
  dayjs.locale("az");
  // popup üçün ayrıca state
  const [popup, setPopup] = useState(null); // null | "cancel" | "approve"

  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);
  // === UPDATE 1: Saatlıq state-lər ===
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // === UPDATE 2: Günlük və aylıq state-lər ===
  const [dailyStart, setDailyStart] = useState("");
  const [dailyEnd, setDailyEnd] = useState("");
  const [people, setPeople] = useState([
    { id: 1, name: "Ali İsmayıl", tick: false },
    { id: 2, name: "Vəli Məmmədovaaa", tick: false },
    { id: 3, name: "Aygün Quliyeva", tick: false },
    { id: 4, name: "Murad Əliyev", tick: false },
    { id: 5, name: "Murad Əliyev", tick: false },
    { id: 6, name: "Murad Əliyev", tick: false },
    { id: 7, name: "Murad Əliyev", tick: false },
  ]);

  // seçilmiş şəxslər
  const selectedPeople = people
    .filter((person) => person.tick)
    .map((person) => person.name)
    .join(", ");

  const toggleTick = (id) => {
    setPeople((prev) =>
      prev.map((p) => (p.id === id ? { ...p, tick: !p.tick } : p))
    );
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

  // yeni state: seçilmiş icazə növü
  const [selectedType, setSelectedType] = useState("Ərizə növü seçin");
  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setOpen((p) => ({ ...p, type: false })); // seçəndən sonra bağla
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(
          `http://172.20.5.167:8000/api/hr/forms/${id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setData(res.data);
        console.log("detail:", res.data);
      } catch (err) {
        console.error("Detail fetch error:", err);
      }
    };

    fetchData();
  }, [id]);

  return (
    <section id="permissionDetail">
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
            <p style={{ color: popup === "approve" ? "#128c3c" : "" }}>
              Müraciətlər təsdiqləyiciyə göndərildi
            </p>
          )}
          {popup === "cancel" && (
            <p style={{ color: popup === "cancel" ? "#FF3D00" : "" }}>
              Müraciətlər ləğv edildi
            </p>
          )}
        </div>
      </div>
      <div className="userInfo">
        <h2>İstifadəçi məlumatları:</h2>
        <form>
          <div className="box">
            <label>Sənəd nömrəsi</label>
            <p>1234</p>
          </div>
          <div className="box">
            <label>Ad soyad</label>
            <p>
              {data?.user?.first_name} {data?.user?.last_name}
            </p>
          </div>
          <div className="box">
            <label>İşçi nömrəsi</label>
            <p>{data?.user?.staffnumber}</p>
          </div>
          <div className="box">
            <label>Vəzifə</label>
            <p>{data?.user?.jobname}</p>
          </div>
          <div className="box">
            <label>Şöbə</label>
            <p>{data?.user?.department}</p>
          </div>
        </form>
      </div>
      <div className="documentSend">
        <h2>İcazə sənədi</h2>
        <div className="doxBox">
          <div className="middle">
            <div className="icon">
              <FaFileContract />
            </div>
            <div className="normal">
              <p>{data?.documentType}</p>
              <Link className="button" to={`${data?.document}`} target="_blank">
                Yüklə{" "}
                <div className="ico">
                  <LiaDownloadSolid />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="summaryBox">
        <h2>Təsdiq edəcək şəxslər</h2>
        <div className="info">
          <div className="little">
            <p>Ad, soyad:</p>
            <p>
              {data?.user?.first_name} {data?.user?.last_name}
            </p>
          </div>
          <div className="little">
            <p>Vəzifə:</p>
            <p>{data?.user?.jobname}</p>
          </div>
          <div className="little">
            <p>İcazə növü:</p>
            <p>{data?.documentType}</p>
          </div>
          <div className="little">
            <p>Başlama tarixi:</p>
            <p>
              {dayjs(data?.date_start).format("DD.MM.YYYY")} /{" "}
              {data?.time_start.slice(0, 5)}
            </p>
          </div>
          <div className="little">
            <p>Bitmə tarixi:</p>
            <p>
              {dayjs(data?.date_end).format("DD.MM.YYYY")} /{" "}
              {data?.time_end.slice(0, 5)}
            </p>
          </div>
          <div className="little">
            <p>Təqvim günü sayı:</p>
            <p>
              {" "}
              {data?.date_start && data?.date_end
                ? `${dayjs(data.date_end).diff(
                    dayjs(data.date_start),
                    "day"
                  )} gün`
                : "-"}
            </p>
          </div>
          <div className="little">
            <p>İşə çıxma tarixi:</p>
            <p>{data?.start_job_date}</p>
          </div>
          <div className="little">
            <p>Sənəd nömrəsi:</p>
            <p>{data?.document_number}</p>
          </div>
          <div className="little">
            <p>Şöbə:</p>
            <p>{data?.user?.department}</p>
          </div>
          <div className="little">
            <p>Təsdiq edəcək şəxslər:</p>
            <p style={{ fontWeight: "bold" }}>
              {data?.accept_person
                ?.map((p) => `${p.first_name} ${p.last_name}`)
                .join(", ")}
            </p>
          </div>
          <div className="buttons">
            <div className="button" onClick={() => setPopup("cancel")}>
              Sil
            </div>
            <div className="button" onClick={() => setPopup("approve")}>
              Təsdiqlə
            </div>
          </div>
          <div className="copy">
            © {new Date().getFullYear()}{" "}
            <Link
              to={"https://pmsystems.az/"}
              target="_blank"
              className="linkk"
            >
              PM Systems{" "}
            </Link>
            tərəfindən hazırlanmışdır.
          </div>
        </div>
      </div>
    </section>
  );
}

export default PermissionDetail;
