// src/Pages/PermissionDetail/PermissionDetail.jsx
import dayjs from "dayjs";
import "dayjs/locale/az";
import { useEffect, useRef, useState } from "react";
import { AiOutlineExclamation } from "react-icons/ai";
import { FaFileContract } from "react-icons/fa";
import { IoCheckmark } from "react-icons/io5";
import { LiaDownloadSolid } from "react-icons/lia";
import { MdEdit, MdSave, MdClose } from "react-icons/md";
import { Link, useParams, useLocation } from "react-router-dom";
import "./PermissionDetail.scss";
import axios from "axios";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


function PermissionDetail({ multiple = true, onSelect }) {
  const { id } = useParams();
  const location = useLocation();
  const [data, setData] = useState(null);
  dayjs.locale("az");
  
  // Check if current path is permission-info-detail
  const isInfoDetailPage = location.pathname.includes("/hr/permission-info-detail/");
  
  // popup state: null | "cancel" | "approve"
  const [popup, setPopup] = useState(null);
  const [rejectReason, setRejectReason] = useState("");


  // Edit mode state for document number
  const [isEditingDocNumber, setIsEditingDocNumber] = useState(false);
  const [editedDocNumber, setEditedDocNumber] = useState("");


  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);


  const openPicker = () => inputRef.current?.click();


  const handleChange = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles(picked);
    onSelect?.(picked);
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;


        const res = await axios.get(`${API_BASE_URL}/api/hr/forms/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });


        setData(res.data);
        setEditedDocNumber(res.data.document_number || "");
      } catch (err) {
        console.error("Detail fetch error:", err);
      }
    };


    fetchData();
  }, [id]);


  // Backend call to approve/reject with optional reason
  const submitDecision = async (decision, reason = "") => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token || !data) return;


      await axios.post(
        `${API_BASE_URL}/api/hr/forms/${data.id}/approve/`,
        {
          decision, // "approved" or "rejected"
          reason, // reason only for rejected
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );


      alert(
        decision === "approved"
          ? "Form təsdiq edildi!"
          : "Form rədd edildi!"
      );


      setPopup(null);
      setRejectReason("");
      // Refresh data after decision
      const res = await axios.get(`${API_BASE_URL}/api/hr/forms/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
      setEditedDocNumber(res.data.document_number || "");
    } catch (error) {
      console.error("Submit decision error:", error.response || error);
      alert(
        error.response?.data?.error ||
          "Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin."
      );
    }
  };


  // Save edited document number
  const handleSaveDocNumber = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token || !data) return;


      await axios.patch(
        `${API_BASE_URL}/api/hr/forms/${data.id}/`,
        {
          document_number: editedDocNumber,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );


      // Update local data
      setData({ ...data, document_number: editedDocNumber });
      setIsEditingDocNumber(false);
      alert("Sənəd nömrəsi uğurla yeniləndi!");
    } catch (error) {
      console.error("Update document number error:", error.response || error);
      alert(
        error.response?.data?.error ||
          "Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin."
      );
    }
  };


  // Cancel editing
  const handleCancelEdit = () => {
    setEditedDocNumber(data.document_number || "");
    setIsEditingDocNumber(false);
  };


  if (!data) {
    return (
      <section id="permissionDetail">
        <p>Yüklənir...</p>
      </section>
    );
  }


  return (
    <section id="permissionDetail">
      {/* Popup for reject reason */}
      <div
        className={`popUp ${popup ? "open" : ""}`}
        onClick={() => setPopup(null)}
      >
        {popup && (
          <div className="normalPop" onClick={(e) => e.stopPropagation()}>
            {popup === "cancel" && (
              <>
                <div className="box6">
                  <label>Rədd səbəbi</label>
                  <textarea
                    placeholder="Rədd səbəbi və əlavə məlumatlar....."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
                <div
                  className="button"
                  onClick={() => submitDecision("rejected", rejectReason.trim())}
                >
                  Göndər
                </div>
              </>
            )}
          </div>
        )}
      </div>


      <div className="userInfo">
        <h2>İstifadəçi məlumatları:</h2>
        <form>
          <div className={`box ${isInfoDetailPage ? 'editableBox' : ''}`}>
            <label>Sənəd nömrəsi</label>
            {isInfoDetailPage && isEditingDocNumber ? (
              <div className="editableContent">
                <input
                  type="text"
                  value={editedDocNumber}
                  onChange={(e) => setEditedDocNumber(e.target.value)}
                  className="editInput"
                  autoFocus
                />
                <div className="editActions">
                  <div className="editIcon saveIcon" onClick={handleSaveDocNumber}>
                    <MdSave />
                  </div>
                  <div className="editIcon cancelIcon" onClick={handleCancelEdit}>
                    <MdClose />
                  </div>
                </div>
              </div>
            ) : isInfoDetailPage ? (
              <div className="editableContent">
                <p>{data.document_number || "-"}</p>
                <div className="editIcon" onClick={() => setIsEditingDocNumber(true)}>
                  <MdEdit />
                </div>
              </div>
            ) : (
              <p>{data.document_number || "-"}</p>
            )}
          </div>
          
          <div className="box">
            <label>Ad soyad</label>
            <p>
              {data.user?.first_name || "-"} {data.user?.last_name || "-"}
            </p>
          </div>
          <div className="box">
            <label>İşçi nömrəsi</label>
            <p>{data.user?.staffnumber || "-"}</p>
          </div>
          <div className="box">
            <label>Vəzifə</label>
            <p>{data.user?.jobname || "-"}</p>
          </div>
          <div className="box">
            <label>Şöbə</label>
            <p>{data.user?.department || "-"}</p>
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
              <p>{data.documentType || "-"}</p>
              {data.document ? (
                <Link
                  className="button"
                  to={`${data.document}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Yüklə{" "}
                  <div className="ico">
                    <LiaDownloadSolid />
                  </div>
                </Link>
              ) : (
                <p>Sənəd mövcud deyil</p>
              )}
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
              {data.user?.first_name || "-"} {data.user?.last_name || "-"}
            </p>
          </div>
          <div className="little">
            <p>Vəzifə:</p>
            <p>{data.user?.jobname || "-"}</p>
          </div>
          <div className="little">
            <p>İcazə növü:</p>
            <p>{data.documentType || "-"}</p>
          </div>
          <div className="little">
            <p>Başlama tarixi:</p>
            <p>
              {data.date_start
                ? `${dayjs(data.date_start).format("DD.MM.YYYY")} / ${
                    data.time_start?.slice(0, 5) ?? "-"
                  }`
                : "-"}
            </p>
          </div>
          <div className="little">
            <p>Bitmə tarixi:</p>
            <p>
              {data.date_end
                ? `${dayjs(data.date_end).format("DD.MM.YYYY")} / ${
                    data.time_end?.slice(0, 5) ?? "-"
                  }`
                : "-"}
            </p>
          </div>
          <div className="little">
            <p>Təqvim günü sayı:</p>
            <p>
              {data.date_start && data.date_end
                ? `${dayjs(data.date_end).diff(
                    dayjs(data.date_start),
                    "day"
                  )} gün`
                : "-"}
            </p>
          </div>
          <div className="little">
            <p>İşə çıxma tarixi:</p>
            <p>{data.start_job_date || "-"}</p>
          </div>
          <div className="little">
            <p>Sənəd nömrəsi:</p>
            <p>{data.document_number || "-"}</p>
          </div>
          <div className="little">
            <p>Şöbə:</p>
            <p>{data.user?.department || "-"}</p>
          </div>
          <div className="little">
            <p>Təsdiq edəcək şəxslər:</p>
            <p style={{ fontWeight: "bold" }}>
              {data.accept_person && data.accept_person.length > 0
                ? data.accept_person
                    .map((p) => `${p.first_name} ${p.last_name}`)
                    .join(", ")
                : "-"}
            </p>
          </div>
          <div className="buttons">
            <div
              className="button"
              style={{ backgroundColor: "#e2202e", color: "#fff" }}
              onClick={() => setPopup("cancel")}
            >
              Rədd et
            </div>
            <div
              className="button"
              style={{ backgroundColor: "#128c3c", color: "#fff" }}
              onClick={() => submitDecision("approved")}
            >
              Təsdiqlə
            </div>
          </div>
          <div className="copy">
            © {new Date().getFullYear()}{" "}
            <Link
              to={"https://pmsystems.az/"}
              target="_blank"
              rel="noopener noreferrer"
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
